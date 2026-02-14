import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RouteInfo {
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: string;
  fuelCost: number;
  tollTax: number;
  driverExpenses: number;
  profitMargin: number;
  totalCost: number;
  pricePerKm: number;
}

const POPULAR_ROUTES = [
  { origin: 'Karachi', destination: 'Lahore', distance: 1210 },
  { origin: 'Lahore', destination: 'Islamabad', distance: 375 },
  { origin: 'Karachi', destination: 'Islamabad', distance: 1400 },
  { origin: 'Peshawar', destination: 'Karachi', distance: 1500 },
  { origin: 'Quetta', destination: 'Karachi', distance: 685 },
  { origin: 'Gilgit', destination: 'Islamabad', distance: 610 },
  { origin: 'Kashgar', destination: 'Islamabad', distance: 1250 },
  { origin: 'Gwadar', destination: 'Karachi', distance: 650 },
];

export default function RoutesScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Configuration values (same as web)
  const FUEL_PRICE_PER_LITER = 280; // PKR
  const FUEL_CONSUMPTION = 3.5; // km per liter for heavy trucks
  const TOLL_TAX_PER_100KM = 3000; // PKR minimum
  const DRIVER_EXPENSES_PER_DAY = 7000; // PKR
  const PROFIT_MARGIN = 0.35; // 35%
  const AVG_SPEED_KM_PER_DAY = 400; // Average distance covered per day

  const calculateRoute = (dist: number, orig: string, dest: string) => {
    setLoading(true);

    setTimeout(() => {
      const fuelNeeded = dist / FUEL_CONSUMPTION;
      const fuelCost = fuelNeeded * FUEL_PRICE_PER_LITER;
      
      const tollUnits = Math.ceil(dist / 100);
      const tollTax = tollUnits * TOLL_TAX_PER_100KM;
      
      const travelDays = Math.ceil(dist / AVG_SPEED_KM_PER_DAY);
      const driverExpenses = travelDays * DRIVER_EXPENSES_PER_DAY;
      
      const subtotal = fuelCost + tollTax + driverExpenses;
      const profitAmount = subtotal * PROFIT_MARGIN;
      const totalCost = subtotal + profitAmount;
      const pricePerKm = totalCost / dist;

      const hours = Math.round((dist / 50) * 10) / 10;
      const estimatedTime = hours > 24 
        ? `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`
        : `${Math.round(hours)}h`;

      setRouteInfo({
        origin: orig,
        destination: dest,
        distance: dist,
        estimatedTime,
        fuelCost: Math.round(fuelCost),
        tollTax,
        driverExpenses,
        profitMargin: Math.round(profitAmount),
        totalCost: Math.round(totalCost),
        pricePerKm: Math.round(pricePerKm),
      });

      setLoading(false);
    }, 500);
  };

  const handleCalculate = () => {
    if (!origin.trim() || !destination.trim() || !distance.trim()) {
      return;
    }
    const dist = parseInt(distance);
    if (isNaN(dist) || dist <= 0) return;
    calculateRoute(dist, origin, destination);
  };

  const handlePopularRoute = (route: typeof POPULAR_ROUTES[0]) => {
    setOrigin(route.origin);
    setDestination(route.destination);
    setDistance(route.distance.toString());
    calculateRoute(route.distance, route.origin, route.destination);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Route Calculator</Text>
          <Text style={styles.headerSubtitle}>Calculate freight costs</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calculator Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Calculate Route Cost</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Origin</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#16a34a" />
              <TextInput
                style={styles.input}
                placeholder="e.g., Karachi"
                placeholderTextColor="#9CA3AF"
                value={origin}
                onChangeText={setOrigin}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#EF4444" />
              <TextInput
                style={styles.input}
                placeholder="e.g., Lahore"
                placeholderTextColor="#9CA3AF"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Distance (km)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="speedometer" size={20} color="#3B82F6" />
              <TextInput
                style={styles.input}
                placeholder="e.g., 1210"
                placeholderTextColor="#9CA3AF"
                value={distance}
                onChangeText={setDistance}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.calculateButton, (!origin || !destination || !distance) && styles.buttonDisabled]}
            onPress={handleCalculate}
            disabled={!origin || !destination || !distance || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="calculator" size={20} color="#fff" />
                <Text style={styles.buttonText}>Calculate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {routeInfo && (
          <View style={styles.resultsCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routePoints}>
                <View style={styles.routePoint}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.routeCity}>{routeInfo.origin}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={styles.dotRed} />
                  <Text style={styles.routeCity}>{routeInfo.destination}</Text>
                </View>
              </View>
              <View style={styles.routeStats}>
                <Text style={styles.distanceText}>{routeInfo.distance} km</Text>
                <Text style={styles.timeText}>{routeInfo.estimatedTime}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.breakdownTitle}>Cost Breakdown</Text>

            <View style={styles.costItem}>
              <View style={styles.costLabel}>
                <Ionicons name="water" size={18} color="#F59E0B" />
                <Text style={styles.costText}>Fuel Cost</Text>
              </View>
              <Text style={styles.costValue}>PKR {routeInfo.fuelCost.toLocaleString()}</Text>
            </View>

            <View style={styles.costItem}>
              <View style={styles.costLabel}>
                <Ionicons name="car" size={18} color="#8B5CF6" />
                <Text style={styles.costText}>Toll Tax</Text>
              </View>
              <Text style={styles.costValue}>PKR {routeInfo.tollTax.toLocaleString()}</Text>
            </View>

            <View style={styles.costItem}>
              <View style={styles.costLabel}>
                <Ionicons name="person" size={18} color="#3B82F6" />
                <Text style={styles.costText}>Driver Expenses</Text>
              </View>
              <Text style={styles.costValue}>PKR {routeInfo.driverExpenses.toLocaleString()}</Text>
            </View>

            <View style={styles.costItem}>
              <View style={styles.costLabel}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.costText}>Profit (35%)</Text>
              </View>
              <Text style={styles.costValue}>PKR {routeInfo.profitMargin.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Recommended Price</Text>
                <Text style={styles.totalValue}>PKR {routeInfo.totalCost.toLocaleString()}</Text>
              </View>
              <View style={styles.perKmRow}>
                <Text style={styles.perKmLabel}>Price per km</Text>
                <Text style={styles.perKmValue}>PKR {routeInfo.pricePerKm}/km</Text>
              </View>
            </View>
          </View>
        )}

        {/* Popular Routes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <View style={styles.popularRoutes}>
            {POPULAR_ROUTES.map((route, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularRoute}
                onPress={() => handlePopularRoute(route)}
              >
                <View style={styles.popularRouteInfo}>
                  <Text style={styles.popularRouteText}>
                    {route.origin} → {route.destination}
                  </Text>
                  <Text style={styles.popularRouteDistance}>{route.distance} km</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Calculation Parameters</Text>
            <Text style={styles.infoText}>• Fuel: PKR {FUEL_PRICE_PER_LITER}/L @ {FUEL_CONSUMPTION} km/L</Text>
            <Text style={styles.infoText}>• Toll: PKR {TOLL_TAX_PER_100KM.toLocaleString()}/100km</Text>
            <Text style={styles.infoText}>• Driver: PKR {DRIVER_EXPENSES_PER_DAY.toLocaleString()}/day</Text>
            <Text style={styles.infoText}>• Profit Margin: {PROFIT_MARGIN * 100}%</Text>
          </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routePoints: {
    flex: 1,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4,
  },
  routeCity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  costLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costText: {
    fontSize: 14,
    color: '#4B5563',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalSection: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
  },
  perKmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  perKmLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  perKmValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  popularRoutes: {
    gap: 8,
  },
  popularRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularRouteInfo: {
    flex: 1,
  },
  popularRouteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  popularRouteDistance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 2,
  },
});
