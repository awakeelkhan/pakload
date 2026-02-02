import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/AuthContext';
import { marketRequestsAPI } from '../../src/services/api';

export default function RequestsScreen() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['marketRequests'],
    queryFn: async () => {
      if (!isAuthenticated) return { requests: [] };
      return marketRequestsAPI.getMyRequests({ limit: 50, offset: 0 });
    },
    enabled: isAuthenticated,
  });

  const requests = useMemo(() => {
    const payload = (data as any)?.requests ?? (data as any)?.data ?? data;
    return Array.isArray(payload) ? payload : Array.isArray(payload?.requests) ? payload.requests : [];
  }, [data]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGoodsType('');
    setOriginCity('');
    setDestinationCity('');
    setBudgetMin('');
    setBudgetMax('');
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title || !description || !goodsType) {
        throw new Error('Title, description, and goods type are required');
      }
      return marketRequestsAPI.create({
        title,
        description,
        goodsType,
        originCity: originCity || undefined,
        destinationCity: destinationCity || undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketRequests'] });
      setShowCreate(false);
      resetForm();
      Alert.alert('Success', 'Market request created');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to create request';
      Alert.alert('Error', message);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={56} color="#d1d5db" />
        <Text style={styles.title}>Sign In Required</Text>
        <Text style={styles.subtitle}>Please sign in to view and create market requests.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Request'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{(item.status || 'open').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {item.originCity ? item.originCity : 'Origin'} → {item.destinationCity ? item.destinationCity : 'Destination'}
      </Text>
      <Text style={styles.cardBody} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.smallText}>Goods: {item.goodsType || '-'}</Text>
        {!!(item.budgetMin || item.budgetMax) && (
          <Text style={styles.smallText}>Budget: {item.budgetMin || '-'} - {item.budgetMax || '-'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market Requests</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || `req-${index}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="file-tray-outline" size={56} color="#d1d5db" />
            <Text style={styles.title}>{isLoading ? 'Loading...' : 'No requests yet'}</Text>
            <Text style={styles.subtitle}>Create your first market request to get help with sourcing/fulfillment.</Text>
          </View>
        }
      />

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Market Request</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Need textile rolls" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Add details..." placeholderTextColor="#9ca3af" multiline numberOfLines={4} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Goods Type *</Text>
              <TextInput style={styles.input} value={goodsType} onChangeText={setGoodsType} placeholder="e.g., Textiles" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.row}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Origin City</Text>
                <TextInput style={styles.input} value={originCity} onChangeText={setOriginCity} placeholder="e.g., Karachi" placeholderTextColor="#9ca3af" />
              </View>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Destination City</Text>
                <TextInput style={styles.input} value={destinationCity} onChangeText={setDestinationCity} placeholder="e.g., Lahore" placeholderTextColor="#9ca3af" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Budget Min</Text>
                <TextInput style={styles.input} value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
              </View>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Budget Max</Text>
                <TextInput style={styles.input} value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, createMutation.isPending && styles.createButtonDisabled]}
              onPress={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.createButtonText}>{createMutation.isPending ? 'Creating...' : 'Create Request'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newButtonText: { color: '#fff', fontWeight: '700' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { marginTop: 14, fontSize: 18, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6b7280', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#16a34a', fontSize: 11, fontWeight: '800' },
  cardMeta: { marginTop: 8, color: '#6b7280', fontSize: 13, fontWeight: '600' },
  cardBody: { marginTop: 8, color: '#374151', fontSize: 14, lineHeight: 20 },
  cardFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  smallText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  createButton: {
    marginTop: 6,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  createButtonDisabled: { opacity: 0.7 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
