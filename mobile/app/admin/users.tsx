import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'shipper' | 'carrier' | 'admin';
  phone?: string;
  companyName?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        { id: 1, email: 'shipper1@test.com', fullName: 'Ahmed Khan', role: 'shipper', phone: '+92300111222', companyName: 'Khan Logistics', isVerified: true, createdAt: '2024-01-15' },
        { id: 2, email: 'carrier1@test.com', fullName: 'Muhammad Ali', role: 'carrier', phone: '+92301222333', companyName: 'Ali Transport', isVerified: true, createdAt: '2024-01-20' },
        { id: 3, email: 'shipper2@test.com', fullName: 'Fatima Bibi', role: 'shipper', phone: '+92302333444', companyName: 'FB Exports', isVerified: false, createdAt: '2024-02-01' },
        { id: 4, email: 'carrier2@test.com', fullName: 'Usman Ghani', role: 'carrier', phone: '+92303444555', companyName: 'Ghani Trucking', isVerified: true, createdAt: '2024-02-10' },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'shipper': return '#16a34a';
      case 'carrier': return '#2563eb';
      case 'admin': return '#dc2626';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading users...</Text>
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
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Role Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'shipper', 'carrier', 'admin'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
            onPress={() => setFilterRole(role)}
          >
            <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>
              {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#16a34a' }]}>{users.filter(u => u.role === 'shipper').length}</Text>
          <Text style={styles.statLabel}>Shippers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#2563eb' }]}>{users.filter(u => u.role === 'carrier').length}</Text>
          <Text style={styles.statLabel}>Carriers</Text>
        </View>
      </View>

      {/* User List */}
      <ScrollView
        style={styles.userList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
      >
        {filteredUsers.map((user) => (
          <TouchableOpacity key={user.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{user.fullName}</Text>
                {user.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                )}
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.companyName && <Text style={styles.userCompany}>{user.companyName}</Text>}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor(user.role) }]}>
                {user.role}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  searchContainer: { padding: 16, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0f172a' },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  filterChipActive: { backgroundColor: '#16a34a' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  filterChipTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  userList: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, marginLeft: 12 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  userEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  userCompany: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
