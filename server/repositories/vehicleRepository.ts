import { db, vehicles, users, type Vehicle, type NewVehicle } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';

export class VehicleRepository {
  async findAll(filters?: { carrierId?: number; status?: string }) {
    let query = db.select({
      vehicle: vehicles,
      carrier: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
      }
    })
    .from(vehicles)
    .leftJoin(users, eq(vehicles.carrierId, users.id));

    const conditions = [];
    
    if (filters?.carrierId) {
      conditions.push(eq(vehicles.carrierId, filters.carrierId));
    }
    if (filters?.status) {
      conditions.push(eq(vehicles.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(vehicles.createdAt));
  }

  async findById(id: number) {
    const [result] = await db.select({
      vehicle: vehicles,
      carrier: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
      }
    })
    .from(vehicles)
    .leftJoin(users, eq(vehicles.carrierId, users.id))
    .where(eq(vehicles.id, id));
    
    return result;
  }

  async findByRegistrationNumber(registrationNumber: string) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.registrationNumber, registrationNumber));
    return vehicle;
  }

  async create(vehicleData: NewVehicle) {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }

  async update(id: number, vehicleData: Partial<NewVehicle>) {
    const [vehicle] = await db
      .update(vehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async delete(id: number) {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async updateStatus(id: number, status: string) {
    return await this.update(id, { status: status as any });
  }

  async updateLocation(id: number, location: string) {
    return await this.update(id, { currentLocation: location });
  }

  async getStats(carrierId?: number) {
    let allVehicles = await db.select().from(vehicles);
    
    if (carrierId) {
      allVehicles = allVehicles.filter(v => v.carrierId === carrierId);
    }
    
    return {
      total: allVehicles.length,
      active: allVehicles.filter(v => v.status === 'active').length,
      maintenance: allVehicles.filter(v => v.status === 'maintenance').length,
      inactive: allVehicles.filter(v => v.status === 'inactive').length,
      totalCapacity: allVehicles.reduce((sum, v) => sum + parseFloat(v.capacity), 0),
    };
  }
}

export const vehicleRepository = new VehicleRepository();
