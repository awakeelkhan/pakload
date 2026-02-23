import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  BarChart3, TrendingUp, Users, Package, Truck, DollarSign,
  ArrowLeft, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgLoadValue: number;
  topRoutes: { route: string; count: number }[];
  userGrowth: { month: string; users: number }[];
  loadsByStatus: { status: string; count: number }[];
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    avgLoadValue: 0,
    topRoutes: [],
    userGrowth: [],
    loadsByStatus: [],
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Use mock data
        setAnalytics({
          totalUsers: 1250,
          newUsersThisMonth: 87,
          totalLoads: 3420,
          activeLoads: 156,
          completedLoads: 3180,
          totalRevenue: 45600000,
          monthlyRevenue: 8500000,
          avgLoadValue: 125000,
          topRoutes: [
            { route: 'Kashgar → Islamabad', count: 245 },
            { route: 'Lahore → Karachi', count: 198 },
            { route: 'Islamabad → Lahore', count: 176 },
            { route: 'Karachi → Gwadar', count: 134 },
            { route: 'Peshawar → Lahore', count: 112 },
          ],
          userGrowth: [
            { month: 'Sep', users: 980 },
            { month: 'Oct', users: 1050 },
            { month: 'Nov', users: 1120 },
            { month: 'Dec', users: 1180 },
            { month: 'Jan', users: 1250 },
          ],
          loadsByStatus: [
            { status: 'Completed', count: 3180 },
            { status: 'Active', count: 156 },
            { status: 'Pending', count: 45 },
            { status: 'Cancelled', count: 39 },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(0)}K`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-600">Platform performance and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                +{analytics.newUsersThisMonth}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{analytics.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-slate-500">Total Users</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-green-600" />
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                {analytics.activeLoads}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{analytics.totalLoads.toLocaleString()}</div>
            <div className="text-sm text-slate-500">Total Loads</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-amber-600" />
              <span className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="text-sm text-slate-500">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.avgLoadValue)}</div>
            <div className="text-sm text-slate-500">Avg Load Value</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Routes */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Routes</h2>
            <div className="space-y-3">
              {analytics.topRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-slate-900">{route.route}</span>
                  </div>
                  <span className="font-medium text-slate-700">{route.count} loads</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loads by Status */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Loads by Status</h2>
            <div className="space-y-3">
              {analytics.loadsByStatus.map((item, index) => {
                const total = analytics.loadsByStatus.reduce((sum, i) => sum + i.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                const colors: Record<string, string> = {
                  'Completed': 'bg-green-500',
                  'Active': 'bg-blue-500',
                  'Pending': 'bg-amber-500',
                  'Cancelled': 'bg-red-500',
                };
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{item.status}</span>
                      <span className="text-sm font-medium text-slate-900">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[item.status] || 'bg-slate-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h2>
            <div className="flex items-end justify-between h-40 gap-2">
              {analytics.userGrowth.map((item, index) => {
                const maxUsers = Math.max(...analytics.userGrowth.map(i => i.users));
                const height = (item.users / maxUsers) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-purple-500 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-500 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Monthly Revenue</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(analytics.monthlyRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Completed Loads</p>
                  <p className="text-xl font-bold text-purple-700">{analytics.completedLoads.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
