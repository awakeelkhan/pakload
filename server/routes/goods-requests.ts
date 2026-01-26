import { Router } from 'express';
import { db } from '../db/index.js';
import { goodsRequests, users } from '../db/schema.js';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get all goods requests with filters
router.get('/', async (req, res) => {
  try {
    const { originCity, destinationCity, goodsType, status = 'open', page = '1', limit = '20' } = req.query;
    
    let query = db.select({
      request: goodsRequests,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        rating: users.rating,
        verified: users.verified,
      }
    })
    .from(goodsRequests)
    .leftJoin(users, eq(goodsRequests.shipperId, users.id))
    .orderBy(desc(goodsRequests.createdAt));
    
    const results = await query;
    
    // Apply filters
    let filtered = results;
    if (status) {
      filtered = filtered.filter(r => r.request.status === status);
    }
    if (originCity) {
      filtered = filtered.filter(r => 
        r.request.originCity?.toLowerCase().includes((originCity as string).toLowerCase())
      );
    }
    if (destinationCity) {
      filtered = filtered.filter(r => 
        r.request.destinationCity?.toLowerCase().includes((destinationCity as string).toLowerCase())
      );
    }
    if (goodsType) {
      filtered = filtered.filter(r => 
        r.request.goodsType?.toLowerCase().includes((goodsType as string).toLowerCase())
      );
    }
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = filtered.slice(startIndex, startIndex + limitNum);
    
    res.json({
      requests: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching goods requests:', error);
    res.status(500).json({ error: 'Failed to fetch goods requests' });
  }
});

// Get single goods request
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.select({
      request: goodsRequests,
      shipper: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        companyName: users.companyName,
        rating: users.rating,
        verified: users.verified,
      }
    })
    .from(goodsRequests)
    .leftJoin(users, eq(goodsRequests.shipperId, users.id))
    .where(eq(goodsRequests.id, parseInt(req.params.id)));
    
    if (!result) {
      return res.status(404).json({ error: 'Goods request not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching goods request:', error);
    res.status(500).json({ error: 'Failed to fetch goods request' });
  }
});

// Create goods request (shipper posts what they need)
router.post('/', requireAuth, async (req, res) => {
  try {
    const [newRequest] = await db.insert(goodsRequests).values({
      shipperId: req.user!.id,
      title: req.body.title,
      description: req.body.description,
      goodsType: req.body.goodsType,
      quantity: req.body.quantity,
      unit: req.body.unit,
      originCity: req.body.originCity,
      originCountry: req.body.originCountry || 'Pakistan',
      destinationCity: req.body.destinationCity,
      destinationCountry: req.body.destinationCountry || 'Pakistan',
      budgetMin: req.body.budgetMin?.toString(),
      budgetMax: req.body.budgetMax?.toString(),
      currency: req.body.currency || 'PKR',
      requiredBy: req.body.requiredBy ? new Date(req.body.requiredBy) : null,
      status: 'open',
      metadata: req.body.metadata,
    }).returning();
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating goods request:', error);
    res.status(500).json({ error: 'Failed to create goods request' });
  }
});

// Update goods request
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const [existing] = await db.select().from(goodsRequests).where(eq(goodsRequests.id, requestId));
    
    if (!existing) {
      return res.status(404).json({ error: 'Goods request not found' });
    }
    
    if (existing.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }
    
    const [updated] = await db.update(goodsRequests)
      .set({
        title: req.body.title,
        description: req.body.description,
        goodsType: req.body.goodsType,
        quantity: req.body.quantity,
        unit: req.body.unit,
        originCity: req.body.originCity,
        originCountry: req.body.originCountry,
        destinationCity: req.body.destinationCity,
        destinationCountry: req.body.destinationCountry,
        budgetMin: req.body.budgetMin?.toString(),
        budgetMax: req.body.budgetMax?.toString(),
        requiredBy: req.body.requiredBy ? new Date(req.body.requiredBy) : null,
        status: req.body.status,
        updatedAt: new Date(),
      })
      .where(eq(goodsRequests.id, requestId))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating goods request:', error);
    res.status(500).json({ error: 'Failed to update goods request' });
  }
});

// Close goods request
router.post('/:id/close', requireAuth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const [existing] = await db.select().from(goodsRequests).where(eq(goodsRequests.id, requestId));
    
    if (!existing) {
      return res.status(404).json({ error: 'Goods request not found' });
    }
    
    if (existing.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const [updated] = await db.update(goodsRequests)
      .set({ status: 'closed', updatedAt: new Date() })
      .where(eq(goodsRequests.id, requestId))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Error closing goods request:', error);
    res.status(500).json({ error: 'Failed to close goods request' });
  }
});

// Get my goods requests
router.get('/my/requests', requireAuth, async (req, res) => {
  try {
    const requests = await db.select()
      .from(goodsRequests)
      .where(eq(goodsRequests.shipperId, req.user!.id))
      .orderBy(desc(goodsRequests.createdAt));
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching my goods requests:', error);
    res.status(500).json({ error: 'Failed to fetch goods requests' });
  }
});

export default router;
