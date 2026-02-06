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
      {/* Beautiful Gradient Header */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated ? `Hello, ${user?.fullName?.split(' ')[0] || 'there'} 👋` : 'Welcome 👋'}
            </Text>
            <Text style={styles.headerTitle}>PakLoad</Text>
            <Text style={styles.headerSubtitle}>Your trusted logistics partner</Text>
          </View>
          <View style={styles.headerActions}>
            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.notifButton}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
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
      </LinearGradient>

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
            <Ionicons name="location" size={24} color="#22c55e" />
            <Text style={styles.secondaryActionText}>Track Shipment</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryActionCard}
            onPress={() => router.push('/post')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="#22c55e" />
            <Text style={styles.secondaryActionText}>Post a Load</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
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
                    <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.routeFlag}>{route.flag2}</Text>
                  </View>
                  <Text style={styles.routeFrom}>{route.from}</Text>
                  <Text style={styles.routeTo}>to {route.to}</Text>
                  <View style={styles.routeMeta}>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="navigate" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.routeMetaText}>{route.distance}</Text>
                    </View>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="time" size={12} color="rgba(255,255,255,0.8)" />
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
    backgroundColor: '#22c55e',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginTop: -12,
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
    paddingTop: 24,
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  actionIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
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
    color: '#22c55e',
  },
  routesScroll: {
    paddingRight: 20,
  },
  routeCard: {
    marginRight: 14,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  routeGradient: {
    backgroundColor: '#22c55e',
    width: 160,
    padding: 18,
    borderRadius: 20,
  },
  routeFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  routeFlag: {
    fontSize: 20,
  },
  routeFrom: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  routeTo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  routeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
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
    gap: 12,
  },
  secondaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryActionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
});
