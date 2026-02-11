import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { loadsAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

export default function EditLoadScreen() {
  const router = useRouter();
  const { loadId } = useLocalSearchParams<{ loadId: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [pickupDateObj, setPickupDateObj] = useState<Date | null>(null);
  const [deliveryDateObj, setDeliveryDateObj] = useState<Date | null>(null);

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      const response = await loadsAPI.getById(parseInt(loadId || '0'));
      return response?.load || response;
    },
    enabled: !!loadId && isAuthenticated,
  });

  useEffect(() => {
    if (load) {
      setOrigin(load.origin || '');
      setDestination(load.destination || '');
      setPickupDate(load.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : '');
      setDeliveryDate(load.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : '');
      setCargoType(load.cargoType || '');
      setCargoWeight(load.cargoWeight?.toString() || load.weight?.toString() || '');
      setPrice(load.price?.toString() || '');
      setDescription(load.description || '');
      
      if (load.pickupDate) setPickupDateObj(new Date(load.pickupDate));
      if (load.deliveryDate) setDeliveryDateObj(new Date(load.deliveryDate));
    }
  }, [load]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await loadsAPI.update(parseInt(loadId || '0'), {
        origin,
        destination,
        pickupDate,
        deliveryDate,
        cargoType,
        cargoWeight: parseFloat(cargoWeight),
        price: parseFloat(price),
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loads'] });
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
      Alert.alert('Success', 'Load updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to update load');
    },
  });

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handlePickupDateChange = (event: any, selectedDate?: Date) => {
    setShowPickupDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPickupDateObj(selectedDate);
      setPickupDate(formatDate(selectedDate));
    }
  };

  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    setShowDeliveryDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeliveryDateObj(selectedDate);
      setDeliveryDate(formatDate(selectedDate));
    }
  };

  const handleSave = () => {
    if (!origin || !destination || !pickupDate || !deliveryDate || !cargoType || !cargoWeight || !price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    updateMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Load</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Load</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14532d" />
          <Text style={styles.loadingText}>Loading load details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Load</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#14532d" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Origin *</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
              placeholder="e.g., Lahore"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination *</Text>
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g., Karachi"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Pickup Date *</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickupDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={pickupDate ? styles.dateText : styles.datePlaceholder}>
                  {pickupDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Delivery Date *</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDeliveryDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={deliveryDate ? styles.dateText : styles.datePlaceholder}>
                  {deliveryDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showPickupDatePicker && (
          <DateTimePicker
            value={pickupDateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handlePickupDateChange}
          />
        )}
        {showDeliveryDatePicker && (
          <DateTimePicker
            value={deliveryDateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDeliveryDateChange}
          />
        )}

        {/* Cargo Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo Type *</Text>
            <TextInput
              style={styles.input}
              value={cargoType}
              onChangeText={setCargoType}
              placeholder="e.g., Electronics, Textiles"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Weight (kg) *</Text>
              <TextInput
                style={styles.input}
                value={cargoWeight}
                onChangeText={setCargoWeight}
                placeholder="e.g., 15000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Rate (PKR) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g., 125000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Additional details..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14532d',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    color: '#1f2937',
  },
  datePlaceholder: {
    fontSize: 15,
    color: '#9ca3af',
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
