import { Router } from 'express';
import { builtyRepo } from '../repositories/builtyRepository.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Create a new builty receipt (when booking is confirmed)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      bookingId,
      consigneeId,
      consigneeName,
      consigneePhone,
      consigneeAddress,
      carrierId,
      driverId,
      vehicleId,
      vehicleNumber,
      vehicleType,
      fromLocation,
      fromLatitude,
      fromLongitude,
      toLocation,
      toLatitude,
      toLongitude,
      cargoDescription,
      numberOfPackages,
      packagingType,
      declaredWeight,
      actualWeight,
      declaredValue,
      freightCharges,
      loadingCharges,
      unloadingCharges,
      otherCharges,
      paymentMode,
      advancePaid,
      expectedDeliveryDate,
      conditionAtPickup,
      pickupPhotos,
      termsAndConditions,
      specialInstructions,
    } = req.body;

    if (!bookingId || !consigneeName || !carrierId || !vehicleNumber || 
        !fromLocation || !toLocation || !cargoDescription || !numberOfPackages || !freightCharges) {
      return res.status(400).json({ 
        error: 'Missing required fields: bookingId, consigneeName, carrierId, vehicleNumber, fromLocation, toLocation, cargoDescription, numberOfPackages, freightCharges' 
      });
    }

    const builty = await builtyRepo.create({
      bookingId,
      consignorId: req.user!.id,
      consigneeId,
      consigneeName,
      consigneePhone,
      consigneeAddress,
      carrierId,
      driverId,
      vehicleId,
      vehicleNumber,
      vehicleType,
      fromLocation,
      fromLatitude,
      fromLongitude,
      toLocation,
      toLatitude,
      toLongitude,
      cargoDescription,
      numberOfPackages,
      packagingType,
      declaredWeight,
      actualWeight,
      declaredValue,
      freightCharges,
      loadingCharges,
      unloadingCharges,
      otherCharges,
      paymentMode,
      advancePaid,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      conditionAtPickup,
      pickupPhotos,
      termsAndConditions,
      specialInstructions,
    });

    // Return builty without platform fee (hidden)
    const { platformFeeHidden, ...publicBuilty } = builty;

    res.status(201).json({
      message: 'Builty created successfully',
      builty: publicBuilty,
    });
  } catch (error) {
    console.error('Create builty error:', error);
    res.status(500).json({ error: 'Failed to create builty' });
  }
});

