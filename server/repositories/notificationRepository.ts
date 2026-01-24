import { db, notifications, users, loads, bookings, type Notification, type NewNotification } from '../db/index.js';
import { eq, and, desc, isNull, or, lte } from 'drizzle-orm';

// Notification types for type safety
export type NotificationType = 
  | 'bid_received'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'bid_expired'
  | 'load_posted'
  | 'load_assigned'
  | 'load_cancelled'
  | 'shipment_pickup'
  | 'shipment_delivered'
  | 'shipment_delayed'
  | 'payment_received'
  | 'payment_due'
  | 'document_required'
  | 'message_received'
  | 'rating_received'
  | 'account_alert'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  relatedLoadId?: number;
  relatedBookingId?: number;
  relatedUserId?: number;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export class NotificationRepository {
  async create(params: CreateNotificationParams): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      userId: params.userId,
      type: params.type as any,
      priority: (params.priority || 'normal') as any,
      title: params.title,
      message: params.message,
      link: params.link || null,
      relatedLoadId: params.relatedLoadId || null,
      relatedBookingId: params.relatedBookingId || null,
      relatedUserId: params.relatedUserId || null,
      metadata: params.metadata || null,
      expiresAt: params.expiresAt || null,
    }).returning();
    return notification;
  }

  async findByUserId(userId: number, options?: { 
    unreadOnly?: boolean; 
    limit?: number;
    includeExpired?: boolean;
  }): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    
    if (options?.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    
    if (!options?.includeExpired) {
      conditions.push(
        or(
          isNull(notifications.expiresAt),
          lte(new Date(), notifications.expiresAt)
        )!
      );
    }

    let query = db.select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }

    return await query;
  }

  async getUnreadCount(userId: number): Promise<number> {
    const result = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
        or(
          isNull(notifications.expiresAt),
          lte(new Date(), notifications.expiresAt)
        )
      ));
    return result.length;
  }

  async markAsRead(notificationId: number): Promise<Notification | null> {
    const [notification] = await db.update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId))
      .returning();
    return notification || null;
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await db.update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))
      .returning();
    return result.length;
  }

  async delete(notificationId: number): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(eq(notifications.id, notificationId))
      .returning();
    return result.length > 0;
  }

  async deleteAllRead(userId: number): Promise<number> {
    const result = await db.delete(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, true)
      ))
      .returning();
    return result.length;
  }

  async findById(id: number): Promise<Notification | null> {
    const [notification] = await db.select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification || null;
  }
}

// Notification Service - handles business logic for creating notifications
export class NotificationService {
  private repo: NotificationRepository;

  constructor() {
    this.repo = new NotificationRepository();
  }

  // === BID NOTIFICATIONS ===
  
  async notifyBidReceived(shipperId: number, carrierId: number, loadId: number, bidAmount: number, trackingNumber: string) {
    return this.repo.create({
      userId: shipperId,
      type: 'bid_received',
      priority: 'high',
      title: 'New Bid Received',
      message: `You received a new bid of $${bidAmount.toLocaleString()} on load ${trackingNumber}`,
      link: '/bids',
      relatedLoadId: loadId,
      relatedUserId: carrierId,
      metadata: { bidAmount, trackingNumber },
    });
  }

  async notifyBidAccepted(carrierId: number, loadId: number, trackingNumber: string, origin: string, destination: string) {
    return this.repo.create({
      userId: carrierId,
      type: 'bid_accepted',
      priority: 'high',
      title: 'Bid Accepted! 🎉',
      message: `Your bid on ${origin} → ${destination} (${trackingNumber}) has been accepted. Prepare for pickup.`,
      link: '/bookings',
      relatedLoadId: loadId,
      metadata: { trackingNumber, origin, destination },
    });
  }

  async notifyBidRejected(carrierId: number, loadId: number, trackingNumber: string, reason?: string) {
    return this.repo.create({
      userId: carrierId,
      type: 'bid_rejected',
      priority: 'normal',
      title: 'Bid Not Selected',
      message: `Your bid on load ${trackingNumber} was not selected.${reason ? ` Reason: ${reason}` : ''} Keep bidding!`,
      link: '/loads',
      relatedLoadId: loadId,
      metadata: { trackingNumber, reason },
    });
  }

  // === LOAD NOTIFICATIONS ===

  async notifyLoadPosted(carrierId: number, loadId: number, origin: string, destination: string, price: number) {
    return this.repo.create({
      userId: carrierId,
      type: 'load_posted',
      priority: 'normal',
      title: 'New Load Available',
      message: `New load: ${origin} → ${destination} at $${price.toLocaleString()}`,
      link: `/loads`,
      relatedLoadId: loadId,
      metadata: { origin, destination, price },
    });
  }

