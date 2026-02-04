import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Search, Filter, Package, MapPin, Calendar, Truck, X, DollarSign, TrendingUp, Star, Bookmark, BookmarkCheck, Eye, MessageSquare, ChevronDown, ChevronUp, AlertCircle, Clock, Navigation, Phone, Mail, Building, Award, Shield, ArrowUpDown, Plus, RefreshCw, Image, FileText, File, Edit, Trash2, MoreVertical } from 'lucide-react';
import BidModal from '../components/BidModal';
import { useAuth } from '../contexts/AuthContext';

interface Load {
  id: number;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  volume?: string;
  price?: string;
  currency?: string;
  pickupDate: string;
  deliveryDate: string;
  urgent: boolean;
  status: string;
  description?: string;
  specialRequirements?: string;
  createdAt: string;
}

export default function FindLoads() {
  const { user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rate' | 'distance'>('date');
  const [savedLoads, setSavedLoads] = useState<number[]>([]);
  const [expandedLoad, setExpandedLoad] = useState<number | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLoad, setEditingLoad] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  
  const [filters, setFilters] = useState({
    originCity: '',
    destinationCity: '',
    cargoType: '',
    minWeight: '',
    maxWeight: '',
    vehicleType: '',
    minRate: '',
    maxRate: '',
    pickupDateFrom: '',
    pickupDateTo: '',
    urgentOnly: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.originCity) params.append('origin', filters.originCity);
      if (filters.destinationCity) params.append('destination', filters.destinationCity);
      if (filters.cargoType) params.append('cargoType', filters.cargoType);
      if (filters.urgentOnly) params.append('urgent', 'true');
      
      const response = await fetch(`/api/loads?${params}`);
      const data = await response.json();
      // Handle paginated response
      const loadsArray = data.loads || data || [];
      setLoads(Array.isArray(loadsArray) ? loadsArray : []);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchLoads();
  };

  const handleEditLoad = (load: any) => {
    setEditingLoad(load);
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleDeleteLoad = async (loadId: number) => {
    if (!confirm('Are you sure you want to delete this load?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/loads/${loadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchLoads();
      }
    } catch (error) {
      console.error('Error deleting load:', error);
    }
    setMenuOpenId(null);
  };

  // Convert database loads to display format
  const allLoads = loads.map(load => ({
    id: load.id,
    origin: load.origin || 'Unknown',
    destination: load.destination || 'Unknown',
    cargo: load.cargoType || 'General',
    weight: load.weight || 0,
    volume: parseInt(load.volume || '0') || 0,
    vehicle: '40ft Container',
    rateUsd: parseFloat(load.price || '0') || 0,
    ratePkr: (parseFloat(load.price || '0') || 0) * 278,
    ratePerKm: 3.5,
    distance: 1200,
    pickupDate: load.pickupDate?.split('T')[0] || 'TBD',
    deliveryDate: load.deliveryDate?.split('T')[0] || 'TBD',
    urgent: load.urgent || false,
    postedBy: 'Shipper',
    postedDate: load.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    contactPhone: '+92 300 1234567',
    contactEmail: 'contact@pakload.com',
    rating: 4.5,
    verified: true,
    insurance: true,
    description: load.description || '',
    specialRequirements: load.specialRequirements?.split(',').filter(Boolean) || [],
    loadingType: 'FTL' as const,
    views: Math.floor(Math.random() * 100) + 20,
  }));

  // Mock data fallback if no loads from database
  const mockLoads = [
    {
      id: 1,
      origin: 'Kashgar, China',
      destination: 'Islamabad, Pakistan',
      cargo: 'Electronics',
      weight: 16000,
      volume: 45,
      vehicle: '40ft Container',
      rateUsd: 4500,
      ratePkr: 1251000,
      ratePerKm: 3.6,
      distance: 1250,
      pickupDate: '2024-01-25',
      deliveryDate: '2024-02-02',
      urgent: true,
      postedBy: 'TechCorp Ltd',
      postedDate: '2024-01-20',
      contactPhone: '+86 998 123 4567',
      contactEmail: 'logistics@techcorp.cn',
      rating: 4.8,
      verified: true,
      insurance: true,
      description: 'High-value electronics requiring careful handling',
      specialRequirements: ['Temperature Controlled', 'GPS Tracking', 'Insurance Required'],
      loadingType: 'FTL',
      views: 145,
    },
    {
      id: 2,
      origin: 'Urumqi, China',
      destination: 'Lahore, Pakistan',
      cargo: 'Textiles',
      weight: 23000,
      volume: 60,
      vehicle: '40ft Container',
      rateUsd: 5200,
      ratePkr: 1446000,
      ratePerKm: 2.9,
      distance: 1800,
      pickupDate: '2024-01-28',
      deliveryDate: '2024-02-05',
      urgent: false,
      postedBy: 'Silk Road Traders',
      postedDate: '2024-01-21',
      contactPhone: '+86 991 234 5678',
      contactEmail: 'export@silkroad.cn',
      rating: 4.5,
      verified: true,
      insurance: true,
      description: 'Bulk textile shipment for manufacturing',
      specialRequirements: ['Dry Storage', 'Customs Documentation'],
      loadingType: 'FTL',
      views: 89,
    },
    {
      id: 3,
      origin: 'Kashgar, China',
      destination: 'Karachi, Pakistan',
      cargo: 'Machinery',
      weight: 15000,
      volume: 38,
      vehicle: '20ft Container',
      rateUsd: 6800,
      ratePkr: 1890000,
      ratePerKm: 3.2,
      distance: 2100,
      pickupDate: '2024-02-01',
      deliveryDate: '2024-02-10',
      urgent: false,
      postedBy: 'Industrial Solutions',
      postedDate: '2024-01-22',
      contactPhone: '+86 998 345 6789',
      contactEmail: 'shipping@industrial.cn',
      rating: 4.9,
      verified: true,
      insurance: true,
      description: 'Heavy machinery parts for construction',
      specialRequirements: ['Heavy Lift', 'Secure Fastening'],
      loadingType: 'FTL',
      views: 67,
    },
    {
      id: 4,
      origin: 'Kashgar, China',
      destination: 'Peshawar, Pakistan',
      cargo: 'Food Products',
      weight: 12000,
      volume: 35,
      vehicle: 'Refrigerated 40ft',
      rateUsd: 5500,
      ratePkr: 1530000,
      ratePerKm: 4.2,
      distance: 1300,
      pickupDate: '2024-01-26',
      deliveryDate: '2024-02-01',
      urgent: true,
      postedBy: 'Fresh Foods Export',
      postedDate: '2024-01-23',
      contactPhone: '+86 998 456 7890',
      contactEmail: 'cold@freshfoods.cn',
      rating: 4.7,
      verified: true,
      insurance: true,
      description: 'Perishable food items requiring refrigeration',
      specialRequirements: ['Temperature Controlled', 'Fast Transit', 'Health Certificates'],
      loadingType: 'FTL',
      views: 123,
    },
    {
      id: 5,
      origin: 'Urumqi, China',
      destination: 'Islamabad, Pakistan',
      cargo: 'Auto Parts',
      weight: 18000,
      volume: 42,
      vehicle: '40ft Container',
      rateUsd: 4800,
      ratePkr: 1334400,
      ratePerKm: 3.1,
      distance: 1550,
      pickupDate: '2024-01-29',
      deliveryDate: '2024-02-06',
      urgent: false,
      postedBy: 'AutoParts International',
      postedDate: '2024-01-20',
      contactPhone: '+86 991 567 8901',
      contactEmail: 'logistics@autoparts.cn',
      rating: 4.6,
      verified: true,
      insurance: true,
      description: 'Automotive components for assembly plant',
      specialRequirements: ['Secure Packaging', 'Inventory List'],
      loadingType: 'FTL',
      views: 98,
    },
    {
      id: 6,
      origin: 'Kashgar, China',
      destination: 'Lahore, Pakistan',
      cargo: 'Chemicals',
      weight: 20000,
      volume: 48,
      vehicle: '40ft Container',
      rateUsd: 6200,
      ratePkr: 1724000,
      ratePerKm: 4.3,
      distance: 1450,
      pickupDate: '2024-02-02',
      deliveryDate: '2024-02-09',
      urgent: false,
      postedBy: 'ChemTrade Corp',
      postedDate: '2024-01-21',
      contactPhone: '+86 998 678 9012',
      contactEmail: 'hazmat@chemtrade.cn',
      rating: 4.8,
      verified: true,
      insurance: true,
      description: 'Industrial chemicals - Hazmat certified carrier required',
      specialRequirements: ['Hazmat Certified', 'Special Permits', 'Safety Equipment'],
      loadingType: 'FTL',
      views: 56,
    },
    {
      id: 7,
      origin: 'Urumqi, China',
      destination: 'Karachi, Pakistan',
      cargo: 'Construction Materials',
      weight: 25000,
      volume: 55,
      vehicle: 'Flatbed 40ft',
      rateUsd: 7200,
      ratePkr: 2001600,
      ratePerKm: 3.4,
      distance: 2100,
      pickupDate: '2024-02-03',
      deliveryDate: '2024-02-12',
      urgent: false,
      postedBy: 'BuildMaster Supply',
      postedDate: '2024-01-22',
      contactPhone: '+86 991 789 0123',
      contactEmail: 'shipping@buildmaster.cn',
      rating: 4.4,
      verified: true,
      insurance: true,
      description: 'Steel beams and construction materials',
      specialRequirements: ['Flatbed Required', 'Heavy Load', 'Secure Strapping'],
      loadingType: 'FTL',
      views: 78,
    },
    {
      id: 8,
      origin: 'Kashgar, China',
      destination: 'Faisalabad, Pakistan',
      cargo: 'Pharmaceuticals',
      weight: 8000,
      volume: 25,
      vehicle: 'Refrigerated 20ft',
      rateUsd: 5800,
      ratePkr: 1612000,
      ratePerKm: 4.5,
      distance: 1290,
      pickupDate: '2024-01-27',
      deliveryDate: '2024-02-03',
      urgent: true,
      postedBy: 'MediExport Ltd',
      postedDate: '2024-01-23',
      contactPhone: '+86 998 890 1234',
      contactEmail: 'cold@mediexport.cn',
      rating: 4.9,
      verified: true,
      insurance: true,
      description: 'Temperature-sensitive pharmaceutical products',
      specialRequirements: ['Temperature Controlled', 'FDA Compliance', 'Chain of Custody'],
      loadingType: 'FTL',
      views: 134,
    },
    {
      id: 9,
      origin: 'Urumqi, China',
      destination: 'Multan, Pakistan',
      cargo: 'Consumer Goods',
      weight: 14000,
      volume: 40,
      vehicle: '40ft Container',
      rateUsd: 4200,
      ratePkr: 1168800,
      ratePerKm: 2.8,
      distance: 1500,
      pickupDate: '2024-01-30',
      deliveryDate: '2024-02-07',
      urgent: false,
      postedBy: 'Global Retail Supply',
      postedDate: '2024-01-21',
      contactPhone: '+86 991 901 2345',
      contactEmail: 'logistics@globalretail.cn',
      rating: 4.5,
      verified: true,
      insurance: false,
      description: 'Mixed consumer goods for retail distribution',
      specialRequirements: ['Standard Container', 'Inventory Manifest'],
      loadingType: 'FTL',
      views: 92,
    },
    {
      id: 10,
      origin: 'Kashgar, China',
      destination: 'Rawalpindi, Pakistan',
      cargo: 'Furniture',
      weight: 11000,
      volume: 50,
      vehicle: '40ft Container',
      rateUsd: 3900,
      ratePkr: 1084200,
      ratePerKm: 3.0,
      distance: 1300,
      pickupDate: '2024-02-04',
      deliveryDate: '2024-02-11',
      urgent: false,
      postedBy: 'Furniture Exports Inc',
      postedDate: '2024-01-22',
      contactPhone: '+86 998 012 3456',
      contactEmail: 'export@furniture.cn',
      rating: 4.3,
      verified: false,
      insurance: true,
      description: 'Assembled furniture for commercial use',
      specialRequirements: ['Careful Handling', 'Padding Required'],
      loadingType: 'FTL',
      views: 45,
    },
    {
      id: 11,
      origin: 'Urumqi, China',
      destination: 'Gwadar, Pakistan',
      cargo: 'Mining Equipment',
      weight: 28000,
      volume: 65,
      vehicle: 'Lowboy Trailer',
      rateUsd: 9500,
      ratePkr: 2641000,
      ratePerKm: 3.9,
      distance: 2450,
      pickupDate: '2024-02-05',
      deliveryDate: '2024-02-15',
      urgent: false,
      postedBy: 'Heavy Equipment Ltd',
      postedDate: '2024-01-23',
      contactPhone: '+86 991 123 4567',
      contactEmail: 'heavy@equipment.cn',
      rating: 4.7,
      verified: true,
      insurance: true,
      description: 'Oversized mining equipment',
      specialRequirements: ['Specialized Trailer', 'Escort Vehicle', 'Route Planning'],
      loadingType: 'FTL',
      views: 112,
    },
    {
      id: 12,
      origin: 'Kashgar, China',
      destination: 'Quetta, Pakistan',
      cargo: 'Agricultural Products',
      weight: 19000,
      volume: 52,
      vehicle: '40ft Container',
      rateUsd: 4600,
      ratePkr: 1278400,
      ratePerKm: 3.3,
      distance: 1400,
      pickupDate: '2024-01-31',
      deliveryDate: '2024-02-08',
      urgent: false,
      postedBy: 'AgriTrade Export',
      postedDate: '2024-01-20',
      contactPhone: '+86 998 234 5678',
      contactEmail: 'export@agritrade.cn',
      rating: 4.6,
      verified: true,
      insurance: true,
      description: 'Bulk agricultural commodities',
      specialRequirements: ['Dry Storage', 'Fumigation Certificate'],
      loadingType: 'FTL',
      views: 71,
    },
    {
      id: 13,
      origin: 'Urumqi, China',
      destination: 'Sialkot, Pakistan',
      cargo: 'Sports Equipment',
      weight: 9000,
      volume: 30,
      vehicle: '20ft Container',
      rateUsd: 3200,
      ratePkr: 889600,
      ratePerKm: 2.5,
      distance: 1280,
      pickupDate: '2024-02-06',
      deliveryDate: '2024-02-13',
      urgent: false,
      postedBy: 'SportsPro International',
      postedDate: '2024-01-21',
      contactPhone: '+86 991 345 6789',
      contactEmail: 'logistics@sportspro.cn',
      rating: 4.4,
      verified: true,
      insurance: false,
      description: 'Sports goods for wholesale distribution',
      specialRequirements: ['Standard Container', 'Quality Inspection'],
      loadingType: 'LTL',
      views: 58,
    },
    {
      id: 14,
      origin: 'Kashgar, China',
      destination: 'Hyderabad, Pakistan',
      cargo: 'Paper Products',
      weight: 17000,
      volume: 55,
      vehicle: '40ft Container',
      rateUsd: 4400,
      ratePkr: 1223200,
      ratePerKm: 2.7,
      distance: 1630,
      pickupDate: '2024-02-07',
      deliveryDate: '2024-02-14',
      urgent: false,
      postedBy: 'Paper Mills Export',
      postedDate: '2024-01-22',
      contactPhone: '+86 998 456 7890',
      contactEmail: 'shipping@papermills.cn',
      rating: 4.5,
      verified: true,
      insurance: true,
      description: 'Bulk paper and cardboard products',
      specialRequirements: ['Dry Storage', 'Moisture Protection'],
      loadingType: 'FTL',
      views: 64,
    },
    {
      id: 15,
      origin: 'Urumqi, China',
      destination: 'Sukkur, Pakistan',
      cargo: 'Plastic Products',
      weight: 13000,
      volume: 42,
      vehicle: '40ft Container',
      rateUsd: 3800,
      ratePkr: 1056800,
      ratePerKm: 2.6,
      distance: 1460,
      pickupDate: '2024-02-08',
      deliveryDate: '2024-02-15',
      urgent: false,
      postedBy: 'PlasticWorks Ltd',
      postedDate: '2024-01-23',
      contactPhone: '+86 991 567 8901',
      contactEmail: 'export@plasticworks.cn',
      rating: 4.3,
      verified: false,
      insurance: false,
      description: 'Molded plastic components',
      specialRequirements: ['Standard Container'],
      loadingType: 'FTL',
      views: 42,
    },
    {
      id: 16,
      origin: 'Kashgar, China',
      destination: 'Abbottabad, Pakistan',
      cargo: 'Medical Equipment',
      weight: 7000,
      volume: 22,
      vehicle: '20ft Container',
      rateUsd: 5200,
      ratePkr: 1446000,
      ratePerKm: 4.0,
      distance: 1300,
      pickupDate: '2024-01-28',
      deliveryDate: '2024-02-04',
      urgent: true,
      postedBy: 'MedEquip Export',
      postedDate: '2024-01-23',
      contactPhone: '+86 998 678 9012',
      contactEmail: 'urgent@medequip.cn',
      rating: 4.8,
      verified: true,
      insurance: true,
      description: 'Hospital equipment - urgent delivery required',
      specialRequirements: ['Careful Handling', 'Insurance Required', 'Fast Transit'],
      loadingType: 'FTL',
      views: 156,
    },
    {
      id: 17,
      origin: 'Urumqi, China',
      destination: 'Sargodha, Pakistan',
      cargo: 'Ceramics',
      weight: 16000,
      volume: 38,
      vehicle: '40ft Container',
      rateUsd: 4100,
      ratePkr: 1139800,
      ratePerKm: 2.9,
      distance: 1420,
      pickupDate: '2024-02-09',
      deliveryDate: '2024-02-16',
      urgent: false,
      postedBy: 'Ceramic Exports Co',
      postedDate: '2024-01-21',
      contactPhone: '+86 991 789 0123',
      contactEmail: 'logistics@ceramics.cn',
      rating: 4.4,
      verified: true,
      insurance: true,
      description: 'Ceramic tiles and bathroom fixtures',
      specialRequirements: ['Fragile Handling', 'Secure Packaging'],
      loadingType: 'FTL',
      views: 53,
    },
    {
      id: 18,
      origin: 'Kashgar, China',
      destination: 'Bahawalpur, Pakistan',
      cargo: 'Leather Goods',
      weight: 10000,
      volume: 32,
      vehicle: '20ft Container',
      rateUsd: 3500,
      ratePkr: 973000,
      ratePerKm: 2.8,
      distance: 1250,
      pickupDate: '2024-02-10',
      deliveryDate: '2024-02-17',
      urgent: false,
      postedBy: 'Leather Exports Inc',
      postedDate: '2024-01-22',
      contactPhone: '+86 998 890 1234',
      contactEmail: 'export@leather.cn',
      rating: 4.6,
      verified: true,
      insurance: false,
      description: 'Finished leather products for retail',
      specialRequirements: ['Dry Storage', 'Quality Check'],
      loadingType: 'LTL',
      views: 48,
    },
    {
      id: 19,
      origin: 'Urumqi, China',
      destination: 'Mardan, Pakistan',
      cargo: 'Glass Products',
      weight: 21000,
      volume: 45,
      vehicle: '40ft Container',
      rateUsd: 5600,
      ratePkr: 1556800,
      ratePerKm: 3.7,
      distance: 1510,
      pickupDate: '2024-02-11',
      deliveryDate: '2024-02-18',
      urgent: false,
      postedBy: 'Glass Manufacturing',
      postedDate: '2024-01-23',
      contactPhone: '+86 991 901 2345',
      contactEmail: 'shipping@glass.cn',
      rating: 4.5,
      verified: true,
      insurance: true,
      description: 'Tempered glass panels - fragile',
      specialRequirements: ['Fragile', 'Special Packaging', 'Insurance Required'],
      loadingType: 'FTL',
      views: 87,
    },
    {
      id: 20,
      origin: 'Kashgar, China',
      destination: 'Gujranwala, Pakistan',
      cargo: 'Metal Products',
      weight: 24000,
      volume: 50,
      vehicle: '40ft Container',
      rateUsd: 4900,
      ratePkr: 1361400,
      ratePerKm: 3.4,
      distance: 1440,
      pickupDate: '2024-02-12',
      deliveryDate: '2024-02-19',
      urgent: false,
      postedBy: 'MetalWorks Export',
      postedDate: '2024-01-20',
      contactPhone: '+86 998 012 3456',
      contactEmail: 'logistics@metalworks.cn',
      rating: 4.7,
      verified: true,
      insurance: true,
      description: 'Steel and aluminum products',
      specialRequirements: ['Heavy Load', 'Secure Fastening'],
      loadingType: 'FTL',
      views: 95,
    },
  ];

  const filteredLoads = allLoads.filter(load => {
    if (filters.originCity && !load.origin.toLowerCase().includes(filters.originCity.toLowerCase())) return false;
    if (filters.destinationCity && !load.destination.toLowerCase().includes(filters.destinationCity.toLowerCase())) return false;
    if (filters.cargoType && !load.cargo.toLowerCase().includes(filters.cargoType.toLowerCase())) return false;
    if (filters.minWeight && load.weight < parseInt(filters.minWeight)) return false;
    if (filters.maxWeight && load.weight > parseInt(filters.maxWeight)) return false;
    if (filters.vehicleType && !load.vehicle.toLowerCase().includes(filters.vehicleType.toLowerCase())) return false;
    if (filters.minRate && load.rateUsd < parseInt(filters.minRate)) return false;
    if (filters.maxRate && load.rateUsd > parseInt(filters.maxRate)) return false;
    if (filters.pickupDateFrom && load.pickupDate < filters.pickupDateFrom) return false;
    if (filters.pickupDateTo && load.pickupDate > filters.pickupDateTo) return false;
    if (filters.urgentOnly && !load.urgent) return false;
    if (filters.verifiedOnly && !load.verified) return false;
    return true;
  });

  const sortedLoads = [...filteredLoads].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return b.rateUsd - a.rateUsd;
      case 'distance':
        return a.distance - b.distance;
      case 'date':
      default:
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const toggleSaveLoad = (loadId: number) => {
    setSavedLoads(prev =>
      prev.includes(loadId)
        ? prev.filter(id => id !== loadId)
        : [...prev, loadId]
    );
  };

  const clearFilters = () => {
    setFilters({
      originCity: '',
      destinationCity: '',
      cargoType: '',
      minWeight: '',
      maxWeight: '',
      vehicleType: '',
      minRate: '',
      maxRate: '',
      pickupDateFrom: '',
      pickupDateTo: '',
      urgentOnly: false,
      verifiedOnly: false,
    });
  };

  const urgentCount = allLoads.filter(l => l.urgent).length;
  const avgRate = (allLoads.reduce((sum, l) => sum + l.ratePerKm, 0) / allLoads.length).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Loads</h1>
          <p className="text-slate-600">Browse available loads along the CPEC corridor</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{allLoads.length}</div>
            <div className="text-sm text-slate-600">Available Loads</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-sm text-slate-600">Urgent Loads</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-green-600">${avgRate}/km</div>
            <div className="text-sm text-slate-600">Avg Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{savedLoads.length}</div>
            <div className="text-sm text-slate-600">Saved Loads</div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city, cargo type..."
                value={filters.originCity}
                onChange={(e) => setFilters({...filters, originCity: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rate' | 'distance')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="date">Sort by: Newest First</option>
              <option value="rate">Sort by: Highest Rate</option>
              <option value="distance">Sort by: Shortest Distance</option>
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
                  Origin City
                </label>
                <input
                  type="text"
                  value={filters.originCity}
                  onChange={(e) => setFilters({...filters, originCity: e.target.value})}
                  placeholder="e.g., Kashgar"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Destination City
                </label>
                <input
                  type="text"
                  value={filters.destinationCity}
                  onChange={(e) => setFilters({...filters, destinationCity: e.target.value})}
                  placeholder="e.g., Islamabad"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Cargo Type
                </label>
                <select
                  value={filters.cargoType}
                  onChange={(e) => setFilters({...filters, cargoType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Types</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="machinery">Machinery</option>
                  <option value="food">Food & Beverages</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="construction">Construction Materials</option>
                  <option value="pharmaceuticals">Pharmaceuticals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Min Weight (kg)
                </label>
                <input
                  type="number"
                  value={filters.minWeight}
                  onChange={(e) => setFilters({...filters, minWeight: e.target.value})}
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Weight (kg)
                </label>
                <input
                  type="number"
                  value={filters.maxWeight}
                  onChange={(e) => setFilters({...filters, maxWeight: e.target.value})}
                  placeholder="25000"
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
                  <option value="">All Vehicles</option>
                  <option value="20ft">20ft Container</option>
                  <option value="40ft">40ft Container</option>
                  <option value="flatbed">Flatbed Truck</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="lowboy">Lowboy Trailer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Pickup From
                </label>
                <input
                  type="date"
                  value={filters.pickupDateFrom}
                  onChange={(e) => setFilters({...filters, pickupDateFrom: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Pickup To
                </label>
                <input
                  type="date"
                  value={filters.pickupDateTo}
                  onChange={(e) => setFilters({...filters, pickupDateTo: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="urgentOnly"
                    checked={filters.urgentOnly}
                    onChange={(e) => setFilters({...filters, urgentOnly: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="urgentOnly" className="ml-2 text-sm font-medium text-slate-700">
                    Urgent Loads Only
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="verifiedOnly" className="ml-2 text-sm font-medium text-slate-700">
                    Verified Shippers Only
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Showing {sortedLoads.length} of {allLoads.length} loads
            </div>
          </div>
        )}

        {/* Load Cards */}
        <div className="space-y-4">
          {sortedLoads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Package size={64} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No loads found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            sortedLoads.map((load) => {
              // Extract city names only
              const originCity = load.origin.split(',')[0].trim();
              const destCity = load.destination.split(',')[0].trim();
              
              return (
              <div key={load.id} className="bg-white rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* City-only title */}
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {originCity} → {destCity}
                        </h3>
                        {load.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                        {load.verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      {/* Full address in smaller text */}
                      <p className="text-xs text-slate-500 mb-2">
                        {load.origin} → {load.destination}
                      </p>
                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {load.postedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {load.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {load.views}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {load.loadingType}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${load.rateUsd.toLocaleString()}</div>
                        <div className="text-sm text-slate-500">PKR {load.ratePkr.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">${load.ratePerKm}/km</div>
                      </div>
                      <button
                        onClick={() => toggleSaveLoad(load.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={savedLoads.includes(load.id) ? 'Remove from saved' : 'Save load'}
                      >
                        {savedLoads.includes(load.id) ? (
                          <BookmarkCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {/* Three-dot menu for Edit/Delete */}
                      {user?.role === 'shipper' && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === load.id ? null : load.id);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>
                          {menuOpenId === load.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setMenuOpenId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                <button
                                  onClick={() => handleEditLoad(load)}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Load
                                </button>
                                <button
                                  onClick={() => handleDeleteLoad(load.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Load
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Pickup</span>
                      </div>
                      <div className="font-semibold text-slate-900">{load.pickupDate}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Cargo</span>
                      </div>
                      <div className="font-semibold text-slate-900">{load.cargo}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Weight</span>
                      </div>
                      <div className="font-semibold text-slate-900">{load.weight.toLocaleString()} kg</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">Vehicle</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{load.vehicle}</div>
                    </div>
                  </div>

                  {load.specialRequirements && load.specialRequirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {load.specialRequirements.map((req, idx) => (
                        <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedLoad(expandedLoad === load.id ? null : load.id)}
                    className="w-full text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 py-2"
                  >
                    {expandedLoad === load.id ? (
                      <><ChevronUp className="w-4 h-4" /> Hide Details</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Show Details</>
                    )}
                  </button>

                  {expandedLoad === load.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                      {/* Product Images */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4 text-green-600" />
                          Product Images
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {/* Placeholder images - in real app these would come from load.images */}
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                            <Image className="w-8 h-8 text-slate-300" />
                          </div>
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                            <Image className="w-8 h-8 text-slate-300" />
                          </div>
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 text-xs">
                            No images
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Documents
                        </h4>
                        <div className="space-y-2">
                          {/* Placeholder documents - in real app these would come from load.documents */}
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <File className="w-5 h-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Commercial Invoice</p>
                              <p className="text-xs text-slate-500">PDF • 245 KB</p>
                            </div>
                            <button className="text-xs text-green-600 hover:text-green-700 font-medium">View</button>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <File className="w-5 h-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Packing List</p>
                              <p className="text-xs text-slate-500">PDF • 128 KB</p>
                            </div>
                            <button className="text-xs text-green-600 hover:text-green-700 font-medium">View</button>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                        <p className="text-sm text-slate-600">{load.description}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <a href={`tel:${load.contactPhone}`} className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <Phone className="w-4 h-4" />
                              {load.contactPhone}
                            </a>
                            <a href={`mailto:${load.contactEmail}`} className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <Mail className="w-4 h-4" />
                              {load.contactEmail}
                            </a>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Additional Info</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                              <span>Distance:</span>
                              <span className="font-medium">{load.distance} km</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Volume:</span>
                              <span className="font-medium">{load.volume} m³</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Insurance:</span>
                              <span className={`font-medium ${load.insurance ? 'text-green-600' : 'text-slate-400'}`}>
                                {load.insurance ? 'Included' : 'Not Included'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <a 
                          href={`mailto:${load.contactEmail}?subject=Inquiry about Load ${load.id}&body=Hello ${load.postedBy},%0D%0A%0D%0AI am interested in your load from ${load.origin} to ${load.destination}.`}
                          className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center"
                        >
                          Contact Shipper
                        </a>
                        <button 
                          onClick={() => {
                            setSelectedLoad(load);
                            setShowBidModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Place Bid
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Bid Modal */}
        {selectedLoad && (
          <BidModal
            isOpen={showBidModal}
            onClose={() => {
              setShowBidModal(false);
              setSelectedLoad(null);
            }}
            load={selectedLoad}
          />
        )}

        {/* Edit Load Modal */}
        {showEditModal && editingLoad && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Edit Load</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLoad(null);
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const token = localStorage.getItem('access_token');
                  const response = await fetch(`/api/loads/${editingLoad.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(editingLoad)
                  });
                  if (response.ok) {
                    setShowEditModal(false);
                    setEditingLoad(null);
                    fetchLoads();
                  }
                } catch (error) {
                  console.error('Error updating load:', error);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
                    <input
                      type="text"
                      value={editingLoad.origin || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, origin: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                    <input
                      type="text"
                      value={editingLoad.destination || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
                    <input
                      type="text"
                      value={editingLoad.cargo || editingLoad.cargoType || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, cargoType: e.target.value, cargo: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={editingLoad.weight || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, weight: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      value={editingLoad.rateUsd || editingLoad.price || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, price: e.target.value, rateUsd: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={editingLoad.pickupDate?.split('T')[0] || ''}
                      onChange={(e) => setEditingLoad({...editingLoad, pickupDate: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editingLoad.description || ''}
                    onChange={(e) => setEditingLoad({...editingLoad, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={editingLoad.urgent || false}
                    onChange={(e) => setEditingLoad({...editingLoad, urgent: e.target.checked})}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <label htmlFor="urgent" className="text-sm text-slate-700">Mark as Urgent</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingLoad(null);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
