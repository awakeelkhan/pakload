import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

type BidStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

export default function MyBidsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BidStatus>('all');
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const { data: bids, isLoading, refetch } = useQuery({
    queryKey: ['myBids'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await quotesAPI.getMyBids();
        // Handle different API response formats
        if (Array.isArray(response)) return response;
        if (response?.bids && Array.isArray(response.bids)) return response.bids;
        if (response?.quotes && Array.isArray(response.quotes)) return response.quotes;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      } catch (error) {
        console.log('Bids fetch error:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (bidId: number) => {
      return await quotesAPI.withdraw(bidId, 'Withdrawn by carrier');
    },
    onSuccess: () => {
      Alert.alert('Success', 'Bid withdrawn successfully');
      queryClient.invalidateQueries({ queryKey: ['myBids'] });
      setWithdrawingId(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to withdraw bid');
      setWithdrawingId(null);
    },
  });

  const handleWithdrawBid = (bidId: number) => {
    Alert.alert(
      'Withdraw Bid',
      'Are you sure you want to withdraw this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          style: 'destructive',
          onPress: () => {
            setWithdrawingId(bidId);
            withdrawMutation.mutate(bidId);
          }
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'rejected': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Accepted';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Rejected';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const filteredBids = (bids || []).filter((bid: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'cancelled') {
      return bid.status === 'cancelled' || bid.status === 'rejected';
    }
    return bid.status === statusFilter;
  });

  const statusCounts = {
    all: (bids || []).length,
    pending: (bids || []).filter((b: any) => b.status === 'pending').length,
    confirmed: (bids || []).filter((b: any) => b.status === 'confirmed').length,
    cancelled: (bids || []).filter((b: any) => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  const renderBidCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.bidCard}
      onPress={() => item.loadId && router.push(`/loads/${item.loadId}`)}
    >
      {/* Header */}
      <View style={styles.bidHeader}>
        <View style={styles.bidInfo}>
          <Text style={styles.bidId}>Bid #{item.id}</Text>
          <Text style={styles.bidDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeSection}>
        <View style={styles.routePoint}>
          <View style={styles.routeDotGreen} />
          <Text style={styles.routeCity}>{item.origin || item.load?.origin || 'Origin'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={styles.routeDotRed} />
          <Text style={styles.routeCity}>{item.destination || item.load?.destination || 'Destination'}</Text>
        </View>
      </View>

      {/* Bid Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Your Bid</Text>
          <Text style={styles.bidAmount}>
            {(item.currency || item.load?.currency) === 'PKR' ? 'PKR ' : (item.currency || item.load?.currency) === 'CNY' ? '¥' : '$'}
            {(item.price || item.quotedPrice || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Load Budget</Text>
          <Text style={styles.budgetAmount}>
            {(item.currency || item.load?.currency) === 'PKR' ? 'PKR ' : (item.currency || item.load?.currency) === 'CNY' ? '¥' : '$'}
            {(item.loadBudget || item.load?.budget || item.load?.price || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Load Info */}
      <View style={styles.loadInfo}>
        <View style={styles.loadInfoItem}>
          <Ionicons name="cube-outline" size={16} color="#6b7280" />
          <Text style={styles.loadInfoText}>{item.cargoType || item.load?.cargoType || 'General'}</Text>
        </View>
        <View style={styles.loadInfoItem}>
          <Ionicons name="scale-outline" size={16} color="#6b7280" />
          <Text style={styles.loadInfoText}>{(item.weight || item.load?.weight || 0).toLocaleString()} kg</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.bidFooter}>
        {item.status === 'pending' && (
          <View style={styles.pendingActions}>
            <View style={styles.pendingInfo}>
              <Ionicons name="hourglass-outline" size={16} color="#f59e0b" />
              <Text style={styles.pendingText}>Awaiting Admin Approval</Text>
            </View>
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => handleWithdrawBid(item.id)}
              disabled={withdrawingId === item.id}
            >
              {withdrawingId === item.id ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'confirmed' && (
          <View style={styles.confirmedActions}>
            <TouchableOpacity 
              style={styles.viewBookingButton}
              onPress={() => router.push('/bookings')}
            >
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.viewBookingText}>View Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.startTrackingButton}
              onPress={() => router.push({
                pathname: '/driver-tracking',
                params: { 
                  loadId: item.loadId || item.id,
                  origin: item.origin || item.load?.origin || 'Origin',
                  destination: item.destination || item.load?.destination || 'Destination'
                }
              })}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.viewBookingText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        )}
        {(item.status === 'cancelled' || item.status === 'rejected') && (
          <View style={styles.rejectedInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#dc2626" />
            <Text style={styles.rejectedText}>
              {item.rejectionReason || 'Another bid was selected'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="pricetags" size={64} color="#d1d5db" />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authSubtitle}>Please sign in to view your bids</Text>
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
      {/* Status Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'pending', 'confirmed', 'cancelled'] as BidStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, statusFilter === status && styles.filterTabActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterTabText, statusFilter === status && styles.filterTabTextActive]}>
              {status === 'all' ? 'All' : status === 'cancelled' ? 'Rejected' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            <View style={[styles.filterBadge, statusFilter === status && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, statusFilter === status && styles.filterBadgeTextActive]}>
                {statusCounts[status]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bids List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading your bids...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBids}
          renderItem={renderBidCard}
          keyExtractor={(item, index) => item?.id?.toString() || `bid-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No bids found</Text>
              <Text style={styles.emptySubtitle}>
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} bids`
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
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#16a34a',
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
    backgroundColor: '#e5e7eb',
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
  },
  bidCard: {
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
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bidInfo: {
    gap: 4,
  },
  bidId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  bidDate: {
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
  },
  routeDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc2626',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 4,
    marginVertical: 4,
  },
  routeCity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  loadInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  loadInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bidFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  withdrawButtonText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },
  confirmedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBookingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
  },
  startTrackingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
  },
  viewBookingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  rejectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectedText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
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
    backgroundColor: '#16a34a',
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
    backgroundColor: '#16a34a',
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
