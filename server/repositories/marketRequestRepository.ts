import { db } from '../db/index.js';
import { goodsRequests, marketRequestFulfillment, users } from '../db/schema.js';
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm';

export class MarketRequestRepository {
  // Generate unique request number
  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(goodsRequests);
    const count = result[0]?.count || 0;
    const nextNum = Number(count) + 1;
    return `MR-${year}-${String(nextNum).padStart(5, '0')}`;
  }

  // Create a new market request
  async create(data: {
    shipperId: number;
    title: string;
    description: string;
    goodsType: string;
    quantity?: string;
    unit?: string;
    originCity?: string;
    originCountry?: string;
    originAddress?: string;
    originLatitude?: string;
    originLongitude?: string;
    destinationCity?: string;
    destinationCountry?: string;
    destinationAddress?: string;
    destinationLatitude?: string;
    destinationLongitude?: string;
    budgetMin?: string;
    budgetMax?: string;
    currency?: string;
    requiredBy?: Date;
    containerType?: string;
    images?: any;
    videos?: any;
    documents?: any;
    metadata?: any;
  }) {
    const requestNumber = await this.generateRequestNumber();
    
    const result = await db.insert(goodsRequests).values({
      requestNumber,
      shipperId: data.shipperId,
      title: data.title,
      description: data.description,
      goodsType: data.goodsType,
      quantity: data.quantity,
      unit: data.unit,
      originCity: data.originCity,
      originCountry: data.originCountry,
      originAddress: data.originAddress,
      originLatitude: data.originLatitude,
      originLongitude: data.originLongitude,
      destinationCity: data.destinationCity,
      destinationCountry: data.destinationCountry,
      destinationAddress: data.destinationAddress,
      destinationLatitude: data.destinationLatitude,
      destinationLongitude: data.destinationLongitude,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      currency: data.currency || 'PKR',
      requiredBy: data.requiredBy,
      containerType: data.containerType,
      images: data.images,
      videos: data.videos,
      documents: data.documents,
      status: 'open',
      fulfillmentStatus: 'pending',
      metadata: data.metadata,
    }).returning();
    
    return result[0];
  }

  // Find all requests with filters
  async findAll(filters?: {
    shipperId?: number;
    status?: string;
    fulfillmentStatus?: string;
    assignedTo?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select({
      request: goodsRequests,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
        phone: users.phone,
      },
    })
    .from(goodsRequests)
    .leftJoin(users, eq(goodsRequests.shipperId, users.id));

    const conditions = [];
    
    if (filters?.shipperId) {
      conditions.push(eq(goodsRequests.shipperId, filters.shipperId));
    }
    if (filters?.status) {
      conditions.push(eq(goodsRequests.status, filters.status as any));
    }
    if (filters?.fulfillmentStatus) {
      conditions.push(eq(goodsRequests.fulfillmentStatus, filters.fulfillmentStatus));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(goodsRequests.assignedTo, filters.assignedTo));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(goodsRequests.title, `%${filters.search}%`),
          ilike(goodsRequests.description, `%${filters.search}%`),
          ilike(goodsRequests.requestNumber, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(goodsRequests.createdAt)) as any;

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }

  // Find by ID
  async findById(id: number) {
    const result = await db.select({
      request: goodsRequests,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
        phone: users.phone,
      },
    })
    .from(goodsRequests)
    .leftJoin(users, eq(goodsRequests.shipperId, users.id))
    .where(eq(goodsRequests.id, id));
    
    return result[0] || null;
  }

  // Find by request number
  async findByRequestNumber(requestNumber: string) {
    const result = await db.select()
      .from(goodsRequests)
      .where(eq(goodsRequests.requestNumber, requestNumber));
    return result[0] || null;
  }

  // Update request
  async update(id: number, data: Partial<{
    title: string;
    description: string;
    goodsType: string;
    quantity: string;
    unit: string;
    originCity: string;
    originCountry: string;
    originAddress: string;
    originLatitude: string;
    originLongitude: string;
    destinationCity: string;
    destinationCountry: string;
    destinationAddress: string;
    destinationLatitude: string;
    destinationLongitude: string;
    budgetMin: string;
    budgetMax: string;
    currency: string;
    requiredBy: Date;
    containerType: string;
    images: any;
    videos: any;
    documents: any;
    status: 'open' | 'matched' | 'closed' | 'expired';
    assignedTo: number;
    internalNotes: string;
    fulfillmentStatus: string;
    matchedLoadId: number;
    matchedCarrierId: number;
    metadata: any;
  }>) {
    const result = await db.update(goodsRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goodsRequests.id, id))
      .returning();
    return result[0] || null;
  }

  // Assign to internal team member
  async assignToTeam(id: number, assignedTo: number) {
    return this.update(id, { 
      assignedTo, 
      fulfillmentStatus: 'searching' 
    });
  }

  // Log fulfillment action
  async logFulfillmentAction(data: {
    requestId: number;
    actionType: string;
    actionBy: number;
    notes?: string;
    carrierContacted?: number;
    loadMatched?: number;
    quotedPrice?: string;
    outcome?: string;
  }) {
    const result = await db.insert(marketRequestFulfillment).values({
      requestId: data.requestId,
      actionType: data.actionType,
      actionBy: data.actionBy,
      notes: data.notes,
      carrierContacted: data.carrierContacted,
      loadMatched: data.loadMatched,
      quotedPrice: data.quotedPrice,
      outcome: data.outcome,
    }).returning();
    return result[0];
  }

  // Get fulfillment history for a request
  async getFulfillmentHistory(requestId: number) {
    return await db.select({
      log: marketRequestFulfillment,
      actionByUser: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(marketRequestFulfillment)
    .leftJoin(users, eq(marketRequestFulfillment.actionBy, users.id))
    .where(eq(marketRequestFulfillment.requestId, requestId))
    .orderBy(desc(marketRequestFulfillment.actionDate));
  }

  // Mark as fulfilled
  async markFulfilled(id: number, matchedLoadId: number, matchedCarrierId: number) {
    return this.update(id, {
      status: 'matched',
      fulfillmentStatus: 'fulfilled',
      matchedLoadId,
      matchedCarrierId,
    });
  }

  // Get pending requests for internal team
  async getPendingForTeam() {
    return this.findAll({
      fulfillmentStatus: 'pending',
    });
  }

  // Get requests assigned to a team member
  async getAssignedToMember(userId: number) {
    return this.findAll({
      assignedTo: userId,
    });
  }

  // Get statistics
  async getStats() {
    const all = await db.select().from(goodsRequests);
    
    return {
      total: all.length,
      byStatus: {
        open: all.filter(r => r.status === 'open').length,
        matched: all.filter(r => r.status === 'matched').length,
        closed: all.filter(r => r.status === 'closed').length,
        expired: all.filter(r => r.status === 'expired').length,
      },
      byFulfillment: {
        pending: all.filter(r => r.fulfillmentStatus === 'pending').length,
        searching: all.filter(r => r.fulfillmentStatus === 'searching').length,
        found: all.filter(r => r.fulfillmentStatus === 'found').length,
        negotiating: all.filter(r => r.fulfillmentStatus === 'negotiating').length,
        fulfilled: all.filter(r => r.fulfillmentStatus === 'fulfilled').length,
        cancelled: all.filter(r => r.fulfillmentStatus === 'cancelled').length,
      },
    };
  }
}

export const marketRequestRepo = new MarketRequestRepository();
