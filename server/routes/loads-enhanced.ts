import { Router } from 'express';
import { LoadRepository } from '../repositories/loadRepository.js';
import { loadMediaRepo } from '../repositories/loadMediaRepository.js';
import { PlatformConfigRepository } from '../repositories/platformConfigRepository.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { loads, users } from '../db/schema.js';
import { eq, and, or, gte, lte, desc, asc, sql, ilike } from 'drizzle-orm';

const router = Router();
const loadRepo = new LoadRepository();
const configRepo = new PlatformConfigRepository();

// Container types for validation
const CONTAINER_TYPES = [
  '20ft', '40ft', '40ft_hc', '45ft_hc', 'flatbed', 'lowbed',
  'reefer_20ft', 'reefer_40ft', 'tanker', 'open_top', 'bulk', 'other'
];

// Generate tracking number
async function generateTrackingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.select({ count: sql<number>`count(*)` }).from(loads);
  const count = result[0]?.count || 0;
  const nextNum = Number(count) + 1;
  return `LP-${year}-${String(nextNum).padStart(5, '0')}`;
}

// Calculate platform fee (hidden from user)
async function calculatePlatformFee(price: number): Promise<{
  platformFeePercent: number;
  platformFeeAmount: number;
  totalAmount: number;
}> {
  const feePercent = await configRepo.getValue('platform_fee_percent') || 5;
  const minFee = await configRepo.getValue('min_platform_fee') || 500;
  const maxFee = await configRepo.getValue('max_platform_fee') || 50000;

  let platformFeeAmount = (price * feePercent) / 100;
  platformFeeAmount = Math.max(platformFeeAmount, minFee);
  platformFeeAmount = Math.min(platformFeeAmount, maxFee);

  return {
    platformFeePercent: feePercent,
    platformFeeAmount,
    totalAmount: price + platformFeeAmount,
  };
}

// Create a new load with all enhanced features
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      // Basic info
      origin,
      destination,
      pickupDate,
      deliveryDate,
      cargoType,
      cargoWeight,
      cargoVolume,
      description,
      price,
      
      // Origin with PIN
      originAddress,
      originCity,
      originProvince,
      originCountry,
      originLatitude,
      originLongitude,
      pickupContactName,
      pickupContactPhone,
      pickupTimeWindow,
      
      // Destination with PIN
      destinationAddress,
      destinationCity,
      destinationProvince,
      destinationCountry,
      destinationLatitude,
      destinationLongitude,
      deliveryContactName,
      deliveryContactPhone,
      deliveryTimeWindow,
      
      // Cargo details
      numberOfPackages,
      packagingType,
      
      // Container
      containerType,
      containerCount,
      
      // Media (arrays of URLs)
      images,
      videos,
      documents,
      
      // Other
      distance,
      estimatedDays,
      specialRequirements,
    } = req.body;

    // Validation
    if (!origin || !destination || !pickupDate || !deliveryDate || !cargoType || !cargoWeight || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: origin, destination, pickupDate, deliveryDate, cargoType, cargoWeight, price' 
      });
    }

    // Validate container type if provided
    if (containerType && !CONTAINER_TYPES.includes(containerType)) {
      return res.status(400).json({ 
        error: `Invalid container type. Must be one of: ${CONTAINER_TYPES.join(', ')}` 
      });
    }

    // Check load limits for individual users
    const userType = req.user!.userType || 'individual';
    const maxLoadsKey = userType === 'company' ? 'company_max_active_loads' : 'individual_max_active_loads';
    const maxLoads = await configRepo.getValue(maxLoadsKey) || (userType === 'company' ? 100 : 5);

    // Count active loads
    const activeLoads = await db.select({ count: sql<number>`count(*)` })
      .from(loads)
      .where(
        and(
          eq(loads.shipperId, req.user!.id),
          or(
            eq(loads.status, 'pending'),
            eq(loads.status, 'posted'),
            eq(loads.status, 'in_transit')
          )
        )
      );

    if (Number(activeLoads[0]?.count || 0) >= maxLoads) {
      return res.status(400).json({ 
        error: `You have reached the maximum number of active loads (${maxLoads}). Please complete or cancel existing loads.` 
      });
    }

    // Calculate platform fee
    const priceNum = parseFloat(price);
    const { platformFeePercent, platformFeeAmount, totalAmount } = await calculatePlatformFee(priceNum);

    // Generate tracking number
    const trackingNumber = await generateTrackingNumber();

    // Create load
    const load = await db.insert(loads).values({
      shipperId: req.user!.id,
      trackingNumber,
      origin,
      destination,
      pickupDate: new Date(pickupDate),
      deliveryDate: new Date(deliveryDate),
      cargoType,
      cargoWeight: String(cargoWeight),
      cargoVolume: cargoVolume ? String(cargoVolume) : null,
      description,
      price: String(priceNum),
      platformFeePercent: String(platformFeePercent),
      platformFeeAmount: String(platformFeeAmount),
      totalAmount: String(totalAmount),
      
      // Origin with PIN
      originAddress,
      originCity,
      originProvince,
      originCountry: originCountry || 'Pakistan',
      originLatitude,
      originLongitude,
      pickupContactName,
      pickupContactPhone,
      pickupTimeWindow,
      
      // Destination with PIN
      destinationAddress,
      destinationCity,
      destinationProvince,
      destinationCountry: destinationCountry || 'Pakistan',
      destinationLatitude,
      destinationLongitude,
      deliveryContactName,
      deliveryContactPhone,
      deliveryTimeWindow,
      
      // Cargo details
      numberOfPackages,
      packagingType,
      
      // Container
      containerType: containerType as any,
      containerCount: containerCount || 1,
      
      // Media (stored as JSON)
      images,
      videos,
      documents,
      
      // Other
      distance,
      estimatedDays,
      specialRequirements,
      status: 'pending',
    }).returning();

    // Return load without platform fee details (hidden)
    const createdLoad = load[0];
    const { platformFeePercent: _, platformFeeAmount: __, ...publicLoad } = createdLoad;

    res.status(201).json({
      message: 'Load created successfully',
      load: publicLoad,
    });
  } catch (error) {
    console.error('Create load error:', error);
    res.status(500).json({ error: 'Failed to create load' });
  }
});

