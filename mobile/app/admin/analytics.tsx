import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Stats {
  totalUsers: number;
  totalShippers: number;
  totalCarriers: number;
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
  totalBids: number;
  totalRevenue: number;
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: Stats = {
        totalUsers: 156,
        totalShippers: 89,
        totalCarriers: 67,
        totalLoads: 423,
        activeLoads: 46,
        completedLoads: 312,
        totalBids: 1247,
        totalRevenue: 15600000,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
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
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
      >
        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Ionicons name="trending-up" size={24} color="#fff" />
            <Text style={styles.revenueLabel}>Total Revenue</Text>
          </View>
          <Text style={styles.revenueAmount}>{formatCurrency(stats?.totalRevenue || 0)}</Text>
          <Text style={styles.revenuePeriod}>All time</Text>
        </View>

        {/* User Stats */}
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="people" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="business" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalShippers}</Text>
            <Text style={styles.statLabel}>Shippers</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="car" size={24} color="#d97706" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalCarriers}</Text>
            <Text style={styles.statLabel}>Carriers</Text>
          </View>
        </View>

        {/* Load Stats */}
        <Text style={styles.sectionTitle}>Loads</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="cube" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statNumber}>{stats?.totalLoads}</Text>
            <Text style={styles.statLabel}>Total Loads</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time" size={24} color="#d97706" />
            </View>
            <Text style={styles.statNumber}>{stats?.activeLoads}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{stats?.completedLoads}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Bids Stats */}
        <Text style={styles.sectionTitle}>Bids & Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Ionicons name="pricetags" size={20} color="#9333ea" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityNumber}>{stats?.totalBids}</Text>
                <Text style={styles.activityLabel}>Total Bids</Text>
              </View>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Ionicons name="analytics" size={20} color="#16a34a" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityNumber}>{((stats?.completedLoads || 0) / (stats?.totalLoads || 1) * 100).toFixed(0)}%</Text>
                <Text style={styles.activityLabel}>Completion Rate</Text>
              </View>
            </View>
          </View>
        </View>

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
  content: { flex: 1, padding: 16 },
  revenueCard: { backgroundColor: '#16a34a', borderRadius: 16, padding: 20, marginBottom: 20 },
  revenueHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revenueLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  revenueAmount: { fontSize: 36, fontWeight: '800', color: '#fff', marginTop: 8 },
  revenuePeriod: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  activityCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityDivider: { width: 1, height: 40, backgroundColor: '#e2e8f0', marginHorizontal: 16 },
  activityInfo: { flex: 1 },
  activityNumber: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  activityLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
