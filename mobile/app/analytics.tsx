import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

const STATS: StatCard[] = [
  { title: 'Total Loads', value: '156', change: '+12%', changeType: 'up', icon: 'cube', color: '#3B82F6' },
  { title: 'Completed', value: '142', change: '+8%', changeType: 'up', icon: 'checkmark-circle', color: '#10B981' },
  { title: 'Revenue', value: 'PKR 2.4M', change: '+15%', changeType: 'up', icon: 'cash', color: '#F59E0B' },
  { title: 'Active Bids', value: '23', change: '-5%', changeType: 'down', icon: 'pricetag', color: '#8B5CF6' },
];

const MONTHLY_DATA = [
  { month: 'Jan', loads: 12, revenue: 180000 },
  { month: 'Feb', loads: 15, revenue: 220000 },
  { month: 'Mar', loads: 18, revenue: 280000 },
  { month: 'Apr', loads: 14, revenue: 210000 },
  { month: 'May', loads: 22, revenue: 340000 },
  { month: 'Jun', loads: 25, revenue: 390000 },
];

const TOP_ROUTES = [
  { route: 'Karachi → Lahore', loads: 45, revenue: 'PKR 850K' },
  { route: 'Lahore → Islamabad', loads: 38, revenue: 'PKR 420K' },
  { route: 'Karachi → Islamabad', loads: 32, revenue: 'PKR 720K' },
  { route: 'Peshawar → Karachi', loads: 28, revenue: 'PKR 680K' },
  { route: 'Quetta → Karachi', loads: 21, revenue: 'PKR 380K' },
];

const RECENT_ACTIVITY = [
  { type: 'load', text: 'Load #1234 delivered to Lahore', time: '2 hours ago', icon: 'checkmark-circle', color: '#10B981' },
  { type: 'bid', text: 'Bid accepted for Karachi route', time: '5 hours ago', icon: 'pricetag', color: '#3B82F6' },
  { type: 'payment', text: 'Payment received PKR 125,000', time: '1 day ago', icon: 'cash', color: '#F59E0B' },
  { type: 'load', text: 'New load posted to Islamabad', time: '2 days ago', icon: 'cube', color: '#8B5CF6' },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const maxLoads = Math.max(...MONTHLY_DATA.map(d => d.loads));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Your performance overview</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <View style={styles.statChange}>
                <Ionicons 
                  name={stat.changeType === 'up' ? 'trending-up' : stat.changeType === 'down' ? 'trending-down' : 'remove'} 
                  size={14} 
                  color={stat.changeType === 'up' ? '#10B981' : stat.changeType === 'down' ? '#EF4444' : '#6B7280'} 
                />
                <Text style={[
                  styles.statChangeText,
                  { color: stat.changeType === 'up' ? '#10B981' : stat.changeType === 'down' ? '#EF4444' : '#6B7280' }
                ]}>
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Monthly Loads</Text>
          <View style={styles.chart}>
            {MONTHLY_DATA.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { height: (data.loads / maxLoads) * 100, backgroundColor: '#3B82F6' }
                  ]} 
                />
                <Text style={styles.barLabel}>{data.month}</Text>
                <Text style={styles.barValue}>{data.loads}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Routes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top Routes</Text>
          {TOP_ROUTES.map((route, index) => (
            <View key={index} style={styles.routeItem}>
              <View style={styles.routeRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.route}</Text>
                <Text style={styles.routeStats}>{route.loads} loads • {route.revenue}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {RECENT_ACTIVITY.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={18} color={activity.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryGradient}>
            <Ionicons name="trophy" size={32} color="#fff" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Great Performance!</Text>
              <Text style={styles.summaryText}>
                You've completed 15% more loads this month compared to last month.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  routeStats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  summaryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
});