// Get user's own loads
router.get('/my-loads', requireAuth, async (req, res) => {
  try {
    const userLoads = await db.select({
      load: loads,
    })
    .from(loads)
    .where(eq(loads.shipperId, req.user!.id))
    .orderBy(desc(loads.createdAt));

    // Remove platform fee details from response
    const publicLoads = userLoads.map(({ load }) => {
      const { platformFeePercent, platformFeeAmount, ...publicLoad } = load;
      return publicLoad;
    });

    res.json({ loads: publicLoads });
  } catch (error) {
    console.error('Get my loads error:', error);
    res.status(500).json({ error: 'Failed to fetch your loads' });
  }
});

// Delete a load
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const loadId = parseInt(req.params.id);
    
    // Check if load exists and belongs to user
    const [existingLoad] = await db.select().from(loads).where(eq(loads.id, loadId));
    
    if (!existingLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    if (existingLoad.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own loads' });
    }
    
    await db.delete(loads).where(eq(loads.id, loadId));
    
    res.json({ message: 'Load deleted successfully' });
  } catch (error) {
    console.error('Delete load error:', error);
    res.status(500).json({ error: 'Failed to delete load' });
  }
});

// Update a load
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const loadId = parseInt(req.params.id);
    
    // Check if load exists and belongs to user
    const [existingLoad] = await db.select().from(loads).where(eq(loads.id, loadId));
    
    if (!existingLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    if (existingLoad.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own loads' });
    }
    
    const {
      origin, destination, pickupDate, deliveryDate,
      cargoType, cargoWeight, description, price, status,
    } = req.body;
    
    const [updatedLoad] = await db.update(loads)
      .set({
        origin: origin || existingLoad.origin,
        destination: destination || existingLoad.destination,
        pickupDate: pickupDate ? new Date(pickupDate) : existingLoad.pickupDate,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : existingLoad.deliveryDate,
        cargoType: cargoType || existingLoad.cargoType,
        cargoWeight: cargoWeight ? String(cargoWeight) : existingLoad.cargoWeight,
        description: description !== undefined ? description : existingLoad.description,
        price: price ? String(price) : existingLoad.price,
        status: status || existingLoad.status,
        updatedAt: new Date(),
      })
      .where(eq(loads.id, loadId))
      .returning();
    
    const { platformFeePercent, platformFeeAmount, ...publicLoad } = updatedLoad;
    
    res.json({ message: 'Load updated successfully', load: publicLoad });
  } catch (error) {
    console.error('Update load error:', error);
    res.status(500).json({ error: 'Failed to update load' });
  }
});

