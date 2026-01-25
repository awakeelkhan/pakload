import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CPEC_ROUTES = [
  {
    id: 1,
    name: 'Kashgar - Islamabad',
    from: 'Kashgar, China',
    to: 'Islamabad, Pakistan',
    distance: '1,200 km',
    duration: '3-4 days',
    status: 'active',
    coordinates: { fromLat: 39.4547, fromLng: 75.9797, toLat: 33.6844, toLng: 73.0479 },
  },
  {
    id: 2,
    name: 'Urumqi - Lahore',
    from: 'Urumqi, China',
    to: 'Lahore, Pakistan',
    distance: '2,100 km',
    duration: '5-6 days',
    status: 'active',
    coordinates: { fromLat: 43.8256, fromLng: 87.6168, toLat: 31.5204, toLng: 74.3587 },
  },
  {
    id: 3,
    name: 'Kashgar - Gwadar',
    from: 'Kashgar, China',
    to: 'Gwadar, Pakistan',
    distance: '2,800 km',
    duration: '7-8 days',
    status: 'active',
    coordinates: { fromLat: 39.4547, fromLng: 75.9797, toLat: 25.1264, toLng: 62.3225 },
  },
  {
    id: 4,
    name: 'Khunjerab - Karachi',
    from: 'Khunjerab Pass',
    to: 'Karachi, Pakistan',
    distance: '2,400 km',
    duration: '6-7 days',
    status: 'active',
    coordinates: { fromLat: 36.8500, fromLng: 75.4167, toLat: 24.8607, toLng: 67.0011 },
  },
];

export default function MapScreen() {
  const router = useRouter();

  const openInMaps = (route: typeof CPEC_ROUTES[0]) => {
    const url = `https://www.google.com/maps/dir/${route.coordinates.fromLat},${route.coordinates.fromLng}/${route.coordinates.toLat},${route.coordinates.toLng}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open maps');
        }
      })
      .catch(() => Alert.alert('Error', 'Unable to open maps'));
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <LinearGradient
          colors={['#dcfce7', '#bbf7d0']}
          style={styles.mapGradient}
        >
          <Ionicons name="map" size={64} color="#16a34a" />
          <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
          <Text style={styles.mapPlaceholderText}>
            Tap a route below to view in Google Maps
          </Text>
        </LinearGradient>
      </View>

      {/* Routes List */}
      <ScrollView style={styles.routesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Routes</Text>
        
        {CPEC_ROUTES.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={styles.routeCard}
            onPress={() => openInMaps(route)}
            activeOpacity={0.8}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeIcon}>
                <Ionicons name="navigate" size={24} color="#16a34a" />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name}</Text>
                <View style={styles.routeMeta}>
                  <View style={styles.routeMetaItem}>
                    <Ionicons name="resize" size={14} color="#6b7280" />
                    <Text style={styles.routeMetaText}>{route.distance}</Text>
                  </View>
                  <View style={styles.routeMetaItem}>
                    <Ionicons name="time" size={14} color="#6b7280" />
                    <Text style={styles.routeMetaText}>{route.duration}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            
            <View style={styles.routePoints}>
              <View style={styles.routePoint}>
                <View style={styles.dotGreen} />
                <Text style={styles.pointText}>{route.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={styles.dotRed} />
                <Text style={styles.pointText}>{route.to}</Text>
              </View>
            </View>
            
            <View style={styles.routeAction}>
              <Ionicons name="open-outline" size={16} color="#16a34a" />
              <Text style={styles.routeActionText}>Open in Maps</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapPlaceholder: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapGradient: {
    padding: 40,
    alignItems: 'center',
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 16,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
    textAlign: 'center',
  },
  routesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  routeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  routePoints: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginVertical: 4,
  },
  pointText: {
    fontSize: 14,
    color: '#374151',
  },
  routeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  routeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
});
