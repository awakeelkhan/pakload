import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { bookingsAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

const MILESTONES = [
  { key: 'booked', label: 'Booked', icon: 'checkmark-circle' },
  { key: 'pickup', label: 'Picked Up', icon: 'arrow-up-circle' },
  { key: 'in_transit', label: 'In Transit', icon: 'car' },
  { key: 'customs', label: 'Customs', icon: 'document-text' },
  { key: 'delivered', label: 'Delivered', icon: 'flag' },
];

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await bookingsAPI.getById(Number(id));
      return response;
    },
    enabled: !!id && isAuthenticated,
  });

  // Extract booking and load data - handle nested API response
  const rawBooking = bookingData?.booking || bookingData;
  const load = bookingData?.load || rawBooking?.load || {};
  
  // Merge booking with load data for display
  const booking = rawBooking ? {
    ...rawBooking,
    origin: rawBooking.origin || load.origin || load.pickupCity,
    destination: rawBooking.destination || load.destination || load.deliveryCity,
    cargoType: rawBooking.cargoType || load.cargoType,
    weight: rawBooking.weight || load.weight,
    vehicleType: rawBooking.vehicleType || load.vehicleType,
    distance: rawBooking.distance || load.distance,
  } : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'confirmed': return '#2563eb';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getMilestoneStatus = (milestoneKey: string, bookingStatus: string, progress: number) => {
    const milestoneIndex = MILESTONES.findIndex(m => m.key === milestoneKey);
    const statusIndex = MILESTONES.findIndex(m => m.key === bookingStatus);
    
    if (milestoneIndex < statusIndex) return 'completed';
    if (milestoneIndex === statusIndex) return 'current';
    return 'pending';
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={64} color="#d1d5db" />
        <Text style={styles.errorTitle}>Sign In Required</Text>
        <Text style={styles.errorSubtitle}>Please sign in to view booking details</Text>
        <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#dc2626" />
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorSubtitle}>This booking may have been removed</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.trackingLabel}>Tracking Number</Text>
            <Text style={styles.trackingNumber}>{booking.trackingNumber || `#${booking.id}`}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Delivery Progress</Text>
            <Text style={styles.progressPercent}>{booking.progress || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${booking.progress || 0}%`,
                  backgroundColor: getStatusColor(booking.status)
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Route Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Route</Text>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={styles.routeDotGreen} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeCity}>{booking.origin || 'Origin'}</Text>
              {booking.pickupDate && (
                <Text style={styles.routeDate}>
                  {new Date(booking.pickupDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.routeLineContainer}>
            <View style={styles.routeLineVertical} />
            {booking.currentLocation && booking.status === 'in_transit' && (
              <View style={styles.currentLocationMarker}>
                <Ionicons name="location" size={20} color="#f59e0b" />
                <Text style={styles.currentLocationText}>{booking.currentLocation}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.routePoint}>
            <View style={styles.routeDotRed} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routeLabel}>DELIVERY</Text>
              <Text style={styles.routeCity}>{booking.destination || 'Destination'}</Text>
              {booking.deliveryDate && (
                <Text style={styles.routeDate}>
                  ETA: {new Date(booking.deliveryDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipment Milestones</Text>
        <View style={styles.milestonesContainer}>
          {MILESTONES.map((milestone, index) => {
            const status = getMilestoneStatus(milestone.key, booking.status, booking.progress || 0);
            const isLast = index === MILESTONES.length - 1;
            
            return (
              <View key={milestone.key} style={styles.milestoneRow}>
                <View style={styles.milestoneIconColumn}>
                  <View style={[
                    styles.milestoneIcon,
                    status === 'completed' && styles.milestoneIconCompleted,
                    status === 'current' && styles.milestoneIconCurrent,
                  ]}>
                    <Ionicons 
                      name={milestone.icon as any} 
                      size={20} 
                      color={status === 'pending' ? '#9ca3af' : '#fff'} 
                    />
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.milestoneLine,
                      status === 'completed' && styles.milestoneLineCompleted,
                    ]} />
                  )}
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[
                    styles.milestoneLabel,
                    status !== 'pending' && styles.milestoneLabelActive,
                  ]}>
                    {milestone.label}
                  </Text>
                  {status === 'current' && (
                    <Text style={styles.milestoneCurrentText}>Current Status</Text>
                  )}
                  {status === 'completed' && (
                    <Text style={styles.milestoneCompletedText}>Completed</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Shipment Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipment Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cube-outline" size={20} color="#6b7280" />
              <View>
                <Text style={styles.detailLabel}>Cargo Type</Text>
                <Text style={styles.detailValue}>{booking.cargoType || 'General'}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={20} color="#6b7280" />
              <View>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{(booking.weight || 0).toLocaleString()} kg</Text>
              </View>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="car-outline" size={20} color="#6b7280" />
              <View>
                <Text style={styles.detailLabel}>Vehicle Type</Text>
                <Text style={styles.detailValue}>{booking.vehicleType || 'Standard'}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="navigate-outline" size={20} color="#6b7280" />
              <View>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{booking.distance || 'N/A'} km</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment</Text>
        <View style={styles.paymentContainer}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.paymentAmount}>
              ${(booking.totalAmount || booking.price || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <View style={[
              styles.paymentStatusBadge,
              { backgroundColor: booking.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7' }
            ]}>
              <Text style={[
                styles.paymentStatusText,
                { color: booking.paymentStatus === 'paid' ? '#16a34a' : '#d97706' }
              ]}>
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call" size={24} color="#16a34a" />
          <Text style={styles.actionButtonText}>Call Driver</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble" size={24} color="#16a34a" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={24} color="#16a34a" />
          <Text style={styles.actionButtonText}>Documents</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authButton: {
    marginTop: 24,
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: '#16a34a',
    borderRadius: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  trackingNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  routeContainer: {
    gap: 0,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  routeDotGreen: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    marginTop: 4,
  },
  routeDotRed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    marginTop: 4,
  },
  routePointInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 1,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  routeDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  routeLineContainer: {
    paddingLeft: 7,
    paddingVertical: 8,
  },
  routeLineVertical: {
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  currentLocationMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
    marginTop: -20,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  milestonesContainer: {
    gap: 0,
  },
  milestoneRow: {
    flexDirection: 'row',
  },
  milestoneIconColumn: {
    alignItems: 'center',
    width: 44,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneIconCompleted: {
    backgroundColor: '#16a34a',
  },
  milestoneIconCurrent: {
    backgroundColor: '#f59e0b',
  },
  milestoneLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  milestoneLineCompleted: {
    backgroundColor: '#16a34a',
  },
  milestoneContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  milestoneLabel: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  milestoneLabelActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  milestoneCurrentText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 2,
  },
  milestoneCompletedText: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 2,
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentContainer: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
});
