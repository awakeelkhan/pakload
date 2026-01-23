import { db, loads, users, type Load, type NewLoad } from '../db/index.js';
import { eq, and, or, gte, lte, desc, sql } from 'drizzle-orm';

export class LoadRepository {
  async findAll(filters?: { 
    status?: string; 
    shipperId?: number;
    origin?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    let query = db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        rating: users.rating,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id));

    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(loads.status, filters.status as any));
    }
    if (filters?.shipperId) {
      conditions.push(eq(loads.shipperId, filters.shipperId));
    }
    if (filters?.origin) {
      conditions.push(sql`${loads.origin} ILIKE ${`%${filters.origin}%`}`);
    }
    if (filters?.destination) {
      conditions.push(sql`${loads.destination} ILIKE ${`%${filters.destination}%`}`);
    }
    if (filters?.minPrice) {
      conditions.push(gte(loads.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(loads.price, filters.maxPrice.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(loads.createdAt));
  }

  async findById(id: number) {
    const [result] = await db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
        phone: users.phone,
        rating: users.rating,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id))
    .where(eq(loads.id, id));
    
    return result;
  }

  async findByTrackingNumber(trackingNumber: string) {
    const [load] = await db.select().from(loads).where(eq(loads.trackingNumber, trackingNumber));
    return load;
  }

  async create(loadData: NewLoad) {
    const [load] = await db.insert(loads).values(loadData).returning();
    return load;
  }

  async update(id: number, loadData: Partial<NewLoad>) {
    const [load] = await db
      .update(loads)
      .set({ ...loadData, updatedAt: new Date() })
      .where(eq(loads.id, id))
      .returning();
    return load;
  }

  async delete(id: number) {
    await db.delete(loads).where(eq(loads.id, id));
  }

  async updateStatus(id: number, status: string) {
    return await this.update(id, { status: status as any });
  }

  async getStats() {
    const allLoads = await db.select().from(loads);
    
    return {
      total: allLoads.length,
      pending: allLoads.filter(l => l.status === 'pending').length,
      posted: allLoads.filter(l => l.status === 'posted').length,
      inTransit: allLoads.filter(l => l.status === 'in_transit').length,
      delivered: allLoads.filter(l => l.status === 'delivered').length,
      cancelled: allLoads.filter(l => l.status === 'cancelled').length,
      totalValue: allLoads.reduce((sum, l) => sum + parseFloat(l.price), 0),
    };
  }

  async generateTrackingNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `LP-${year}-${random}`;
  }
}

export const loadRepository = new LoadRepository();
