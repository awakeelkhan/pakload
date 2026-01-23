import { db, bookings, loads, users, vehicles, type Booking, type NewBooking } from '../db/index.js';
import { eq, and, or, desc } from 'drizzle-orm';

export class BookingRepository {
  async findAll(filters?: { 
    status?: string; 
    carrierId?: number;
    loadId?: number;
  }) {
    let query = db.select({
      booking: bookings,
      load: loads,
      carrier: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        rating: users.rating,
      },
      vehicle: vehicles,
    })
    .from(bookings)
    .leftJoin(loads, eq(bookings.loadId, loads.id))
    .leftJoin(users, eq(bookings.carrierId, users.id))
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id));

    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status as any));
    }
    if (filters?.carrierId) {
      conditions.push(eq(bookings.carrierId, filters.carrierId));
    }
    if (filters?.loadId) {
      conditions.push(eq(bookings.loadId, filters.loadId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(bookings.createdAt));
  }

  async findById(id: number) {
    const [result] = await db.select({
      booking: bookings,
      load: loads,
      carrier: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
        phone: users.phone,
        rating: users.rating,
      },
      vehicle: vehicles,
    })
    .from(bookings)
    .leftJoin(loads, eq(bookings.loadId, loads.id))
    .leftJoin(users, eq(bookings.carrierId, users.id))
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(eq(bookings.id, id));
    
    return result;
  }

  async create(bookingData: NewBooking) {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async update(id: number, bookingData: Partial<NewBooking>) {
    const [booking] = await db
      .update(bookings)
      .set({ ...bookingData, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async delete(id: number) {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async updateStatus(id: number, status: string) {
    return await this.update(id, { status: status as any });
  }

  async updateProgress(id: number, progress: number, currentLocation?: string) {
    const updateData: any = { progress };
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }
    return await this.update(id, updateData);
  }

  async getStats(carrierId?: number) {
    let allBookings = await db.select().from(bookings);
    
    if (carrierId) {
      allBookings = allBookings.filter(b => b.carrierId === carrierId);
    }
    
    return {
      total: allBookings.length,
      pending: allBookings.filter(b => b.status === 'pending').length,
      confirmed: allBookings.filter(b => b.status === 'confirmed').length,
      inTransit: allBookings.filter(b => b.status === 'in_transit').length,
      completed: allBookings.filter(b => b.status === 'completed').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: allBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.price), 0),
      totalPlatformFees: allBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.platformFee), 0),
    };
  }
}

export const bookingRepository = new BookingRepository();
