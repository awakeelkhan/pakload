import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, RefreshControl, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadsAPI, quotesAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

type BidData = {
  loadId: number;
  carrierId?: number;
  quotedPrice: number;
  estimatedDays: number;
  message?: string;
};

const CARGO_TYPES = ['All', 'General', 'Electronics', 'Textiles', 'Machinery', 'Food', 'Chemicals', 'Construction'];
const VEHICLE_TYPES = ['All', 'Container', 'Flatbed', 'Refrigerated', 'Tanker', 'Box Truck'];

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function LoadsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCargoType, setSelectedCargoType] = useState('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  
  // Bid Modal State
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  const { data: loads = [], isLoading, refetch } = useQuery({
    queryKey: ['loads', search, selectedCargoType, selectedVehicleType],
    queryFn: async () => {
      try {
        const params: any = {};
        if (selectedCargoType !== 'All') params.cargoType = selectedCargoType;
        if (selectedVehicleType !== 'All') params.vehicleType = selectedVehicleType;
        const response = await loadsAPI.getAll(params);
        // Handle different API response formats
        if (Array.isArray(response)) return response;
        if (response?.loads && Array.isArray(response.loads)) return response.loads;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      } catch {
        return [];
      }
    },
  });

  const bidMutation = useMutation({
    mutationFn: async (data: BidData) => {
      return await quotesAPI.create({
        ...data,
        carrierId: user?.id,
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Your bid has been submitted!');
      setShowBidModal(false);
      resetBidForm();
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['userBids'] });
    },
    onError: (error: any) => {
      console.log('Bid error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to submit bid. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const resetBidForm = () => {
    setBidAmount('');
    setEstimatedDays('');
    setBidMessage('');
    setSelectedLoad(null);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const handlePlaceBid = (load: any) => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to place a bid', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    setSelectedLoad(load);
    setBidAmount(load.budget?.toString() || '');
    setShowBidModal(true);
  };

  const submitBid = () => {
    if (!selectedLoad) {
      Alert.alert('Error', 'No load selected');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }
    
    if (!estimatedDays || parseInt(estimatedDays) <= 0) {
      Alert.alert('Error', 'Please enter estimated delivery days');
      return;
    }
    
    bidMutation.mutate({
      loadId: selectedLoad.id,
      quotedPrice: parseFloat(bidAmount),
      estimatedDays: parseInt(estimatedDays),
      message: bidMessage || undefined,
    });
  };

  const filteredLoads = (loads || []).filter((load: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      load.origin?.toLowerCase().includes(searchLower) ||
      load.destination?.toLowerCase().includes(searchLower) ||
      load.cargoType?.toLowerCase().includes(searchLower) ||
      load.trackingNumber?.toLowerCase().includes(searchLower)
    );
  });

  const renderLoadCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.loadCard}
      onPress={() => router.push(`/loads/${item.id}`)}
    >
      {/* Posted Time */}
      <View style={styles.postedTimeContainer}>
        <Ionicons name="time-outline" size={14} color="#9ca3af" />
        <Text style={styles.postedTimeText}>
          {item.createdAt ? getTimeAgo(new Date(item.createdAt)) : 'Recently posted'}
        </Text>
      </View>

      {/* Header with Route */}
      <View style={styles.loadHeader}>
        <View style={styles.routeContainer}>
          <View style={styles.locationDot}>
            <View style={styles.dotGreen} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.cityText}>{item.origin || 'Origin'}</Text>
            <View style={styles.routeLine} />
            <Text style={styles.cityText}>{item.destination || 'Destination'}</Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Ionicons name="flash" size={12} color="#dc2626" />
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
          {item.status === 'available' && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>AVAILABLE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Load Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="cube-outline" size={18} color="#6b7280" />
          <Text style={styles.detailLabel}>Cargo</Text>
          <Text style={styles.detailValue}>{item.cargoType || 'General'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="scale-outline" size={18} color="#6b7280" />
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{(item.weight || 0).toLocaleString()} kg</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="car-outline" size={18} color="#6b7280" />
          <Text style={styles.detailLabel}>Vehicle</Text>
          <Text style={styles.detailValue}>{item.vehicleType || 'Any'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text style={styles.detailLabel}>Pickup</Text>
          <Text style={styles.detailValue}>
            {item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : 'Flexible'}
          </Text>
        </View>
      </View>

      {/* Footer with Price and Bid */}
      <View style={styles.loadFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Budget</Text>
          <Text style={styles.priceAmount}>
            ${(item.budget || item.price || 0).toLocaleString()}
          </Text>
          {item.distance && (
            <Text style={styles.distanceText}>{item.distance} km</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => router.push(`/loads/${item.id}`)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bidButton}
            onPress={() => handlePlaceBid(item)}
          >
            <Ionicons name="pricetag" size={16} color="#fff" />
            <Text style={styles.bidButtonText}>Bid</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tracking Number */}
      {item.trackingNumber && (
        <View style={styles.trackingContainer}>
          <Ionicons name="barcode-outline" size={14} color="#9ca3af" />
          <Text style={styles.trackingText}>{item.trackingNumber}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search loads by city, cargo type..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color={showFilters ? '#fff' : '#14532d'} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Cargo Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {CARGO_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, selectedCargoType === type && styles.filterChipActive]}
                onPress={() => setSelectedCargoType(type)}
              >
                <Text style={[styles.filterChipText, selectedCargoType === type && styles.filterChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Vehicle Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, selectedVehicleType === type && styles.filterChipActive]}
                onPress={() => setSelectedVehicleType(type)}
              >
                <Text style={[styles.filterChipText, selectedVehicleType === type && styles.filterChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredLoads.length} load{filteredLoads.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Loads List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading available loads...</Text>
        </View>
      ) : filteredLoads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No loads found</Text>
          <Text style={styles.emptySubtitle}>
            {search ? 'Try adjusting your search or filters' : 'Check back later for new loads'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLoads}
          renderItem={renderLoadCard}
          keyExtractor={(item, index) => item?.id?.toString() || `load-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bid Modal */}
      <Modal
        visible={showBidModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBidModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedLoad && (
              <View style={styles.modalLoadInfo}>
                <Text style={styles.modalLoadRoute}>
                  {selectedLoad.origin} → {selectedLoad.destination}
                </Text>
                <Text style={styles.modalLoadDetails}>
                  {selectedLoad.cargoType} • {(selectedLoad.weight || 0).toLocaleString()} kg
                </Text>
                <Text style={styles.modalBudget}>
                  Budget: ${(selectedLoad.budget || 0).toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Bid Amount ($) *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="cash-outline" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your bid amount"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estimated Delivery (days) *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., 5"
                    value={estimatedDays}
                    onChangeText={setEstimatedDays}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message (optional)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    placeholder="Add a message to the shipper..."
                    value={bidMessage}
                    onChangeText={setBidMessage}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowBidModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, bidMutation.isPending && styles.submitButtonDisabled]}
                onPress={submitBid}
                disabled={bidMutation.isPending}
              >
                {bidMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Bid</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  filterButtonActive: {
    backgroundColor: '#14532d',
    borderColor: '#14532d',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#14532d',
    borderColor: '#14532d',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  postedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  postedTimeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  loadCard: {
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
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  locationDot: {
    marginRight: 12,
    paddingTop: 4,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  routeInfo: {
    flex: 1,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 0,
    marginVertical: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
  },
  availableBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceContainer: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  distanceText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  trackingText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
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
    padding: 32,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalLoadInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalLoadRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalLoadDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  modalBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 8,
  },
  modalForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
