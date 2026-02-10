import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/AuthContext';
import { statsAPI, notificationsAPI, bookingsAPI } from '../../src/services/api';
import { useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        return await statsAPI.getPlatform();
      } catch {
        return { activeLoads: 0, availableTrucks: 0, completedShipments: 0, activeCarriers: 0 };
      }
    },
  });

  const { data: notifCount, refetch: refetchNotifs } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: async () => {
      if (!isAuthenticated) return { count: 0 };
      try {
        return await notificationsAPI.getUnreadCount();
      } catch {
        return { count: 0 };
      }
    },
    enabled: isAuthenticated,
  });

  const { data: recentBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['recentBookings'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await bookingsAPI.getAll();
        // Handle different API response formats
        let bookings = [];
        if (Array.isArray(response)) bookings = response;
        else if (response?.bookings && Array.isArray(response.bookings)) bookings = response.bookings;
        else if (response?.data && Array.isArray(response.data)) bookings = response.data;
        return bookings.slice(0, 3);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchNotifs(), refetchBookings()]);
    setRefreshing(false);
  }, [refetchStats, refetchNotifs, refetchBookings]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_transit: '#f59e0b',
      delivered: '#10b981',
      confirmed: '#3b82f6',
      pending: '#8b5cf6',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
      {/* Clean Professional Header - Upwork Style */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated ? `Hello, ${user?.fullName?.split(' ')[0] || 'there'} 👋` : 'Welcome 👋'}
            </Text>
            <Text style={styles.headerTitle}>PakLoad</Text>
            <Text style={styles.headerSubtitle}>Your trusted logistics partner</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.langButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="language-outline" size={22} color="#14532d" />
            </TouchableOpacity>
            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.notifButton}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#14532d" />
                {(notifCount?.count || 0) > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {(notifCount?.count || 0) > 9 ? '9+' : notifCount?.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push('/loads')}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color="#6b7280" />
          <Text style={styles.searchPlaceholder}>Search loads, routes, carriers...</Text>
        </TouchableOpacity>

        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats?.activeLoads || 0}</Text>
            <Text style={styles.quickStatLabel}>Active Loads</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats?.availableTrucks || 0}</Text>
            <Text style={styles.quickStatLabel}>Trucks</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats?.completedShipments || 0}</Text>
            <Text style={styles.quickStatLabel}>Delivered</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Quick Actions - World Class Design */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/loads')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#dcfce7', '#bbf7d0']}
              style={styles.actionIconBg}
            >
              <Ionicons name="search" size={28} color="#16a34a" />
            </LinearGradient>
            <Text style={styles.actionTitle}>Find Loads</Text>
            <Text style={styles.actionSubtitle}>Browse available</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/bookings')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#dbeafe', '#bfdbfe']}
              style={styles.actionIconBg}
            >
              <Ionicons name="cube" size={28} color="#2563eb" />
            </LinearGradient>
            <Text style={styles.actionTitle}>Bookings</Text>
            <Text style={styles.actionSubtitle}>Track shipments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/bids')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={styles.actionIconBg}
            >
              <Ionicons name="pricetag" size={28} color="#d97706" />
            </LinearGradient>
            <Text style={styles.actionTitle}>My Bids</Text>
            <Text style={styles.actionSubtitle}>View offers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/trucks')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f3e8ff', '#e9d5ff']}
              style={styles.actionIconBg}
            >
              <Ionicons name="car" size={28} color="#9333ea" />
            </LinearGradient>
            <Text style={styles.actionTitle}>Find Trucks</Text>
            <Text style={styles.actionSubtitle}>Available carriers</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryActionCard}
            onPress={() => router.push('/track')}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={22} color="#14532d" />
            <Text style={styles.secondaryActionText}>Track Shipment</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryActionCard}
            onPress={() => router.push('/post')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={22} color="#14532d" />
            <Text style={styles.secondaryActionText}>Post a Load</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Featured Routes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CPEC Routes</Text>
            <TouchableOpacity onPress={() => router.push('/map')}>
              <Text style={styles.seeAll}>View Map</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesScroll}
          >
            {[
              { from: 'Kashgar', to: 'Islamabad', distance: '1,200 km', time: '3-4 days', flag1: '🇨🇳', flag2: '🇵🇰' },
              { from: 'Urumqi', to: 'Lahore', distance: '2,100 km', time: '5-6 days', flag1: '🇨🇳', flag2: '🇵🇰' },
              { from: 'Kashgar', to: 'Gwadar', distance: '2,800 km', time: '7-8 days', flag1: '🇨🇳', flag2: '🇵🇰' },
            ].map((route, index) => (
              <TouchableOpacity key={index} style={styles.routeCard} activeOpacity={0.8} onPress={() => router.push('/map')}>
                <View style={styles.routeGradient}>
                  <View style={styles.routeFlags}>
                    <Text style={styles.routeFlag}>{route.flag1}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#14532d" />
                    <Text style={styles.routeFlag}>{route.flag2}</Text>
                  </View>
                  <Text style={styles.routeFrom}>{route.from}</Text>
                  <Text style={styles.routeTo}>to {route.to}</Text>
                  <View style={styles.routeMeta}>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="navigate" size={12} color="#14532d" />
                      <Text style={styles.routeMetaText}>{route.distance}</Text>
                    </View>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="time" size={12} color="#14532d" />
                      <Text style={styles.routeMetaText}>{route.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        {isAuthenticated && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/bookings')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((booking: any, index: number) => {
                const load = booking.load || {};
                const origin = booking.origin || load.origin || load.pickupCity || 'Origin';
                const destination = booking.destination || load.destination || load.deliveryCity || 'Destination';
                const status = booking.status || 'pending';
                
                return (
                  <TouchableOpacity 
                    key={booking.id || index}
                    style={styles.activityCard}
                    onPress={() => router.push(`/bookings/${booking.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: getStatusColor(status) + '15' }]}>
                      <Ionicons 
                        name={status === 'delivered' ? 'checkmark-circle' : 'cube'} 
                        size={22} 
                        color={getStatusColor(status)} 
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {booking.trackingNumber || `#PL-${String(booking.id || 0).padStart(6, '0')}`}
                      </Text>
                      <Text style={styles.activityRoute} numberOfLines={1}>
                        {origin} → {destination}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(status) + '15' }]}>
                      <Text style={[styles.statusPillText, { color: getStatusColor(status) }]}>
                        {status.replace('_', ' ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="cube-outline" size={40} color="#d1d5db" />
                </View>
                <Text style={styles.emptyTitle}>No recent activity</Text>
                <Text style={styles.emptySubtitle}>Your shipments will appear here</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/loads')}
                >
                  <Text style={styles.emptyButtonText}>Find Loads</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <View style={styles.ctaContainer}>
            <View style={styles.ctaGradient}>
              <View style={styles.ctaContent}>
                <View style={styles.ctaIconContainer}>
                  <Ionicons name="rocket" size={32} color="#fff" />
                </View>
                <Text style={styles.ctaTitle}>Start Shipping Today</Text>
                <Text style={styles.ctaSubtitle}>
                  Join thousands of carriers on the CPEC corridor
                </Text>
                <TouchableOpacity 
                  style={styles.ctaButton}
                  onPress={() => router.push('/auth/login')}
                >
                  <Text style={styles.ctaButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14532d',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#14532d',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14532d',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#dcfce7',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionContainer: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14532d',
  },
  routesScroll: {
    paddingRight: 20,
  },
  routeCard: {
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  routeGradient: {
    backgroundColor: '#ffffff',
    width: 180,
    padding: 16,
    borderRadius: 16,
  },
  routeFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  routeFlag: {
    fontSize: 20,
  },
  routeFrom: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  routeTo: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  routeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  activityRoute: {
    fontSize: 13,
    color: '#64748b',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaContainer: {
    marginTop: 28,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGradient: {
    backgroundColor: '#22c55e',
    padding: 28,
    borderRadius: 24,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  secondaryActions: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  secondaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryActionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
});
