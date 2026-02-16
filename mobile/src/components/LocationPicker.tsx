import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  label?: string;
  placeholder?: string;
}

export default function LocationPicker({
  value,
  onChange,
  label = 'Pin Location',
  placeholder = 'Select or enter location',
}: LocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature.');
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const addressString = address
        ? `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.country || ''}`.trim()
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      onChange({
        latitude,
        longitude,
        address: addressString,
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setGettingLocation(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pk,cn,af,ir&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to search location. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    onChange({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    });
    setSearchResults([]);
    setSearchQuery('');
    setModalVisible(false);
  };

  const formatCoordinates = (loc: LocationData) => {
    return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="location" size={20} color="#16a34a" />
        <Text style={[styles.inputText, !value && styles.placeholder]} numberOfLines={1}>
          {value?.address || (value ? formatCoordinates(value) : placeholder)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#16a34a" />
              ) : (
                <Ionicons name="navigate" size={20} color="#16a34a" />
              )}
              <Text style={styles.currentLocationText}>
                {gettingLocation ? 'Getting location...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchLocation}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchLocation}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => selectSearchResult(result)}
                  >
                    <Ionicons name="location-outline" size={18} color="#16a34a" />
                    <Text style={styles.resultText} numberOfLines={2}>
                      {result.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manual Coordinates Input */}
            <View style={styles.manualSection}>
              <Text style={styles.manualTitle}>Or enter coordinates manually:</Text>
              <Text style={styles.manualHint}>Format: latitude, longitude (e.g., 33.6844, 73.0479)</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="33.6844, 73.0479"
                keyboardType="numbers-and-punctuation"
                onSubmitEditing={(e) => {
                  const coords = e.nativeEvent.text.split(',').map(s => parseFloat(s.trim()));
                  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    onChange({
                      latitude: coords[0],
                      longitude: coords[1],
                      address: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                    });
                    setModalVisible(false);
                  } else {
                    Alert.alert('Invalid Format', 'Please enter coordinates as: latitude, longitude');
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  placeholder: {
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  manualSection: {
    backgroundColor: '#f0f9ff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  manualTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  manualHint: {
    fontSize: 11,
    color: '#0c4a6e',
    marginBottom: 10,
  },
  manualInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
});
