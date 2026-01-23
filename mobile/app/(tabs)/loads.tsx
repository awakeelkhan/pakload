import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export default function LoadsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/loads`);
      return response.data.data || [];
    },
  });

  const renderLoadCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.loadCard}
      onPress={() => router.push(`/loads/${item.id}`)}
    >
      <View style={styles.loadHeader}>
        <View style={styles.routeContainer}>
          <Ionicons name="location" size={16} color="#2563eb" />
          <Text style={styles.cityText}>{item.originCity}</Text>
          <Ionicons name="arrow-forward" size={16} color="#6b7280" />
          <Text style={styles.cityText}>{item.destinationCity}</Text>
        </View>
        {item.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
      </View>

      <View style={styles.loadDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.cargoType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="scale-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.weightKg.toLocaleString()} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.requiredVehicleType}</Text>
        </View>
      </View>

      <View style={styles.loadFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rate</Text>
          <Text style={styles.priceAmount}>${item.rateAmountUsd.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bidButton}>
          <Text style={styles.bidButtonText}>Place Bid</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city or cargo type..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text>Loading loads...</Text>
        </View>
      ) : (
        <FlatList
          data={loads}
          renderItem={renderLoadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
    padding: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  loadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  urgentBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  loadDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceContainer: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  bidButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
