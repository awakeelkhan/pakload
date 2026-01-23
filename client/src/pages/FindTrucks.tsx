import { useState, useEffect } from 'react';
import { Search, Truck, ShieldCheck, MapPin, Star, Phone, Mail, Calendar, DollarSign, Package, Navigation, Filter, X, Bookmark, BookmarkCheck, Award, Clock, TrendingUp, ChevronDown, ChevronUp, Eye, Building } from 'lucide-react';
import QuoteRequestModal from '../components/QuoteRequestModal';

interface TruckData {
  id: number;
  carrierName: string;
  vehicleType: string;
  capacity: {
    weight: number;
    volume: number;
  };
  currentLocation: string;
  availableFrom: string;
  preferredRoutes: string[];
  ratePerKm: number;
  rateUsd: number;
  ratePkr: number;
  verified: boolean;
  insured: boolean;
  gpsTracking: boolean;
  rating: number;
  totalTrips: number;
  contactPhone: string;
  contactEmail: string;
  equipmentFeatures: string[];
  certifications: string[];
  views: number;
  postedDate: string;
}

export default function FindTrucks() {
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rate' | 'rating'>('date');
  const [savedTrucks, setSavedTrucks] = useState<number[]>([]);
  const [expandedTruck, setExpandedTruck] = useState<number | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  
  const [filters, setFilters] = useState({
    location: '',
    vehicleType: '',
    minCapacity: '',
    maxCapacity: '',
    availableFrom: '',
    verifiedOnly: false,
    insuredOnly: false,
    gpsOnly: false,
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.location) params.append('currentLocation', filters.location);
      if (filters.vehicleType) params.append('truckType', filters.vehicleType);
      if (filters.verifiedOnly) params.append('status', 'active');
      
      const response = await fetch(`/api/trucks?${params}`);
      const data = await response.json();
      
      // Transform API data to match TruckData interface
      const transformedTrucks: TruckData[] = (Array.isArray(data) ? data : []).map((truck: any) => ({
        id: truck.id,
        carrierName: truck.carrier?.companyName || truck.carrier?.firstName + ' ' + truck.carrier?.lastName || 'Unknown Carrier',
        vehicleType: truck.type || 'Container',
        capacity: {
          weight: parseFloat(truck.capacity) || 20000,
          volume: 60,
        },
        currentLocation: truck.currentLocation || 'Unknown',
        availableFrom: new Date().toISOString().split('T')[0],
        preferredRoutes: ['Islamabad', 'Lahore', 'Karachi'],
        ratePerKm: 3.5,
        rateUsd: 3.5,
        ratePkr: 973,
        verified: truck.status === 'active',
        insured: true,
        gpsTracking: true,
        rating: 4.5,
        totalTrips: 100,
        contactPhone: '+92 300 1234567',
        contactEmail: 'contact@pakload.com',
        equipmentFeatures: ['GPS Tracking', 'Climate Control'],
        certifications: ['ISO 9001'],
        views: 50,
        postedDate: truck.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      }));
      
      setTrucks(transformedTrucks);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTrucks();
  };

  // Fallback mock data if API returns empty
  const mockTrucks: TruckData[] = [
    {
      id: 1,
      carrierName: 'CPEC Express Logistics',
      vehicleType: '40ft Container',
      capacity: { weight: 28000, volume: 67 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-01-26',
      preferredRoutes: ['Islamabad', 'Lahore', 'Karachi'],
      ratePerKm: 3.8,
      rateUsd: 3.8,
      ratePkr: 1056,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.9,
      totalTrips: 245,
      contactPhone: '+86 998 111 2222',
      contactEmail: 'dispatch@cpecexpress.com',
      equipmentFeatures: ['Climate Control', 'Air Ride Suspension', 'Liftgate'],
      certifications: ['ISO 9001', 'Customs Certified', 'Hazmat'],
      views: 189,
      postedDate: '2024-01-20',
    },
    {
      id: 2,
      carrierName: 'Silk Road Transport',
      vehicleType: '40ft Container',
      capacity: { weight: 26000, volume: 65 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-01-28',
      preferredRoutes: ['Lahore', 'Faisalabad', 'Multan'],
      ratePerKm: 3.5,
      rateUsd: 3.5,
      ratePkr: 973,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.7,
      totalTrips: 198,
      contactPhone: '+86 991 222 3333',
      contactEmail: 'ops@silkroadtrans.com',
      equipmentFeatures: ['GPS Tracking', 'Real-time Updates', 'Secure Locks'],
      certifications: ['ISO 9001', 'Safety Certified'],
      views: 156,
      postedDate: '2024-01-21',
    },
    {
      id: 3,
      carrierName: 'Mountain Express Carriers',
      vehicleType: 'Refrigerated 40ft',
      capacity: { weight: 25000, volume: 60 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-01-27',
      preferredRoutes: ['Islamabad', 'Rawalpindi', 'Peshawar'],
      ratePerKm: 4.5,
      rateUsd: 4.5,
      ratePkr: 1251,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.8,
      totalTrips: 167,
      contactPhone: '+86 998 333 4444',
      contactEmail: 'cold@mountainexpress.com',
      equipmentFeatures: ['Temperature Control', 'Multi-temp Zones', 'Backup Generator'],
      certifications: ['Food Safety', 'Pharma Certified', 'ISO 22000'],
      views: 203,
      postedDate: '2024-01-22',
    },
    {
      id: 4,
      carrierName: 'Heavy Haul Logistics',
      vehicleType: 'Flatbed 40ft',
      capacity: { weight: 32000, volume: 70 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-01-29',
      preferredRoutes: ['Karachi', 'Gwadar', 'Quetta'],
      ratePerKm: 4.2,
      rateUsd: 4.2,
      ratePkr: 1168,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.6,
      totalTrips: 134,
      contactPhone: '+86 991 444 5555',
      contactEmail: 'heavy@heavyhaul.com',
      equipmentFeatures: ['Heavy Duty', 'Winch System', 'Tie-down Points'],
      certifications: ['Heavy Load Certified', 'Safety Inspected'],
      views: 145,
      postedDate: '2024-01-20',
    },
    {
      id: 5,
      carrierName: 'Swift Cargo Solutions',
      vehicleType: '20ft Container',
      capacity: { weight: 18000, volume: 33 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-01-30',
      preferredRoutes: ['Lahore', 'Sialkot', 'Gujranwala'],
      ratePerKm: 3.2,
      rateUsd: 3.2,
      ratePkr: 890,
      verified: true,
      insured: true,
      gpsTracking: false,
      rating: 4.5,
      totalTrips: 212,
      contactPhone: '+86 998 555 6666',
      contactEmail: 'dispatch@swiftcargo.com',
      equipmentFeatures: ['Standard Container', 'Secure Seals'],
      certifications: ['ISO 9001'],
      views: 98,
      postedDate: '2024-01-21',
    },
    {
      id: 6,
      carrierName: 'Premium Transport Services',
      vehicleType: '40ft Container',
      capacity: { weight: 27000, volume: 66 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-02-01',
      preferredRoutes: ['Islamabad', 'Karachi', 'Lahore'],
      ratePerKm: 3.9,
      rateUsd: 3.9,
      ratePkr: 1084,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.8,
      totalTrips: 289,
      contactPhone: '+86 991 666 7777',
      contactEmail: 'premium@premiumtrans.com',
      equipmentFeatures: ['Air Ride', 'Climate Control', 'Security System'],
      certifications: ['ISO 9001', 'Quality Certified', 'Customs Approved'],
      views: 178,
      postedDate: '2024-01-22',
    },
    {
      id: 7,
      carrierName: 'Border Express Freight',
      vehicleType: '40ft Container',
      capacity: { weight: 26500, volume: 64 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-02-02',
      preferredRoutes: ['Peshawar', 'Islamabad', 'Lahore'],
      ratePerKm: 3.6,
      rateUsd: 3.6,
      ratePkr: 1001,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.7,
      totalTrips: 176,
      contactPhone: '+86 998 777 8888',
      contactEmail: 'ops@borderexpress.com',
      equipmentFeatures: ['GPS Tracking', 'Real-time Monitoring', 'Secure Locks'],
      certifications: ['Customs Certified', 'Border Crossing Approved'],
      views: 134,
      postedDate: '2024-01-23',
    },
    {
      id: 8,
      carrierName: 'Reliable Movers Ltd',
      vehicleType: 'Refrigerated 20ft',
      capacity: { weight: 15000, volume: 28 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-02-03',
      preferredRoutes: ['Lahore', 'Faisalabad', 'Multan'],
      ratePerKm: 4.0,
      rateUsd: 4.0,
      ratePkr: 1112,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.6,
      totalTrips: 143,
      contactPhone: '+86 991 888 9999',
      contactEmail: 'cold@reliablemovers.com',
      equipmentFeatures: ['Temperature Control', 'Monitoring System', 'Backup Power'],
      certifications: ['Food Safety', 'Pharma Certified'],
      views: 167,
      postedDate: '2024-01-20',
    },
    {
      id: 9,
      carrierName: 'Global Freight Network',
      vehicleType: '40ft Container',
      capacity: { weight: 28500, volume: 68 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-02-04',
      preferredRoutes: ['Karachi', 'Hyderabad', 'Sukkur'],
      ratePerKm: 3.7,
      rateUsd: 3.7,
      ratePkr: 1029,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.9,
      totalTrips: 312,
      contactPhone: '+86 998 999 0000',
      contactEmail: 'dispatch@globalfreight.com',
      equipmentFeatures: ['Advanced GPS', 'Climate Control', 'Security Cameras'],
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
      views: 221,
      postedDate: '2024-01-21',
    },
    {
      id: 10,
      carrierName: 'Fast Track Logistics',
      vehicleType: '20ft Container',
      capacity: { weight: 17000, volume: 32 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-02-05',
      preferredRoutes: ['Islamabad', 'Rawalpindi', 'Abbottabad'],
      ratePerKm: 3.3,
      rateUsd: 3.3,
      ratePkr: 918,
      verified: false,
      insured: true,
      gpsTracking: false,
      rating: 4.4,
      totalTrips: 98,
      contactPhone: '+86 991 000 1111',
      contactEmail: 'ops@fasttrack.com',
      equipmentFeatures: ['Standard Container', 'Basic Security'],
      certifications: ['Basic Safety'],
      views: 76,
      postedDate: '2024-01-22',
    },
    {
      id: 11,
      carrierName: 'Elite Transport Group',
      vehicleType: 'Lowboy Trailer',
      capacity: { weight: 35000, volume: 75 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-02-06',
      preferredRoutes: ['Gwadar', 'Karachi', 'Quetta'],
      ratePerKm: 5.2,
      rateUsd: 5.2,
      ratePkr: 1446,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.8,
      totalTrips: 87,
      contactPhone: '+86 998 111 2223',
      contactEmail: 'heavy@elitetrans.com',
      equipmentFeatures: ['Hydraulic Ramps', 'Heavy Duty', 'Specialized Equipment'],
      certifications: ['Heavy Load', 'Oversized Transport', 'Safety Certified'],
      views: 192,
      postedDate: '2024-01-23',
    },
    {
      id: 12,
      carrierName: 'Secure Cargo Movers',
      vehicleType: '40ft Container',
      capacity: { weight: 27500, volume: 66 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-02-07',
      preferredRoutes: ['Lahore', 'Islamabad', 'Peshawar'],
      ratePerKm: 3.8,
      rateUsd: 3.8,
      ratePkr: 1056,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.7,
      totalTrips: 203,
      contactPhone: '+86 991 222 3334',
      contactEmail: 'secure@securecargo.com',
      equipmentFeatures: ['Advanced Security', 'GPS Tracking', 'Alarm System'],
      certifications: ['ISO 9001', 'Security Certified'],
      views: 145,
      postedDate: '2024-01-20',
    },
    {
      id: 13,
      carrierName: 'Express Lane Transport',
      vehicleType: 'Flatbed 20ft',
      capacity: { weight: 20000, volume: 40 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-02-08',
      preferredRoutes: ['Faisalabad', 'Multan', 'Bahawalpur'],
      ratePerKm: 3.4,
      rateUsd: 3.4,
      ratePkr: 945,
      verified: true,
      insured: true,
      gpsTracking: false,
      rating: 4.5,
      totalTrips: 156,
      contactPhone: '+86 998 333 4445',
      contactEmail: 'dispatch@expresslane.com',
      equipmentFeatures: ['Flatbed', 'Tie-down System', 'Tarp Cover'],
      certifications: ['Safety Certified'],
      views: 112,
      postedDate: '2024-01-21',
    },
    {
      id: 14,
      carrierName: 'Continental Freight Services',
      vehicleType: '40ft Container',
      capacity: { weight: 29000, volume: 69 },
      currentLocation: 'Urumqi, China',
      availableFrom: '2024-02-09',
      preferredRoutes: ['Karachi', 'Lahore', 'Islamabad'],
      ratePerKm: 4.1,
      rateUsd: 4.1,
      ratePkr: 1140,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.9,
      totalTrips: 267,
      contactPhone: '+86 991 444 5556',
      contactEmail: 'ops@continental.com',
      equipmentFeatures: ['Premium Service', 'Climate Control', 'Real-time Tracking'],
      certifications: ['ISO 9001', 'ISO 14001', 'Quality Excellence'],
      views: 198,
      postedDate: '2024-01-22',
    },
    {
      id: 15,
      carrierName: 'Rapid Response Logistics',
      vehicleType: 'Refrigerated 40ft',
      capacity: { weight: 24000, volume: 58 },
      currentLocation: 'Kashgar, China',
      availableFrom: '2024-02-10',
      preferredRoutes: ['Islamabad', 'Lahore', 'Karachi'],
      ratePerKm: 4.6,
      rateUsd: 4.6,
      ratePkr: 1279,
      verified: true,
      insured: true,
      gpsTracking: true,
      rating: 4.8,
      totalTrips: 189,
      contactPhone: '+86 998 555 6667',
      contactEmail: 'cold@rapidresponse.com',
      equipmentFeatures: ['Multi-temp Control', 'Monitoring', 'Emergency Backup'],
      certifications: ['Food Safety', 'Pharma', 'ISO 22000'],
      views: 176,
      postedDate: '2024-01-23',
    },
  ];

  // Use API data if available, otherwise use mock data
  const allTrucks = trucks.length > 0 ? trucks : mockTrucks;

  const filteredTrucks = allTrucks.filter(truck => {
    if (filters.location && !truck.currentLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.vehicleType && !truck.vehicleType.toLowerCase().includes(filters.vehicleType.toLowerCase())) return false;
    if (filters.minCapacity && truck.capacity.weight < parseInt(filters.minCapacity)) return false;
    if (filters.maxCapacity && truck.capacity.weight > parseInt(filters.maxCapacity)) return false;
    if (filters.availableFrom && truck.availableFrom < filters.availableFrom) return false;
    if (filters.verifiedOnly && !truck.verified) return false;
    if (filters.insuredOnly && !truck.insured) return false;
    if (filters.gpsOnly && !truck.gpsTracking) return false;
    return true;
  });

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return a.ratePerKm - b.ratePerKm;
      case 'rating':
        return b.rating - a.rating;
      case 'date':
      default:
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const toggleSaveTruck = (truckId: number) => {
    setSavedTrucks(prev =>
      prev.includes(truckId)
        ? prev.filter(id => id !== truckId)
        : [...prev, truckId]
    );
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      vehicleType: '',
      minCapacity: '',
      maxCapacity: '',
      availableFrom: '',
      verifiedOnly: false,
      insuredOnly: false,
      gpsOnly: false,
    });
  };

  const verifiedCount = allTrucks.filter(t => t.verified).length;
  const avgRate = (allTrucks.reduce((sum, t) => sum + t.ratePerKm, 0) / allTrucks.length).toFixed(2);
  const chinaCount = allTrucks.filter(t => t.currentLocation.includes('China')).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Trucks</h1>
          <p className="text-slate-600">Browse available carriers along the CPEC corridor</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{allTrucks.length}</div>
            <div className="text-sm text-slate-600">Available Trucks</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
            <div className="text-sm text-slate-600">Verified Carriers</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">${avgRate}/km</div>
            <div className="text-sm text-slate-600">Avg Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-amber-600">{savedTrucks.length}</div>
            <div className="text-sm text-slate-600">Saved Trucks</div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by location, vehicle type..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rate' | 'rating')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="date">Sort by: Newest First</option>
              <option value="rate">Sort by: Lowest Rate</option>
              <option value="rating">Sort by: Highest Rating</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Advanced Filters</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <X size={16} />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Current Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  placeholder="e.g., Kashgar"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Truck className="inline w-4 h-4 mr-1" />
                  Vehicle Type
                </label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Types</option>
                  <option value="20ft">20ft Container</option>
                  <option value="40ft">40ft Container</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="lowboy">Lowboy Trailer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Min Capacity (kg)
                </label>
                <input
                  type="number"
                  value={filters.minCapacity}
                  onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                  placeholder="15000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Available From
                </label>
                <input
                  type="date"
                  value={filters.availableFrom}
                  onChange={(e) => setFilters({...filters, availableFrom: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="verifiedOnly" className="ml-2 text-sm font-medium text-slate-700">
                    Verified Carriers Only
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="insuredOnly"
                    checked={filters.insuredOnly}
                    onChange={(e) => setFilters({...filters, insuredOnly: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="insuredOnly" className="ml-2 text-sm font-medium text-slate-700">
                    Insured Only
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gpsOnly"
                    checked={filters.gpsOnly}
                    onChange={(e) => setFilters({...filters, gpsOnly: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="gpsOnly" className="ml-2 text-sm font-medium text-slate-700">
                    GPS Tracking Only
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Showing {sortedTrucks.length} of {allTrucks.length} trucks
            </div>
          </div>
        )}

        {/* Truck Cards */}
        <div className="space-y-4">
          {sortedTrucks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Truck size={64} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No trucks found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            sortedTrucks.map((truck) => (
              <div key={truck.id} className="bg-white rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Truck className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{truck.carrierName}</h3>
                          {truck.verified && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {truck.insured && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Insured
                            </span>
                          )}
                          {truck.gpsTracking && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              GPS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {truck.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {truck.totalTrips} trips
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Eye className="w-4 h-4" />
                            {truck.views} views
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{truck.vehicleType}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${truck.ratePerKm}/km</div>
                        <div className="text-sm text-slate-500">PKR {truck.ratePkr}/km</div>
                      </div>
                      <button
                        onClick={() => toggleSaveTruck(truck.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={savedTrucks.includes(truck.id) ? 'Remove from saved' : 'Save truck'}
                      >
                        {savedTrucks.includes(truck.id) ? (
                          <BookmarkCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Location</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{truck.currentLocation}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Available</span>
                      </div>
                      <div className="font-semibold text-slate-900">{truck.availableFrom}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Capacity</span>
                      </div>
                      <div className="font-semibold text-slate-900">{truck.capacity.weight.toLocaleString()} kg</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Navigation className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Routes</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{truck.preferredRoutes.length} cities</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTruck(expandedTruck === truck.id ? null : truck.id)}
                    className="w-full text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 py-2"
                  >
                    {expandedTruck === truck.id ? (
                      <><ChevronUp className="w-4 h-4" /> Hide Details</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Show Details</>
                    )}
                  </button>

                  {expandedTruck === truck.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Preferred Routes</h4>
                        <div className="flex flex-wrap gap-2">
                          {truck.preferredRoutes.map((route, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Equipment Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {truck.equipmentFeatures.map((feature, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {truck.certifications.map((cert, idx) => (
                            <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <a href={`tel:${truck.contactPhone}`} className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <Phone className="w-4 h-4" />
                              {truck.contactPhone}
                            </a>
                            <a href={`mailto:${truck.contactEmail}`} className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <Mail className="w-4 h-4" />
                              {truck.contactEmail}
                            </a>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Additional Info</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                              <span>Volume Capacity:</span>
                              <span className="font-medium">{truck.capacity.volume} m³</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Total Trips:</span>
                              <span className="font-medium">{truck.totalTrips}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Posted:</span>
                              <span className="font-medium">{truck.postedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <a 
                          href={`mailto:${truck.contactEmail}?subject=Inquiry about ${truck.vehicleType}&body=Hello ${truck.carrierName},%0D%0A%0D%0AI am interested in your ${truck.vehicleType} currently in ${truck.currentLocation}.`}
                          className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center"
                        >
                          Contact Carrier
                        </a>
                        <button 
                          onClick={() => {
                            setSelectedTruck(truck);
                            setShowQuoteModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Request Quote
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quote Request Modal */}
        {selectedTruck && (
          <QuoteRequestModal
            isOpen={showQuoteModal}
            onClose={() => {
              setShowQuoteModal(false);
              setSelectedTruck(null);
            }}
            truck={selectedTruck}
          />
        )}
      </div>
    </div>
  );
}
