import { db } from '../db/index.js';
import { builtyReceipts, bookings, loads, users, vehicles } from '../db/schema.js';
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm';
import { PlatformConfigRepository } from './platformConfigRepository.js';

const configRepo = new PlatformConfigRepository();

export class BuiltyRepository {
  // Generate unique builty number
  private async generateBuiltyNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(builtyReceipts);
    const count = result[0]?.count || 0;
    const nextNum = Number(count) + 1;
    return `BLT-${year}-${String(nextNum).padStart(5, '0')}`;
  }

  // Calculate platform fee (hidden from user)
  private async calculatePlatformFee(freightCharges: number): Promise<{
    platformFee: number;
    totalWithFee: number;
  }> {
    // Get fee configuration from admin settings
    const feePercent = await configRepo.getValue('platform_fee_percent') || 5;
    const minFee = await configRepo.getValue('min_platform_fee') || 500;
    const maxFee = await configRepo.getValue('max_platform_fee') || 50000;

    let platformFee = (freightCharges * feePercent) / 100;
    
    // Apply min/max limits
    platformFee = Math.max(platformFee, minFee);
    platformFee = Math.min(platformFee, maxFee);

    return {
      platformFee,
      totalWithFee: freightCharges + platformFee,
    };
  }

  // Create a new builty receipt
  async create(data: {
    bookingId: number;
    consignorId: number;
    consigneeId?: number;
    consigneeName: string;
    consigneePhone?: string;
    consigneeAddress?: string;
    carrierId: number;
    driverId?: number;
    vehicleId?: number;
    vehicleNumber: string;
    vehicleType?: string;
    fromLocation: string;
    fromLatitude?: string;
    fromLongitude?: string;
    toLocation: string;
    toLatitude?: string;
    toLongitude?: string;
    cargoDescription: string;
    numberOfPackages: number;
    packagingType?: string;
    declaredWeight?: string;
    actualWeight?: string;
    declaredValue?: string;
    freightCharges: string;
    loadingCharges?: string;
    unloadingCharges?: string;
    otherCharges?: string;
    paymentMode?: string;
    advancePaid?: string;
    expectedDeliveryDate?: Date;
    conditionAtPickup?: string;
    pickupPhotos?: any;
    termsAndConditions?: string;
    specialInstructions?: string;
    metadata?: any;
  }) {
    const builtyNumber = await this.generateBuiltyNumber();
    
    // Calculate charges
    const freightCharges = parseFloat(data.freightCharges) || 0;
    const loadingCharges = parseFloat(data.loadingCharges || '0');
    const unloadingCharges = parseFloat(data.unloadingCharges || '0');
    const otherCharges = parseFloat(data.otherCharges || '0');
    const advancePaid = parseFloat(data.advancePaid || '0');

    // Calculate platform fee (hidden)
    const { platformFee } = await this.calculatePlatformFee(freightCharges);

    // Total shown to user (without platform fee visible)
    const totalAmount = freightCharges + loadingCharges + unloadingCharges + otherCharges;
    const balanceDue = totalAmount - advancePaid;

    // Generate QR code data
    const qrData = JSON.stringify({
      builtyNumber,
      bookingId: data.bookingId,
      totalAmount,
      verifyUrl: `https://pakload.com/verify/${builtyNumber}`,
    });

    const result = await db.insert(builtyReceipts).values({
      bookingId: data.bookingId,
      builtyNumber,
      consignorId: data.consignorId,
      consigneeId: data.consigneeId,
      consigneeName: data.consigneeName,
      consigneePhone: data.consigneePhone,
      consigneeAddress: data.consigneeAddress,
      carrierId: data.carrierId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      fromLocation: data.fromLocation,
      fromLatitude: data.fromLatitude,
      fromLongitude: data.fromLongitude,
      toLocation: data.toLocation,
      toLatitude: data.toLatitude,
      toLongitude: data.toLongitude,
      cargoDescription: data.cargoDescription,
      numberOfPackages: data.numberOfPackages,
      packagingType: data.packagingType,
      declaredWeight: data.declaredWeight,
      actualWeight: data.actualWeight,
      declaredValue: data.declaredValue,
      freightCharges: String(freightCharges),
      loadingCharges: String(loadingCharges),
      unloadingCharges: String(unloadingCharges),
      otherCharges: String(otherCharges),
      platformFeeHidden: String(platformFee), // Hidden from user
      totalAmount: String(totalAmount),
      paymentMode: data.paymentMode || 'to_pay',
      advancePaid: String(advancePaid),
      balanceDue: String(balanceDue),
      expectedDeliveryDate: data.expectedDeliveryDate,
      conditionAtPickup: data.conditionAtPickup || 'good',
      pickupPhotos: data.pickupPhotos,
      qrCode: qrData,
      termsAndConditions: data.termsAndConditions,
      specialInstructions: data.specialInstructions,
      status: 'issued',
      metadata: data.metadata,
    }).returning();

    return result[0];
  }

  // Find all builty receipts
  async findAll(filters?: {
    consignorId?: number;
    carrierId?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select({
      builty: builtyReceipts,
      consignor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
      },
    })
    .from(builtyReceipts)
    .leftJoin(users, eq(builtyReceipts.consignorId, users.id));

    const conditions = [];

    if (filters?.consignorId) {
      conditions.push(eq(builtyReceipts.consignorId, filters.consignorId));
    }
    if (filters?.carrierId) {
      conditions.push(eq(builtyReceipts.carrierId, filters.carrierId));
    }
    if (filters?.status) {
      conditions.push(eq(builtyReceipts.status, filters.status));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(builtyReceipts.builtyNumber, `%${filters.search}%`),
          ilike(builtyReceipts.consigneeName, `%${filters.search}%`),
          ilike(builtyReceipts.vehicleNumber, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(builtyReceipts.createdAt)) as any;

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
    const result = await db.select()
      .from(builtyReceipts)
      .where(eq(builtyReceipts.id, id));
    return result[0] || null;
  }

  // Find by builty number
  async findByBuiltyNumber(builtyNumber: string) {
    const result = await db.select()
      .from(builtyReceipts)
      .where(eq(builtyReceipts.builtyNumber, builtyNumber));
    return result[0] || null;
  }

  // Find by booking ID
  async findByBookingId(bookingId: number) {
    const result = await db.select()
      .from(builtyReceipts)
      .where(eq(builtyReceipts.bookingId, bookingId));
    return result[0] || null;
  }

  // Update builty
  async update(id: number, data: Partial<{
    status: string;
    dispatchDate: Date;
    actualDeliveryDate: Date;
    consignorSignature: string;
    driverSignature: string;
    consigneeSignature: string;
    conditionAtDelivery: string;
    damageNotes: string;
    deliveryPhotos: any;
    actualWeight: string;
    metadata: any;
  }>) {
    const result = await db.update(builtyReceipts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(builtyReceipts.id, id))
      .returning();
    return result[0] || null;
  }

  // Mark as dispatched
  async markDispatched(id: number, driverSignature?: string) {
    return this.update(id, {
      status: 'in_transit',
      dispatchDate: new Date(),
      driverSignature,
    });
  }

  // Mark as delivered
  async markDelivered(id: number, data: {
    consigneeSignature?: string;
    conditionAtDelivery?: string;
    damageNotes?: string;
    deliveryPhotos?: any;
    actualWeight?: string;
  }) {
    return this.update(id, {
      status: 'delivered',
      actualDeliveryDate: new Date(),
      ...data,
    });
  }

  // Get builty for printing (public view - no platform fee)
  async getForPrint(builtyNumber: string) {
    const builty = await this.findByBuiltyNumber(builtyNumber);
    if (!builty) return null;

    // Get related data
    const consignor = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      companyName: users.companyName,
      phone: users.phone,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, builty.consignorId));

    const carrier = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      companyName: users.companyName,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, builty.carrierId));

    // Return without platform fee (hidden)
    const { platformFeeHidden, ...publicBuilty } = builty;

    return {
      ...publicBuilty,
      consignor: consignor[0] || null,
      carrier: carrier[0] || null,
    };
  }

  // Verify builty (for QR code scanning)
  async verify(builtyNumber: string) {
    const builty = await this.findByBuiltyNumber(builtyNumber);
    if (!builty) {
      return { valid: false, message: 'Builty not found' };
    }

    return {
      valid: true,
      builtyNumber: builty.builtyNumber,
      status: builty.status,
      fromLocation: builty.fromLocation,
      toLocation: builty.toLocation,
      totalAmount: builty.totalAmount,
      bookingDate: builty.bookingDate,
      issuedAt: builty.createdAt,
    };
  }

  // Get statistics (for admin - includes hidden fees)
  async getStats() {
    const all = await db.select().from(builtyReceipts);
    
    const totalFreight = all.reduce((sum, b) => sum + parseFloat(b.freightCharges || '0'), 0);
    const totalPlatformFee = all.reduce((sum, b) => sum + parseFloat(b.platformFeeHidden || '0'), 0);
    const totalAmount = all.reduce((sum, b) => sum + parseFloat(b.totalAmount || '0'), 0);

    return {
      total: all.length,
      byStatus: {
        issued: all.filter(b => b.status === 'issued').length,
        in_transit: all.filter(b => b.status === 'in_transit').length,
        delivered: all.filter(b => b.status === 'delivered').length,
        cancelled: all.filter(b => b.status === 'cancelled').length,
      },
      financials: {
        totalFreight,
        totalPlatformFee, // Only visible to admin
        totalAmount,
        platformRevenue: totalPlatformFee,
      },
    };
  }
}

export const builtyRepo = new BuiltyRepository();
