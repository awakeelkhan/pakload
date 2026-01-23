import { db } from '../db/index.js';
import { cargoCategories, type CargoCategory, type NewCargoCategory } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export class CargoCategoryRepository {
  async findAll(filters?: { status?: string }) {
    let query = db.select().from(cargoCategories);
    
    if (filters?.status) {
      query = query.where(eq(cargoCategories.status, filters.status as any));
    }
    
    return await query.orderBy(cargoCategories.displayOrder, cargoCategories.name);
  }

  async findById(id: number) {
    const result = await db.select().from(cargoCategories).where(eq(cargoCategories.id, id));
    return result[0] || null;
  }

  async findPublished() {
    return await db.select()
      .from(cargoCategories)
      .where(eq(cargoCategories.status, 'published'))
      .orderBy(cargoCategories.displayOrder, cargoCategories.name);
  }

  async create(data: NewCargoCategory) {
    const result = await db.insert(cargoCategories).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewCargoCategory>) {
    const result = await db.update(cargoCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cargoCategories.id, id))
      .returning();
    return result[0] || null;
  }

  async publish(id: number, userId: number) {
    const result = await db.update(cargoCategories)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(cargoCategories.id, id))
      .returning();
    return result[0] || null;
  }

  async unpublish(id: number, userId: number) {
    const result = await db.update(cargoCategories)
      .set({
        status: 'draft',
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(cargoCategories.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(cargoCategories).where(eq(cargoCategories.id, id));
  }

  async reorder(updates: Array<{ id: number; displayOrder: number }>) {
    for (const update of updates) {
      await db.update(cargoCategories)
        .set({ displayOrder: update.displayOrder, updatedAt: new Date() })
        .where(eq(cargoCategories.id, update.id));
    }
  }

  async getStats() {
    const all = await db.select().from(cargoCategories);
    return {
      total: all.length,
      published: all.filter(c => c.status === 'published').length,
      draft: all.filter(c => c.status === 'draft').length,
      archived: all.filter(c => c.status === 'archived').length,
    };
  }
}
