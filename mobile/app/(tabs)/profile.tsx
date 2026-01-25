import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { bookingsAPI, quotesAPI } from '../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: bookings, refetch: refetchBookings } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await bookingsAPI.getAll();
        // Handle different API response formats
        if (Array.isArray(response)) return response;
        if (response?.bookings && Array.isArray(response.bookings)) return response.bookings;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const { data: bids, refetch: refetchBids } = useQuery({
    queryKey: ['userBids'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const response = await quotesAPI.getMyBids();
        // Handle different API response formats
        if (Array.isArray(response)) return response;
        if (response?.bids && Array.isArray(response.bids)) return response.bids;
        if (response?.quotes && Array.isArray(response.quotes)) return response.quotes;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBookings(), refetchBids()]);
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace('/auth/login');
          } catch {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const stats = {
    completed: (bookings || []).filter((b: any) => b.status === 'delivered').length,
    active: (bookings || []).filter((b: any) => ['pending', 'confirmed', 'in_transit'].includes(b.status)).length,
    totalBids: (bids || []).length,
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authIconBg}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.authTitle}>Welcome to PakLoad</Text>
        <Text style={styles.authSubtitle}>Sign in to manage your shipments and track deliveries</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/auth/register')}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name={user?.role === 'carrier' ? 'car' : 'cube'} size={14} color="#fff" />
          <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'USER'}</Text>
        </View>
        {user?.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#fbbf24" />
            <Text style={styles.rating}>{parseFloat(String(user.rating)).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({user.totalRatings || 0} reviews)</Text>
          </View>
        )}
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="cube" size={20} color="#2563eb" />
          </View>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="pricetag" size={20} color="#d97706" />
          </View>
          <Text style={styles.statValue}>{stats.totalBids}</Text>
          <Text style={styles.statLabel}>Bids</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/bookings')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="list" size={22} color="#22c55e" />
          </View>
          <Text style={styles.quickActionText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/bids')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="pricetags" size={22} color="#d97706" />
          </View>
          <Text style={styles.quickActionText}>My Bids</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/notifications')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="notifications" size={22} color="#2563eb" />
          </View>
          <Text style={styles.quickActionText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="person-outline" size={20} color="#059669" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Text style={styles.menuSubtext}>Update your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="car-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>My Vehicles</Text>
              <Text style={styles.menuSubtext}>Manage your fleet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.menuIconBg, { backgroundColor: '#fefce8' }]}>
              <Ionicons name="document-text-outline" size={20} color="#d97706" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Documents</Text>
              <Text style={styles.menuSubtext}>Licenses & certifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
            <View style={[styles.menuIconBg, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="notifications-outline" size={20} color="#9333ea" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuSubtext}>Push & email alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="language-outline" size={20} color="#059669" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Language</Text>
              <Text style={styles.menuSubtext}>English</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.menuIconBg, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuSubtext}>FAQs & contact us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
        {loggingOut ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>PakLoad v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2026 PakLoad. All rights reserved.</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authIconBg: {
    backgroundColor: '#22c55e',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  signInButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#22c55e',
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#22c55e',
    fontSize: 17,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#22c55e',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  ratingCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#cbd5e1',
  },
});
