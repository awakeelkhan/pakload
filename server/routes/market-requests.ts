import { Router } from 'express';
import { marketRequestRepo } from '../repositories/marketRequestRepository.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all market requests (public list for carriers to see available requests)
router.get('/', async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const requests = await marketRequestRepo.findAll({
      status: status as string || 'open',
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get market requests error:', error);
    res.status(500).json({ error: 'Failed to get market requests' });
  }
});

// Create a new market request (shipper/individual)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      goodsType,
      quantity,
      unit,
      originCity,
      originCountry,
      originAddress,
      originLatitude,
      originLongitude,
      destinationCity,
      destinationCountry,
      destinationAddress,
      destinationLatitude,
      destinationLongitude,
      budgetMin,
      budgetMax,
      currency,
      requiredBy,
      containerType,
      images,
      videos,
      documents,
    } = req.body;

    if (!title || !description || !goodsType) {
      return res.status(400).json({ error: 'Title, description, and goods type are required' });
    }

    const request = await marketRequestRepo.create({
      shipperId: req.user!.id,
      title,
      description,
      goodsType,
      quantity,
      unit,
      originCity,
      originCountry,
      originAddress,
      originLatitude,
      originLongitude,
      destinationCity,
      destinationCountry,
      destinationAddress,
      destinationLatitude,
      destinationLongitude,
      budgetMin,
      budgetMax,
      currency,
      requiredBy: requiredBy ? new Date(requiredBy) : undefined,
      containerType,
      images,
      videos,
      documents,
    });

    res.status(201).json({
      message: 'Market request created successfully',
      request,
    });
  } catch (error) {
    console.error('Create market request error:', error);
    res.status(500).json({ error: 'Failed to create market request' });
  }
});

