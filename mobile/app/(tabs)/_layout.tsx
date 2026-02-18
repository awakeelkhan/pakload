import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate safe bottom padding - ensures tab bar doesn't overlap with gesture navigation
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const tabBarHeight = Platform.OS === 'ios' ? 56 + bottomPadding : 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#14532d',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: bottomPadding,
          paddingTop: 6,
          height: tabBarHeight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTintColor: '#14532d',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#14532d',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="loads"
        options={{
          title: 'Loads',
          headerTitle: 'Find Loads',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trucks"
        options={{
          title: 'Trucks',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bus' : 'bus-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={26} color={focused ? '#22c55e' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - accessible from Profile */}
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
          headerTitle: 'Market Requests',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: null,
          headerTitle: 'My Bookings',
        }}
      />
    </Tabs>
  );
}
