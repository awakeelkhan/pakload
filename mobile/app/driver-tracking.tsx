import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

type LoadStatus = 'assigned' | 'picked' | 'in_transit' | 'at_checkpoint' | 'customs_clearance' | 'delivered' | 'delayed' | 'issue_reported';
type CheckpointType = 'pickup' | 'checkpoint' | 'border_crossing' | 'customs' | 'rest_stop' | 'fuel_stop' | 'delivery';

interface LocationUpdate {
  id: string;
  loadId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  synced: boolean;
}

interface StatusUpdate {
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

const STATUS_OPTIONS: { status: LoadStatus; label: string; icon: string; color: string }[] = [
  { status: 'picked', label: 'Picked Up', icon: 'checkmark-circle', color: '#3B82F6' },
  { status: 'in_transit', label: 'In Transit', icon: 'car', color: '#10B981' },
  { status: 'at_checkpoint', label: 'At Checkpoint', icon: 'location', color: '#F59E0B' },
  { status: 'customs_clearance', label: 'Customs', icon: 'document-text', color: '#8B5CF6' },
  { status: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle', color: '#059669' },
  { status: 'delayed', label: 'Delayed', icon: 'time', color: '#EF4444' },
  { status: 'issue_reported', label: 'Report Issue', icon: 'warning', color: '#DC2626' },
];

const CHECKPOINT_OPTIONS: { type: CheckpointType; label: string }[] = [
  { type: 'pickup', label: 'Pickup' },
  { type: 'checkpoint', label: 'Checkpoint' },
  { type: 'border_crossing', label: 'Border' },
  { type: 'customs', label: 'Customs' },
  { type: 'rest_stop', label: 'Rest Stop' },
  { type: 'fuel_stop', label: 'Fuel' },
  { type: 'delivery', label: 'Delivery' },
];

const API_URL = 'http://ec2-13-50-123-3.eu-north-1.compute.amazonaws.com';

export default function DriverTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loadId = parseInt(params.loadId?.toString() || '0');
  const origin = params.origin?.toString() || 'Origin';
  const destination = params.destination?.toString() || 'Destination';

  const [isTracking, setIsTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LoadStatus>('assigned');
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointType | null>(null);
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState({ locations: 0, statuses: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    checkPendingUpdates();
    const interval = setInterval(checkPendingUpdates, 30000);
    return () => {
      clearInterval(interval);
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const checkPendingUpdates = async () => {
    try {
      const pendingLocations = await AsyncStorage.getItem('pending_location_updates');
      const pendingStatus = await AsyncStorage.getItem('pending_status_updates');
      
      const locations: LocationUpdate[] = pendingLocations ? JSON.parse(pendingLocations) : [];
      const statuses: StatusUpdate[] = pendingStatus ? JSON.parse(pendingStatus) : [];
      
      setPendingUpdates({
        locations: locations.filter(l => !l.synced).length,
        statuses: statuses.filter(s => !s.synced).length,
      });
    } catch (error) {
      console.error('Error checking pending updates:', error);
    }
  };

  const requestLocationPermissions = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required for tracking.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  };

  const handleStartTracking = async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,
          distanceInterval: 100,
        },
        async (location) => {
          setCurrentLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });

          const locationUpdate: LocationUpdate = {
            id: generateId(),
            loadId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
            synced: false,
          };

          await storeLocationUpdate(locationUpdate);
          await syncLocationUpdate(locationUpdate);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      Alert.alert('Tracking Started', 'Your location is now being tracked.');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking.');
    }
  };

