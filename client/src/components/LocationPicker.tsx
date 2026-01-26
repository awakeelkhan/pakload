import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, Locate } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

function LocationMarker({ position, setPosition }: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
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
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {label}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0"
                    onClick={() => selectSearchResult(result)}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={searchLocation}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="p-2 border rounded-md hover:bg-gray-50"
            onClick={getCurrentLocation}
          >
            <Locate className="h-4 w-4" />
          </button>
        </div>

        <div className="h-64 rounded-md overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <MapController center={mapCenter} />
          </MapContainer>
        </div>

        {position && (
          <div className="text-xs text-gray-500">
            Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationPicker;