// Get all loads with enhanced filters
router.get('/', async (req, res) => {
  try {
    const {
      status,
      shipperId,
      origin,
      destination,
      originCity,
      destinationCity,
      containerType,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      pickupDateFrom,
      pickupDateTo,
      search,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    let query = db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        rating: users.rating,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id));

    const conditions = [];

    if (status) {
      conditions.push(eq(loads.status, status as any));
    }
    if (shipperId) {
      conditions.push(eq(loads.shipperId, parseInt(shipperId as string)));
    }
    if (origin) {
      conditions.push(ilike(loads.origin, `%${origin}%`));
    }
    if (destination) {
      conditions.push(ilike(loads.destination, `%${destination}%`));
    }
    if (originCity) {
      conditions.push(ilike(loads.originCity, `%${originCity}%`));
    }
    if (destinationCity) {
      conditions.push(ilike(loads.destinationCity, `%${destinationCity}%`));
    }
    if (containerType) {
      conditions.push(eq(loads.containerType, containerType as any));
    }
    if (minPrice) {
      conditions.push(gte(loads.price, minPrice as string));
    }
    if (maxPrice) {
      conditions.push(lte(loads.price, maxPrice as string));
    }
    if (minWeight) {
      conditions.push(gte(loads.cargoWeight, minWeight as string));
    }
    if (maxWeight) {
      conditions.push(lte(loads.cargoWeight, maxWeight as string));
    }
    if (pickupDateFrom) {
      conditions.push(gte(loads.pickupDate, new Date(pickupDateFrom as string)));
    }
    if (pickupDateTo) {
      conditions.push(lte(loads.pickupDate, new Date(pickupDateTo as string)));
    }
    if (search) {
      conditions.push(
        or(
          ilike(loads.trackingNumber, `%${search}%`),
          ilike(loads.origin, `%${search}%`),
          ilike(loads.destination, `%${search}%`),
          ilike(loads.cargoType, `%${search}%`),
          ilike(loads.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Sorting
    const orderColumn = sortBy === 'price' ? loads.price :
                        sortBy === 'weight' ? loads.cargoWeight :
                        sortBy === 'pickupDate' ? loads.pickupDate :
                        loads.createdAt;
    
    query = query.orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)) as any;

    // Pagination
    if (limit) {
      query = query.limit(parseInt(limit as string)) as any;
    }
    if (offset) {
      query = query.offset(parseInt(offset as string)) as any;
    }

    const results = await query;

    // Remove platform fee from response
    const publicLoads = results.map(({ load, shipper }) => {
      const { platformFeePercent, platformFeeAmount, ...publicLoad } = load;
      return { load: publicLoad, shipper };
    });

    res.json({ loads: publicLoads });
  } catch (error) {
    console.error('Get loads error:', error);
    res.status(500).json({ error: 'Failed to get loads' });
  }
});

// Get single load with all details
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [result] = await db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        email: users.email,
        phone: users.phone,
        rating: users.rating,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id))
    .where(eq(loads.id, id));

    if (!result) {
      return res.status(404).json({ error: 'Load not found' });
    }

    // Get media from separate table if exists
    const media = await loadMediaRepo.findByLoadId(id);

    // Remove platform fee from response (unless admin)
    const { platformFeePercent, platformFeeAmount, ...publicLoad } = result.load;

    res.json({
      load: publicLoad,
      shipper: result.shipper,
      media: {
        images: media.filter(m => m.mediaType === 'image'),
        videos: media.filter(m => m.mediaType === 'video'),
        documents: media.filter(m => m.mediaType === 'document'),
      },
    });
  } catch (error) {
    console.error('Get load error:', error);
    res.status(500).json({ error: 'Failed to get load' });
  }
});

