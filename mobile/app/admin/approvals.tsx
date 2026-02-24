import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI } from '../../src/services/api';

interface PendingItem {
  id: number;
  type: 'load' | 'bid' | 'document';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending';
}

export default function AdminApprovalsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'loads' | 'bids' | 'documents'>('loads');

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      const response = await adminAPI.getPendingApprovals();
      const allItems: PendingItem[] = [];
      
      // Map loads
      (response?.loads || []).forEach((load: any) => {
        allItems.push({
          id: load.id,
          type: 'load',
          title: `Load #${load.trackingNumber || load.id}`,
          description: `${load.origin || 'Origin'} → ${load.destination || 'Destination'} • ${load.vehicleType || 'Any'}`,
          submittedBy: load.shipper?.fullName || load.shipperName || 'Unknown',
          submittedAt: load.createdAt ? new Date(load.createdAt).toLocaleDateString() : 'Recently',
          status: 'pending',
        });
      });
      
      // Map quotes/bids
      (response?.quotes || []).forEach((quote: any) => {
        allItems.push({
          id: quote.id,
          type: 'bid',
          title: `Bid on Load #${quote.loadId}`,
          description: `PKR ${(quote.quotedPrice || quote.amount || 0).toLocaleString()} • ${quote.estimatedDays || '?'} days`,
          submittedBy: quote.carrier?.fullName || quote.carrierName || 'Unknown',
          submittedAt: quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'Recently',
          status: 'pending',
        });
      });
      
      // Map documents
      (response?.documents || []).forEach((doc: any) => {
        allItems.push({
          id: doc.id,
          type: 'document',
          title: doc.documentType || 'Document',
          description: doc.fileName || 'Uploaded document',
          submittedBy: doc.user?.fullName || doc.userName || 'Unknown',
          submittedAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recently',
          status: 'pending',
        });
      });
      
      setItems(allItems);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingItems();
  };

  const handleApprove = async (item: PendingItem) => {
    try {
      if (item.type === 'document') {
        await adminAPI.approveDocument(item.id);
      }
      Alert.alert('Success', 'Item approved successfully');
      setItems(items.filter(i => i.id !== item.id || i.type !== item.type));
    } catch (error) {
      Alert.alert('Error', 'Failed to approve item');
    }
  };

  const handleReject = async (item: PendingItem) => {
    try {
      if (item.type === 'document') {
        await adminAPI.rejectDocument(item.id);
      }
      Alert.alert('Success', 'Item rejected');
      setItems(items.filter(i => i.id !== item.id || i.type !== item.type));
    } catch (error) {
      Alert.alert('Error', 'Failed to reject item');
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'loads') return item.type === 'load';
    if (activeTab === 'bids') return item.type === 'bid';
    if (activeTab === 'documents') return item.type === 'document';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'load': return 'cube-outline';
      case 'bid': return 'pricetag-outline';
      case 'document': return 'document-text-outline';
      default: return 'ellipse-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'load': return '#16a34a';
      case 'bid': return '#d97706';
      case 'document': return '#2563eb';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading approvals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'loads' && styles.tabActive]}
          onPress={() => setActiveTab('loads')}
        >
          <Ionicons name="cube-outline" size={18} color={activeTab === 'loads' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'loads' && styles.tabTextActive]}>
            Loads ({items.filter(i => i.type === 'load').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bids' && styles.tabActive]}
          onPress={() => setActiveTab('bids')}
        >
          <Ionicons name="pricetag-outline" size={18} color={activeTab === 'bids' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'bids' && styles.tabTextActive]}>
            Bids ({items.filter(i => i.type === 'bid').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.tabActive]}
          onPress={() => setActiveTab('documents')}
        >
          <Ionicons name="document-text-outline" size={18} color={activeTab === 'documents' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'documents' && styles.tabTextActive]}>
            Docs ({items.filter(i => i.type === 'document').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScrollView
        style={styles.itemList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No pending {activeTab} to review</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={[styles.itemIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Ionicons name={getTypeIcon(item.type) as any} size={20} color={getTypeColor(item.type)} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.itemSubmitter}>By: {item.submittedBy}</Text>
                <Text style={styles.itemTime}>{item.submittedAt}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item)}
                >
                  <Ionicons name="close" size={18} color="#dc2626" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748b' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#f0fdf4' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#16a34a' },
  itemList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 4 },
  itemCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  itemDescription: { fontSize: 13, color: '#64748b', marginTop: 2 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  itemSubmitter: { fontSize: 13, color: '#64748b' },
  itemTime: { fontSize: 12, color: '#94a3b8' },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  rejectButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  rejectButtonText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
  approveButton: { backgroundColor: '#16a34a' },
  approveButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
