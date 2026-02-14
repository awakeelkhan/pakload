import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

// Load status types
export type LoadStatus = 
  | 'assigned'
  | 'picked'
  | 'in_transit'
  | 'at_checkpoint'
  | 'customs_clearance'
  | 'delivered'
  | 'delayed'
  | 'issue_reported';

// Checkpoint/milestone types
export type CheckpointType = 
  | 'pickup'
  | 'checkpoint'
  | 'border_crossing'
  | 'customs'
  | 'rest_stop'
  | 'fuel_stop'
  | 'delivery';

export interface LocationUpdate {
  id: string;
  loadId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: string;
  synced: boolean;
}

export interface StatusUpdate {
  id: string;
  loadId: number;
  status: LoadStatus;
  checkpointType?: CheckpointType;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export interface TrackingData {
  loadId: number;
  currentStatus: LoadStatus;
  currentLocation: LocationUpdate | null;
  statusHistory: StatusUpdate[];
  locationHistory: LocationUpdate[];
  lastSyncedAt: string | null;
}

const STORAGE_KEYS = {
  PENDING_LOCATIONS: 'pending_location_updates',
  PENDING_STATUS: 'pending_status_updates',
  TRACKING_DATA: 'tracking_data',
};

class TrackingService {
  private isTracking: boolean = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.API_URL || 'http://localhost:5000';
    this.initNetworkListener();
  }

