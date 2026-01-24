import { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, Fuel, AlertTriangle, Cloud, TrendingUp, Calculator, Route as RouteIcon, Truck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// City coordinates for CPEC routes
const CITY_COORDS: Record<string, [number, number]> = {
  'Kashgar, China': [39.4547, 75.9797],
  'Urumqi, China': [43.8256, 87.6168],
  'Khunjerab Pass': [36.8500, 75.4167],
  'Islamabad, Pakistan': [33.6844, 73.0479],
  'Lahore, Pakistan': [31.5497, 74.3436],
  'Karachi, Pakistan': [24.8607, 67.0011],
  'Peshawar, Pakistan': [34.0151, 71.5249],
  'Gwadar, Pakistan': [25.1264, 62.3225],
};

interface RouteData {
  id: string;
  from: string;
  to: string;
  distance: number;
  duration: string;
  fuelCost: number;
  tollCost: number;
  borderCrossing: string;
  status: 'open' | 'restricted' | 'closed';
  weatherCondition: string;
  trafficLevel: 'low' | 'medium' | 'high';
  popularRoute: boolean;
}

export default function Routes() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [fuelPrice, setFuelPrice] = useState(280);
  const [vehicleType, setVehicleType] = useState('truck');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const routes: RouteData[] = [
    {
      id: '1',
      from: 'Kashgar, China',
      to: 'Islamabad, Pakistan',
      distance: 1250,
      duration: '5-7 days',
      fuelCost: 45000,
      tollCost: 8500,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Clear',
      trafficLevel: 'low',
      popularRoute: true,
    },
    {
      id: '2',
      from: 'Urumqi, China',
      to: 'Lahore, Pakistan',
      distance: 1800,
      duration: '7-10 days',
      fuelCost: 65000,
      tollCost: 12000,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Partly Cloudy',
      trafficLevel: 'medium',
      popularRoute: true,
    },
    {
      id: '3',
      from: 'Kashgar, China',
      to: 'Lahore, Pakistan',
      distance: 1450,
      duration: '6-8 days',
      fuelCost: 52000,
      tollCost: 9500,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Clear',
      trafficLevel: 'low',
      popularRoute: true,
    },
    {
      id: '4',
      from: 'Kashgar, China',
      to: 'Karachi, Pakistan',
      distance: 2100,
      duration: '10-12 days',
      fuelCost: 75000,
      tollCost: 15000,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Clear',
      trafficLevel: 'medium',
      popularRoute: false,
    },
    {
      id: '5',
      from: 'Urumqi, China',
      to: 'Peshawar, Pakistan',
      distance: 1650,
      duration: '7-9 days',
      fuelCost: 59000,
      tollCost: 11000,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Windy',
      trafficLevel: 'low',
      popularRoute: false,
    },
    {
      id: '6',
      from: 'Kashgar, China',
      to: 'Gwadar, Pakistan',
      distance: 2450,
      duration: '12-15 days',
      fuelCost: 88000,
      tollCost: 18000,
      borderCrossing: 'Khunjerab Pass',
      status: 'open',
      weatherCondition: 'Hot',
      trafficLevel: 'low',
      popularRoute: false,
    },
  ];

  const calculateRoute = () => {
    if (origin && destination) {
      const route = routes.find(
        (r) => r.from.toLowerCase().includes(origin.toLowerCase()) && 
               r.to.toLowerCase().includes(destination.toLowerCase())
      );
      setSelectedRoute(route || null);
    }
  };

  const getFuelConsumption = (distance: number) => {
    const consumption = vehicleType === 'truck' ? 0.35 : 0.25; // liters per km
    return (distance * consumption).toFixed(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700 border-green-200';
      case 'restricted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'closed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'high': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CPEC Routes & Planning</h1>
          <p className="text-slate-600">Plan your route along the China-Pakistan Economic Corridor with real-time information</p>
        </div>

        {/* Route Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Route Calculator</h2>
                <p className="text-sm text-slate-600">Calculate distance, time, and costs</p>
              </div>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showCalculator ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {showCalculator && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Origin City</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g., Kashgar"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Destination City</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Islamabad"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="truck">Heavy Truck (0.35 L/km)</option>
                    <option value="van">Van/Light Truck (0.25 L/km)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fuel Price (PKR/L)</label>
                  <input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={calculateRoute}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Calculate Route
              </button>

              {selectedRoute && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Route Summary</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <RouteIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-600">Distance</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{selectedRoute.distance} km</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-slate-600">Duration</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{selectedRoute.duration}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel className="w-5 h-5 text-amber-600" />
                        <span className="text-sm text-slate-600">Fuel Cost</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">PKR {selectedRoute.fuelCost.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">{getFuelConsumption(selectedRoute.distance)} liters</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-600">Toll Cost</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">PKR {selectedRoute.tollCost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Total Estimated Cost</span>
                      <span className="text-2xl font-bold text-green-600">PKR {(selectedRoute.fuelCost + selectedRoute.tollCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Khunjerab Pass</h3>
            </div>
            <p className="text-sm text-green-800">✓ Open - Normal operations</p>
            <p className="text-xs text-green-600 mt-1">Last updated: 2 hours ago</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Weather Advisory</h3>
            </div>
            <p className="text-sm text-amber-800">Snow expected in high-altitude areas</p>
            <p className="text-xs text-amber-600 mt-1">Valid until: Dec 28</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Traffic Update</h3>
            </div>
            <p className="text-sm text-blue-800">Light traffic on all major routes</p>
            <p className="text-xs text-blue-600 mt-1">Updated: 30 mins ago</p>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Interactive Route Map</h2>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{routes.length} Active Routes</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Live</span>
            </div>
          </div>
          <div className="h-96 rounded-xl overflow-hidden border border-slate-200">
            <MapContainer 
              center={[35.0, 75.0]} 
              zoom={5} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* City Markers */}
              {Object.entries(CITY_COORDS).map(([city, coords]) => (
                <Marker key={city} position={coords}>
                  <Popup>
                    <div className="text-center">
                      <strong>{city}</strong>
                      <br />
                      <span className="text-xs text-gray-500">
                        {city.includes('China') ? '🇨🇳 China' : city.includes('Pass') ? '🏔️ Border' : '🇵🇰 Pakistan'}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Route Lines */}
              {routes.map((route) => {
                const fromCoords = CITY_COORDS[route.from];
                const toCoords = CITY_COORDS[route.to];
                const khunjerabCoords = CITY_COORDS['Khunjerab Pass'];
                
                if (fromCoords && toCoords && khunjerabCoords) {
                  // Route goes through Khunjerab Pass
                  return (
                    <Polyline
                      key={route.id}
                      positions={[fromCoords, khunjerabCoords, toCoords]}
                      color={route.status === 'open' ? '#16a34a' : route.status === 'restricted' ? '#f59e0b' : '#ef4444'}
                      weight={3}
                      opacity={0.7}
                      dashArray={route.popularRoute ? undefined : '10, 10'}
                    >
                      <Popup>
                        <div>
                          <strong>{route.from} → {route.to}</strong>
                          <br />
                          <span className="text-sm">Distance: {route.distance} km</span>
                          <br />
                          <span className="text-sm">Duration: {route.duration}</span>
                          <br />
                          <span className={`text-sm ${route.status === 'open' ? 'text-green-600' : 'text-amber-600'}`}>
                            Status: {route.status.toUpperCase()}
                          </span>
                        </div>
                      </Popup>
                    </Polyline>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500 rounded"></div>
              <span>Open Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500 rounded"></div>
              <span>Restricted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500 rounded border-dashed"></div>
              <span>Less Popular</span>
            </div>
          </div>
        </div>

        {/* All Routes */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">All CPEC Routes</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Sort by Distance
            </button>
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <RouteIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{route.from}</h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm">{route.to}</span>
                      </div>
                    </div>
                  </div>
                  {route.popularRoute && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <RouteIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{route.distance} km</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{route.duration}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Fuel className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">Fuel Cost</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">PKR {(route.fuelCost / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">Toll Cost</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">PKR {(route.tollCost / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(route.status)}`}>
                    {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                  </span>
                  <span className="text-xs text-slate-600">Border: {route.borderCrossing}</span>
                </div>

                <button
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                  className="w-full text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 py-2"
                >
                  {expandedRoute === route.id ? (
                    <><ChevronUp className="w-4 h-4" /> Hide Details</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show Details</>
                  )}
                </button>

                {expandedRoute === route.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Weather Condition</span>
                      <span className="font-medium text-slate-900">{route.weatherCondition}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Traffic Level</span>
                      <span className={`font-medium ${getTrafficColor(route.trafficLevel)}`}>
                        {route.trafficLevel.charAt(0).toUpperCase() + route.trafficLevel.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total Cost Estimate</span>
                      <span className="font-bold text-green-600">PKR {(route.fuelCost + route.tollCost).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <button className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                        View Available Loads
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Find Trucks
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Route Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Route Planning Tips</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Check weather conditions before departure, especially for high-altitude routes</li>
                <li>• Khunjerab Pass is closed during winter months (November-April)</li>
                <li>• Ensure all customs documentation is prepared in advance</li>
                <li>• Consider fuel availability and plan refueling stops accordingly</li>
                <li>• Traffic is typically lighter during weekdays</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
