import { db, users, type User, type NewUser } from '../db/index.js';
import { eq, and, or, like, desc } from 'drizzle-orm';

export class UserRepository {
  async findAll(filters?: { role?: string; status?: string; search?: string }) {
    let query = db.select().from(users);

    if (filters?.role) {
      query = query.where(eq(users.role, filters.role as any));
    }
    if (filters?.status) {
      query = query.where(eq(users.status, filters.status as any));
    }
    if (filters?.search) {
      query = query.where(
        or(
          like(users.email, `%${filters.search}%`),
          like(users.firstName, `%${filters.search}%`),
          like(users.lastName, `%${filters.search}%`),
          like(users.companyName, `%${filters.search}%`)
        )
      );
    }

    return await query.orderBy(desc(users.createdAt));
  }

  async findById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findByPhone(phone: string) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async create(userData: NewUser) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async update(id: number, userData: Partial<NewUser>) {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateStatus(id: number, status: string) {
    return await this.update(id, { status: status as any });
  }

  async verify(id: number) {
    return await this.update(id, { verified: true, status: 'active' as any });
  }

  async getStats() {
    const allUsers = await db.select().from(users);
    
    return {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      shippers: allUsers.filter(u => u.role === 'shipper').length,
      carriers: allUsers.filter(u => u.role === 'carrier').length,
      active: allUsers.filter(u => u.status === 'active').length,
      pending: allUsers.filter(u => u.status === 'pending').length,
      suspended: allUsers.filter(u => u.status === 'suspended').length,
    };
  }
}

export const userRepository = new UserRepository();
