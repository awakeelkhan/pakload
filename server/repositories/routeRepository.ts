import { db } from '../db/index.js';
import { routes, type Route, type NewRoute } from '../db/schema.js';
import { eq, or, like, desc } from 'drizzle-orm';

export class RouteRepository {
  async findAll() {
    return await db.select().from(routes).orderBy(routes.routePopularity, routes.from);
  }

  async findById(id: number) {
    const result = await db.select().from(routes).where(eq(routes.id, id));
    return result[0] || null;
  }

  async findByLocations(from: string, to: string) {
    const result = await db.select()
      .from(routes)
      .where(
        or(
          eq(routes.from, from),
          eq(routes.to, to)
        )
      );
    return result;
  }

  async search(query: string) {
    return await db.select()
      .from(routes)
      .where(
        or(
          like(routes.from, `%${query}%`),
          like(routes.to, `%${query}%`)
        )
      )
      .orderBy(routes.routePopularity);
  }

  async findPopular(limit: number = 10) {
    return await db.select()
      .from(routes)
      .orderBy(desc(routes.activeTrucks), desc(routes.activeLoads))
      .limit(limit);
  }

  async create(data: NewRoute) {
    const result = await db.insert(routes).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewRoute>) {
    const result = await db.update(routes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(routes).where(eq(routes.id, id));
  }

  async updateStats(id: number, stats: { activeTrucks?: number; activeLoads?: number; avgPrice?: string }) {
    const result = await db.update(routes)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning();
    return result[0] || null;
  }

  async getStats() {
    const all = await db.select().from(routes);
    
    return {
      total: all.length,
      totalActiveTrucks: all.reduce((sum, r) => sum + (r.activeTrucks || 0), 0),
      totalActiveLoads: all.reduce((sum, r) => sum + (r.activeLoads || 0), 0),
      avgDistance: all.reduce((sum, r) => sum + r.distance, 0) / all.length,
      popular: all.filter(r => r.routePopularity === 'high').length,
    };
  }
}
