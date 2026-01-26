import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Truck, 
  Users, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw,
  PieChart, Activity, Target, Clock, MapPin, Star
} from 'lucide-react';

interface Stats {
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgLoadValue: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  avgRating: number;
  totalDistance: number;
  onTimeDelivery: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [stats, setStats] = useState<Stats>({
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    avgLoadValue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    avgRating: 4.8,
    totalDistance: 0,
    onTimeDelivery: 94,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      setStats({
        totalLoads: data.totalLoads || 0,
        activeLoads: data.activeLoads || 0,
        completedLoads: data.completedLoads || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        avgLoadValue: data.avgLoadValue || 0,
        totalBookings: data.totalBookings || 0,
        pendingBookings: data.pendingBookings || 0,
        completedBookings: data.completedBookings || 0,
        avgRating: data.avgRating || 4.8,
        totalDistance: data.totalDistance || 0,
        onTimeDelivery: data.onTimeDelivery || 94,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isShipper = user.role === 'shipper';
  const isCarrier = user.role === 'carrier';
  const isAdmin = user.role === 'admin';

  // Mock chart data
  const revenueData = [
    { month: 'Aug', value: 125000 },
    { month: 'Sep', value: 148000 },
    { month: 'Oct', value: 162000 },
    { month: 'Nov', value: 185000 },
    { month: 'Dec', value: 198000 },
    { month: 'Jan', value: 175000 },
  ];

  const loadsByRoute = [
    { route: 'Karachi → Lahore', count: 45, percentage: 28 },
    { route: 'Karachi → Islamabad', count: 38, percentage: 24 },
    { route: 'Lahore → Peshawar', count: 28, percentage: 18 },
    { route: 'Faisalabad → Karachi', count: 25, percentage: 16 },
    { route: 'Other Routes', count: 22, percentage: 14 },
  ];

  const cargoTypes = [
    { type: 'Electronics', count: 32, color: 'bg-blue-500' },
    { type: 'Textiles', count: 28, color: 'bg-green-500' },
    { type: 'Machinery', count: 22, color: 'bg-amber-500' },
    { type: 'Food', count: 18, color: 'bg-red-500' },
    { type: 'Other', count: 15, color: 'bg-purple-500' },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Track your performance and insights</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              PKR {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +8.3%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLoads}</div>
            <div className="text-sm text-slate-500">Total Loads</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +2.1%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.onTimeDelivery}%</div>
            <div className="text-sm text-slate-500">On-Time Delivery</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                Stable
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.avgRating}</div>
            <div className="text-sm text-slate-500">Average Rating</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                    style={{ height: `${(item.value / maxRevenue) * 200}px` }}
                  />
                  <div className="text-xs text-slate-500 mt-2">{item.month}</div>
                  <div className="text-xs font-medium text-slate-700">
                    {(item.value / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loads by Route */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Top Routes</h2>
            <div className="space-y-4">
              {loadsByRoute.map((route, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{route.route}</span>
                    <span className="text-sm font-medium text-slate-900">{route.count} loads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${route.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cargo Types */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Cargo Types</h2>
            <div className="space-y-3">
              {cargoTypes.map((cargo, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cargo.color}`} />
                  <span className="flex-1 text-sm text-slate-700">{cargo.type}</span>
                  <span className="text-sm font-medium text-slate-900">{cargo.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-700">Active Loads</span>
                </div>
                <span className="font-semibold text-slate-900">{stats.activeLoads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-700">Pending Bookings</span>
                </div>
                <span className="font-semibold text-slate-900">{stats.pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Completed</span>
                </div>
                <span className="font-semibold text-slate-900">{stats.completedLoads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-700">Total Distance</span>
                </div>
                <span className="font-semibold text-slate-900">{stats.totalDistance.toLocaleString()} km</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Performance</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Load Completion Rate</span>
                  <span className="text-sm font-medium text-green-600">92%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Customer Satisfaction</span>
                  <span className="text-sm font-medium text-green-600">96%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Response Time</span>
                  <span className="text-sm font-medium text-amber-600">78%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Dispute Resolution</span>
                  <span className="text-sm font-medium text-green-600">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
