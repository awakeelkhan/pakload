import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, RefreshControl, ActivityIndicator, Alert, Switch } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

const VEHICLE_TYPES = [
  { value: 'container_20ft', label: '20ft Container' },
  { value: 'container_40ft', label: '40ft Container' },
  { value: 'container_40ft_hc', label: '40ft High Cube' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'lowbed', label: 'Low Bed' },
  { value: 'box_truck', label: 'Box Truck' },
];

export default function MyVehiclesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  
  // Form state
  const [type, setType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [hasGPS, setHasGPS] = useState(false);
  const [hasRefrigeration, setHasRefrigeration] = useState(false);

  const { data: vehiclesData, isLoading, refetch } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await vehiclesAPI.getAll();
        const vehicles = response?.trucks || response || [];
        return Array.isArray(vehicles) ? vehicles : [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const vehicles = vehiclesData || [];

  const createMutation = useMutation({
    mutationFn: async (data: any) => vehiclesAPI.create(data),
    onSuccess: () => {
      Alert.alert('Success', 'Vehicle added successfully!');
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to add vehicle');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => vehiclesAPI.update(id, data),
    onSuccess: () => {
      Alert.alert('Success', 'Vehicle updated successfully!');
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to update vehicle');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => vehiclesAPI.delete(id),
    onSuccess: () => {
      Alert.alert('Success', 'Vehicle deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to delete vehicle');
    },
  });

  const resetForm = () => {
    setType('');
    setRegistrationNumber('');
    setCapacity('');
    setCurrentLocation('');
    setHasGPS(false);
    setHasRefrigeration(false);
    setEditingVehicle(null);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const handleAddVehicle = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setType(vehicle.type || '');
    setRegistrationNumber(vehicle.registrationNumber || '');
    setCapacity(vehicle.capacity?.toString() || '');
    setCurrentLocation(vehicle.currentLocation || '');
    setHasGPS(vehicle.hasGPS || false);
    setHasRefrigeration(vehicle.hasRefrigeration || false);
    setShowModal(true);
  };

  const handleDeleteVehicle = (vehicle: any) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.registrationNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(vehicle.id) },
      ]
    );
  };

  const handleSubmit = () => {
    if (!type || !registrationNumber || !capacity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const vehicleData = {
      type,
      registrationNumber,
      capacity: parseFloat(capacity),
      currentLocation,
      hasGPS,
      hasRefrigeration,
      status: 'active',
    };

    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data: vehicleData });
    } else {
      createMutation.mutate(vehicleData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'available': return '#10b981';
      case 'in_transit': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="bus-outline" size={64} color="#d1d5db" />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authText}>Please sign in to manage your vehicles</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderVehicleCard = ({ item: vehicle }: any) => (
    <View style={styles.vehicleCard}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleIconContainer}>
          <Ionicons name="bus" size={24} color="#22c55e" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleType}>{vehicle.type || 'Vehicle'}</Text>
          <Text style={styles.registrationNumber}>{vehicle.registrationNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
            {vehicle.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{vehicle.currentLocation || 'Location not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube" size={16} color="#6b7280" />
          <Text style={styles.infoText}>Capacity: {vehicle.capacity?.toLocaleString() || 'N/A'} kg</Text>
        </View>
        <View style={styles.featuresRow}>
          {vehicle.hasGPS && (
            <View style={styles.featureBadge}>
              <Ionicons name="navigate" size={12} color="#22c55e" />
              <Text style={styles.featureText}>GPS</Text>
            </View>
          )}
          {vehicle.hasRefrigeration && (
            <View style={styles.featureBadge}>
              <Ionicons name="snow" size={12} color="#3b82f6" />
              <Text style={styles.featureText}>Reefer</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditVehicle(vehicle)}>
          <Ionicons name="pencil" size={16} color="#22c55e" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVehicle(vehicle)}>
          <Ionicons name="trash" size={16} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity onPress={handleAddVehicle} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bus-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Vehicles Yet</Text>
          <Text style={styles.emptyText}>Add your first vehicle to start receiving load requests</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={handleAddVehicle}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addFirstButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Type *</Text>
              <View style={styles.typeGrid}>
                {VEHICLE_TYPES.map((vt) => (
                  <TouchableOpacity
                    key={vt.value}
                    style={[styles.typeOption, type === vt.value && styles.typeOptionActive]}
                    onPress={() => setType(vt.value)}
                  >
                    <Text style={[styles.typeOptionText, type === vt.value && styles.typeOptionTextActive]}>
                      {vt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Registration Number *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., ABC-1234"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Capacity (kg) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 25000"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Location</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Karachi, Pakistan"
                value={currentLocation}
                onChangeText={setCurrentLocation}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>GPS Tracking</Text>
                <Switch
                  value={hasGPS}
                  onValueChange={setHasGPS}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={hasGPS ? '#22c55e' : '#f4f4f5'}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Refrigeration</Text>
                <Switch
                  value={hasRefrigeration}
                  onValueChange={setHasRefrigeration}
                  trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                  thumbColor={hasRefrigeration ? '#3b82f6' : '#f4f4f5'}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingVehicle ? 'Update' : 'Add Vehicle'}
                  </Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#22c55e',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  vehicleCard: {
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
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  registrationNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#166534',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
    gap: 6,
  },
  editButtonText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    gap: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
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
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  authText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    maxHeight: '90%',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeOptionActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#6b7280',
  },
  typeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
