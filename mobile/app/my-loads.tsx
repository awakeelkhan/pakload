import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadsAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

interface Load {
  id: number;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  cargoType: string;
  weight: number;
  price: number;
  currency: string;
  status: string;
  bidsCount?: number;
}

export default function MyLoadsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: loads, isLoading, refetch } = useQuery({
    queryKey: ['my-loads'],
    queryFn: async () => {
      const response = await loadsAPI.getMyLoads();
      return response?.loads || response || [];
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (loadId: number) => {
      return await loadsAPI.deleteLoad(loadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loads'] });
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      Alert.alert('Success', 'Load deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to delete load');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEdit = (load: Load) => {
    router.push({
      pathname: '/edit-load',
      params: { loadId: load.id.toString() },
    });
  };

  const handleDelete = (load: Load) => {
    Alert.alert(
      'Delete Load',
      `Are you sure you want to delete the load from ${load.origin} to ${load.destination}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(load.id),
        },
      ]
    );
  };

  const handleViewBids = (load: Load) => {
    router.push({
      pathname: '/load-bids',
      params: { loadId: load.id.toString() },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    if (currency === 'PKR') {
      return `PKR ${amount?.toLocaleString() || 0}`;
    }
    return `$${amount?.toLocaleString() || 0}`;
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Loads</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to view your posted loads</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Loads</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/post')}>
          <Ionicons name="add" size={24} color="#14532d" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14532d" />
          <Text style={styles.loadingText}>Loading your loads...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14532d']} />
          }
        >
          {(!loads || loads.length === 0) ? (
            <View style={styles.noLoads}>
              <Ionicons name="cube-outline" size={64} color="#d1d5db" />
              <Text style={styles.noLoadsTitle}>No Loads Posted</Text>
              <Text style={styles.noLoadsText}>You haven't posted any loads yet. Start by posting your first load!</Text>
              <TouchableOpacity style={styles.postButton} onPress={() => router.push('/(tabs)/post')}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.postButtonText}>Post a Load</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.countText}>{loads.length} load{loads.length !== 1 ? 's' : ''} posted</Text>
              
              {loads.map((load: Load) => (
                <View key={load.id} style={styles.loadCard}>
                  <View style={styles.loadHeader}>
                    <View style={styles.routeContainer}>
                      <Text style={styles.origin}>{load.origin}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                      <Text style={styles.destination}>{load.destination}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(load.status)}15` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(load.status) }]}>
                        {load.status || 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.loadDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="cube-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{load.cargoType} • {load.weight} kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {new Date(load.pickupDate).toLocaleDateString()} - {new Date(load.deliveryDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color="#6b7280" />
                      <Text style={styles.priceText}>{formatCurrency(load.price, load.currency || 'PKR')}</Text>
                    </View>
                  </View>

                  {(load.bidsCount || 0) > 0 && (
                    <TouchableOpacity style={styles.bidsRow} onPress={() => handleViewBids(load)}>
                      <Ionicons name="pricetags-outline" size={16} color="#2563eb" />
                      <Text style={styles.bidsText}>{load.bidsCount} bid{load.bidsCount !== 1 ? 's' : ''} received</Text>
                      <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                    </TouchableOpacity>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(load)}>
                      <Ionicons name="create-outline" size={18} color="#2563eb" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(load)}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  countText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  loadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    flex: 1,
  },
  origin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  destination: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadDetails: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14532d',
  },
  bidsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bidsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  noLoads: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  noLoadsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  noLoadsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14532d',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#14532d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
