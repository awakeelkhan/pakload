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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import trackingService, { LoadStatus, CheckpointType } from '../services/trackingService';

interface DriverTrackingScreenProps {
  route: {
    params: {
      loadId: number;
      origin: string;
      destination: string;
    };
  };
  navigation: any;
}

const STATUS_OPTIONS: { status: LoadStatus; label: string; icon: string; color: string }[] = [
  { status: 'picked', label: 'Picked Up', icon: 'checkmark-circle', color: '#3B82F6' },
  { status: 'in_transit', label: 'In Transit', icon: 'car', color: '#10B981' },
  { status: 'at_checkpoint', label: 'At Checkpoint', icon: 'location', color: '#F59E0B' },
  { status: 'customs_clearance', label: 'Customs Clearance', icon: 'document-text', color: '#8B5CF6' },
  { status: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle', color: '#059669' },
  { status: 'delayed', label: 'Delayed', icon: 'time', color: '#EF4444' },
  { status: 'issue_reported', label: 'Report Issue', icon: 'warning', color: '#DC2626' },
];

const CHECKPOINT_OPTIONS: { type: CheckpointType; label: string }[] = [
  { type: 'pickup', label: 'Pickup Point' },
  { type: 'checkpoint', label: 'Checkpoint' },
  { type: 'border_crossing', label: 'Border Crossing' },
  { type: 'customs', label: 'Customs' },
  { type: 'rest_stop', label: 'Rest Stop' },
  { type: 'fuel_stop', label: 'Fuel Stop' },
  { type: 'delivery', label: 'Delivery Point' },
];

export default function DriverTrackingScreen({ route, navigation }: DriverTrackingScreenProps) {
  const { loadId, origin, destination } = route.params;
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LoadStatus>('assigned');
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointType | null>(null);
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState({ locations: 0, statuses: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkPendingUpdates();
    const interval = setInterval(checkPendingUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkPendingUpdates = async () => {
    const counts = await trackingService.getPendingUpdatesCount();
    setPendingUpdates(counts);
  };

  const handleStartTracking = async () => {
    const success = await trackingService.startTracking(loadId);
    if (success) {
      setIsTracking(true);
      Alert.alert('Tracking Started', 'Your location is now being tracked.');
    } else {
      Alert.alert('Error', 'Failed to start tracking. Please check location permissions.');
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
            trackingService.stopTracking();
            setIsTracking(false);
          },
        },
      ]
    );
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
      const success = await trackingService.updateStatus(
        loadId,
        selectedStatus,
        locationName.trim(),
        selectedCheckpoint || undefined,
        notes.trim() || undefined
      );

      if (success) {
        setCurrentStatus(selectedStatus);
        Alert.alert('Success', 'Status updated successfully');
        
        // Reset form
        setSelectedStatus(null);
        setSelectedCheckpoint(null);
        setLocationName('');
        setNotes('');
        
        // Check pending updates
        checkPendingUpdates();
      } else {
        Alert.alert('Saved Offline', 'Status saved locally. Will sync when online.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncNow = async () => {
    Alert.alert('Syncing', 'Syncing pending updates...');
    await trackingService.syncPendingUpdates();
    checkPendingUpdates();
    Alert.alert('Done', 'Sync completed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Load Tracking</Text>
            <Text style={styles.headerSubtitle}>Load #{loadId}</Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.routeText}>{origin}</Text>
          </View>
          <View style={styles.routeArrow}>
            <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
          </View>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={20} color="#EF4444" />
            <Text style={styles.routeText}>{destination}</Text>
          </View>
        </View>

        {/* Tracking Control */}
        <View style={styles.trackingCard}>
          <Text style={styles.sectionTitle}>Location Tracking</Text>
          <View style={styles.trackingStatus}>
            <View style={[styles.statusDot, isTracking ? styles.statusDotActive : styles.statusDotInactive]} />
            <Text style={styles.trackingStatusText}>
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </Text>
          </View>
          
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

          {/* Pending Updates */}
          {(pendingUpdates.locations > 0 || pendingUpdates.statuses > 0) && (
            <View style={styles.pendingCard}>
              <Ionicons name="cloud-upload" size={20} color="#F59E0B" />
              <Text style={styles.pendingText}>
                {pendingUpdates.locations + pendingUpdates.statuses} pending updates
              </Text>
              <TouchableOpacity onPress={handleSyncNow}>
                <Text style={styles.syncLink}>Sync Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Status Update */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          
          {/* Status Options */}
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

          {/* Checkpoint Type (optional) */}
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

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Gilgit City, Near Main Bazaar"
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional information..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
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

        {/* Current Status Display */}
        <View style={styles.currentStatusCard}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.currentStatusDisplay}>
            <Ionicons 
              name={STATUS_OPTIONS.find(s => s.status === currentStatus)?.icon as any || 'help-circle'} 
              size={32} 
              color={STATUS_OPTIONS.find(s => s.status === currentStatus)?.color || '#6B7280'} 
            />
            <Text style={styles.currentStatusText}>
              {STATUS_OPTIONS.find(s => s.status === currentStatus)?.label || 'Assigned'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
  routeArrow: {
    paddingHorizontal: 8,
  },
  trackingCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
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
  statusCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 12,
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
  currentStatusCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
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
