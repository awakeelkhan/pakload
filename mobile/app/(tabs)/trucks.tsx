import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, RefreshControl, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trucksAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

const TRUCK_TYPES = ['All', 'Container', 'Flatbed', 'Refrigerated', 'Tanker', 'Box Truck', 'Lowbed'];

export default function TrucksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  
  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  const { data: trucksData, isLoading, refetch } = useQuery({
    queryKey: ['trucks', search, selectedType],
    queryFn: async () => {
      try {
        const params: any = {};
        if (selectedType !== 'All') params.type = selectedType;
        const response = await trucksAPI.getAll(params);
        return response?.trucks || [];
      } catch {
        return [];
      }
    },
  });

  const trucks = trucksData || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  // Only shippers can request quotes
  const canRequestQuote = isAuthenticated && user?.role === 'shipper';

  const handleRequestQuote = (truck: any) => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to request a quote', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!canRequestQuote) {
      Alert.alert('Not Allowed', 'Only Shippers can request quotes for trucks.');
      return;
    }
    setSelectedTruck(truck);
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async () => {
    if (!pickupLocation.trim() || !deliveryLocation.trim()) {
      Alert.alert('Error', 'Please enter pickup and delivery locations');
      return;
    }

    try {
      await trucksAPI.requestQuote(selectedTruck.id, {
        pickupLocation,
        deliveryLocation,
        message: quoteMessage,
      });
      Alert.alert('Success', 'Quote request sent successfully!');
      setShowQuoteModal(false);
      resetQuoteForm();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to send quote request');
    }
  };

  const resetQuoteForm = () => {
    setQuoteMessage('');
    setPickupLocation('');
    setDeliveryLocation('');
    setSelectedTruck(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'active': return '#10b981';
      case 'in_transit': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredTrucks = trucks.filter((truck: any) => {
    if (search) {
      const query = search.toLowerCase();
      return (
        truck.registrationNumber?.toLowerCase().includes(query) ||
        truck.type?.toLowerCase().includes(query) ||
        truck.currentLocation?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderTruckCard = ({ item: truck }: any) => (
    <TouchableOpacity 
      style={styles.truckCard}
      onPress={() => handleRequestQuote(truck)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.truckIconContainer}>
          <Ionicons name="bus" size={24} color="#22c55e" />
        </View>
        <View style={styles.truckInfo}>
          <Text style={styles.truckType}>{truck.type || 'Truck'}</Text>
          <Text style={styles.registrationNumber}>{truck.registrationNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(truck.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(truck.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(truck.status) }]}>
            {truck.status === 'active' ? 'Available' : truck.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{truck.currentLocation || 'Location not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube" size={16} color="#6b7280" />
          <Text style={styles.infoText}>Capacity: {truck.capacity?.toLocaleString() || 'N/A'} kg</Text>
        </View>
        {truck.hasGPS && (
          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={16} color="#22c55e" />
            <Text style={[styles.infoText, { color: '#22c55e' }]}>GPS Tracking</Text>
          </View>
        )}
        {truck.hasRefrigeration && (
          <View style={styles.infoRow}>
            <Ionicons name="snow" size={16} color="#3b82f6" />
            <Text style={[styles.infoText, { color: '#3b82f6' }]}>Refrigerated</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.quoteButton}
        onPress={() => handleRequestQuote(truck)}
      >
        <Text style={styles.quoteButtonText}>Request Quote</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Trucks</Text>
        <Text style={styles.headerSubtitle}>Browse available trucks for your shipment</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by type, location..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color={showFilters ? '#fff' : '#22c55e'} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      {showFilters && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {TRUCK_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, selectedType === type && styles.filterPillActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterPillText, selectedType === type && styles.filterPillTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filteredTrucks.length} trucks available</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Trucks List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading trucks...</Text>
        </View>
      ) : filteredTrucks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bus-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Trucks Found</Text>
          <Text style={styles.emptyText}>
            {search ? 'Try adjusting your search criteria' : 'No trucks available at the moment'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrucks}
          renderItem={renderTruckCard}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
          }
        />
      )}

      {/* Quote Request Modal */}
      <Modal
        visible={showQuoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Quote</Text>
              <TouchableOpacity onPress={() => setShowQuoteModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedTruck && (
              <View style={styles.selectedTruckInfo}>
                <Ionicons name="bus" size={20} color="#22c55e" />
                <Text style={styles.selectedTruckText}>
                  {selectedTruck.type} - {selectedTruck.registrationNumber}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pickup Location *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter pickup city/address"
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Location *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter delivery city/address"
                value={deliveryLocation}
                onChangeText={setDeliveryLocation}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Add details about your shipment..."
                value={quoteMessage}
                onChangeText={setQuoteMessage}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowQuoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitQuote}
              >
                <Text style={styles.submitButtonText}>Send Request</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14532d',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterPillActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterPillText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  truckCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckInfo: {
    flex: 1,
    marginLeft: 12,
  },
  truckType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  registrationNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  quoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  selectedTruckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  selectedTruckText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
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
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
