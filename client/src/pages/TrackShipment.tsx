import { useState } from 'react';
import { Package, CheckCircle2, Circle, MapPin, Clock, User, Phone, Mail, Truck, Navigation, AlertCircle, Bell, Download, Share2, RefreshCw, Calendar, TrendingUp, Info, ChevronRight } from 'lucide-react';

interface LocationUpdate {
  location: string;
  timestamp: string;
  status: string;
  notes?: string;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  location: string;
  date: string;
  estimatedDate?: string;
}

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('LP-2024-08844');
  const [searchInput, setSearchInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const shipmentData = {
    trackingNumber: 'LP-2024-08844',
    status: 'In Transit',
    progress: 60,
    origin: 'Kashgar, China',
    destination: 'Islamabad, Pakistan',
    cargoType: 'Electronics',
    weight: '12,500 kg',
    estimatedArrival: 'Dec 15, 2024',
    actualPickup: 'Dec 8, 2024 08:30',
    currentLocation: 'Gilgit-Baltistan, Pakistan',
    lastUpdate: '2 hours ago',
    distance: {
      total: 1250,
      completed: 750,
      remaining: 500,
    },
    driver: {
      name: 'Muhammad Ali',
      phone: '+92 300 1234567',
      email: 'ali.driver@pakload.com',
      vehicleNumber: 'ISB-1234',
      vehicleType: 'Heavy Truck',
    },
  };

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Load Pickup',
      completed: true,
      location: 'Kashgar Freight Terminal, China',
      date: 'Dec 8, 2024 08:30',
    },
    {
      id: '2',
      title: 'Border Crossing',
      completed: true,
      location: 'Khunjerab Pass',
      date: 'Dec 10, 2024 14:20',
    },
    {
      id: '3',
      title: 'Customs Clearance',
      completed: true,
      location: 'Sost Customs, Pakistan',
      date: 'Dec 10, 2024 17:40',
    },
    {
      id: '4',
      title: 'In Transit',
      completed: true,
      location: 'Gilgit-Baltistan, Pakistan',
      date: 'Dec 12, 2024 10:15',
    },
    {
      id: '5',
      title: 'Final Delivery',
      completed: false,
      location: 'Islamabad, Pakistan',
      date: '',
      estimatedDate: 'Dec 15, 2024 16:00',
    },
  ];

  const locationHistory: LocationUpdate[] = [
    {
      location: 'Gilgit-Baltistan, Pakistan',
      timestamp: 'Dec 12, 2024 10:15',
      status: 'In Transit',
      notes: 'Shipment on schedule',
    },
    {
      location: 'Sost Customs, Pakistan',
      timestamp: 'Dec 10, 2024 17:40',
      status: 'Customs Cleared',
      notes: 'All documentation approved',
    },
    {
      location: 'Khunjerab Pass',
      timestamp: 'Dec 10, 2024 14:20',
      status: 'Border Crossed',
      notes: 'Border formalities completed',
    },
    {
      location: 'Kashgar Freight Terminal, China',
      timestamp: 'Dec 8, 2024 08:30',
      status: 'Picked Up',
      notes: 'Cargo loaded and secured',
    },
  ];

  const handleSearch = () => {
    if (searchInput) {
      setTrackingNumber(searchInput);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Shipment</h1>
          <p className="text-slate-600">Real-time tracking with live updates and notifications</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tracking Number</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter tracking number (e.g., LP-2024-08844)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Track
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tracking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Tracking Number</div>
                    <div className="text-2xl font-bold text-slate-900">{shipmentData.trackingNumber}</div>
                    <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Download Report">
                    <Download className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Share">
                    <Share2 className="w-5 h-5 text-slate-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors" 
                    title="Auto Refresh"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'text-green-600' : 'text-slate-600'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Origin</span>
                  </div>
                  <div className="font-semibold text-slate-900">{shipmentData.origin}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Destination</span>
                  </div>
                  <div className="font-semibold text-slate-900">{shipmentData.destination}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Cargo</span>
                  </div>
                  <div className="font-semibold text-slate-900">{shipmentData.cargoType}</div>
                  <div className="text-xs text-slate-500">{shipmentData.weight}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">ETA</span>
                  </div>
                  <div className="font-semibold text-green-600">{shipmentData.estimatedArrival}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Delivery Progress</span>
                  <span className="text-sm text-green-600 font-semibold">{shipmentData.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${shipmentData.progress}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                  <span>{shipmentData.distance.completed} km completed</span>
                  <span>{shipmentData.distance.remaining} km remaining</span>
                </div>
              </div>

              {/* Current Location */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm text-blue-900 font-medium">Current Location</div>
                    <div className="text-lg font-bold text-slate-900">{shipmentData.currentLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-600">Last Updated</div>
                    <div className="text-sm font-medium text-slate-900">{shipmentData.lastUpdate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Shipment Timeline</h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.completed ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className={`w-0.5 h-20 ${milestone.completed ? 'bg-green-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="font-semibold text-slate-900">{milestone.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{milestone.location}</div>
                      {milestone.date ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">{milestone.date}</span>
                        </div>
                      ) : milestone.estimatedDate ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500">Est: {milestone.estimatedDate}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Location History</h3>
              <div className="space-y-4">
                {locationHistory.map((update, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{update.location}</span>
                        <span className="text-xs text-slate-500">{update.timestamp}</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium mb-1">{update.status}</div>
                      {update.notes && (
                        <div className="text-sm text-slate-600">{update.notes}</div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Driver Information</h3>
                  <p className="text-sm text-slate-600">Contact details</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Driver Name</div>
                  <div className="font-semibold text-slate-900">{shipmentData.driver.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Phone Number</div>
                  <a href={`tel:${shipmentData.driver.phone}`} className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                    <Phone className="w-4 h-4" />
                    {shipmentData.driver.phone}
                  </a>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <a href={`mailto:${shipmentData.driver.email}`} className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm">
                    <Mail className="w-4 h-4" />
                    {shipmentData.driver.email}
                  </a>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Vehicle Details</div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-900">{shipmentData.driver.vehicleType}</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{shipmentData.driver.vehicleNumber}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Distance</span>
                  <span className="font-bold text-slate-900">{shipmentData.distance.total} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-bold text-green-600">{shipmentData.distance.completed} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Remaining</span>
                  <span className="font-bold text-blue-600">{shipmentData.distance.remaining} km</span>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">On-Time Performance</span>
                    <span className="flex items-center gap-1 font-bold text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      98%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className={`w-5 h-5 ${showNotifications ? 'text-green-600' : 'text-slate-400'}`} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Location Updated</div>
                    <div className="text-xs text-blue-700 mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-green-900">Customs Cleared</div>
                    <div className="text-xs text-green-700 mt-1">2 days ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">Weather Advisory</div>
                    <div className="text-xs text-amber-700 mt-1">Check route conditions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-bold text-slate-900 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-700 mb-4">Contact our support team for assistance</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