  async notifyLoadAssigned(carrierId: number, loadId: number, bookingId: number, trackingNumber: string) {
    return this.repo.create({
      userId: carrierId,
      type: 'load_assigned',
      priority: 'high',
      title: 'Load Assigned',
      message: `Load ${trackingNumber} has been assigned to you. Check booking details.`,
      link: '/bookings',
      relatedLoadId: loadId,
      relatedBookingId: bookingId,
      metadata: { trackingNumber },
    });
  }

  async notifyLoadCancelled(userId: number, loadId: number, trackingNumber: string, reason?: string) {
    return this.repo.create({
      userId,
      type: 'load_cancelled',
      priority: 'high',
      title: 'Load Cancelled',
      message: `Load ${trackingNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      link: '/bookings',
      relatedLoadId: loadId,
      metadata: { trackingNumber, reason },
    });
  }

  // === SHIPMENT NOTIFICATIONS ===

  async notifyShipmentPickup(userId: number, bookingId: number, trackingNumber: string) {
    return this.repo.create({
      userId,
      type: 'shipment_pickup',
      priority: 'normal',
      title: 'Shipment Picked Up',
      message: `Shipment ${trackingNumber} has been picked up and is now in transit.`,
      link: '/track',
      relatedBookingId: bookingId,
      metadata: { trackingNumber },
    });
  }

  async notifyShipmentDelivered(userId: number, bookingId: number, trackingNumber: string) {
    return this.repo.create({
      userId,
      type: 'shipment_delivered',
      priority: 'high',
      title: 'Shipment Delivered! ✅',
      message: `Shipment ${trackingNumber} has been successfully delivered.`,
      link: '/bookings',
      relatedBookingId: bookingId,
      metadata: { trackingNumber },
    });
  }

  async notifyShipmentDelayed(userId: number, bookingId: number, trackingNumber: string, reason: string, newEta?: string) {
    return this.repo.create({
      userId,
      type: 'shipment_delayed',
      priority: 'high',
      title: 'Shipment Delayed',
      message: `Shipment ${trackingNumber} is delayed. ${reason}${newEta ? ` New ETA: ${newEta}` : ''}`,
      link: '/track',
      relatedBookingId: bookingId,
      metadata: { trackingNumber, reason, newEta },
    });
  }

  // === PAYMENT NOTIFICATIONS ===

  async notifyPaymentReceived(carrierId: number, bookingId: number, amount: number, trackingNumber: string) {
    return this.repo.create({
      userId: carrierId,
      type: 'payment_received',
      priority: 'high',
      title: 'Payment Received 💰',
      message: `Payment of $${amount.toLocaleString()} received for shipment ${trackingNumber}.`,
      link: '/bookings',
      relatedBookingId: bookingId,
      metadata: { amount, trackingNumber },
    });
  }

  async notifyPaymentDue(shipperId: number, bookingId: number, amount: number, dueDate: string) {
    return this.repo.create({
      userId: shipperId,
      type: 'payment_due',
      priority: 'high',
      title: 'Payment Due',
      message: `Payment of $${amount.toLocaleString()} is due by ${dueDate}.`,
      link: '/bookings',
      relatedBookingId: bookingId,
      metadata: { amount, dueDate },
      expiresAt: new Date(dueDate),
    });
  }

  // === OTHER NOTIFICATIONS ===

  async notifyDocumentRequired(userId: number, loadId: number, documentType: string) {
    return this.repo.create({
      userId,
      type: 'document_required',
      priority: 'high',
      title: 'Document Required',
      message: `Please upload ${documentType} for customs clearance.`,
      link: '/bookings',
      relatedLoadId: loadId,
      metadata: { documentType },
    });
  }

  async notifyRatingReceived(userId: number, rating: number, reviewerName: string) {
    return this.repo.create({
      userId,
      type: 'rating_received',
      priority: 'normal',
      title: 'New Rating Received',
      message: `${reviewerName} gave you a ${rating}-star rating.`,
      link: '/profile',
      metadata: { rating, reviewerName },
    });
  }

  async notifySystemMessage(userId: number, title: string, message: string, link?: string) {
    return this.repo.create({
      userId,
      type: 'system',
      priority: 'normal',
      title,
      message,
      link,
    });
  }

  async notifyAccountAlert(userId: number, title: string, message: string) {
    return this.repo.create({
      userId,
      type: 'account_alert',
      priority: 'high',
      title,
      message,
      link: '/settings',
    });
  }
}

export const notificationRepo = new NotificationRepository();
export const notificationService = new NotificationService();
