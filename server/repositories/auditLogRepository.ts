import { db } from '../db/index.js';
import { auditLogs, users, type AuditLog, type NewAuditLog } from '../db/schema.js';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export class AuditLogRepository {
  async create(data: NewAuditLog) {
    const result = await db.insert(auditLogs).values(data).returning();
    return result[0];
  }

  async log(params: {
    userId?: number;
    action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'logout';
    entity: string;
    entityId?: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    severity?: 'info' | 'warning' | 'critical';
  }) {
    // Calculate changes if both old and new values provided
    let changes = null;
    if (params.oldValues && params.newValues) {
      changes = {};
      for (const key in params.newValues) {
        if (JSON.stringify(params.oldValues[key]) !== JSON.stringify(params.newValues[key])) {
          changes[key] = {
            from: params.oldValues[key],
            to: params.newValues[key],
          };
        }
      }
    }

    return await this.create({
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      severity: params.severity || 'info',
    });
  }

  async findAll(filters?: {
    userId?: number;
    action?: string;
    entity?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    let query = db.select({
      auditLog: auditLogs,
      user: users,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id));
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action as any));
    }
    if (filters?.entity) {
      conditions.push(eq(auditLogs.entity, filters.entity));
    }
    if (filters?.severity) {
      conditions.push(eq(auditLogs.severity, filters.severity));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(auditLogs.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async findByEntity(entity: string, entityId: number) {
    return await db.select({
      auditLog: auditLogs,
      user: users,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(
      and(
        eq(auditLogs.entity, entity),
        eq(auditLogs.entityId, entityId)
      )
    )
    .orderBy(desc(auditLogs.createdAt));
  }

  async findByUser(userId: number, limit: number = 100) {
    return await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async findRecent(limit: number = 50) {
    return await db.select({
      auditLog: auditLogs,
      user: users,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
  }

  async getStats(filters?: { startDate?: Date; endDate?: Date }) {
    const conditions = [];
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }

    let query = db.select().from(auditLogs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query;
    
    return {
      total: logs.length,
      byAction: {
        create: logs.filter(l => l.action === 'create').length,
        update: logs.filter(l => l.action === 'update').length,
        delete: logs.filter(l => l.action === 'delete').length,
        publish: logs.filter(l => l.action === 'publish').length,
        unpublish: logs.filter(l => l.action === 'unpublish').length,
        login: logs.filter(l => l.action === 'login').length,
        logout: logs.filter(l => l.action === 'logout').length,
      },
      bySeverity: {
        info: logs.filter(l => l.severity === 'info').length,
        warning: logs.filter(l => l.severity === 'warning').length,
        critical: logs.filter(l => l.severity === 'critical').length,
      },
      byEntity: logs.reduce((acc, log) => {
        acc[log.entity] = (acc[log.entity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async deleteOld(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await db.delete(auditLogs).where(lte(auditLogs.createdAt, cutoffDate));
  }
}