// Get my loads (shipper)
router.get('/my/loads', requireAuth, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const conditions = [eq(loads.shipperId, req.user!.id)];
    if (status) {
      conditions.push(eq(loads.status, status as any));
    }

    let query = db.select({
      load: loads,
    })
    .from(loads)
    .where(and(...conditions))
    .orderBy(desc(loads.createdAt));

    if (limit) {
      query = query.limit(parseInt(limit as string)) as any;
    }
    if (offset) {
      query = query.offset(parseInt(offset as string)) as any;
    }

    const results = await query;

    // Remove platform fee
    const publicLoads = results.map(({ load }) => {
      const { platformFeePercent, platformFeeAmount, ...publicLoad } = load;
      return publicLoad;
    });

    res.json({ loads: publicLoads });
  } catch (error) {
    console.error('Get my loads error:', error);
    res.status(500).json({ error: 'Failed to get loads' });
  }
});

// Update load (owner only, before booking)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [existing] = await db.select().from(loads).where(eq(loads.id, id));
    
    if (!existing) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (existing.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existing.status !== 'pending' && existing.status !== 'posted') {
      return res.status(400).json({ error: 'Cannot update load that is in transit or completed' });
    }

    // Recalculate platform fee if price changed
    let updateData = { ...req.body, updatedAt: new Date() };
    if (req.body.price) {
      const priceNum = parseFloat(req.body.price);
      const { platformFeePercent, platformFeeAmount, totalAmount } = await calculatePlatformFee(priceNum);
      updateData = {
        ...updateData,
        price: String(priceNum),
        platformFeePercent: String(platformFeePercent),
        platformFeeAmount: String(platformFeeAmount),
        totalAmount: String(totalAmount),
      };
    }

    const [updated] = await db.update(loads)
      .set(updateData)
      .where(eq(loads.id, id))
      .returning();

    const { platformFeePercent, platformFeeAmount, ...publicLoad } = updated;
    res.json({ message: 'Load updated', load: publicLoad });
  } catch (error) {
    console.error('Update load error:', error);
    res.status(500).json({ error: 'Failed to update load' });
  }
});

// Post load (make visible to carriers)
router.post('/:id/post', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [existing] = await db.select().from(loads).where(eq(loads.id, id));
    
    if (!existing) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (existing.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Load is already posted or in progress' });
    }

    const [updated] = await db.update(loads)
      .set({ status: 'posted', updatedAt: new Date() })
      .where(eq(loads.id, id))
      .returning();

    const { platformFeePercent, platformFeeAmount, ...publicLoad } = updated;
    res.json({ message: 'Load posted successfully', load: publicLoad });
  } catch (error) {
    console.error('Post load error:', error);
    res.status(500).json({ error: 'Failed to post load' });
  }
});

// Cancel load (owner only)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [existing] = await db.select().from(loads).where(eq(loads.id, id));
    
    if (!existing) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (existing.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existing.status === 'in_transit' || existing.status === 'delivered') {
      return res.status(400).json({ error: 'Cannot cancel load that is in transit or delivered' });
    }

    const [updated] = await db.update(loads)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(loads.id, id))
      .returning();

    res.json({ message: 'Load cancelled', load: updated });
  } catch (error) {
    console.error('Cancel load error:', error);
    res.status(500).json({ error: 'Failed to cancel load' });
  }
});

// Add media to load
router.post('/:id/media', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { mediaType, mediaUrl, thumbnailUrl, fileName, fileSize, mimeType, caption } = req.body;

    const [existing] = await db.select().from(loads).where(eq(loads.id, id));
    
    if (!existing) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (existing.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!mediaType || !mediaUrl) {
      return res.status(400).json({ error: 'mediaType and mediaUrl are required' });
    }

    const media = await loadMediaRepo.create({
      loadId: id,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      fileName,
      fileSize,
      mimeType,
      caption,
      uploadedBy: req.user!.id,
    });

    res.status(201).json({ message: 'Media added', media });
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({ error: 'Failed to add media' });
  }
});