// Get my builty receipts (as consignor/shipper)
router.get('/my-builties', requireAuth, async (req, res) => {
  try {
    const { status, limit, offset, search } = req.query;

    const builties = await builtyRepo.findAll({
      consignorId: req.user!.id,
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    // Remove platform fee from response
    const publicBuilties = builties.map(({ builty, consignor }) => {
      const { platformFeeHidden, ...publicBuilty } = builty;
      return { builty: publicBuilty, consignor };
    });

    res.json({ builties: publicBuilties });
  } catch (error) {
    console.error('Get my builties error:', error);
    res.status(500).json({ error: 'Failed to get builties' });
  }
});

// Get builty receipts as carrier
router.get('/carrier-builties', requireAuth, async (req, res) => {
  try {
    const { status, limit, offset, search } = req.query;

    const builties = await builtyRepo.findAll({
      carrierId: req.user!.id,
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    // Remove platform fee from response
    const publicBuilties = builties.map(({ builty, consignor }) => {
      const { platformFeeHidden, ...publicBuilty } = builty;
      return { builty: publicBuilty, consignor };
    });

    res.json({ builties: publicBuilties });
  } catch (error) {
    console.error('Get carrier builties error:', error);
    res.status(500).json({ error: 'Failed to get builties' });
  }
});

// Get single builty by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const builty = await builtyRepo.findById(id);

    if (!builty) {
      return res.status(404).json({ error: 'Builty not found' });
    }

    // Check access - consignor, carrier, or admin
    if (builty.consignorId !== req.user!.id && 
        builty.carrierId !== req.user!.id && 
        req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove platform fee for non-admin
    if (req.user!.role !== 'admin') {
      const { platformFeeHidden, ...publicBuilty } = builty;
      return res.json({ builty: publicBuilty });
    }

    res.json({ builty });
  } catch (error) {
    console.error('Get builty error:', error);
    res.status(500).json({ error: 'Failed to get builty' });
  }
});

// Get builty for printing (public view)
router.get('/print/:builtyNumber', async (req, res) => {
  try {
    const builty = await builtyRepo.getForPrint(req.params.builtyNumber);

    if (!builty) {
      return res.status(404).json({ error: 'Builty not found' });
    }

    res.json({ builty });
  } catch (error) {
    console.error('Get builty for print error:', error);
    res.status(500).json({ error: 'Failed to get builty' });
  }
});

// Verify builty (QR code scanning)
router.get('/verify/:builtyNumber', async (req, res) => {
  try {
    const result = await builtyRepo.verify(req.params.builtyNumber);
    res.json(result);
  } catch (error) {
    console.error('Verify builty error:', error);
    res.status(500).json({ error: 'Failed to verify builty' });
  }
});

// Mark builty as dispatched (carrier/driver)
router.post('/:id/dispatch', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { driverSignature } = req.body;

    const builty = await builtyRepo.findById(id);
    if (!builty) {
      return res.status(404).json({ error: 'Builty not found' });
    }

    // Only carrier can dispatch
    if (builty.carrierId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only carrier can dispatch' });
    }

    const updated = await builtyRepo.markDispatched(id, driverSignature);
    
    const { platformFeeHidden, ...publicBuilty } = updated!;
    res.json({ message: 'Builty dispatched', builty: publicBuilty });
  } catch (error) {
    console.error('Dispatch builty error:', error);
    res.status(500).json({ error: 'Failed to dispatch builty' });
  }
});

// Mark builty as delivered (carrier/driver)
router.post('/:id/deliver', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { consigneeSignature, conditionAtDelivery, damageNotes, deliveryPhotos, actualWeight } = req.body;

    const builty = await builtyRepo.findById(id);
    if (!builty) {
      return res.status(404).json({ error: 'Builty not found' });
    }

    // Only carrier can mark delivered
    if (builty.carrierId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only carrier can mark delivered' });
    }

    const updated = await builtyRepo.markDelivered(id, {
      consigneeSignature,
      conditionAtDelivery,
      damageNotes,
      deliveryPhotos,
      actualWeight,
    });

    const { platformFeeHidden, ...publicBuilty } = updated!;
    res.json({ message: 'Builty delivered', builty: publicBuilty });
  } catch (error) {
    console.error('Deliver builty error:', error);
    res.status(500).json({ error: 'Failed to mark delivered' });
  }
});

// Add consignor signature
router.post('/:id/sign-consignor', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { signature } = req.body;

    const builty = await builtyRepo.findById(id);
    if (!builty) {
      return res.status(404).json({ error: 'Builty not found' });
    }

    if (builty.consignorId !== req.user!.id) {
      return res.status(403).json({ error: 'Only consignor can sign' });
    }

    const updated = await builtyRepo.update(id, { consignorSignature: signature });
    
    const { platformFeeHidden, ...publicBuilty } = updated!;
    res.json({ message: 'Signature added', builty: publicBuilty });
  } catch (error) {
    console.error('Sign builty error:', error);
    res.status(500).json({ error: 'Failed to add signature' });
  }
});

// ============ ADMIN ROUTES ============

// Get all builties (admin)
router.get('/admin/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;

    const builties = await builtyRepo.findAll({
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    // Admin can see platform fee
    res.json({ builties });
  } catch (error) {
    console.error('Admin get builties error:', error);
    res.status(500).json({ error: 'Failed to get builties' });
  }
});

// Get builty statistics (admin)
router.get('/admin/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stats = await builtyRepo.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
