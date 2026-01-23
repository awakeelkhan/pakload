import { db } from '../db/index.js';
import { routePricing, routes, cargoCategories, type RoutePricing, type NewRoutePricing } from '../db/schema.js';
import { eq, and, or, lte, gte, desc } from 'drizzle-orm';

export class RoutePricingRepository {
  async findAll(filters?: { status?: string; routeId?: number; categoryId?: number }) {
    let query = db.select({
      routePricing,
      route: routes,
      category: cargoCategories,
    })
    .from(routePricing)
    .leftJoin(routes, eq(routePricing.routeId, routes.id))
    .leftJoin(cargoCategories, eq(routePricing.categoryId, cargoCategories.id));
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(routePricing.status, filters.status as any));
    }
    if (filters?.routeId) {
      conditions.push(eq(routePricing.routeId, filters.routeId));
    }
    if (filters?.categoryId) {
      conditions.push(eq(routePricing.categoryId, filters.categoryId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async findById(id: number) {
    const result = await db.select({
      routePricing,
      route: routes,
      category: cargoCategories,
    })
    .from(routePricing)
    .leftJoin(routes, eq(routePricing.routeId, routes.id))
    .leftJoin(cargoCategories, eq(routePricing.categoryId, cargoCategories.id))
    .where(eq(routePricing.id, id));
    
    return result[0] || null;
  }

  async findActive(routeId: number, categoryId?: number) {
    const now = new Date();
    const conditions = [
      eq(routePricing.routeId, routeId),
      eq(routePricing.status, 'published'),
      or(
        eq(routePricing.validFrom, null),
        lte(routePricing.validFrom, now)
      ),
      or(
        eq(routePricing.validUntil, null),
        gte(routePricing.validUntil, now)
      ),
    ];

    if (categoryId) {
      conditions.push(eq(routePricing.categoryId, categoryId));
    }

    return await db.select()
      .from(routePricing)
      .where(and(...conditions));
  }

  async create(data: NewRoutePricing) {
    const result = await db.insert(routePricing).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewRoutePricing>) {
    const result = await db.update(routePricing)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routePricing.id, id))
      .returning();
    return result[0] || null;
  }

  async publish(id: number, userId: number) {
    const result = await db.update(routePricing)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(routePricing.id, id))
      .returning();
    return result[0] || null;
  }

  async unpublish(id: number, userId: number) {
    const result = await db.update(routePricing)
      .set({
        status: 'draft',
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(routePricing.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(routePricing).where(eq(routePricing.id, id));
  }

  async bulkCreate(data: NewRoutePricing[]) {
    const result = await db.insert(routePricing).values(data).returning();
    return result;
  }

  async getStats() {
    const all = await db.select().from(routePricing);
    
    return {
      total: all.length,
      published: all.filter(r => r.status === 'published').length,
      draft: all.filter(r => r.status === 'draft').length,
      archived: all.filter(r => r.status === 'archived').length,
    };
  }
}