// Get load media
router.get('/:id/media', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const media = await loadMediaRepo.findByLoadId(id);

    res.json({
      media,
      count: await loadMediaRepo.getCount(id),
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

// Delete media from load
router.delete('/:id/media/:mediaId', requireAuth, async (req, res) => {
  try {
    const loadId = parseInt(req.params.id);
    const mediaId = parseInt(req.params.mediaId);

    const [existing] = await db.select().from(loads).where(eq(loads.id, loadId));
    
    if (!existing) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (existing.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await loadMediaRepo.delete(mediaId);
    res.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Get container types
router.get('/reference/container-types', (req, res) => {
  const containerTypes = [
    { value: '20ft', label: '20ft Standard Container', capacity: '33 CBM', maxWeight: '28,000 kg' },
    { value: '40ft', label: '40ft Standard Container', capacity: '67 CBM', maxWeight: '26,000 kg' },
    { value: '40ft_hc', label: '40ft High Cube', capacity: '76 CBM', maxWeight: '26,000 kg' },
    { value: '45ft_hc', label: '45ft High Cube', capacity: '86 CBM', maxWeight: '25,000 kg' },
    { value: 'flatbed', label: 'Flatbed Truck', capacity: 'Open', maxWeight: '25,000 kg' },
    { value: 'lowbed', label: 'Low Bed Trailer', capacity: 'Open', maxWeight: '50,000 kg' },
    { value: 'reefer_20ft', label: '20ft Refrigerated', capacity: '28 CBM', maxWeight: '27,000 kg' },
    { value: 'reefer_40ft', label: '40ft Refrigerated', capacity: '60 CBM', maxWeight: '25,000 kg' },
    { value: 'tanker', label: 'Tanker Truck', capacity: 'Liquid', maxWeight: '30,000 L' },
    { value: 'open_top', label: 'Open Top Container', capacity: 'Variable', maxWeight: '26,000 kg' },
    { value: 'bulk', label: 'Bulk Carrier', capacity: 'Bulk', maxWeight: '30,000 kg' },
    { value: 'other', label: 'Other', capacity: 'Variable', maxWeight: 'Variable' },
  ];

  res.json({ containerTypes });
});

// ============ ADMIN ROUTES ============

// Get all loads with platform fee (admin)
router.get('/admin/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;

    const conditions = [];
    if (status) {
      conditions.push(eq(loads.status, status as any));
    }
    if (search) {
      conditions.push(
        or(
          ilike(loads.trackingNumber, `%${search}%`),
          ilike(loads.origin, `%${search}%`),
          ilike(loads.destination, `%${search}%`)
        )
      );
    }

    let query = db.select({
      load: loads,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
      }
    })
    .from(loads)
    .leftJoin(users, eq(loads.shipperId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(loads.createdAt)) as any;

    if (limit) {
      query = query.limit(parseInt(limit as string)) as any;
    }
    if (offset) {
      query = query.offset(parseInt(offset as string)) as any;
    }

    const results = await query;

    // Admin can see platform fee
    res.json({ loads: results });
  } catch (error) {
    console.error('Admin get loads error:', error);
    res.status(500).json({ error: 'Failed to get loads' });
  }
});

// Get load statistics (admin)
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const allLoads = await db.select().from(loads);
    
    const totalValue = allLoads.reduce((sum, l) => sum + parseFloat(l.price || '0'), 0);
    const totalPlatformFee = allLoads.reduce((sum, l) => sum + parseFloat(l.platformFeeAmount || '0'), 0);

    res.json({
      stats: {
        total: allLoads.length,
        byStatus: {
          pending: allLoads.filter(l => l.status === 'pending').length,
          posted: allLoads.filter(l => l.status === 'posted').length,
          in_transit: allLoads.filter(l => l.status === 'in_transit').length,
          delivered: allLoads.filter(l => l.status === 'delivered').length,
          cancelled: allLoads.filter(l => l.status === 'cancelled').length,
        },
        byContainerType: allLoads.reduce((acc, l) => {
          const type = l.containerType || 'unspecified';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        financials: {
          totalValue,
          totalPlatformFee,
          platformRevenue: totalPlatformFee,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
