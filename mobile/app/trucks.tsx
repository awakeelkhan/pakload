import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://ec2-13-50-123-3.eu-north-1.compute.amazonaws.com';

interface Truck {
  id: number;
  type: string;
  capacity: string;
  location: string;
  availableFrom: string;
  ratePerKm: number;
  driver: string;
  rating: number;
  verified: boolean;
  phone: string;
}

export default function TrucksScreen() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const truckTypes = ['all', 'Container', 'Flatbed', 'Tanker', 'Refrigerated', 'Box Truck'];

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trucks`);
      if (response.ok) {
        const data = await response.json();
        setTrucks(data.trucks || []);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
      // Use mock data as fallback
      setTrucks([
        { id: 1, type: '40ft Container', capacity: '26 tons', location: 'Karachi', availableFrom: '2026-02-06', ratePerKm: 85, driver: 'Ahmed Khan', rating: 4.8, verified: true, phone: '+92 300 1234567' },
        { id: 2, type: '20ft Container', capacity: '18 tons', location: 'Lahore', availableFrom: '2026-02-05', ratePerKm: 65, driver: 'Ali Hassan', rating: 4.5, verified: true, phone: '+92 301 2345678' },
        { id: 3, type: 'Flatbed Trailer', capacity: '30 tons', location: 'Islamabad', availableFrom: '2026-02-07', ratePerKm: 90, driver: 'Usman Malik', rating: 4.9, verified: true, phone: '+92 302 3456789' },
        { id: 4, type: 'Refrigerated', capacity: '15 tons', location: 'Peshawar', availableFrom: '2026-02-08', ratePerKm: 120, driver: 'Bilal Ahmed', rating: 4.7, verified: false, phone: '+92 303 4567890' },
        { id: 5, type: 'Tanker', capacity: '20,000L', location: 'Multan', availableFrom: '2026-02-06', ratePerKm: 95, driver: 'Farhan Ali', rating: 4.6, verified: true, phone: '+92 304 5678901' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrucks();
  }, []);

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         truck.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         truck.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || truck.type.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesType;
  });

  const renderTruckCard = ({ item }: { item: Truck }) => (
    <TouchableOpacity style={styles.truckCard}>
      <View style={styles.cardHeader}>
        <View style={styles.truckTypeContainer}>
          <Ionicons name="car" size={20} color="#22c55e" />
          <Text style={styles.truckType}>{item.type}</Text>
        </View>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>{item.capacity}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>From {item.availableFrom}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.infoText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.driverRow}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
            <Text style={styles.driverName}>{item.driver}</Text>
          </View>
          <Text style={styles.rateText}>PKR {item.ratePerKm}/km</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call-outline" size={18} color="#22c55e" />
          <Text style={styles.contactButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request Quote</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Trucks</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, type, driver..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {truckTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
              {type === 'all' ? 'All Types' : type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filteredTrucks.length} trucks available</Text>
      </View>

      {/* Truck List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Finding trucks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrucks}
          renderItem={renderTruckCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22c55e']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No trucks found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  truckCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  truckTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  truckType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  rateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  requestButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#22c55e',
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
