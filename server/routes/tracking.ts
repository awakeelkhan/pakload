import { Router, Request, Response } from 'express';
import { db } from '../db';
import { loads } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// In-memory storage for tracking data (in production, use database)
interface LocationUpdate {
  id: string;
  loadId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: string;
}

interface StatusUpdate {
  id: string;
  loadId: number;
  status: string;
  checkpointType?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  timestamp: string;
}

// Store tracking data in memory (replace with database in production)
const trackingData: Map<number, {
  currentStatus: string;
  currentLocation: LocationUpdate | null;
  statusHistory: StatusUpdate[];
  locationHistory: LocationUpdate[];
  lastSyncedAt: string | null;
}> = new Map();

// POST /api/tracking/location - Receive location update from driver
router.post('/location', async (req: Request, res: Response) => {
  try {
    const locationUpdate: LocationUpdate = req.body;
    const { loadId } = locationUpdate;

    if (!loadId) {
      return res.status(400).json({ error: 'Load ID is required' });
    }

    // Get or create tracking data for this load
    let data = trackingData.get(loadId);
    if (!data) {
      data = {
        currentStatus: 'in_transit',
        currentLocation: null,
        statusHistory: [],
        locationHistory: [],
        lastSyncedAt: null,
      };
      trackingData.set(loadId, data);
    }

    // Update current location
    data.currentLocation = locationUpdate;
    data.locationHistory.push(locationUpdate);
    data.lastSyncedAt = new Date().toISOString();

    // Keep only last 500 location points
    if (data.locationHistory.length > 500) {
      data.locationHistory = data.locationHistory.slice(-500);
    }

    console.log(`Location update received for load ${loadId}:`, {
      lat: locationUpdate.latitude,
      lng: locationUpdate.longitude,
      timestamp: locationUpdate.timestamp,
    });

    res.json({ success: true, message: 'Location update received' });
  } catch (error) {
    console.error('Error processing location update:', error);
    res.status(500).json({ error: 'Failed to process location update' });
  }
});

// POST /api/tracking/status - Receive status update from driver
router.post('/status', async (req: Request, res: Response) => {
  try {
    const statusUpdate: StatusUpdate = req.body;
    const { loadId, status } = statusUpdate;

    if (!loadId || !status) {
      return res.status(400).json({ error: 'Load ID and status are required' });
    }

    // Get or create tracking data for this load
    let data = trackingData.get(loadId);
    if (!data) {
      data = {
        currentStatus: status,
        currentLocation: null,
        statusHistory: [],
        locationHistory: [],
        lastSyncedAt: null,
      };
      trackingData.set(loadId, data);
    }

    // Update current status and add to history
    data.currentStatus = status;
    data.statusHistory.push(statusUpdate);
    data.lastSyncedAt = new Date().toISOString();

    // Update load status in database
    try {
      await db.update(loads)
        .set({ status: mapStatusToDbStatus(status) })
        .where(eq(loads.id, loadId));
    } catch (dbError) {
      console.error('Error updating load status in database:', dbError);
    }

    console.log(`Status update received for load ${loadId}:`, {
      status,
      location: statusUpdate.location,
      timestamp: statusUpdate.timestamp,
    });

    res.json({ success: true, message: 'Status update received' });
  } catch (error) {
    console.error('Error processing status update:', error);
    res.status(500).json({ error: 'Failed to process status update' });
  }
});

// GET /api/tracking/:loadId - Get tracking data for a load
router.get('/:loadId', async (req: Request, res: Response) => {
  try {
    const loadId = parseInt(req.params.loadId);

    if (isNaN(loadId)) {
      return res.status(400).json({ error: 'Invalid load ID' });
    }

    const data = trackingData.get(loadId);

    if (!data) {
      // Return empty tracking data if not found
      return res.json({
        loadId,
        currentStatus: 'assigned',
        currentLocation: null,
        statusHistory: [],
        locationHistory: [],
        lastSyncedAt: null,
      });
    }

    res.json({
      loadId,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// GET /api/tracking/:loadId/history - Get full status history
router.get('/:loadId/history', async (req: Request, res: Response) => {
  try {
    const loadId = parseInt(req.params.loadId);

    if (isNaN(loadId)) {
      return res.status(400).json({ error: 'Invalid load ID' });
    }

    const data = trackingData.get(loadId);

    if (!data) {
      return res.json({ statusHistory: [], locationHistory: [] });
    }

    res.json({
      statusHistory: data.statusHistory,
      locationHistory: data.locationHistory,
    });
  } catch (error) {
    console.error('Error fetching tracking history:', error);
    res.status(500).json({ error: 'Failed to fetch tracking history' });
  }
});

// GET /api/tracking/:loadId/route - Get route path for map display
router.get('/:loadId/route', async (req: Request, res: Response) => {
  try {
    const loadId = parseInt(req.params.loadId);

    if (isNaN(loadId)) {
      return res.status(400).json({ error: 'Invalid load ID' });
    }

    const data = trackingData.get(loadId);

    if (!data || data.locationHistory.length === 0) {
      return res.json({ route: [] });
    }

    // Return simplified route for map display
    const route = data.locationHistory.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      timestamp: loc.timestamp,
    }));

    res.json({ route });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Helper function to map tracking status to database status
function mapStatusToDbStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'assigned': 'posted',
    'picked': 'in_transit',
    'in_transit': 'in_transit',
    'at_checkpoint': 'in_transit',
    'customs_clearance': 'in_transit',
    'delivered': 'delivered',
    'delayed': 'in_transit',
    'issue_reported': 'in_transit',
  };
  return statusMap[status] || 'in_transit';
}

export default router;
