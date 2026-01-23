import { db } from '../db/index.js';
import { platformConfig, type PlatformConfig, type NewPlatformConfig } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export class PlatformConfigRepository {
  async findAll(filters?: { category?: string; status?: string; isPublic?: boolean }) {
    let query = db.select().from(platformConfig);
    
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(platformConfig.category, filters.category));
    }
    if (filters?.status) {
      conditions.push(eq(platformConfig.status, filters.status as any));
    }
    if (filters?.isPublic !== undefined) {
      conditions.push(eq(platformConfig.isPublic, filters.isPublic));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(platformConfig.category, platformConfig.key);
  }

  async findByKey(key: string) {
    const result = await db.select().from(platformConfig).where(eq(platformConfig.key, key));
    return result[0] || null;
  }

  async findPublished() {
    return await db.select()
      .from(platformConfig)
      .where(eq(platformConfig.status, 'published'))
      .orderBy(platformConfig.category, platformConfig.key);
  }

  async findPublic() {
    return await db.select()
      .from(platformConfig)
      .where(
        and(
          eq(platformConfig.status, 'published'),
          eq(platformConfig.isPublic, true)
        )
      )
      .orderBy(platformConfig.category, platformConfig.key);
  }

  async getValue(key: string): Promise<any> {
    const config = await this.findByKey(key);
    if (!config || config.status !== 'published') return null;

    // Parse value based on dataType
    switch (config.dataType) {
      case 'number':
        return parseFloat(config.value);
      case 'boolean':
        return config.value === 'true';
      case 'json':
        try {
          return JSON.parse(config.value);
        } catch {
          return null;
        }
      default:
        return config.value;
    }
  }

  async create(data: NewPlatformConfig) {
    const result = await db.insert(platformConfig).values(data).returning();
    return result[0];
  }

  async update(key: string, data: Partial<NewPlatformConfig>) {
    const result = await db.update(platformConfig)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformConfig.key, key))
      .returning();
    return result[0] || null;
  }

  async publish(key: string, userId: number) {
    const result = await db.update(platformConfig)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(platformConfig.key, key))
      .returning();
    return result[0] || null;
  }

  async unpublish(key: string, userId: number) {
    const result = await db.update(platformConfig)
      .set({
        status: 'draft',
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(platformConfig.key, key))
      .returning();
    return result[0] || null;
  }

  async delete(key: string) {
    await db.delete(platformConfig).where(eq(platformConfig.key, key));
  }

  async bulkUpdate(updates: Array<{ key: string; value: string; updatedBy: number }>) {
    for (const update of updates) {
      await db.update(platformConfig)
        .set({
          value: update.value,
          updatedBy: update.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(platformConfig.key, update.key));
    }
  }

  async getByCategory() {
    const all = await this.findPublished();
    const grouped: Record<string, PlatformConfig[]> = {};
    
    for (const config of all) {
      const category = config.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(config);
    }
    
    return grouped;
  }

  async getStats() {
    const all = await db.select().from(platformConfig);
    
    return {
      total: all.length,
      published: all.filter(c => c.status === 'published').length,
      draft: all.filter(c => c.status === 'draft').length,
      public: all.filter(c => c.isPublic).length,
      byCategory: all.reduce((acc, config) => {
        const cat = config.category || 'general';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
