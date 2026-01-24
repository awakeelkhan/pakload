import { Truck, TrendingUp, DollarSign, Clock, MapPin, Star, CheckCircle, Calendar, BarChart3, ArrowUpRight, Bell, AlertTriangle, Package, Fuel, Wrench, Plus, RefreshCw, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

interface CarrierDashboardProps {
  user: any;
}

export default function CarrierDashboard({ user }: CarrierDashboardProps) {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedTrips: 0,
    totalEarned: 0,
    avgRating: 4.9,
    availableTrucks: 0,
    inTransit: 0,
    avgUtilization: 87,
    profitMargin: 18.5,
  });
  const [availableLoads, setAvailableLoads] = useState<any[]>([]);
  const [fleetStatus, setFleetStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      
      // Fetch available loads
      const loadsRes = await fetch('/api/loads?status=available');
      const loadsData = await loadsRes.json();
      // Handle paginated response
      const loadsArray = loadsData.loads || loadsData || [];
      
      // Fetch vehicles
      const vehiclesRes = await fetch('/api/trucks');
      const vehiclesData = await vehiclesRes.json();
      // Handle paginated response
      const vehiclesArray = vehiclesData.trucks || vehiclesData || [];
      const safeLoadsArray = Array.isArray(loadsArray) ? loadsArray : [];
      const safeVehiclesArray = Array.isArray(vehiclesArray) ? vehiclesArray : [];
      setStats({
        activeBookings: statsData.activeBookings || 0,
        completedTrips: statsData.completedBookings || 0,
        totalEarned: statsData.totalRevenue || 0,
        avgRating: 4.9,
        availableTrucks: safeVehiclesArray.filter((v: any) => v.status === 'active' || v.status === 'available').length,
        inTransit: statsData.activeBookings || 0,
        avgUtilization: 87,
        profitMargin: 18.5,
      });
      
      // Transform loads for display
      const transformedLoads = safeLoadsArray.slice(0, 5).map((load: any) => ({
        id: load.id,
        route: `${load.origin} → ${load.destination}`,
        cargo: load.cargoType,
        weight: `${load.weight?.toLocaleString() || 0} kg`,
        rate: `$${load.price || 0}`,
        distance: '1,200 km',
        pickup: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'TBD',
      }));
      setAvailableLoads(transformedLoads);
      
      // Transform vehicles for display
      const transformedVehicles = safeVehiclesArray.slice(0, 5).map((v: any) => ({
        id: v.id,
        truck: v.registrationNumber,
        type: v.type,
        status: v.status,
        location: v.currentLocation,
        nextMaintenance: '1,000 km',
      }));
      setFleetStatus(transformedVehicles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTrips = [
    { id: 1, load: 'Kashgar → Islamabad', cargo: 'Electronics', truck: 'LHR-1234', progress: 65, eta: '2 hours', amount: 4200, shipper: 'Khan Logistics' },
    { id: 2, load: 'Urumqi → Lahore', cargo: 'Textiles', truck: 'ISB-5678', progress: 40, eta: '1 day', amount: 5200, shipper: 'Ahmad Trading' },
  ];

  const earnings = [
    { month: 'Nov', earned: 185000, expenses: 145000, profit: 40000 },
    { month: 'Dec', earned: 198000, expenses: 152000, profit: 46000 },
    { month: 'Jan', earned: 184000, expenses: 148000, profit: 36000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header with Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.firstName || 'Carrier'}! 👋
            </h1>
            <p className="text-slate-600 mt-1">Manage your fleet and maximize your earnings</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button onClick={() => navigate('/loads')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium">
              <Search className="w-5 h-5" />
              Find Loads
            </button>
            <button onClick={() => navigate('/vehicles')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
            <button onClick={fetchDashboardData} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeBookings}</h3>
            <p className="text-sm text-slate-600 mt-1">Active Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.completedTrips}</h3>
            <p className="text-sm text-slate-600 mt-1">Completed Trips</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                15%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">${stats.totalEarned.toLocaleString()}</h3>
            <p className="text-sm text-slate-600 mt-1">Total Earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600">{stats.profitMargin}%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.avgUtilization}%</h3>
            <p className="text-sm text-slate-600 mt-1">Fleet Utilization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/loads')} className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Find Loads</span>
                </button>
                <button onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">My Bookings</span>
                </button>
                <button onClick={() => navigate('/vehicles')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">My Fleet</span>
                </button>
                <button onClick={() => navigate('/track')} className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-amber-600 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Track</span>
                </button>
              </div>
            </div>

            {/* Active Trips */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Active Trips</h2>
                <button onClick={() => navigate('/bookings')} className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {activeTrips.map((trip) => (
                  <div key={trip.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">{trip.load}</h3>
                        <p className="text-sm text-slate-600 mt-1">{trip.cargo} • Truck {trip.truck}</p>
                        <p className="text-xs text-slate-500 mt-1">Shipper: {trip.shipper}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${trip.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-600 mt-1">ETA: {trip.eta}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-semibold text-slate-900">{trip.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${trip.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Loads */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Available Loads</h2>
                <button onClick={() => navigate('/loads')} className="text-sm text-green-600 hover:text-green-700 font-medium">Browse All</button>
              </div>
              <div className="space-y-3">
                {availableLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-slate-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-slate-900">{load.route}</h3>
                        <p className="text-sm text-slate-600 mt-1">{load.cargo} • {load.weight}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{load.rate}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{load.distance}</span>
                      <span>•</span>
                      <span>Pickup: {load.pickup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Earnings Overview</h2>
              <div className="space-y-4">
                {earnings.map((month, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{month.month}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-green-600">${month.earned.toLocaleString()}</span>
                        <span className="text-xs text-slate-600 ml-2">Profit: ${month.profit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(month.profit / month.earned) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fleet Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Fleet Status</h2>
              <div className="space-y-3">
                {fleetStatus.map((vehicle) => (
                  <div key={vehicle.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-900">{vehicle.truck}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (vehicle.status || 'available') === 'available' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {(vehicle.status || 'available') === 'available' ? 'Available' : 'In Transit'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{vehicle.type}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>{vehicle.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <Wrench className="w-3 h-3" />
                      <span>Maintenance in {vehicle.nextMaintenance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Alerts</h2>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">3 New</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">New load available</p>
                    <p className="text-xs text-slate-600 mt-1">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">Payment received</p>
                    <p className="text-xs text-slate-600 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">Maintenance due</p>
                    <p className="text-xs text-slate-600 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">This Month</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Trips Completed</span>
                    <span className="text-sm font-semibold text-slate-900">24</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">On-Time Rate</span>
                    <span className="text-sm font-semibold text-slate-900">98%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Customer Rating</span>
                    <span className="text-sm font-semibold text-slate-900">4.9/5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