  // Initialize network state listener for auto-sync
  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncPendingUpdates();
      }
    });
  }

  // Generate unique ID for updates
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Request location permissions
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      return backgroundStatus === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Start continuous location tracking
  async startTracking(loadId: number): Promise<boolean> {
    if (this.isTracking) {
      console.log('Tracking already active');
      return true;
    }

    const hasPermission = await this.requestLocationPermissions();
    if (!hasPermission) {
      console.error('Location permissions not granted');
      return false;
    }

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Or every 100 meters
        },
        (location) => {
          this.handleLocationUpdate(loadId, location);
        }
      );

      this.isTracking = true;

      // Start periodic sync
      this.syncInterval = setInterval(() => {
        this.syncPendingUpdates();
      }, 60000); // Sync every minute

      console.log('Location tracking started for load:', loadId);
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  // Stop location tracking
  stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  // Handle incoming location update
  private async handleLocationUpdate(loadId: number, location: Location.LocationObject) {
    const locationUpdate: LocationUpdate = {
      id: this.generateId(),
      loadId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      speed: location.coords.speed,
      heading: location.coords.heading,
      altitude: location.coords.altitude,
      timestamp: new Date(location.timestamp).toISOString(),
      synced: false,
    };

    // Store locally
    await this.storeLocationUpdate(locationUpdate);

    // Try to sync immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      await this.syncLocationUpdate(locationUpdate);
    }
  }

  // Store location update locally
  private async storeLocationUpdate(update: LocationUpdate) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_LOCATIONS);
      const updates: LocationUpdate[] = existing ? JSON.parse(existing) : [];
      updates.push(update);

      // Keep only last 1000 updates to prevent storage overflow
      const trimmed = updates.slice(-1000);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_LOCATIONS, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing location update:', error);
    }
  }

  // Update load status (called by driver)
  async updateStatus(
    loadId: number,
    status: LoadStatus,
    location: string,
    checkpointType?: CheckpointType,
    notes?: string
  ): Promise<boolean> {
    try {
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const statusUpdate: StatusUpdate = {
        id: this.generateId(),
        loadId,
        status,
        checkpointType,
        location,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        notes,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      // Store locally
      await this.storeStatusUpdate(statusUpdate);

      // Try to sync immediately if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        return await this.syncStatusUpdate(statusUpdate);
      }

      return true; // Stored locally, will sync later
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  // Store status update locally
  private async storeStatusUpdate(update: StatusUpdate) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_STATUS);
      const updates: StatusUpdate[] = existing ? JSON.parse(existing) : [];
      updates.push(update);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_STATUS, JSON.stringify(updates));
    } catch (error) {
      console.error('Error storing status update:', error);
    }
  }

  // Sync single location update to server
  private async syncLocationUpdate(update: LocationUpdate): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${this.apiBaseUrl}/api/tracking/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (response.ok) {
        // Mark as synced
        await this.markLocationSynced(update.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing location update:', error);
      return false;
    }
  }

  // Sync single status update to server
  private async syncStatusUpdate(update: StatusUpdate): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${this.apiBaseUrl}/api/tracking/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (response.ok) {
        // Mark as synced
        await this.markStatusSynced(update.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing status update:', error);
      return false;
    }
  }

  // Sync all pending updates
  async syncPendingUpdates(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('No internet connection, skipping sync');
      return;
    }

    // Sync pending locations
    try {
      const pendingLocations = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_LOCATIONS);
      if (pendingLocations) {
        const locations: LocationUpdate[] = JSON.parse(pendingLocations);
        const unsynced = locations.filter(l => !l.synced);

        for (const location of unsynced) {
          await this.syncLocationUpdate(location);
        }
      }
    } catch (error) {
      console.error('Error syncing pending locations:', error);
    }

    // Sync pending status updates
    try {
      const pendingStatus = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_STATUS);
      if (pendingStatus) {
        const statuses: StatusUpdate[] = JSON.parse(pendingStatus);
        const unsynced = statuses.filter(s => !s.synced);

        for (const status of unsynced) {
          await this.syncStatusUpdate(status);
        }
      }
    } catch (error) {
      console.error('Error syncing pending status updates:', error);
    }

    console.log('Sync completed');
  }

  // Mark location as synced
  private async markLocationSynced(id: string) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_LOCATIONS);
      if (existing) {
        const updates: LocationUpdate[] = JSON.parse(existing);
        const updated = updates.map(u => u.id === id ? { ...u, synced: true } : u);
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_LOCATIONS, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking location synced:', error);
    }
  }

  // Mark status as synced
  private async markStatusSynced(id: string) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_STATUS);
      if (existing) {
        const updates: StatusUpdate[] = JSON.parse(existing);
        const updated = updates.map(u => u.id === id ? { ...u, synced: true } : u);
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_STATUS, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking status synced:', error);
    }
  }

  // Get tracking data for a load
  async getTrackingData(loadId: number): Promise<TrackingData | null> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${this.apiBaseUrl}/api/tracking/${loadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      return null;
    }
  }

  // Get pending updates count
  async getPendingUpdatesCount(): Promise<{ locations: number; statuses: number }> {
    try {
      const pendingLocations = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_LOCATIONS);
      const pendingStatus = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_STATUS);

      const locations: LocationUpdate[] = pendingLocations ? JSON.parse(pendingLocations) : [];
      const statuses: StatusUpdate[] = pendingStatus ? JSON.parse(pendingStatus) : [];

      return {
        locations: locations.filter(l => !l.synced).length,
        statuses: statuses.filter(s => !s.synced).length,
      };
    } catch (error) {
      console.error('Error getting pending updates count:', error);
      return { locations: 0, statuses: 0 };
    }
  }

  // Clear synced updates (cleanup)
  async clearSyncedUpdates(): Promise<void> {
    try {
      const pendingLocations = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_LOCATIONS);
      if (pendingLocations) {
        const locations: LocationUpdate[] = JSON.parse(pendingLocations);
        const unsynced = locations.filter(l => !l.synced);
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_LOCATIONS, JSON.stringify(unsynced));
      }

      const pendingStatus = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_STATUS);
      if (pendingStatus) {
        const statuses: StatusUpdate[] = JSON.parse(pendingStatus);
        const unsynced = statuses.filter(s => !s.synced);
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_STATUS, JSON.stringify(unsynced));
      }
    } catch (error) {
      console.error('Error clearing synced updates:', error);
    }
  }
}

export const trackingService = new TrackingService();
export default trackingService;
