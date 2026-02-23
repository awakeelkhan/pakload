import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  title?: string;
  markerColor?: 'green' | 'red';
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const PAKISTAN_CITIES = [
  { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
  { name: 'Lahore', lat: 31.5204, lon: 74.3587 },
  { name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
  { name: 'Rawalpindi', lat: 33.5651, lon: 73.0169 },
  { name: 'Faisalabad', lat: 31.4504, lon: 73.135 },
  { name: 'Multan', lat: 30.1575, lon: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lon: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lon: 66.975 },
  { name: 'Gwadar', lat: 25.1264, lon: 62.3225 },
  { name: 'Sialkot', lat: 32.4945, lon: 74.5229 },
];

const CHINA_CITIES = [
  { name: 'Kashgar', lat: 39.4547, lon: 75.9797 },
  { name: 'Urumqi', lat: 43.8256, lon: 87.6168 },
  { name: 'Khunjerab', lat: 36.85, lon: 75.4167 },
];

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  title = 'Select Location',
  markerColor = 'green',
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showQuickPicks, setShowQuickPicks] = useState(true);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowQuickPicks(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=pk,cn,af,ir&limit=8`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    const location = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    };
    setSelectedLocation(location);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const selectQuickPick = (city: { name: string; lat: number; lon: number }) => {
    const location = {
      latitude: city.lat,
      longitude: city.lon,
      address: city.name,
    };
    setSelectedLocation(location);
    setSearchQuery(city.name);
    setShowQuickPicks(false);
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressString = address
        ? `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim()
        : 'Current Location';

      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addressString,
      });
      setSearchQuery(addressString);
      setShowQuickPicks(false);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const openInMaps = () => {
    if (!selectedLocation) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`;
    Linking.openURL(url);
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
    setShowQuickPicks(true);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={markerColor === 'green' ? ['#16a34a', '#15803d'] : ['#dc2626', '#b91c1c']}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="location" size={28} color="#fff" />
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>Search or select from quick picks</Text>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, address, or landmark..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (!text) setShowQuickPicks(true);
              }}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowQuickPicks(true);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
            onPress={searchLocation}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="locate" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => selectSearchResult(result)}
                >
                  <View style={[styles.resultIcon, { backgroundColor: markerColor === 'green' ? '#dcfce7' : '#fee2e2' }]}>
                    <Ionicons
                      name="location"
                      size={20}
                      color={markerColor === 'green' ? '#16a34a' : '#dc2626'}
                    />
                  </View>
                  <Text style={styles.resultText} numberOfLines={2}>
                    {result.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Picks */}
          {showQuickPicks && searchResults.length === 0 && (
            <>
              <View style={styles.quickPicksSection}>
                <Text style={styles.sectionTitle}>🇵🇰 Pakistan Cities</Text>
                <View style={styles.quickPicksGrid}>
                  {PAKISTAN_CITIES.map((city) => (
                    <TouchableOpacity
                      key={city.name}
                      style={styles.quickPickItem}
                      onPress={() => selectQuickPick(city)}
                    >
                      <Ionicons name="location" size={16} color="#16a34a" />
                      <Text style={styles.quickPickText}>{city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.quickPicksSection}>
                <Text style={styles.sectionTitle}>🇨🇳 China Cities (CPEC)</Text>
                <View style={styles.quickPicksGrid}>
                  {CHINA_CITIES.map((city) => (
                    <TouchableOpacity
                      key={city.name}
                      style={styles.quickPickItem}
                      onPress={() => selectQuickPick(city)}
                    >
                      <Ionicons name="location" size={16} color="#dc2626" />
                      <Text style={styles.quickPickText}>{city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Selected Location Preview */}
          {selectedLocation && (
            <View style={styles.selectedContainer}>
              <Text style={styles.sectionTitle}>Selected Location</Text>
              <View style={styles.selectedCard}>
                <View style={styles.selectedHeader}>
                  <View style={[styles.selectedIcon, { backgroundColor: markerColor === 'green' ? '#16a34a' : '#dc2626' }]}>
                    <Ionicons name="location" size={24} color="#fff" />
                  </View>
                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedAddress} numberOfLines={2}>
                      {selectedLocation.address}
                    </Text>
                    <Text style={styles.selectedCoords}>
                      {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewMapButton} onPress={openInMaps}>
                  <Ionicons name="map-outline" size={18} color="#3b82f6" />
                  <Text style={styles.viewMapText}>View in Google Maps</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedLocation && styles.confirmButtonDisabled,
              { backgroundColor: markerColor === 'green' ? '#16a34a' : '#dc2626' },
            ]}
            onPress={confirmSelection}
            disabled={!selectedLocation}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quickPicksSection: {
    marginBottom: 8,
  },
  quickPicksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPickText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedContainer: {
    marginBottom: 100,
  },
  selectedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedCoords: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    gap: 8,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
