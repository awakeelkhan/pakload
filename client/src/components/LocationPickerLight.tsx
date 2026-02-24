import { useState, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { MapPin, Search, Locate, Loader2, Check, ExternalLink } from 'lucide-react';

interface LocationPickerProps {
  value?: { latitude: number; longitude: number; address?: string };
  onChange: (location: { latitude: number; longitude: number; address?: string }) => void;
  label?: string;
  placeholder?: string;
  markerColor?: 'green' | 'red';
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Pakistan major cities
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
  { name: 'Hyderabad', lat: 25.396, lon: 68.3578 },
  { name: 'Sukkur', lat: 27.7052, lon: 68.8574 },
];

// China CPEC cities
const CHINA_CITIES = [
  { name: 'Kashgar', lat: 39.4547, lon: 75.9797 },
  { name: 'Urumqi', lat: 43.8256, lon: 87.6168 },
  { name: 'Khunjerab Pass', lat: 36.85, lon: 75.4167 },
];

export function LocationPickerLight({ 
  value, 
  onChange, 
  label = 'Select Location', 
  placeholder = 'Search city or address...',
  markerColor = 'green'
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(value ? { ...value, address: value.address || '' } : null);

  const searchLocation = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pk,cn,af,ir&limit=6`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const selectLocation = (lat: number, lon: number, address: string) => {
    const location = { latitude: lat, longitude: lon, address };
    setSelectedLocation(location);
    setSearchQuery(address);
    setSearchResults([]);
    onChange(location);
  };

  const selectSearchResult = (result: SearchResult) => {
    selectLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
  };

  const selectCity = (city: { name: string; lat: number; lon: number }) => {
    selectLocation(city.lat, city.lon, city.name);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          const address = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          selectLocation(lat, lon, address);
        } catch {
          selectLocation(lat, lon, `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openInGoogleMaps = () => {
    if (selectedLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`,
        '_blank'
      );
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const gradientColors = markerColor === 'green' 
    ? 'from-green-600 to-green-700' 
    : 'from-red-600 to-red-700';
  
  const accentColor = markerColor === 'green' ? 'green' : 'red';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientColors} px-5 py-4`}>
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {label}
        </h3>
        <p className="text-white/80 text-sm mt-1">Search or select from quick picks below</p>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-${accentColor}-500 focus:ring-2 focus:ring-${accentColor}-100 transition-all`}
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
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-${accentColor}-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3 transition-colors`}
                    onClick={() => selectSearchResult(result)}
                  >
                    <MapPin className={`h-5 w-5 text-${accentColor}-600 mt-0.5 flex-shrink-0`} />
                    <span className="text-gray-700 line-clamp-2">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={`px-4 py-3 bg-${accentColor}-600 text-white rounded-xl hover:bg-${accentColor}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium`}
            onClick={searchLocation}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
          <button
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            onClick={getCurrentLocation}
            disabled={isLocating}
            title="Use my current location"
          >
            {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Locate className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Quick Pick Cities */}
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            🇵🇰 Pakistan Cities
          </h4>
          <div className="flex flex-wrap gap-2">
            {PAKISTAN_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => selectCity(city)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  selectedLocation?.address === city.name
                    ? `bg-${accentColor}-600 text-white border-${accentColor}-600`
                    : `bg-white text-gray-700 border-gray-200 hover:border-${accentColor}-400 hover:bg-${accentColor}-50`
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            🇨🇳 China (CPEC)
          </h4>
          <div className="flex flex-wrap gap-2">
            {CHINA_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => selectCity(city)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  selectedLocation?.address === city.name
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="relative h-64 bg-gray-100">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={selectedLocation 
            ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedLocation.latitude},${selectedLocation.longitude}&zoom=12`
            : `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=30.3753,69.3451&zoom=5`
          }
        />
        {!selectedLocation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm text-gray-600">
              Search or select a city to pin location
            </div>
          </div>
        )}
      </div>

      {/* Selected Location */}
      {selectedLocation && (
        <div className={`px-5 py-4 bg-${accentColor}-50 border-t border-${accentColor}-100`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${accentColor}-600 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
            <button
              onClick={openInGoogleMaps}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPickerLight;
