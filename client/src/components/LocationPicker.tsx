import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, Locate, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon - inDrive/Google Maps style
const customIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 48px;
      height: 48px;
      position: relative;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background: rgba(0,0,0,0.2);
        border-radius: 50%;
        filter: blur(2px);
      "></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// Destination marker (red)
const destinationIcon = new L.DivIcon({
  className: 'custom-marker-destination',
  html: `
    <div style="
      width: 48px;
      height: 48px;
      position: relative;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background: rgba(0,0,0,0.2);
        border-radius: 50%;
        filter: blur(2px);
      "></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

interface LocationPickerProps {
  value?: { latitude: number; longitude: number; address?: string };
  onChange: (location: { latitude: number; longitude: number; address?: string }) => void;
  label?: string;
  placeholder?: string;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

function LocationMarker({ position, setPosition, markerType = 'origin' }: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void;
  markerType?: 'origin' | 'destination';
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const icon = markerType === 'destination' ? destinationIcon : customIcon;
  return position ? <Marker position={position} icon={icon} /> : null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export function LocationPicker({ value, onChange, label = 'Select Location', placeholder = 'Search for a location...' }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.latitude, value.longitude] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.3753, 69.3451]);

  useEffect(() => {
    if (position) {
      onChange({
        latitude: position[0],
        longitude: position[1],
      });
    }
  }, [position, onChange]);

  const searchLocation = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pk,cn,af,ir&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setMapCenter([lat, lon]);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    onChange({
      latitude: lat,
      longitude: lon,
      address: result.display_name,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setPosition([lat, lon]);
          setMapCenter([lat, lon]);
          onChange({ latitude: lat, longitude: lon });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {label}
        </h3>
        <p className="text-green-100 text-sm mt-1">Tap on the map or search to select location</p>
      </div>
      
      {/* Search Bar - inDrive style */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-green-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3 transition-colors"
                    onClick={() => selectSearchResult(result)}
                  >
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 line-clamp-2">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            onClick={searchLocation}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
          <button
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={getCurrentLocation}
            title="Use my current location"
          >
            <Locate className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Map Container - Larger and more prominent */}
      <div className="relative h-80">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Use CartoDB Voyager tiles for a cleaner, modern look like Google Maps */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapController center={mapCenter} />
        </MapContainer>
        
        {/* Floating zoom hint */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600">
          <span className="font-medium">Tip:</span> Click on map to pin location
        </div>
        
        {/* Center crosshair when no position */}
        {!position && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-2 border-green-600 rounded-full opacity-50 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Selected Location Footer */}
      {position && (
        <div className="px-5 py-4 bg-green-50 border-t border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Location Selected</p>
              <p className="text-xs text-gray-500 truncate">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>
            <div className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
              ✓ Pinned
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