  const handleStopTracking = () => {
    Alert.alert(
      'Stop Tracking',
      'Are you sure you want to stop location tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            if (locationSubscription) {
              locationSubscription.remove();
              setLocationSubscription(null);
            }
            setIsTracking(false);
          },
        },
      ]
    );
  };

  const storeLocationUpdate = async (update: LocationUpdate) => {
    try {
      const existing = await AsyncStorage.getItem('pending_location_updates');
      const updates: LocationUpdate[] = existing ? JSON.parse(existing) : [];
      updates.push(update);
      const trimmed = updates.slice(-500);
      await AsyncStorage.setItem('pending_location_updates', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing location update:', error);
    }
  };

  const storeStatusUpdate = async (update: StatusUpdate) => {
    try {
      const existing = await AsyncStorage.getItem('pending_status_updates');
      const updates: StatusUpdate[] = existing ? JSON.parse(existing) : [];
      updates.push(update);
      await AsyncStorage.setItem('pending_status_updates', JSON.stringify(updates));
    } catch (error) {
      console.error('Error storing status update:', error);
    }
  };

  const syncLocationUpdate = async (update: LocationUpdate) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return false;

      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/tracking/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (response.ok) {
        await markLocationSynced(update.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing location:', error);
      return false;
    }
  };

  const syncStatusUpdate = async (update: StatusUpdate) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return false;

      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/tracking/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (response.ok) {
        await markStatusSynced(update.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing status:', error);
      return false;
    }
  };

  const markLocationSynced = async (id: string) => {
    try {
      const existing = await AsyncStorage.getItem('pending_location_updates');
      if (existing) {
        const updates: LocationUpdate[] = JSON.parse(existing);
        const updated = updates.map(u => u.id === id ? { ...u, synced: true } : u);
        await AsyncStorage.setItem('pending_location_updates', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking location synced:', error);
    }
  };

  const markStatusSynced = async (id: string) => {
    try {
      const existing = await AsyncStorage.getItem('pending_status_updates');
      if (existing) {
        const updates: StatusUpdate[] = JSON.parse(existing);
        const updated = updates.map(u => u.id === id ? { ...u, synced: true } : u);
        await AsyncStorage.setItem('pending_status_updates', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking status synced:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter your current location');
      return;
    }

    setSubmitting(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } catch (e) {
        console.log('Could not get current location');
      }

      const statusUpdate: StatusUpdate = {
        id: generateId(),
        loadId,
        status: selectedStatus,
        checkpointType: selectedCheckpoint || undefined,
        location: locationName.trim(),
        latitude: lat,
        longitude: lng,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      await storeStatusUpdate(statusUpdate);
      const synced = await syncStatusUpdate(statusUpdate);

      setCurrentStatus(selectedStatus);
      
      if (synced) {
        Alert.alert('Success', 'Status updated successfully');
      } else {
        Alert.alert('Saved Offline', 'Status saved locally. Will sync when online.');
      }

      setSelectedStatus(null);
      setSelectedCheckpoint(null);
      setLocationName('');
      setNotes('');
      checkPendingUpdates();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncNow = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert('No Connection', 'Please connect to the internet to sync.');
      return;
    }

    Alert.alert('Syncing', 'Syncing pending updates...');

    try {
      const pendingLocations = await AsyncStorage.getItem('pending_location_updates');
      if (pendingLocations) {
        const locations: LocationUpdate[] = JSON.parse(pendingLocations);
        for (const loc of locations.filter(l => !l.synced)) {
          await syncLocationUpdate(loc);
        }
      }

      const pendingStatus = await AsyncStorage.getItem('pending_status_updates');
      if (pendingStatus) {
        const statuses: StatusUpdate[] = JSON.parse(pendingStatus);
        for (const status of statuses.filter(s => !s.synced)) {
          await syncStatusUpdate(status);
        }
      }

      checkPendingUpdates();
      Alert.alert('Done', 'Sync completed');
    } catch (error) {
      Alert.alert('Error', 'Sync failed');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Load Tracking</Text>
          <Text style={styles.headerSubtitle}>Load #{loadId}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Info */}
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.routeText} numberOfLines={1}>{origin}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
          <View style={styles.routePoint}>
            <Ionicons name="location" size={20} color="#EF4444" />
            <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>

        {/* Tracking Control */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location Tracking</Text>
          <View style={styles.trackingStatus}>
            <View style={[styles.statusDot, isTracking ? styles.statusDotActive : styles.statusDotInactive]} />
            <Text style={styles.trackingStatusText}>
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </Text>
          </View>

          {currentLocation && (
            <View style={styles.locationInfo}>
              <Ionicons name="navigate" size={16} color="#3b82f6" />
              <Text style={styles.locationText}>
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </Text>
            </View>
          )}

          {isTracking ? (
            <TouchableOpacity style={styles.stopButton} onPress={handleStopTracking}>
              <Ionicons name="stop-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Stop Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={handleStartTracking}>
              <Ionicons name="play-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Start Tracking</Text>
            </TouchableOpacity>
          )}

          {(pendingUpdates.locations > 0 || pendingUpdates.statuses > 0) && (
            <TouchableOpacity style={styles.pendingCard} onPress={handleSyncNow}>
              <Ionicons name="cloud-upload" size={20} color="#F59E0B" />
              <Text style={styles.pendingText}>
                {pendingUpdates.locations + pendingUpdates.statuses} pending updates
              </Text>
              <Text style={styles.syncLink}>Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Update */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Status</Text>

          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.status}
                style={[
                  styles.statusOption,
                  selectedStatus === option.status && { borderColor: option.color, borderWidth: 2 },
                ]}
                onPress={() => setSelectedStatus(option.status)}
              >
                <Ionicons name={option.icon as any} size={24} color={option.color} />
                <Text style={styles.statusOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedStatus && (
            <View style={styles.checkpointSection}>
              <Text style={styles.inputLabel}>Checkpoint Type (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.checkpointOptions}>
                  {CHECKPOINT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.type}
                      style={[
                        styles.checkpointChip,
                        selectedCheckpoint === option.type && styles.checkpointChipSelected,
                      ]}
                      onPress={() => setSelectedCheckpoint(
                        selectedCheckpoint === option.type ? null : option.type
                      )}
                    >
                      <Text style={[
                        styles.checkpointChipText,
                        selectedCheckpoint === option.type && styles.checkpointChipTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Gilgit City, Near Main Bazaar"
              placeholderTextColor="#9CA3AF"
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional information..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!selectedStatus || submitting) && styles.submitButtonDisabled]}
            onPress={handleStatusUpdate}
            disabled={!selectedStatus || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Update Status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Current Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.currentStatusDisplay}>
            <Ionicons
              name={(STATUS_OPTIONS.find(s => s.status === currentStatus)?.icon || 'help-circle') as any}
              size={32}
              color={STATUS_OPTIONS.find(s => s.status === currentStatus)?.color || '#6B7280'}
            />
            <Text style={styles.currentStatusText}>
              {STATUS_OPTIONS.find(s => s.status === currentStatus)?.label || 'Assigned'}
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotInactive: {
    backgroundColor: '#9CA3AF',
  },
  trackingStatusText: {
    fontSize: 14,
    color: '#4B5563',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  syncLink: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusOptionText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center',
  },
  checkpointSection: {
    marginBottom: 16,
  },
  checkpointOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  checkpointChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkpointChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkpointChipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  checkpointChipTextSelected: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  currentStatusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
  },
  currentStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
});
