import { db } from '../db/index.js';
import { pricingRules, type PricingRule, type NewPricingRule } from '../db/schema.js';
import { eq, and, or, lte, gte, desc } from 'drizzle-orm';

export class PricingRuleRepository {
  async findAll(filters?: { status?: string; ruleType?: string; categoryId?: number; routeId?: number }) {
    let query = db.select().from(pricingRules);
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(pricingRules.status, filters.status as any));
    }
    if (filters?.ruleType) {
      conditions.push(eq(pricingRules.ruleType, filters.ruleType));
    }
    if (filters?.categoryId) {
      conditions.push(eq(pricingRules.categoryId, filters.categoryId));
    }
    if (filters?.routeId) {
      conditions.push(eq(pricingRules.routeId, filters.routeId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(pricingRules.priority), pricingRules.name);
  }

  async findById(id: number) {
    const result = await db.select().from(pricingRules).where(eq(pricingRules.id, id));
    return result[0] || null;
  }

  async findActive() {
    const now = new Date();
    return await db.select()
      .from(pricingRules)
      .where(
        and(
          eq(pricingRules.status, 'published'),
          or(
            eq(pricingRules.validFrom, null),
            lte(pricingRules.validFrom, now)
          ),
          or(
            eq(pricingRules.validUntil, null),
            gte(pricingRules.validUntil, now)
          )
        )
      )
      .orderBy(desc(pricingRules.priority));
  }

  async findApplicable(params: {
    ruleType?: string;
    categoryId?: number;
    routeId?: number;
    value?: number;
  }) {
    const now = new Date();
    const conditions = [
      eq(pricingRules.status, 'published'),
      or(
        eq(pricingRules.validFrom, null),
        lte(pricingRules.validFrom, now)
      ),
      or(
        eq(pricingRules.validUntil, null),
        gte(pricingRules.validUntil, now)
      ),
    ];

    if (params.ruleType) {
      conditions.push(eq(pricingRules.ruleType, params.ruleType));
    }
    if (params.categoryId) {
      conditions.push(eq(pricingRules.categoryId, params.categoryId));
    }
    if (params.routeId) {
      conditions.push(eq(pricingRules.routeId, params.routeId));
    }

    const rules = await db.select()
      .from(pricingRules)
      .where(and(...conditions))
      .orderBy(desc(pricingRules.priority));

    // Filter by value range if provided
    if (params.value !== undefined) {
      return rules.filter(rule => {
        const minOk = !rule.minValue || parseFloat(rule.minValue) <= params.value!;
        const maxOk = !rule.maxValue || parseFloat(rule.maxValue) >= params.value!;
        return minOk && maxOk;
      });
    }

    return rules;
  }

  async create(data: NewPricingRule) {
    const result = await db.insert(pricingRules).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewPricingRule>) {
    const result = await db.update(pricingRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pricingRules.id, id))
      .returning();
    return result[0] || null;
  }

  async publish(id: number, userId: number) {
    const result = await db.update(pricingRules)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(pricingRules.id, id))
      .returning();
    return result[0] || null;
  }

  async unpublish(id: number, userId: number) {
    const result = await db.update(pricingRules)
      .set({
        status: 'draft',
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(pricingRules.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(pricingRules).where(eq(pricingRules.id, id));
  }

  async getStats() {
    const all = await db.select().from(pricingRules);
    const active = await this.findActive();
    
    return {
      total: all.length,
      published: all.filter(r => r.status === 'published').length,
      draft: all.filter(r => r.status === 'draft').length,
      active: active.length,
      byType: {
        distance: all.filter(r => r.ruleType === 'distance').length,
        weight: all.filter(r => r.ruleType === 'weight').length,
        category: all.filter(r => r.ruleType === 'category').length,
        route: all.filter(r => r.ruleType === 'route').length,
        surge: all.filter(r => r.ruleType === 'surge').length,
      },
    };
  }
}
