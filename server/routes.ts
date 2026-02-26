import type { Express } from 'express';
import { UserRepository } from './repositories/userRepository';
import { LoadRepository } from './repositories/loadRepository';
import { VehicleRepository } from './repositories/vehicleRepository';
import { BookingRepository } from './repositories/bookingRepository';
import { RouteRepository } from './repositories/routeRepository';
import { notificationRepo, notificationService } from './repositories/notificationRepository';
import { generateToken, generateRefreshToken, requireAuth, optionalAuth, requireRole } from './middleware/auth.js';
import bcrypt from 'bcryptjs';
import adminRoutes from './routes/admin.js';
import oauthRoutes from './routes/oauth.js';
import documentRoutes from './routes/documents.js';
import goodsRequestRoutes from './routes/goods-requests.js';
import referenceDataRoutes from './routes/reference-data.js';
import marketRequestRoutes from './routes/market-requests.js';
import builtyRoutes from './routes/builty.js';
import adminSettingsRoutes from './routes/admin-settings.js';
import loadsEnhancedRoutes from './routes/loads-enhanced.js';
import uploadRoutes from './routes/upload.js';
import trackingRoutes from './routes/tracking.js';

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

  // Document management routes
  app.use('/api/documents', documentRoutes);

  // Goods requests routes (shipper looking for goods/services)
  app.use('/api/goods-requests', goodsRequestRoutes);

  // Reference data routes (TIR countries, Pakistan routes, legal terms)
  app.use('/api/reference', referenceDataRoutes);

  // Market requests routes (I need goods from X - internal fulfillment)
  app.use('/api/market-requests', marketRequestRoutes);

  // Builty routes (Pakistani transport receipts)
  app.use('/api/builty', builtyRoutes);

  // Admin settings routes (fees, GST, platform configuration)
  app.use('/api/admin/settings', adminSettingsRoutes);

  // Enhanced loads routes (container types, media, PIN locations)
  app.use('/api/v2/loads', loadsEnhancedRoutes);

  // File upload routes
  app.use('/api/upload', uploadRoutes);

  // Tracking routes (driver location and status updates)
  app.use('/api/tracking', trackingRoutes);

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

  // Forgot password endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email, phone } = req.body;
      
      let user = null;
      if (email) {
        user = await userRepo.findByEmail(email);
      } else if (phone) {
        user = await userRepo.findByPhone(phone);
      }
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ 
          message: 'If an account exists with this information, you will receive reset instructions.' 
        });
      }
      
      // In production, send email/SMS with reset link
      // For now, just return success
      console.log(`Password reset requested for user: ${user.email || user.phone}`);
      
      res.json({ 
        message: 'If an account exists with this information, you will receive reset instructions.',
        success: true
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
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
      
      const loadsData = await loadRepo.findAll(filters);
      
      // Flatten the nested structure for frontend and normalize field names
      const flattenedLoads = loadsData.map((item: any) => ({
        ...item.load,
        // Normalize origin/destination fields
        origin: item.load?.origin || item.load?.pickupCity || 'Not specified',
        destination: item.load?.destination || item.load?.deliveryCity || 'Not specified',
        // Normalize weight field for frontend compatibility
        weight: parseFloat(item.load?.cargoWeight) || 0,
        cargo: item.load?.cargoType || 'General',
        shipper: item.shipper,
      }));
      
      // Apply additional filters
      let filteredLoads = flattenedLoads;
      if (origin) {
        filteredLoads = filteredLoads.filter((l: any) => 
          l.origin?.toLowerCase().includes((origin as string).toLowerCase())
        );
      }
      if (destination) {
        filteredLoads = filteredLoads.filter((l: any) => 
          l.destination?.toLowerCase().includes((destination as string).toLowerCase())
        );
      }
      if (cargoType) {
        filteredLoads = filteredLoads.filter((l: any) => 
          l.cargoType?.toLowerCase().includes((cargoType as string).toLowerCase())
        );
      }

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

  // Get shipper's own loads
  app.get('/api/loads/my-loads', requireAuth, async (req, res) => {
    try {
      const loads = await loadRepo.findAll({ shipperId: req.user!.id });
      res.json({ loads: loads || [] });
    } catch (error) {
      console.error('Error fetching my loads:', error);
      res.status(500).json({ error: 'Failed to fetch loads' });
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
      // Only shippers can post loads
      if (req.user && req.user.role !== 'shipper') {
        return res.status(403).json({ error: 'Only Shippers can post loads.' });
      }
      
      // Validate required fields
      const requiredFields = ['origin', 'destination', 'pickupDate', 'cargoType'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        });
      }
      
      // Generate tracking number
      const trackingNumber = await loadRepo.generateTrackingNumber();
      
      // Get shipper ID from authenticated user or request body
      const shipperId = req.user?.id || req.body.shipperId || req.body.userId;
      
      if (!shipperId) {
        return res.status(400).json({ error: 'Authentication required. Please sign in to post a load.' });
      }
      
      // Validate dates
      const pickupDate = new Date(req.body.pickupDate);
      if (isNaN(pickupDate.getTime())) {
        return res.status(400).json({ error: 'Invalid pickup date format' });
      }
      
      const deliveryDate = req.body.deliveryDate ? new Date(req.body.deliveryDate) : pickupDate;
      if (isNaN(deliveryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid delivery date format' });
      }
      
      const loadData = {
        shipperId,
        trackingNumber,
        origin: req.body.origin,
        destination: req.body.destination,
        pickupDate,
        deliveryDate,
        cargoType: req.body.cargoType,
        cargoWeight: req.body.weight?.toString() || req.body.cargoWeight?.toString() || '0',
        cargoVolume: req.body.volume?.toString() || null,
        description: req.body.description || null,
        price: req.body.price?.toString() || '0',
        status: 'posted' as const,
        distance: req.body.distance || null,
        estimatedDays: req.body.estimatedDays || null,
        specialRequirements: req.body.specialRequirements || null,
        images: req.body.images || null,
        videos: req.body.videos || null,
        documents: req.body.documents || null,
        containerType: req.body.equipmentType || req.body.containerType || null,
        originCity: req.body.originCity || null,
        destinationCity: req.body.destinationCity || null,
        pickupContactName: req.body.pickupContactName || null,
        pickupContactPhone: req.body.pickupContactPhone || null,
        deliveryContactName: req.body.deliveryContactName || null,
        deliveryContactPhone: req.body.deliveryContactPhone || null,
      };
      
      const newLoad = await loadRepo.create(loadData);
      res.status(201).json(newLoad);
    } catch (error: any) {
      console.error('Error creating load:', error);
      
      // Provide specific error messages based on error type
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A load with this tracking number already exists. Please try again.' });
      }
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid shipper account. Please ensure you are logged in.' });
      }
      if (error.message?.includes('invalid input syntax')) {
        return res.status(400).json({ error: 'Invalid data format. Please check your input values.' });
      }
      
      res.status(500).json({ error: 'Failed to create load. Please try again or contact support.' });
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

  app.post('/api/trucks', requireAuth, async (req, res) => {
    try {
      // Only carriers can post truck availability
      if (req.user?.role !== 'carrier') {
        return res.status(403).json({ error: 'Only Carriers can post truck availability.' });
      }
      
      const vehicleData = {
        type: req.body.type,
        registrationNumber: req.body.registrationNumber,
        capacity: req.body.capacity?.toString() || '0',
        currentLocation: req.body.currentLocation || null,
        carrierId: req.user.id,
        status: 'active' as const,
      };
      
      const newVehicle = await vehicleRepo.create(vehicleData);
      
      // Notify admins about new truck
      await notificationRepo.create({
        userId: 1, // Admin user
        type: 'load_posted',
        title: 'New Truck Posted',
        message: `A new ${vehicleData.type} truck has been posted by carrier.`,
        relatedId: newVehicle.id,
      });
      
      res.status(201).json(newVehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Failed to post availability. Please try again.' });
    }
  });

  app.put('/api/trucks/:id', requireAuth, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const existingVehicle = await vehicleRepo.findById(vehicleId);
      
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      // Ownership check: only owner or admin can update
      const vehicleOwnerId = existingVehicle.vehicle?.carrierId;
      if (req.user && req.user.role !== 'admin' && vehicleOwnerId !== req.user.id) {
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

  app.delete('/api/trucks/:id', requireAuth, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const existingVehicle = await vehicleRepo.findById(vehicleId);
      
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      // Ownership check: only owner or admin can delete
      const vehicleOwnerId = existingVehicle.vehicle?.carrierId;
      if (req.user && req.user.role !== 'admin' && vehicleOwnerId !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own vehicles' });
      }
      
      await vehicleRepo.delete(vehicleId);
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  // Truck quote request endpoint - only shippers can request quotes
  app.post('/api/trucks/:id/quote', requireAuth, async (req, res) => {
    try {
      // Only shippers can request quotes
      if (req.user?.role !== 'shipper') {
        return res.status(403).json({ error: 'Only Shippers can request quotes for trucks.' });
      }
      
      const truckId = parseInt(req.params.id);
      const { pickupLocation, deliveryLocation, message } = req.body;
      
      if (!pickupLocation || !deliveryLocation) {
        return res.status(400).json({ error: 'Pickup and delivery locations are required' });
      }
      
      const truck = await vehicleRepo.findById(truckId);
      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }
      
      // Create notification for truck owner
      const carrierId = truck.vehicle?.carrierId;
      if (carrierId) {
        await notificationRepo.create({
          userId: carrierId,
          type: 'bid_received',
          title: 'New Quote Request',
          message: `Quote request from ${pickupLocation} to ${deliveryLocation}. ${message || ''}`,
          relatedId: truckId,
        });
      }
      
      res.json({ 
        message: 'Quote request sent successfully',
        request: {
          truckId,
          pickupLocation,
          deliveryLocation,
          message,
          requestedBy: req.user!.id,
          createdAt: new Date(),
        }
      });
    } catch (error) {
      console.error('Error creating truck quote request:', error);
      res.status(500).json({ error: 'Failed to send quote request' });
    }
  });

  // Quotes endpoints - using quotes table
  app.post('/api/quotes', optionalAuth, async (req, res) => {
    try {
      console.log('Creating quote with data:', req.body);
      console.log('User from auth:', req.user);
      
      // Validate required fields
      if (!req.body.loadId) {
        return res.status(400).json({ error: 'Load ID is required' });
      }
      
      // For now, create a booking with all required fields
      const now = new Date();
      const deliveryDate = new Date(now);
      deliveryDate.setDate(deliveryDate.getDate() + (parseInt(req.body.estimatedDays) || 7));
      
      const loadId = parseInt(req.body.loadId);
      // Get carrierId from authenticated user or request body
      const carrierId = req.user?.id || parseInt(req.body.carrierId) || null;
      
      if (!carrierId) {
        return res.status(401).json({ error: 'Authentication required to place a bid. Please sign in.' });
      }
      
      // Only carriers can place bids - prevent admin and shippers from bidding
      if (req.user?.role === 'admin') {
        return res.status(403).json({ error: 'Admins cannot place bids. Only carriers can bid on loads.' });
      }
      if (req.user?.role === 'shipper') {
        return res.status(403).json({ error: 'Shippers cannot place bids. Only carriers can bid on loads.' });
      }
      
      const bidAmount = parseFloat(req.body.quotedPrice || req.body.price || 0);
      
      if (isNaN(loadId) || loadId <= 0) {
        return res.status(400).json({ error: 'Invalid load ID' });
      }
      
      if (bidAmount <= 0) {
        return res.status(400).json({ error: 'Bid amount must be greater than 0' });
      }
      
      const bookingData = {
        loadId,
        carrierId,
        vehicleId: req.body.vehicleId ? parseInt(req.body.vehicleId) : null,
        price: bidAmount.toString(),
        platformFee: (bidAmount * 0.05).toFixed(2),
        totalAmount: (bidAmount * 1.05).toFixed(2),
        pickupDate: new Date(req.body.pickupDate || now),
        deliveryDate: new Date(req.body.deliveryDate || deliveryDate),
        status: 'pending' as const,
        progress: 0,
        notes: req.body.message || null,
      };
      
      const newBooking = await bookingRepo.create(bookingData);
      
      // Notify the shipper about the new bid
      try {
        const loadData = await loadRepo.findById(loadId);
        const trackingNumber = loadData?.load?.trackingNumber || `LP-${loadId}`;
        const origin = loadData?.load?.origin || loadData?.load?.originCity || '';
        const destination = loadData?.load?.destination || loadData?.load?.destinationCity || '';
        const currency = (loadData?.load as any)?.currency || 'PKR';
        
        if (loadData?.load?.shipperId) {
          await notificationService.notifyBidReceived(
            loadData.load.shipperId,
            carrierId,
            loadId,
            bidAmount,
            trackingNumber,
            origin,
            destination,
            currency
          );
        }
        // Also notify admins about the new bid for approval
        const formattedBidAmount = bidAmount ? bidAmount.toLocaleString() : '0';
        const currencySymbol = currency === 'PKR' ? 'PKR ' : currency === 'CNY' ? '¥' : '$';
        const routeInfo = origin && destination ? ` (${origin} → ${destination})` : '';
        await notificationService.notifyAllAdmins(
          'New Bid Pending Approval',
          `A new bid of ${currencySymbol}${formattedBidAmount} was submitted for load ${trackingNumber}${routeInfo}.`,
          '/admin/bids',
          { loadId, carrierId, bidAmount, bookingId: newBooking.id, origin, destination, currency }
        );
      } catch (notifError) {
        console.error('Error sending bid notification:', notifError);
        // Don't fail the bid creation if notification fails
      }
      
      res.status(201).json(newBooking);
    } catch (error: any) {
      console.error('Error creating quote:', error);
      console.error('Error details:', error?.message, error?.stack);
      res.status(500).json({ error: 'Failed to create quote', details: error?.message });
    }
  });

  // Get all quotes with optional status filter (admin)
  app.get('/api/quotes', requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      
      // Only admin can view all quotes
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can view all quotes' });
      }
      
      const allBookings = await bookingRepo.findAll({ status: status as string });
      
      // Flatten the response for frontend compatibility
      const flattenedQuotes = allBookings.map(item => ({
        id: item.booking.id,
        loadId: item.booking.loadId,
        carrierId: item.booking.carrierId,
        vehicleId: item.booking.vehicleId,
        quotedPrice: item.booking.quotedPrice,
        estimatedDays: item.booking.estimatedDays,
        message: item.booking.message,
        status: item.booking.status,
        createdAt: item.booking.createdAt,
        updatedAt: item.booking.updatedAt,
        carrier: item.carrier,
        load: item.load ? {
          origin: item.load.origin,
          destination: item.load.destination,
          cargoType: item.load.cargoType,
          weight: item.load.weight,
          price: item.load.price,
        } : null,
        vehicle: item.vehicle,
      }));
      
      res.json({ quotes: flattenedQuotes });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
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

  // My Bids endpoint - get bids for the current user
  app.get('/api/my-bids', optionalAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id || parseInt(req.query.userId as string) || 1;
      
      // Get all bookings where the user is the carrier (bids)
      const allBookings = await bookingRepo.findAll({ carrierId: userId });
      
      // Flatten and format for bids view with normalized data
      const bids = allBookings.map((item: any) => {
        const load = item.load || {};
        return {
          id: item.booking?.id,
          loadId: item.booking?.loadId,
          status: item.booking?.status,
          price: item.booking?.price,
          quotedPrice: item.booking?.price,
          createdAt: item.booking?.createdAt,
          trackingNumber: item.booking?.trackingNumber || `PL-${String(item.booking?.id || 0).padStart(6, '0')}`,
          origin: load.origin || load.pickupCity || 'Not specified',
          destination: load.destination || load.deliveryCity || 'Not specified',
          cargoType: load.cargoType || 'General',
          weight: load.weight || 0,
          loadBudget: load.budget || load.price || 0,
          load: load,
        };
      });
      
      res.json(bids);
    } catch (error) {
      console.error('Error fetching my bids:', error);
      res.status(500).json({ error: 'Failed to fetch bids' });
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
      
      // Flatten the nested structure - repository already returns load and carrier
      // Normalize data to ensure all fields are populated
      const flattenedBookings = allBookings.map((item: any) => {
        const load = item.load || {};
        return {
          ...item.booking,
          // Generate tracking number if missing
          trackingNumber: item.booking?.trackingNumber || `PL-${String(item.booking?.id || 0).padStart(6, '0')}`,
          // Normalize origin/destination from load
          origin: item.booking?.origin || load.origin || load.pickupCity || 'Not specified',
          destination: item.booking?.destination || load.destination || load.deliveryCity || 'Not specified',
          cargoType: item.booking?.cargoType || load.cargoType || 'General',
          weight: item.booking?.weight || load.weight || 0,
          load: load,
          carrier: item.carrier || null,
          vehicle: item.vehicle || null,
        };
      });
      
      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedBookings = flattenedBookings.slice(startIndex, endIndex);

      res.json({
        bookings: paginatedBookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: flattenedBookings.length,
          totalPages: Math.ceil(flattenedBookings.length / limitNum),
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
      
      // Get load details for notifications
      const loadData = await loadRepo.findById(existingBooking.booking.loadId);
      const trackingNumber = loadData?.load?.trackingNumber || existingBooking.booking.trackingNumber || `PL-${bookingId}`;
      const shipperId = loadData?.load?.shipperId;
      
      // Also update load status if booking status changes
      if (status === 'in_transit') {
        await loadRepo.update(existingBooking.booking.loadId, { status: 'in_transit' });
        // Notify shipper that shipment is picked up
        if (shipperId) {
          await notificationService.notifyShipmentPickup(shipperId, bookingId, trackingNumber);
        }
      } else if (status === 'completed') {
        await loadRepo.update(existingBooking.booking.loadId, { status: 'delivered' });
        // Notify shipper that shipment is delivered
        if (shipperId) {
          await notificationService.notifyShipmentDelivered(shipperId, bookingId, trackingNumber);
        }
      } else if (status === 'confirmed') {
        // Notify shipper that carrier confirmed the booking
        if (shipperId) {
          await notificationService.notifyLoadAssigned(shipperId, existingBooking.booking.loadId, bookingId, trackingNumber);
        }
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
      
      // Get load details for notifications
      const loadData = await loadRepo.findById(existingBooking.booking.loadId);
      const trackingNumber = loadData?.load?.trackingNumber || `LP-${existingBooking.booking.loadId}`;
      const origin = loadData?.load?.origin || 'Origin';
      const destination = loadData?.load?.destination || 'Destination';
      
      // Notify the winning carrier
      await notificationService.notifyBidAccepted(
        existingBooking.booking.carrierId,
        existingBooking.booking.loadId,
        trackingNumber,
        origin,
        destination
      );
      
      // Reject all other pending quotes for this load and notify them
      const allQuotes = await bookingRepo.findAll({ loadId: existingBooking.booking.loadId });
      for (const quote of allQuotes) {
        if (quote.booking.id !== quoteId && quote.booking.status === 'pending') {
          await bookingRepo.update(quote.booking.id, { status: 'cancelled' });
          // Notify rejected carriers
          await notificationService.notifyBidRejected(
            quote.booking.carrierId,
            existingBooking.booking.loadId,
            trackingNumber,
            'Another bid was selected'
          );
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

  // Update quote/bid status (admin only)
  app.put('/api/quotes/:id', requireAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate quoteId
      if (isNaN(quoteId) || quoteId <= 0) {
        return res.status(400).json({ error: 'Invalid quote ID' });
      }
      
      // Only admin can update quote status directly
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can update quote status' });
      }
      
      const existingBooking = await bookingRepo.findById(quoteId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Map status values to valid enum values
      let bookingStatus = status;
      if (status === 'approved' || status === 'confirmed') {
        bookingStatus = 'confirmed';
      } else if (status === 'rejected' || status === 'cancelled') {
        bookingStatus = 'cancelled';
      }
      
      const updatedBooking = await bookingRepo.update(quoteId, { status: bookingStatus });
      
      res.json({ message: 'Quote updated successfully', booking: updatedBooking });
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Failed to update quote' });
    }
  });

  // Withdraw bid (carrier withdraws their own bid)
  app.post('/api/quotes/:id/withdraw', optionalAuth, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const existingBooking = await bookingRepo.findById(quoteId);
      
      if (!existingBooking) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      
      // Only the carrier who placed the bid can withdraw it
      if (req.user && existingBooking.booking.carrierId !== req.user.id) {
        return res.status(403).json({ error: 'You can only withdraw your own bids' });
      }
      
      if (existingBooking.booking.status !== 'pending') {
        return res.status(400).json({ error: 'Can only withdraw pending bids' });
      }
      
      const withdrawnBooking = await bookingRepo.update(quoteId, { 
        status: 'cancelled',
        notes: reason ? `Withdrawn by carrier: ${reason}` : 'Withdrawn by carrier',
      });
      
      // Notify shipper that bid was withdrawn
      const loadData = await loadRepo.findById(existingBooking.booking.loadId);
      if (loadData?.load?.shipperId) {
        const trackingNumber = loadData.load.trackingNumber || `LP-${existingBooking.booking.loadId}`;
        await notificationService.notifySystemMessage(
          loadData.load.shipperId,
          'Bid Withdrawn',
          `A carrier has withdrawn their bid on load ${trackingNumber}.`,
          '/loads'
        );
      }
      
      res.json({ message: 'Bid withdrawn successfully', booking: withdrawnBooking });
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      res.status(500).json({ error: 'Failed to withdraw bid' });
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
        activeLoads: loadStats.posted || 0,
        availableTrucks: vehicleStats.active || 0,
        inTransit: bookingStats.inTransit || 0,
        completed: bookingStats.completed || 0,
        verifiedCarriers: userStats.carriers || 0,
        totalLoads: loadStats.total || 0,
        urgentLoads: loadStats.pending || 0,
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

  // ==================== NOTIFICATIONS API ====================

  // Get user notifications
  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const { unread_only, limit } = req.query;
      const notifications = await notificationRepo.findByUserId(req.user!.id, {
        unreadOnly: unread_only === 'true',
        limit: limit ? parseInt(limit as string) : 50,
      });
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/count', requireAuth, async (req, res) => {
    try {
      const count = await notificationRepo.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.status(500).json({ error: 'Failed to fetch notification count' });
    }
  });

  // Mark single notification as read
  app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await notificationRepo.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const updated = await notificationRepo.markAsRead(notificationId);
      res.json(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', requireAuth, async (req, res) => {
    try {
      const count = await notificationRepo.markAllAsRead(req.user!.id);
      res.json({ message: `Marked ${count} notifications as read`, count });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  });

  // Delete a notification
  app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await notificationRepo.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      await notificationRepo.delete(notificationId);
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Delete all read notifications
  app.delete('/api/notifications/read', requireAuth, async (req, res) => {
    try {
      const count = await notificationRepo.deleteAllRead(req.user!.id);
      res.json({ message: `Deleted ${count} read notifications`, count });
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      res.status(500).json({ error: 'Failed to delete read notifications' });
    }
  });

  // Admin endpoints
  app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      const users = await userRepo.findAll();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/pending-approvals', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // Get pending loads
      const pendingLoads = await loadRepo.findAll({ status: 'pending' });
      
      // Get pending bookings (quotes)
      const pendingBookings = await bookingRepo.findAll({ status: 'pending' });
      
      res.json({
        loads: pendingLoads || [],
        documents: [], // Documents are fetched via /api/documents/admin/pending
        quotes: pendingBookings || [],
      });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
  });

  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const users = await userRepo.findAll();
      const loads = await loadRepo.findAll({});
      
      const stats = {
        totalUsers: users?.length || 0,
        totalShippers: users?.filter((u: any) => u.role === 'shipper').length || 0,
        totalCarriers: users?.filter((u: any) => u.role === 'carrier').length || 0,
        totalLoads: loads?.length || 0,
        activeLoads: loads?.filter((l: any) => l.status === 'posted' || l.status === 'pending' || l.status === 'in_transit').length || 0,
        completedLoads: loads?.filter((l: any) => l.status === 'delivered').length || 0,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Admin: Update user status (suspend/activate)
  app.patch('/api/admin/users/:id/status', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      const userId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['active', 'suspended', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const updated = await userRepo.update(userId, { status });
      res.json(updated);
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Admin: Update user role
  app.patch('/api/admin/users/:id/role', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['shipper', 'carrier', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      const updated = await userRepo.update(userId, { role });
      res.json(updated);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Admin: Verify user
  app.patch('/api/admin/users/:id/verify', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      const userId = parseInt(req.params.id);
      const updated = await userRepo.update(userId, { verified: true });
      res.json(updated);
    } catch (error) {
      console.error('Error verifying user:', error);
      res.status(500).json({ error: 'Failed to verify user' });
    }
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      const userId = parseInt(req.params.id);
      
      // Soft delete by setting status to 'deleted'
      const updated = await userRepo.update(userId, { status: 'deleted' });
      res.json({ message: 'User deleted successfully', user: updated });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ============ CONTACT REQUESTS ============
  // In-memory storage for contact requests (in production, use database)
  const contactRequests: any[] = [];
  let contactRequestIdCounter = 1;

  // Create contact request (shipper to carrier)
  app.post('/api/contact-requests', requireAuth, async (req, res) => {
    try {
      const { truckId, carrierId, subject, message, carrierName, vehicleType } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const contactRequest = {
        id: contactRequestIdCounter++,
        shipperId: req.user?.id,
        shipperName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim(),
        shipperEmail: req.user?.email,
        truckId,
        carrierId,
        carrierName,
        vehicleType,
        subject: subject || 'Contact Request',
        message,
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminNotes: null,
        approvedAt: null,
        approvedBy: null
      };

      contactRequests.push(contactRequest);

      // Notify admin about new contact request
      try {
        const admins = await userRepo.findAll();
        const adminUsers = admins?.filter((u: any) => u.role === 'admin') || [];
        for (const admin of adminUsers) {
          await notificationService.createNotification({
            userId: admin.id,
            title: 'New Contact Request',
            message: `${contactRequest.shipperName} wants to contact ${carrierName}`,
            type: 'contact_request',
            data: { contactRequestId: contactRequest.id }
          });
        }
      } catch (notifyError) {
        console.error('Error notifying admins:', notifyError);
      }

      res.status(201).json({ 
        message: 'Contact request submitted successfully',
        contactRequest 
      });
    } catch (error) {
      console.error('Error creating contact request:', error);
      res.status(500).json({ error: 'Failed to create contact request' });
    }
  });

  // Get all contact requests (admin only)
  app.get('/api/contact-requests', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        // For non-admins, return only their own requests
        const userRequests = contactRequests.filter(r => r.shipperId === req.user?.id);
        return res.json(userRequests);
      }
      
      // Admin gets all requests
      res.json(contactRequests);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      res.status(500).json({ error: 'Failed to fetch contact requests' });
    }
  });

  // Update contact request status (admin only)
  app.patch('/api/contact-requests/:id', requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const requestId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      const requestIndex = contactRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        return res.status(404).json({ error: 'Contact request not found' });
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      contactRequests[requestIndex] = {
        ...contactRequests[requestIndex],
        status,
        adminNotes: adminNotes || contactRequests[requestIndex].adminNotes,
        updatedAt: new Date().toISOString(),
        approvedAt: status === 'approved' ? new Date().toISOString() : null,
        approvedBy: status === 'approved' ? req.user?.id : null
      };

      // Notify shipper about the decision
      try {
        const request = contactRequests[requestIndex];
        await notificationService.createNotification({
          userId: request.shipperId,
          title: status === 'approved' ? 'Contact Request Approved' : 'Contact Request Update',
          message: status === 'approved' 
            ? `Your request to contact ${request.carrierName} has been approved. Our team will connect you shortly.`
            : `Your contact request for ${request.carrierName} has been ${status}.`,
          type: 'contact_request_update',
          data: { contactRequestId: request.id, status }
        });
      } catch (notifyError) {
        console.error('Error notifying shipper:', notifyError);
      }

      res.json(contactRequests[requestIndex]);
    } catch (error) {
      console.error('Error updating contact request:', error);
      res.status(500).json({ error: 'Failed to update contact request' });
    }
  });

  // Note: 404 handler moved to index.ts after static file serving
}
