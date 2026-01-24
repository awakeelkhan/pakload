import type { Express } from 'express';
import { UserRepository } from './repositories/userRepository';
import { LoadRepository } from './repositories/loadRepository';
import { VehicleRepository } from './repositories/vehicleRepository';
import { BookingRepository } from './repositories/bookingRepository';
import { RouteRepository } from './repositories/routeRepository';
import { generateToken, generateRefreshToken, requireAuth, optionalAuth, requireRole } from './middleware/auth.js';
import bcrypt from 'bcryptjs';
import adminRoutes from './routes/admin.js';
import oauthRoutes from './routes/oauth.js';

const userRepo = new UserRepository();
const loadRepo = new LoadRepository();
const vehicleRepo = new VehicleRepository();
const bookingRepo = new BookingRepository();
const routeRepo = new RouteRepository();

export function registerRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin routes
  app.use('/api/admin', adminRoutes);

  // OAuth routes
  app.use('/api/v1/auth', oauthRoutes);

  // Authentication endpoints
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const { email, phone, password, firstName, lastName, role, companyName } = req.body;
      
      // Check if user already exists
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await userRepo.create({
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'shipper',
        companyName,
        status: 'active',
        verified: false,
      });

      // Generate real JWT tokens
      const access_token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
      const refresh_token = generateRefreshToken({ id: newUser.id, email: newUser.email });
      
      res.status(201).json({
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 604800, // 7 days in seconds
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          status: newUser.status,
          companyName: newUser.companyName,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await userRepo.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check account status
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Generate real JWT tokens
      const access_token = generateToken({ id: user.id, email: user.email, role: user.role });
      const refresh_token = generateRefreshToken({ id: user.id, email: user.email });
      
      res.json({
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 604800,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          verified: user.verified,
          companyName: user.companyName,
          rating: user.rating,
          totalLoads: user.totalLoads,
          completedLoads: user.completedLoads,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Update user role (for OAuth signup flow)
  app.post('/api/v1/auth/update-role', requireAuth, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !['shipper', 'carrier'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be shipper or carrier.' });
      }
      
      const updatedUser = await userRepo.update(req.user!.id, { role });
      
      res.json({
        message: 'Role updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  // Get current user from JWT token
  app.get('/api/v1/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await userRepo.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        verified: user.verified,
        companyName: user.companyName,
        rating: user.rating,
        totalLoads: user.totalLoads,
        completedLoads: user.completedLoads,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.post('/api/v1/auth/otp/request', (req, res) => {
    res.json({ message: 'OTP sent successfully' });
  });

  app.post('/api/v1/auth/otp/verify', async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      // TODO: Verify OTP from database/cache
      // For now, find user by phone
      const users = await userRepo.findAll({ search: phone });
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid phone number or OTP' });
      }
      
      const user = users[0];
      
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Generate real JWT tokens
      const access_token = generateToken({ id: user.id, email: user.email, role: user.role });
      const refresh_token = generateRefreshToken({ id: user.id, email: user.email });
      
      res.json({
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 604800,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          verified: user.verified,
          companyName: user.companyName,
          rating: user.rating,
          totalLoads: user.totalLoads,
          completedLoads: user.completedLoads,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'OTP verification failed' });
    }
  });

  // Password reset request
  app.post('/api/v1/auth/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const user = await userRepo.findByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }
      
      // Generate reset token (in production, store this in DB with expiry)
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // TODO: In production:
      // 1. Store resetToken in password_reset_tokens table with expiry
      // 2. Send email with reset link containing token
      // For now, we'll use a simple approach
      
      // Store token temporarily (in production use Redis or DB)
      const tokenExpiry = Date.now() + 3600000; // 1 hour
      
      console.log(`Password reset requested for ${email}. Token: ${resetToken}`);
      
      res.json({ 
        message: 'If the email exists, a reset link has been sent',
        // Only for development - remove in production
        _dev_token: resetToken,
        _dev_expiry: new Date(tokenExpiry).toISOString(),
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  });

  // Password reset confirm (with token)
  app.post('/api/v1/auth/reset-password/confirm', async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'Email, token, and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      const user = await userRepo.findByEmail(email);
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid reset request' });
      }
      
      // TODO: In production, verify token from password_reset_tokens table
      // For now, we'll accept any token in development
      
      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userRepo.update(user.id, { password: hashedPassword });
      
      // TODO: Invalidate the reset token in DB
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset confirm error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Loads endpoints with pagination
  app.get('/api/loads', async (req, res) => {
    try {
      const { origin, destination, cargoType, urgent, status, page = '1', limit = '20' } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      
      const loads = await loadRepo.findAll(filters);
      
      // Apply additional filters
      let filteredLoads = loads;
      if (origin) {
        filteredLoads = filteredLoads.filter(l => 
          l.load?.origin?.toLowerCase().includes((origin as string).toLowerCase())
        );
      }
      if (destination) {
        filteredLoads = filteredLoads.filter(l => 
          l.load?.destination?.toLowerCase().includes((destination as string).toLowerCase())
        );
      }
      if (cargoType) {
        filteredLoads = filteredLoads.filter(l => 
          l.load?.cargoType?.toLowerCase().includes((cargoType as string).toLowerCase())
        );
      }
      // Note: urgent field not in schema, skip filter

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedLoads = filteredLoads.slice(startIndex, endIndex);

      res.json({
        loads: paginatedLoads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredLoads.length,
          totalPages: Math.ceil(filteredLoads.length / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching loads:', error);
      res.status(500).json({ error: 'Failed to fetch loads' });
    }
  });

  app.get('/api/loads/:id', async (req, res) => {
    try {
      const load = await loadRepo.findById(parseInt(req.params.id));
      if (!load) {
        return res.status(404).json({ error: 'Load not found' });
      }
      res.json(load);
    } catch (error) {
      console.error('Error fetching load:', error);
      res.status(500).json({ error: 'Failed to fetch load' });
    }
  });

  app.put('/api/loads/:id', optionalAuth, async (req, res) => {
    try {
      const loadId = parseInt(req.params.id);
      const existingLoad = await loadRepo.findById(loadId);
      
      if (!existingLoad) {
        return res.status(404).json({ error: 'Load not found' });
      }
      
      // Ownership check: only owner or admin can update
      if (req.user && req.user.role !== 'admin' && existingLoad.load.shipperId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own loads' });
      }
      
      // Prevent editing loads that are in transit or delivered
      if (['in_transit', 'delivered'].includes(existingLoad.load.status)) {
        return res.status(400).json({ error: 'Cannot edit load in current status' });
      }
      
      const loadData = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const updatedLoad = await loadRepo.update(loadId, loadData);
      res.json(updatedLoad);
    } catch (error) {
      console.error('Error updating load:', error);
      res.status(500).json({ error: 'Failed to update load' });
    }
  });

  app.delete('/api/loads/:id', optionalAuth, async (req, res) => {
    try {
      const loadId = parseInt(req.params.id);
      const existingLoad = await loadRepo.findById(loadId);
      
      if (!existingLoad) {
        return res.status(404).json({ error: 'Load not found' });
      }
      
      // Ownership check: only owner or admin can delete
      if (req.user && req.user.role !== 'admin' && existingLoad.load.shipperId !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own loads' });
      }
      
      // Prevent deleting loads that are in transit
      if (['in_transit', 'confirmed'].includes(existingLoad.load.status)) {
        return res.status(400).json({ error: 'Cannot delete load in current status. Cancel first.' });
      }
      
      await loadRepo.delete(loadId);
      res.json({ message: 'Load deleted successfully' });
    } catch (error) {
      console.error('Error deleting load:', error);
      res.status(500).json({ error: 'Failed to delete load' });
    }
  });

  // Cancel load with reason
  app.post('/api/loads/:id/cancel', optionalAuth, async (req, res) => {
    try {
      const loadId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const existingLoad = await loadRepo.findById(loadId);
      
      if (!existingLoad) {
        return res.status(404).json({ error: 'Load not found' });
      }
      
      // Ownership check
      if (req.user && req.user.role !== 'admin' && existingLoad.load.shipperId !== req.user.id) {
        return res.status(403).json({ error: 'You can only cancel your own loads' });
      }
      
      // Cannot cancel delivered loads
      if (existingLoad.load.status === 'delivered') {
        return res.status(400).json({ error: 'Cannot cancel delivered load' });
      }
      
      const updatedLoad = await loadRepo.update(loadId, {
        status: 'cancelled',
        specialRequirements: existingLoad.load.specialRequirements 
          ? `${existingLoad.load.specialRequirements}\nCancellation reason: ${reason || 'Not specified'}`
          : `Cancellation reason: ${reason || 'Not specified'}`,
      });
      
      res.json({ message: 'Load cancelled successfully', load: updatedLoad });
    } catch (error) {
      console.error('Error cancelling load:', error);
      res.status(500).json({ error: 'Failed to cancel load' });
    }
  });

  app.post('/api/loads', optionalAuth, async (req, res) => {
    try {
      // Generate tracking number
      const trackingNumber = await loadRepo.generateTrackingNumber();
      
      // Get shipper ID from authenticated user or request body
      const shipperId = req.user?.id || req.body.shipperId || req.body.userId;
      
      if (!shipperId) {
        return res.status(400).json({ error: 'Shipper ID is required' });
      }
      
      const loadData = {
        shipperId,
        trackingNumber,
        origin: req.body.origin,
        destination: req.body.destination,
        pickupDate: new Date(req.body.pickupDate),
        deliveryDate: new Date(req.body.deliveryDate || req.body.pickupDate),
        cargoType: req.body.cargoType,
        cargoWeight: req.body.weight?.toString() || req.body.cargoWeight?.toString() || '0',
        cargoVolume: req.body.volume?.toString() || null,
        description: req.body.description || null,
        price: req.body.price?.toString() || '0',
        status: 'posted' as const,
        distance: req.body.distance || null,
        estimatedDays: req.body.estimatedDays || null,
        specialRequirements: req.body.specialRequirements || null,
      };
      
      const newLoad = await loadRepo.create(loadData);
      res.status(201).json(newLoad);
    } catch (error) {
      console.error('Error creating load:', error);
      res.status(500).json({ error: 'Failed to create load' });
    }
  });

  // Vehicles endpoints with pagination
  app.get('/api/trucks', async (req, res) => {
    try {
      const { truckType, currentLocation, status, page = '1', limit = '20' } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      
      const vehiclesData = await vehicleRepo.findAll(filters);
      
      // Flatten the nested structure for frontend
      const vehicles = vehiclesData.map((v: any) => ({
        ...v.vehicle,
        carrier: v.carrier,
      }));
      
      // Apply additional filters
      let filteredVehicles = vehicles;
      if (truckType) {
        filteredVehicles = filteredVehicles.filter((v: any) => 
          v.type?.toLowerCase().includes((truckType as string).toLowerCase())
        );
      }
      if (currentLocation) {
        filteredVehicles = filteredVehicles.filter((v: any) => 
          v.currentLocation?.toLowerCase().includes((currentLocation as string).toLowerCase())
        );
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

      res.json({
        trucks: paginatedVehicles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredVehicles.length,
          totalPages: Math.ceil(filteredVehicles.length / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  app.get('/api/trucks/:id', async (req, res) => {
    try {
      const vehicle = await vehicleRepo.findById(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
  });

  app.post('/api/trucks', async (req, res) => {
    try {
      const vehicleData = {
        type: req.body.type,
        registrationNumber: req.body.registrationNumber,
        capacity: req.body.capacity?.toString() || '0',
        currentLocation: req.body.currentLocation || null,
        carrierId: req.body.carrierId || 1, // TODO: Get from auth session
        status: 'active' as const,
      };
      
      const newVehicle = await vehicleRepo.create(vehicleData);
      res.status(201).json(newVehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  });

  app.put('/api/trucks/:id', optionalAuth, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const existingVehicle = await vehicleRepo.findById(vehicleId);
      
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      // Ownership check: only owner or admin can update
      if (req.user && req.user.role !== 'admin' && existingVehicle.vehicle.carrierId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own vehicles' });
      }
      
      const vehicleData = {
        type: req.body.type,
        registrationNumber: req.body.registrationNumber,
        capacity: req.body.capacity?.toString(),
        currentLocation: req.body.currentLocation,
        status: req.body.status,
      };
      
      const updatedVehicle = await vehicleRepo.update(vehicleId, vehicleData);
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  app.delete('/api/trucks/:id', optionalAuth, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const existingVehicle = await vehicleRepo.findById(vehicleId);
      
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      // Ownership check: only owner or admin can delete
      if (req.user && req.user.role !== 'admin' && existingVehicle.vehicle.carrierId !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own vehicles' });
      }
      
      await vehicleRepo.delete(vehicleId);
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  // Quotes endpoints - using quotes table
  app.post('/api/quotes', async (req, res) => {
    try {
      // For now, create a booking with all required fields
      const now = new Date();
      const deliveryDate = new Date(now);
      deliveryDate.setDate(deliveryDate.getDate() + (parseInt(req.body.estimatedDays) || 7));
      
      const bookingData = {
        loadId: parseInt(req.body.loadId),
        carrierId: req.body.carrierId || 1,
        vehicleId: req.body.vehicleId ? parseInt(req.body.vehicleId) : null,
        price: req.body.quotedPrice?.toString() || req.body.price?.toString() || '0',
        platformFee: (parseFloat(req.body.quotedPrice || req.body.price || 0) * 0.05).toFixed(2),
        totalAmount: (parseFloat(req.body.quotedPrice || req.body.price || 0) * 1.05).toFixed(2),
        pickupDate: new Date(req.body.pickupDate || now),
        deliveryDate: new Date(req.body.deliveryDate || deliveryDate),
        status: 'pending' as const,
        progress: 0,
        notes: req.body.message || null,
      };
      
      const newBooking = await bookingRepo.create(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  });

  app.get('/api/quotes/load/:loadId', async (req, res) => {
    try {
      const bookings = await bookingRepo.findByLoad(parseInt(req.params.loadId));
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  // Bookings endpoints with pagination
  app.get('/api/bookings', async (req, res) => {
    try {
      const { carrierId, shipperId, status, page = '1', limit = '20' } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (carrierId) filters.carrierId = parseInt(carrierId as string);
      
      const allBookings = await bookingRepo.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedBookings = allBookings.slice(startIndex, endIndex);

      res.json({
        bookings: paginatedBookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: allBookings.length,
          totalPages: Math.ceil(allBookings.length / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.get('/api/bookings/:trackingNumber', async (req, res) => {
    try {
      const booking = await bookingRepo.findByTrackingNumber(req.params.trackingNumber);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const load = await loadRepo.findById(booking.loadId);

      res.json({
        ...booking,
        load,
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  });

  app.post('/api/bookings', optionalAuth, async (req, res) => {
    try {
      const carrierId = req.user?.id || req.body.carrierId;
      
      const bookingData = {
        ...req.body,
        carrierId,
        status: 'pending',
        progress: 0,
      };
      
      const newBooking = await bookingRepo.create(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Update booking status
  app.put('/api/bookings/:id', optionalAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const existingBooking = await bookingRepo.findById(bookingId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      // Ownership check: carrier who owns booking or admin can update
      if (req.user && req.user.role !== 'admin' && existingBooking.booking.carrierId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own bookings' });
      }
      
      const updatedBooking = await bookingRepo.update(bookingId, {
        ...req.body,
        updatedAt: new Date(),
      });
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  });

  // Update booking status specifically
  app.patch('/api/bookings/:id/status', optionalAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status, currentLocation, progress } = req.body;
      
      const existingBooking = await bookingRepo.findById(bookingId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['in_transit', 'cancelled'],
        'in_transit': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
      };
      
      const currentStatus = existingBooking.booking.status;
      if (!validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({ 
          error: `Cannot transition from ${currentStatus} to ${status}` 
        });
      }
      
      const updateData: any = { status };
      if (currentLocation) updateData.currentLocation = currentLocation;
      if (progress !== undefined) updateData.progress = progress;
      
      // Set actual dates based on status
      if (status === 'in_transit') {
        updateData.actualPickupDate = new Date();
      } else if (status === 'completed') {
        updateData.actualDeliveryDate = new Date();
        updateData.progress = 100;
      }
      
      const updatedBooking = await bookingRepo.update(bookingId, updateData);
      
      // Also update load status if booking status changes
      if (status === 'in_transit') {
        await loadRepo.update(existingBooking.booking.loadId, { status: 'in_transit' });
      } else if (status === 'completed') {
        await loadRepo.update(existingBooking.booking.loadId, { status: 'delivered' });
      }
      
      res.json({ message: 'Booking status updated', booking: updatedBooking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  });

  // Cancel booking
  app.post('/api/bookings/:id/cancel', optionalAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const existingBooking = await bookingRepo.findById(bookingId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      // Cannot cancel completed bookings
      if (existingBooking.booking.status === 'completed') {
        return res.status(400).json({ error: 'Cannot cancel completed booking' });
      }
      
      const updatedBooking = await bookingRepo.update(bookingId, {
        status: 'cancelled',
        notes: existingBooking.booking.notes 
          ? `${existingBooking.booking.notes}\nCancellation reason: ${reason || 'Not specified'}`
          : `Cancellation reason: ${reason || 'Not specified'}`,
      });
      
      // Revert load status to posted if it was in transit
      if (existingBooking.load?.status === 'in_transit') {
        await loadRepo.update(existingBooking.booking.loadId, { status: 'posted' });
      }
      
      res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  });

  // Accept quote (booking)
  app.post('/api/quotes/:id/accept', optionalAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const existingBooking = await bookingRepo.findById(quoteId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      if (existingBooking.booking.status !== 'pending') {
        return res.status(400).json({ error: 'Quote is no longer pending' });
      }
      
      // Update this quote to confirmed
      const acceptedBooking = await bookingRepo.update(quoteId, { status: 'confirmed' });
      
      // Update load status to assigned/in_transit
      await loadRepo.update(existingBooking.booking.loadId, { status: 'in_transit' });
      
      // Reject all other pending quotes for this load
      const allQuotes = await bookingRepo.findAll({ loadId: existingBooking.booking.loadId });
      for (const quote of allQuotes) {
        if (quote.booking.id !== quoteId && quote.booking.status === 'pending') {
          await bookingRepo.update(quote.booking.id, { status: 'cancelled' });
        }
      }
      
      res.json({ message: 'Quote accepted successfully', booking: acceptedBooking });
    } catch (error) {
      console.error('Error accepting quote:', error);
      res.status(500).json({ error: 'Failed to accept quote' });
    }
  });

  // Reject quote
  app.post('/api/quotes/:id/reject', optionalAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const existingBooking = await bookingRepo.findById(quoteId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      if (existingBooking.booking.status !== 'pending') {
        return res.status(400).json({ error: 'Quote is no longer pending' });
      }
      
      const rejectedBooking = await bookingRepo.update(quoteId, { 
        status: 'cancelled',
        notes: reason ? `Rejected: ${reason}` : 'Rejected by shipper',
      });
      
      res.json({ message: 'Quote rejected', booking: rejectedBooking });
    } catch (error) {
      console.error('Error rejecting quote:', error);
      res.status(500).json({ error: 'Failed to reject quote' });
    }
  });

  // Get user's own loads
  app.get('/api/users/:userId/loads', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only see their own loads unless admin
      if (req.user!.role !== 'admin' && req.user!.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const loads = await loadRepo.findAll({ shipperId: userId });
      res.json(loads);
    } catch (error) {
      console.error('Error fetching user loads:', error);
      res.status(500).json({ error: 'Failed to fetch user loads' });
    }
  });

  // Get user's own bookings
  app.get('/api/users/:userId/bookings', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only see their own bookings unless admin
      if (req.user!.role !== 'admin' && req.user!.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const bookings = await bookingRepo.findAll({ carrierId: userId });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
  });

  // Stats endpoints
  app.get('/api/stats', async (req, res) => {
    try {
      const loadStats = await loadRepo.getStats();
      const vehicleStats = await vehicleRepo.getStats();
      const bookingStats = await bookingRepo.getStats();
      const userStats = await userRepo.getStats();
      
      res.json({
        activeLoads: loadStats.available || 0,
        availableTrucks: vehicleStats.available || 0,
        inTransit: bookingStats.in_transit || 0,
        completed: bookingStats.completed || 0,
        verifiedCarriers: userStats.verified_carriers || 0,
        totalLoads: loadStats.total || 0,
        urgentLoads: loadStats.urgent || 0,
        totalUsers: userStats.total || 0,
        totalVehicles: vehicleStats.total || 0,
        totalBookings: bookingStats.total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Routes information (from routes table in DB)
  app.get('/api/routes', async (req, res) => {
    try {
      const routes = await routeRepo.findAll();
      res.json(routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  // User profile endpoints
  app.get('/api/users/me', requireAuth, async (req, res) => {
    try {
      const user = await userRepo.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.put('/api/users/me', requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, phone, companyName } = req.body;
      
      const updatedUser = await userRepo.update(req.user!.id, {
        firstName,
        lastName,
        phone,
        companyName,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  app.post('/api/users/change-password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      
      const user = await userRepo.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userRepo.update(req.user!.id, { password: hashedPassword });
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  // Carriers endpoints
  app.get('/api/carriers', async (req, res) => {
    try {
      const carriers = await userRepo.findAll({ role: 'carrier' });
      res.json(carriers);
    } catch (error) {
      console.error('Error fetching carriers:', error);
      res.status(500).json({ error: 'Failed to fetch carriers' });
    }
  });

  app.get('/api/carriers/:id', async (req, res) => {
    try {
      const carrier = await userRepo.findById(parseInt(req.params.id));
      if (!carrier || carrier.role !== 'carrier') {
        return res.status(404).json({ error: 'Carrier not found' });
      }
      res.json(carrier);
    } catch (error) {
      console.error('Error fetching carrier:', error);
      res.status(500).json({ error: 'Failed to fetch carrier' });
    }
  });

  // Note: 404 handler moved to index.ts after static file serving
}