// Get my market requests (shipper)
router.get('/my-requests', requireAuth, async (req, res) => {
  try {
    const { status, fulfillmentStatus, limit, offset } = req.query;

    const requests = await marketRequestRepo.findAll({
      shipperId: req.user!.id,
      status: status as string,
      fulfillmentStatus: fulfillmentStatus as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get single request by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const request = await marketRequestRepo.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check access - owner or admin
    if (request.request.shipperId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get fulfillment history if admin
    let fulfillmentHistory = null;
    if (req.user!.role === 'admin') {
      fulfillmentHistory = await marketRequestRepo.getFulfillmentHistory(id);
    }

    res.json({ 
      request,
      fulfillmentHistory,
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

// Update my request (shipper - only if still open)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await marketRequestRepo.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.request.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existing.request.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update request that is not open' });
    }

    const updated = await marketRequestRepo.update(id, req.body);
    res.json({ message: 'Request updated', request: updated });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Cancel my request (shipper)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await marketRequestRepo.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.request.shipperId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await marketRequestRepo.update(id, {
      status: 'closed',
      fulfillmentStatus: 'cancelled',
    });

    res.json({ message: 'Request cancelled', request: updated });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// ============ ADMIN ROUTES ============

// Get all requests (admin)
router.get('/admin/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, fulfillmentStatus, assignedTo, search, limit, offset } = req.query;

    const requests = await marketRequestRepo.findAll({
      status: status as string,
      fulfillmentStatus: fulfillmentStatus as string,
      assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({ requests });
  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get pending requests for internal team (admin)
router.get('/admin/pending', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const requests = await marketRequestRepo.getPendingForTeam();
    res.json({ requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Get requests assigned to me (admin/team member)
router.get('/admin/my-assigned', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const requests = await marketRequestRepo.getAssignedToMember(req.user!.id);
    res.json({ requests });
  } catch (error) {
    console.error('Get assigned requests error:', error);
    res.status(500).json({ error: 'Failed to get assigned requests' });
  }
});

// Assign request to team member (admin)
router.post('/admin/:id/assign', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo is required' });
    }

    const updated = await marketRequestRepo.assignToTeam(id, assignedTo);

    // Log the action
    await marketRequestRepo.logFulfillmentAction({
      requestId: id,
      actionType: 'assign',
      actionBy: req.user!.id,
      notes: `Assigned to team member ID: ${assignedTo}`,
    });

    res.json({ message: 'Request assigned', request: updated });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ error: 'Failed to assign request' });
  }
});

// Log fulfillment action (admin)
router.post('/admin/:id/log-action', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { actionType, notes, carrierContacted, loadMatched, quotedPrice, outcome } = req.body;

    if (!actionType) {
      return res.status(400).json({ error: 'actionType is required' });
    }

    const log = await marketRequestRepo.logFulfillmentAction({
      requestId: id,
      actionType,
      actionBy: req.user!.id,
      notes,
      carrierContacted,
      loadMatched,
      quotedPrice,
      outcome,
    });

    // Update fulfillment status based on action
    let newStatus = null;
    switch (actionType) {
      case 'search':
        newStatus = 'searching';
        break;
      case 'contact_carrier':
        newStatus = 'searching';
        break;
      case 'found':
        newStatus = 'found';
        break;
      case 'negotiate':
        newStatus = 'negotiating';
        break;
      case 'match':
        newStatus = 'fulfilled';
        break;
    }

    if (newStatus) {
      await marketRequestRepo.update(id, { fulfillmentStatus: newStatus });
    }

    res.json({ message: 'Action logged', log });
  } catch (error) {
    console.error('Log action error:', error);
    res.status(500).json({ error: 'Failed to log action' });
  }
});

// Mark request as fulfilled (admin)
router.post('/admin/:id/fulfill', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { matchedLoadId, matchedCarrierId } = req.body;

    if (!matchedLoadId || !matchedCarrierId) {
      return res.status(400).json({ error: 'matchedLoadId and matchedCarrierId are required' });
    }

    const updated = await marketRequestRepo.markFulfilled(id, matchedLoadId, matchedCarrierId);

    // Log the action
    await marketRequestRepo.logFulfillmentAction({
      requestId: id,
      actionType: 'fulfill',
      actionBy: req.user!.id,
      loadMatched: matchedLoadId,
      carrierContacted: matchedCarrierId,
      outcome: 'success',
      notes: 'Request fulfilled successfully',
    });

    res.json({ message: 'Request fulfilled', request: updated });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({ error: 'Failed to fulfill request' });
  }
});

// Update internal notes (admin)
router.put('/admin/:id/notes', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { internalNotes } = req.body;

    const updated = await marketRequestRepo.update(id, { internalNotes });
    res.json({ message: 'Notes updated', request: updated });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// Get fulfillment history (admin)
router.get('/admin/:id/history', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const history = await marketRequestRepo.getFulfillmentHistory(id);
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get statistics (admin)
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stats = await marketRequestRepo.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Approve market request (admin)
router.post('/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await marketRequestRepo.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = await marketRequestRepo.update(id, {
      status: 'open',
      fulfillmentStatus: 'searching',
    });

    // Log the action
    await marketRequestRepo.logFulfillmentAction({
      requestId: id,
      actionType: 'approve',
      actionBy: req.user!.id,
      notes: 'Request approved by admin',
      outcome: 'success',
    });

    // TODO: Send notification to shipper about approval

    res.json({ message: 'Request approved', request: updated });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Reject market request (admin)
router.post('/:id/reject', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    
    const existing = await marketRequestRepo.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = await marketRequestRepo.update(id, {
      status: 'closed',
      fulfillmentStatus: 'cancelled',
    });

    // Log the action
    await marketRequestRepo.logFulfillmentAction({
      requestId: id,
      actionType: 'reject',
      actionBy: req.user!.id,
      notes: reason || 'Request rejected by admin',
      outcome: 'rejected',
    });

    // TODO: Send notification to shipper about rejection

    res.json({ message: 'Request rejected', request: updated });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

export default router;
