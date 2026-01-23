import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockDataService {
  private users = new Map();
  private loads = new Map();
  private vehicles = new Map();
  private bids = new Map();
  private bookings = new Map();
  private ratings = new Map();
  private notifications = new Map();
  private sessions = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock users
    const users = [
      {
        id: uuidv4(),
        email: 'shipper@pakload.com',
        phone: '+923001234567',
        password: '$2b$10$hi219lf54mLE8.B3HK0g/uDWa.CcF.B674sxnl3g/ckQt6ARfExam', // bcrypt hash of 'Password123!'
        firstName: 'Ahmed',
        lastName: 'Khan',
        role: 'shipper',
        accountStatus: 'active',
        kycStatus: 'verified',
        companyName: 'Khan Logistics',
        trustScore: 4.8,
        totalRatings: 45,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: uuidv4(),
        email: 'carrier@pakload.com',
        phone: '+923009876543',
        password: '$2b$10$hi219lf54mLE8.B3HK0g/uDWa.CcF.B674sxnl3g/ckQt6ARfExam',
        firstName: 'Muhammad',
        lastName: 'Ali',
        role: 'carrier',
        accountStatus: 'active',
        kycStatus: 'verified',
        companyName: 'Silk Road Transport',
        trustScore: 4.9,
        totalRatings: 156,
        createdAt: new Date('2023-06-20'),
      },
      {
        id: uuidv4(),
        email: 'demo@pakload.com',
        phone: '+923001111111',
        password: '$2b$10$hi219lf54mLE8.B3HK0g/uDWa.CcF.B674sxnl3g/ckQt6ARfExam',
        firstName: 'Demo',
        lastName: 'User',
        role: 'carrier',
        accountStatus: 'active',
        kycStatus: 'verified',
        companyName: 'Demo Transport Co',
        trustScore: 5.0,
        totalRatings: 10,
        createdAt: new Date('2024-12-01'),
      },
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Create mock vehicles
    const carrierId = users.find(u => u.role === 'carrier').id;
    const vehicles = [
      {
        id: uuidv4(),
        userId: carrierId,
        vehicleType: '40ft Container',
        registrationNumber: 'LHR-1234',
        maxWeightKg: 23000,
        hasGps: true,
        hasRefrigeration: false,
        status: 'active',
        availabilityStatus: 'available',
        currentLocationLat: 31.5204,
        currentLocationLng: 74.3587,
        currentLocationAddress: 'Lahore, Pakistan',
        createdAt: new Date('2023-08-15'),
      },
      {
        id: uuidv4(),
        userId: carrierId,
        vehicleType: '20ft Container',
        registrationNumber: 'ISB-5678',
        maxWeightKg: 12000,
        hasGps: true,
        hasRefrigeration: true,
        status: 'active',
        availabilityStatus: 'available',
        currentLocationLat: 33.6844,
        currentLocationLng: 73.0479,
        currentLocationAddress: 'Islamabad, Pakistan',
        createdAt: new Date('2024-02-10'),
      },
    ];

    vehicles.forEach(vehicle => this.vehicles.set(vehicle.id, vehicle));

    // Create mock loads
    const shipperId = users.find(u => u.role === 'shipper').id;
    const loads = [
      {
        id: uuidv4(),
        userId: shipperId,
        originAddress: 'Kashgar Freight Terminal, Kashgar, China',
        originCity: 'Kashgar',
        originLat: 39.4704,
        originLng: 75.9896,
        destinationAddress: 'Blue Area, Islamabad, Pakistan',
        destinationCity: 'Islamabad',
        destinationLat: 33.6844,
        destinationLng: 73.0479,
        distanceKm: 1250,
        cargoType: 'Electronics',
        cargoDescription: 'Consumer electronics - laptops, phones, tablets',
        weightKg: 16000,
        lengthCm: 1200,
        widthCm: 240,
        heightCm: 240,
        volumeCbm: 67,
        requiredVehicleType: '40ft Container',
        requiresRefrigeration: false,
        isHazardous: false,
        isOversized: false,
        pickupDate: new Date('2024-12-20'),
        deliveryDate: new Date('2024-12-28'),
        rateType: 'flat',
        rateAmountUsd: 4500,
        rateAmountPkr: 1251000,
        insuredValueUsd: 50000,
        status: 'posted',
        isUrgent: true,
        postedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: shipperId,
        originAddress: 'Urumqi Logistics Hub, Urumqi, China',
        originCity: 'Urumqi',
        originLat: 43.8256,
        originLng: 87.6168,
        destinationAddress: 'Ferozepur Road, Lahore, Pakistan',
        destinationCity: 'Lahore',
        destinationLat: 31.5204,
        destinationLng: 74.3587,
        distanceKm: 1800,
        cargoType: 'Textiles',
        cargoDescription: 'Cotton fabric rolls for export',
        weightKg: 23000,
        lengthCm: 1200,
        widthCm: 240,
        heightCm: 240,
        volumeCbm: 76,
        requiredVehicleType: '40ft Container',
        requiresRefrigeration: false,
        isHazardous: false,
        isOversized: false,
        pickupDate: new Date('2024-12-22'),
        deliveryDate: new Date('2025-01-02'),
        rateType: 'flat',
        rateAmountUsd: 5200,
        rateAmountPkr: 1446000,
        status: 'posted',
        isUrgent: false,
        postedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: shipperId,
        originAddress: 'Kashgar Industrial Zone, Kashgar, China',
        originCity: 'Kashgar',
        originLat: 39.4704,
        originLng: 75.9896,
        destinationAddress: 'Port Qasim, Karachi, Pakistan',
        destinationCity: 'Karachi',
        destinationLat: 24.8607,
        destinationLng: 67.0011,
        distanceKm: 2100,
        cargoType: 'Machinery',
        cargoDescription: 'Industrial machinery parts',
        weightKg: 15000,
        requiredVehicleType: 'Flatbed',
        requiresRefrigeration: false,
        isHazardous: false,
        isOversized: true,
        pickupDate: new Date('2024-12-25'),
        deliveryDate: new Date('2025-01-05'),
        rateType: 'negotiable',
        rateAmountUsd: 6800,
        rateAmountPkr: 1892000,
        status: 'posted',
        isUrgent: false,
        postedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    loads.forEach(load => this.loads.set(load.id, load));

    // Create mock booking with tracking
    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      loadId: loads[0].id,
      shipperId,
      carrierId,
      vehicleId: vehicles[0].id,
      trackingNumber: 'LP-2024-08844',
      agreedAmountUsd: 4200,
      agreedAmountPkr: 1168800,
      status: 'in_transit',
      progressPercentage: 60,
      currentLocationLat: 35.9197,
      currentLocationLng: 74.3080,
      currentLocationAddress: 'Gilgit-Baltistan, Pakistan',
      createdAt: new Date('2024-12-08'),
      milestones: [
        {
          id: uuidv4(),
          milestone: 'pickup',
          location: 'Kashgar Freight Terminal',
          completed: true,
          completedAt: new Date('2024-12-08T08:30:00Z'),
          notes: 'Cargo loaded and secured',
        },
        {
          id: uuidv4(),
          milestone: 'border_crossing',
          location: 'Khunjerab Pass',
          completed: true,
          completedAt: new Date('2024-12-10T14:20:00Z'),
          notes: 'Border crossing completed successfully',
        },
        {
          id: uuidv4(),
          milestone: 'customs',
          location: 'Sost Customs',
          completed: true,
          completedAt: new Date('2024-12-10T17:40:00Z'),
          notes: 'Customs clearance approved',
        },
        {
          id: uuidv4(),
          milestone: 'in_transit',
          location: 'Gilgit-Baltistan',
          completed: false,
          notes: 'Currently in transit',
        },
        {
          id: uuidv4(),
          milestone: 'delivery',
          location: 'Islamabad',
          completed: false,
          notes: 'Pending delivery',
        },
      ],
    };

    this.bookings.set(booking.id, booking);

    // Update load status
    loads[0].status = 'in_transit';
    this.loads.set(loads[0].id, loads[0]);
  }

  // User methods
  getAllUsers() {
    return Array.from(this.users.values());
  }

  getUserById(id: string) {
    return this.users.get(id);
  }

  getUserByEmail(email: string) {
    return this.getAllUsers().find(u => u.email === email);
  }

  getUserByPhone(phone: string) {
    return this.getAllUsers().find(u => u.phone === phone);
  }

  createUser(userData: any) {
    const user = {
      id: uuidv4(),
      ...userData,
      accountStatus: 'active',
      kycStatus: 'pending',
      trustScore: 0,
      totalRatings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: any) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Load methods
  getAllLoads(filters?: any) {
    let loads = Array.from(this.loads.values());
    
    if (filters?.status) {
      loads = loads.filter(l => l.status === filters.status);
    }
    if (filters?.originCity) {
      loads = loads.filter(l => l.originCity.toLowerCase().includes(filters.originCity.toLowerCase()));
    }
    if (filters?.destinationCity) {
      loads = loads.filter(l => l.destinationCity.toLowerCase().includes(filters.destinationCity.toLowerCase()));
    }
    if (filters?.isUrgent !== undefined) {
      loads = loads.filter(l => l.isUrgent === filters.isUrgent);
    }
    
    return loads;
  }

  getLoadById(id: string) {
    return this.loads.get(id);
  }

  createLoad(loadData: any) {
    const load = {
      id: uuidv4(),
      ...loadData,
      status: 'posted',
      postedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.loads.set(load.id, load);
    return load;
  }

  updateLoad(id: string, updates: any) {
    const load = this.loads.get(id);
    if (!load) return null;
    
    const updated = { ...load, ...updates, updatedAt: new Date() };
    this.loads.set(id, updated);
    return updated;
  }

  deleteLoad(id: string) {
    return this.loads.delete(id);
  }

  // Vehicle methods
  getAllVehicles(userId?: string) {
    const vehicles = Array.from(this.vehicles.values());
    return userId ? vehicles.filter(v => v.userId === userId) : vehicles;
  }

  getVehicleById(id: string) {
    return this.vehicles.get(id);
  }

  createVehicle(vehicleData: any) {
    const vehicle = {
      id: uuidv4(),
      ...vehicleData,
      status: 'active',
      availabilityStatus: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  // Bid methods
  getAllBids(loadId?: string) {
    const bids = Array.from(this.bids.values());
    return loadId ? bids.filter(b => b.loadId === loadId) : bids;
  }

  createBid(bidData: any) {
    const bid = {
      id: uuidv4(),
      ...bidData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bids.set(bid.id, bid);
    return bid;
  }

  updateBid(id: string, updates: any) {
    const bid = this.bids.get(id);
    if (!bid) return null;
    
    const updated = { ...bid, ...updates, updatedAt: new Date() };
    this.bids.set(id, updated);
    return updated;
  }

  // Booking methods
  getAllBookings(userId?: string, role?: string) {
    const bookings = Array.from(this.bookings.values());
    if (!userId) return bookings;
    
    return bookings.filter(b => 
      role === 'shipper' ? b.shipperId === userId : b.carrierId === userId
    );
  }

  getBookingById(id: string) {
    return this.bookings.get(id);
  }

  getBookingByTrackingNumber(trackingNumber: string) {
    return this.getAllBookings().find(b => b.trackingNumber === trackingNumber);
  }

  createBooking(bookingData: any) {
    const booking = {
      id: uuidv4(),
      ...bookingData,
      trackingNumber: `LP-2024-${String(this.bookings.size + 1).padStart(5, '0')}`,
      status: 'pending',
      progressPercentage: 0,
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  updateBooking(id: string, updates: any) {
    const booking = this.bookings.get(id);
    if (!booking) return null;
    
    const updated = { ...booking, ...updates, updatedAt: new Date() };
    this.bookings.set(id, updated);
    return updated;
  }

  // Rating methods
  createRating(ratingData: any) {
    const rating = {
      id: uuidv4(),
      ...ratingData,
      createdAt: new Date(),
    };
    this.ratings.set(rating.id, rating);
    
    // Update user trust score
    const user = this.users.get(ratingData.revieweeId);
    if (user) {
      const userRatings = Array.from(this.ratings.values())
        .filter(r => r.revieweeId === user.id);
      const avgRating = userRatings.reduce((sum, r) => sum + r.overallRating, 0) / userRatings.length;
      
      this.updateUser(user.id, {
        trustScore: avgRating,
        totalRatings: userRatings.length,
      });
    }
    
    return rating;
  }

  getRatingsByUser(userId: string) {
    return Array.from(this.ratings.values()).filter(r => r.revieweeId === userId);
  }

  // Session methods
  createSession(sessionData: any) {
    const session = {
      id: uuidv4(),
      ...sessionData,
      createdAt: new Date(),
    };
    this.sessions.set(session.refreshToken, session);
    return session;
  }

  getSession(refreshToken: string) {
    return this.sessions.get(refreshToken);
  }

  deleteSession(refreshToken: string) {
    return this.sessions.delete(refreshToken);
  }

  deleteAllUserSessions(userId: string) {
    const sessions = Array.from(this.sessions.values());
    sessions.forEach(session => {
      if (session.userId === userId) {
        this.sessions.delete(session.refreshToken);
      }
    });
  }

  // Notification methods
  createNotification(notificationData: any) {
    const notification = {
      id: uuidv4(),
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  getUserNotifications(userId: string, unreadOnly = false) {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    return unreadOnly ? notifications.filter(n => !n.isRead) : notifications;
  }

  markNotificationAsRead(id: string) {
    const notification = this.notifications.get(id);
    if (!notification) return null;
    
    notification.isRead = true;
    notification.readAt = new Date();
    this.notifications.set(id, notification);
    return notification;
  }

  markAllNotificationsAsRead(userId: string) {
    const notifications = this.getUserNotifications(userId);
    notifications.forEach(n => {
      n.isRead = true;
      n.readAt = new Date();
      this.notifications.set(n.id, n);
    });
    return notifications;
  }
}
