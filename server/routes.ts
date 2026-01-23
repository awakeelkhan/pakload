import type { Express } from 'express';
import { UserRepository } from './repositories/userRepository';
import { LoadRepository } from './repositories/loadRepository';
import { VehicleRepository } from './repositories/vehicleRepository';
import { BookingRepository } from './repositories/bookingRepository';
import { RouteRepository } from './repositories/routeRepository';
import { generateToken, generateRefreshToken, requireAuth, optionalAuth, requireRole } from './middleware/auth.js';
import bcrypt from 'bcryptjs';
import adminRoutes from './routes/admin.js';

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

  // Loads endpoints
  app.get('/api/loads', async (req, res) => {
    try {
      const { origin, destination, cargoType, urgent, status } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      
      const loads = await loadRepo.findAll(filters);
      
      // Apply additional filters
      let filteredLoads = loads;
      if (origin) {
        filteredLoads = filteredLoads.filter(l => 
          l.origin.toLowerCase().includes((origin as string).toLowerCase())
        );
      }
      if (destination) {
        filteredLoads = filteredLoads.filter(l => 
          l.destination.toLowerCase().includes((destination as string).toLowerCase())
        );
      }
      if (cargoType) {
        filteredLoads = filteredLoads.filter(l => 
          l.cargoType.toLowerCase().includes((cargoType as string).toLowerCase())
        );
      }
      if (urgent === 'true') {
        filteredLoads = filteredLoads.filter(l => l.urgent);
      }

      res.json(filteredLoads);
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

  app.put('/api/loads/:id', async (req, res) => {
    try {
      const loadData = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const updatedLoad = await loadRepo.update(parseInt(req.params.id), loadData);
      if (!updatedLoad) {
        return res.status(404).json({ error: 'Load not found' });
      }
      res.json(updatedLoad);
    } catch (error) {
      console.error('Error updating load:', error);
      res.status(500).json({ error: 'Failed to update load' });
    }
  });

  app.delete('/api/loads/:id', async (req, res) => {
    try {
      await loadRepo.delete(parseInt(req.params.id));
      res.json({ message: 'Load deleted successfully' });
    } catch (error) {
      console.error('Error deleting load:', error);
      res.status(500).json({ error: 'Failed to delete load' });
    }
  });

  app.post('/api/loads', async (req, res) => {
    try {
      // Generate tracking number
      const trackingNumber = await loadRepo.generateTrackingNumber();
      
      const loadData = {
        shipperId: req.body.shipperId || req.body.userId || 1, // TODO: Get from auth session
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

  // Vehicles endpoints
  app.get('/api/trucks', async (req, res) => {
    try {
      const { truckType, currentLocation, status } = req.query;
      
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

      res.json(filteredVehicles);
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

  app.put('/api/trucks/:id', async (req, res) => {
    try {
      const vehicleData = {
        type: req.body.type,
        registrationNumber: req.body.registrationNumber,
        capacity: req.body.capacity?.toString(),
        currentLocation: req.body.currentLocation,
        status: req.body.status,
      };
      
      const updatedVehicle = await vehicleRepo.update(parseInt(req.params.id), vehicleData);
      if (!updatedVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  app.delete('/api/trucks/:id', async (req, res) => {
    try {
      await vehicleRepo.delete(parseInt(req.params.id));
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

  // Bookings endpoints
  app.get('/api/bookings', async (req, res) => {
    try {
      const { carrierId, shipperId, status } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (carrierId) filters.carrierId = parseInt(carrierId as string);
      
      const allBookings = await bookingRepo.findAll(filters);
      res.json(allBookings);
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

  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
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

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}
