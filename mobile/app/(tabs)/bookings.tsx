import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { bookingsAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'in_transit' | 'delivered';

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await bookingsAPI.getAll();
        // Handle different API response formats
        if (Array.isArray(response)) return response;
        if (response?.bookings && Array.isArray(response.bookings)) return response.bookings;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      } catch (error) {
        console.log('Bookings fetch error:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

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

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'in_transit': return 'car';
      case 'delivered': return 'checkmark-circle';
      case 'confirmed': return 'thumbs-up';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'ellipse';
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

  const filteredBookings = (bookings || []).filter((booking: any) => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.trackingNumber?.toLowerCase().includes(query) ||
        booking.origin?.toLowerCase().includes(query) ||
        booking.destination?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const statusCounts = {
    all: (bookings || []).length,
    pending: (bookings || []).filter((b: any) => b.status === 'pending').length,
    confirmed: (bookings || []).filter((b: any) => b.status === 'confirmed').length,
    in_transit: (bookings || []).filter((b: any) => b.status === 'in_transit').length,
    delivered: (bookings || []).filter((b: any) => b.status === 'delivered').length,
  };

  const renderBookingCard = ({ item }: any) => {
    if (!item) return null;
    
    // Safely extract data with fallbacks - handle nested load data
    const load = item.load || {};
    const origin = item.origin || load.origin || load.pickupCity || 'Origin';
    const destination = item.destination || load.destination || load.deliveryCity || 'Destination';
    const cargoType = item.cargoType || load.cargoType || 'General';
    const weight = item.weight || load.weight || 0;
    const totalAmount = item.totalAmount || item.price || load.price || item.agreedPrice || 0;
    const currency = item.currency || load.currency || 'PKR';
    const currencySymbol = currency === 'PKR' ? 'PKR ' : currency === 'CNY' ? '¥' : '$';
    const status = item.status || 'pending';
    const progress = item.progress || (status === 'delivered' ? 100 : status === 'in_transit' ? 50 : 0);
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${item.id}`)}
      >
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingNumber}>{item.trackingNumber || `#PL-${String(item.id || 0).padStart(6, '0')}`}</Text>
            <Text style={styles.bookingDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Ionicons name={getStatusIcon(status)} size={14} color={getStatusColor(status)} />
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routePoint}>
            <View style={styles.routeDotGreen} />
            <Text style={styles.routeCity}>{origin}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.routeDotRed} />
            <Text style={styles.routeCity}>{destination}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {status !== 'cancelled' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Delivery Progress</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: getStatusColor(status)
                  }
                ]} 
              />
            </View>
            {status === 'in_transit' && item.currentLocation && (
              <View style={styles.currentLocation}>
                <Ionicons name="location" size={14} color="#f59e0b" />
                <Text style={styles.currentLocationText}>{item.currentLocation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{cargoType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="scale-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{Number(weight).toLocaleString()} kg</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.bookingFooter}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceAmount}>{currencySymbol}{Number(totalAmount).toLocaleString()}</Text>
          </View>
          <View style={styles.footerActions}>
            {status === 'delivered' || status === 'confirmed' ? (
              <TouchableOpacity 
                style={styles.biltyButton}
                onPress={() => router.push({
                  pathname: '/bilty',
                  params: { 
                    bookingId: item.id,
                    trackingNumber: item.trackingNumber || `PL-${String(item.id).padStart(6, '0')}`,
                    origin,
                    destination,
                    price: totalAmount
                  }
                })}
              >
                <Ionicons name="document-text" size={16} color="#16a34a" />
                <Text style={styles.biltyButtonText}>Bilty</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => router.push(`/bookings/${item.id}`)}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="lock-closed" size={64} color="#d1d5db" />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authSubtitle}>Please sign in to view your bookings</Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by tracking number or city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'pending', 'confirmed', 'in_transit', 'delivered'] as StatusFilter[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, statusFilter === status && styles.filterTabActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterTabText, statusFilter === status && styles.filterTabTextActive]}>
              {status === 'all' ? 'All' : status === 'in_transit' ? 'Transit' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            <View style={[styles.filterBadge, statusFilter === status && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, statusFilter === status && styles.filterBadgeTextActive]}>
                {statusCounts[status]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item, index) => item?.id?.toString() || `booking-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22c55e']} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No bookings found</Text>
              <Text style={styles.emptySubtitle}>
                {statusFilter !== 'all' 
                  ? `No ${statusFilter.replace('_', ' ')} bookings`
                  : 'Start by finding loads and placing bids'
                }
              </Text>
              <TouchableOpacity 
                style={styles.findLoadsButton}
                onPress={() => router.push('/loads')}
              >
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.findLoadsButtonText}>Find Loads</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#22c55e',
  },
  filterTabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingInfo: {
    gap: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  bookingDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeSection: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  routeDotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressSection: {
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  currentLocationText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceInfo: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biltyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  biltyButtonText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  findLoadsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  findLoadsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  authButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
