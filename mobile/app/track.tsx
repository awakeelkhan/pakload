import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TrackingInfo {
  id: string;
  status: 'picked_up' | 'in_transit' | 'border_crossing' | 'customs' | 'delivered';
  origin: string;
  destination: string;
  cargo: string;
  estimatedArrival: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  currentLocation: string;
  progress: number;
  timeline: {
    status: string;
    location: string;
    time: string;
    completed: boolean;
  }[];
}

export default function TrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(params.id?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call - in production, fetch from actual API
    setTimeout(() => {
      // Mock tracking data
      setTrackingInfo({
        id: trackingNumber,
        status: 'in_transit',
        origin: 'Kashgar, China',
        destination: 'Islamabad, Pakistan',
        cargo: 'Electronics - 15,000 kg',
        estimatedArrival: 'Feb 8, 2026',
        driver: 'Ahmed Khan',
        driverPhone: '+92 300 1234567',
        vehicle: '40ft Container - ABC-1234',
        currentLocation: 'Khunjerab Pass',
        progress: 65,
        timeline: [
          { status: 'Picked Up', location: 'Kashgar Warehouse', time: 'Feb 3, 10:30 AM', completed: true },
          { status: 'In Transit', location: 'Karakoram Highway', time: 'Feb 4, 2:15 PM', completed: true },
          { status: 'Border Crossing', location: 'Khunjerab Pass', time: 'Feb 5, 9:00 AM', completed: true },
          { status: 'Customs Clearance', location: 'Sost Dry Port', time: 'Pending', completed: false },
          { status: 'Final Delivery', location: 'Islamabad', time: 'Estimated Feb 8', completed: false },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#22c55e';
      case 'in_transit': return '#3b82f6';
      case 'border_crossing': return '#f59e0b';
      case 'customs': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Shipment</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Box */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Enter Tracking Number</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g., PL-2026-001234"
              placeholderTextColor="#94a3b8"
              value={trackingNumber}
              onChangeText={(text) => {
                setTrackingNumber(text);
                setError('');
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleTrack}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Tracking Results */}
        {trackingInfo && (
          <>
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.trackingId}>#{trackingInfo.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trackingInfo.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(trackingInfo.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(trackingInfo.status) }]}>
                      {trackingInfo.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>{trackingInfo.progress}%</Text>
                </View>
              </View>

              <View style={styles.routeInfo}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.routeText}>{trackingInfo.origin}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.routeText}>{trackingInfo.destination}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="cube-outline" size={18} color="#64748b" />
                  <Text style={styles.infoLabel}>Cargo</Text>
                  <Text style={styles.infoValue}>{trackingInfo.cargo}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <Text style={styles.infoLabel}>ETA</Text>
                  <Text style={styles.infoValue}>{trackingInfo.estimatedArrival}</Text>
                </View>
              </View>
            </View>

            {/* Current Location */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={24} color="#22c55e" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.locationValue}>{trackingInfo.currentLocation}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/map')}>
                <Ionicons name="map-outline" size={18} color="#22c55e" />
                <Text style={styles.mapButtonText}>View on Map</Text>
              </TouchableOpacity>
            </View>

            {/* Driver Info */}
            <View style={styles.driverCard}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{trackingInfo.driver}</Text>
                  <Text style={styles.vehicleInfo}>{trackingInfo.vehicle}</Text>
                </View>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>Shipment Timeline</Text>
              {trackingInfo.timeline.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      item.completed ? styles.timelineDotCompleted : styles.timelineDotPending
                    ]}>
                      {item.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    {index < trackingInfo.timeline.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        item.completed ? styles.timelineLineCompleted : styles.timelineLinePending
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStatus, !item.completed && styles.timelineStatusPending]}>
                      {item.status}
                    </Text>
                    <Text style={styles.timelineLocation}>{item.location}</Text>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Empty State */}
        {!trackingInfo && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Track Your Shipment</Text>
            <Text style={styles.emptyText}>
              Enter your tracking number above to see real-time updates on your shipment's location and status.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  trackingId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdf4',
    borderWidth: 4,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },
  routeInfo: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeText: {
    fontSize: 14,
    color: '#475569',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginLeft: 5,
    marginVertical: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#22c55e',
  },
  timelineDotPending: {
    backgroundColor: '#e2e8f0',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
  },
  timelineLineCompleted: {
    backgroundColor: '#22c55e',
  },
  timelineLinePending: {
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  timelineStatusPending: {
    color: '#94a3b8',
  },
  timelineLocation: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
