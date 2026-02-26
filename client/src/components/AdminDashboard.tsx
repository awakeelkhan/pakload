import { Users, Package, Truck, DollarSign, TrendingUp, Activity, AlertTriangle, CheckCircle, Clock, BarChart3, Settings, Shield, FileText, Bell, X, Edit2, Trash2, Ban, CheckSquare, Plus, RefreshCw, MapPin, Database, ShoppingBag, Eye, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [marketRequests, setMarketRequests] = useState<any[]>([]);
  const [pendingLoads, setPendingLoads] = useState<any[]>([]);
  const [pendingBids, setPendingBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userActionConfirm, setUserActionConfirm] = useState<{ show: boolean; userId: number | null; action: string; title: string; message: string }>({
    show: false,
    userId: null,
    action: '',
    title: '',
    message: '',
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeShippers: 0,
    activeCarriers: 0,
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    platformFee: 0,
    avgLoadValue: 0,
    systemUptime: 99.8,
    activeBookings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      
      // Fetch carriers (users)
      const carriersRes = await fetch('/api/carriers');
      const carriersData = await carriersRes.json();
      
      setStats({
        totalUsers: statsData.totalUsers || carriersData.length,
        activeShippers: statsData.shippers || 0,
        activeCarriers: statsData.carriers || carriersData.length,
        totalLoads: statsData.totalLoads || 0,
        activeLoads: statsData.activeLoads || 0,
        completedLoads: statsData.completedLoads || 0,
        totalRevenue: statsData.totalRevenue || 0,
        monthlyRevenue: statsData.monthlyRevenue || 0,
        platformFee: statsData.platformFee || 0,
        avgLoadValue: statsData.avgLoadValue || 0,
        systemUptime: 99.8,
        activeBookings: statsData.activeBookings || 0,
      });
      
      // Transform users for display
      const transformedUsers = carriersData.slice(0, 10).map((u: any) => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
        email: u.email,
        role: u.role,
        status: u.status,
        joined: new Date(u.createdAt).toLocaleDateString(),
        verified: u.verified,
      }));
      setUsers(transformedUsers);

      // Fetch market requests (goods requests)
      try {
        const token = localStorage.getItem('access_token');
        const requestsRes = await fetch('/api/market-requests/admin/all', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setMarketRequests(requestsData.requests || []);
        }
      } catch (reqError) {
        console.error('Error fetching market requests:', reqError);
      }

      // Fetch pending loads for approval
      try {
        const token = localStorage.getItem('access_token');
        const loadsRes = await fetch('/api/loads?status=pending', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (loadsRes.ok) {
          const loadsData = await loadsRes.json();
          setPendingLoads(loadsData.loads || loadsData || []);
        }
      } catch (loadError) {
        console.error('Error fetching pending loads:', loadError);
      }

      // Fetch pending bids for approval
      try {
        const token = localStorage.getItem('access_token');
        const bidsRes = await fetch('/api/quotes?status=pending', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          setPendingBids(bidsData.quotes || bidsData || []);
        }
      } catch (bidError) {
        console.error('Error fetching pending bids:', bidError);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [config, setConfig] = useState({
    platformFeePercentage: 5,
    minLoadValue: 100,
    maxLoadValue: 100000,
    autoApproveCarriers: false,
    autoApproveShippers: false,
    maintenanceMode: false,
  });

  const handleUserAction = (userId: number, action: string) => {
    if (action === 'edit') {
      const userToEdit = users.find(u => u.id === userId);
      setSelectedUser(userToEdit);
      setShowUserModal(true);
    } else if (action === 'suspend') {
      setUserActionConfirm({
        show: true,
        userId,
        action: 'suspend',
        title: 'Suspend User',
        message: 'Are you sure you want to suspend this user?',
      });
    } else if (action === 'delete') {
      setUserActionConfirm({
        show: true,
        userId,
        action: 'delete',
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
      });
    } else if (action === 'verify') {
      setUsers(users.map(u => u.id === userId ? { ...u, verified: true, status: 'active' } : u));
    }
  };

  const confirmUserAction = () => {
    if (!userActionConfirm.userId) return;
    
    if (userActionConfirm.action === 'suspend') {
      setUsers(users.map(u => u.id === userActionConfirm.userId ? { ...u, status: 'suspended' } : u));
    } else if (userActionConfirm.action === 'delete') {
      setUsers(users.filter(u => u.id !== userActionConfirm.userId));
    }
    
    setUserActionConfirm({ show: false, userId: null, action: '', title: '', message: '' });
  };

  const handleConfigSave = () => {
    alert('Configuration saved successfully!');
    setShowConfigModal(false);
  };

  const handleLoadApproval = async (loadId: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = action === 'approve' ? 'active' : 'rejected';
      const response = await fetch(`/api/loads/${loadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setPendingLoads(pendingLoads.filter(l => l.id !== loadId));
        alert(`Load ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update load status');
      }
    } catch (error) {
      console.error('Error updating load:', error);
      alert('Failed to update load status');
    }
  };

  const handleBidApproval = async (bidId: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';
      const response = await fetch(`/api/quotes/${bidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setPendingBids(pendingBids.filter(b => b.id !== bidId));
        alert(`Bid ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Bid approval error:', response.status, errorData);
        alert(errorData.error || 'Failed to update bid status');
      }
    } catch (error) {
      console.error('Error updating bid:', error);
      alert('Failed to update bid status');
    }
  };

  const recentActivity = [
    { id: 1, type: 'load_posted', user: 'Khan Logistics', description: 'Posted new load: Kashgar → Islamabad', time: '5 min ago', status: 'success' },
    { id: 2, type: 'booking_confirmed', user: 'CPEC Express', description: 'Booking confirmed for $4,200', time: '15 min ago', status: 'success' },
    { id: 3, type: 'payment_received', user: 'Ahmad Trading', description: 'Payment received: $5,200', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'user_reported', user: 'System Alert', description: 'User reported suspicious activity', time: '2 hours ago', status: 'warning' },
  ];

  const systemAlerts = [
    { id: 1, type: 'critical', message: 'High server load detected', time: '10 min ago' },
    { id: 2, type: 'warning', message: '3 pending KYC verifications', time: '1 hour ago' },
    { id: 3, type: 'info', message: 'Scheduled maintenance in 2 days', time: '3 hours ago' },
  ];

  const topRoutes = [
    { route: 'Kashgar → Islamabad', loads: 145, revenue: '$652,000', growth: '+12%' },
    { route: 'Urumqi → Lahore', loads: 123, revenue: '$589,000', growth: '+8%' },
    { route: 'Kashgar → Karachi', loads: 98, revenue: '$478,000', growth: '+15%' },
  ];

  const revenueData = [
    { month: 'Oct', revenue: 145000, fees: 28000 },
    { month: 'Nov', revenue: 168000, fees: 32000 },
    { month: 'Dec', revenue: 156780, fees: 24560 },
  ];

  const [, navigate] = useLocation();

  const adminMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, badge: null, path: '/dashboard' },
    { id: 'load-approvals', label: 'Load Approvals', icon: Package, badge: pendingLoads.length, path: '/admin/load-approvals' },
    { id: 'bid-approvals', label: 'Bid Approvals', icon: DollarSign, badge: pendingBids.length, path: '/admin/bid-approvals' },
    { id: 'market-requests', label: 'Market Requests', icon: ShoppingBag, badge: marketRequests.length, path: '/admin/market-requests' },
    { id: 'contact-requests', label: 'Contact Requests', icon: MessageSquare, badge: null, path: '/admin/contact-requests' },
    { id: 'users', label: 'User Management', icon: Users, badge: null, path: '/admin/settings/users' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-slate-600 text-sm">LoadsPak Management Console</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Link href="/">
                <a className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  Back to Site
                </a>
              </Link>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
            <div className="flex flex-wrap gap-2">
              {adminMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    item.id === 'overview' 
                      ? 'bg-green-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-sm text-slate-600 mt-1">Total Users</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span>{stats.activeShippers} Shippers</span>
              <span>•</span>
              <span>{stats.activeCarriers} Carriers</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalLoads.toLocaleString()}</h3>
            <p className="text-sm text-slate-600 mt-1">Total Loads</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span>{stats.activeLoads} Active</span>
              <span>•</span>
              <span>{stats.completedLoads} Completed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-green-600">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Rs {stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-slate-600 mt-1">Total Revenue</p>
            <div className="mt-3 text-xs text-slate-600">
              Platform Fee: Rs {stats.platformFee.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600">{stats.systemUptime}%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeBookings}</h3>
            <p className="text-sm text-slate-600 mt-1">Active Bookings</p>
            <div className="mt-3 text-xs text-slate-600">
              System Uptime: {stats.systemUptime}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setShowUserModal(true)} className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Manage Users</span>
                </button>
                <Link href="/admin/kyc-review">
                  <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors w-full">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">KYC Review</span>
                  </button>
                </Link>
                <Link href="/admin/analytics">
                  <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors w-full">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Analytics</span>
                  </button>
                </Link>
                <button onClick={() => setShowConfigModal(true)} className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                  <div className="p-3 bg-amber-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Configuration</span>
                </button>
              </div>
            </div>

            {/* Pending Load Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Pending Load Approvals
                </h2>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  {pendingLoads.length} pending
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Review and approve loads before they become visible to carriers
              </p>
              <div className="space-y-3">
                {pendingLoads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p>No pending loads to approve</p>
                  </div>
                ) : (
                  pendingLoads.slice(0, 5).map((load: any) => (
                    <div key={load.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900">{load.origin} → {load.destination}</h3>
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {load.cargoType} • {load.weight} kg • PKR {parseInt(load.price || 0).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Pickup: {new Date(load.pickupDate).toLocaleDateString()}</span>
                            <span>Posted: {new Date(load.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button 
                            onClick={() => handleLoadApproval(load.id, 'approve')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleLoadApproval(load.id, 'reject')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Bid Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Pending Bid Approvals
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {pendingBids.length} pending
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Review and approve bids before they are sent to shippers
              </p>
              <div className="space-y-3">
                {pendingBids.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p>No pending bids to approve</p>
                  </div>
                ) : (
                  pendingBids.slice(0, 5).map((bid: any) => (
                    <div key={bid.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900">Bid: PKR {parseInt(bid.quotedPrice || 0).toLocaleString()}</h3>
                            <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Load #{bid.loadId} • {bid.estimatedDays} days delivery
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Carrier ID: {bid.carrierId}</span>
                            <span>Submitted: {new Date(bid.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button 
                            onClick={() => handleBidApproval(bid.id, 'approve')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleBidApproval(bid.id, 'reject')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {users.slice(0, 3).map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{userItem.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{userItem.name}</h3>
                          {userItem.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-slate-600">{userItem.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.role === 'shipper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {userItem.role}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{userItem.joined}</p>
                      </div>
                      <div className="flex gap-1">
                        {!userItem.verified && (
                          <button onClick={() => handleUserAction(userItem.id, 'verify')} className="p-1.5 hover:bg-green-100 rounded transition-colors" title="Verify">
                            <CheckSquare className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button onClick={() => handleUserAction(userItem.id, 'edit')} className="p-1.5 hover:bg-blue-100 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => handleUserAction(userItem.id, 'suspend')} className="p-1.5 hover:bg-amber-100 rounded transition-colors" title="Suspend">
                          <Ban className="w-4 h-4 text-amber-600" />
                        </button>
                        <button onClick={() => handleUserAction(userItem.id, 'delete')} className="p-1.5 hover:bg-red-100 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {activity.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       activity.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                       <Activity className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                      <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Routes */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Routes</h2>
              <div className="space-y-4">
                {topRoutes.map((route, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">{route.route}</h3>
                      <p className="text-sm text-slate-600 mt-1">{route.loads} loads</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{route.revenue}</p>
                      <p className="text-sm text-green-600 mt-1">{route.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Requests - Goods Needed */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Market Requests
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {marketRequests.length} requests
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Users requesting goods/services - "I need goods, can you find and deliver?"
              </p>
              <div className="space-y-3">
                {marketRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No market requests yet</p>
                  </div>
                ) : (
                  marketRequests.slice(0, 5).map((req: any) => (
                    <div key={req.request?.id || req.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900">{req.request?.title || req.title || 'Untitled Request'}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              (req.request?.fulfillmentStatus || req.fulfillmentStatus) === 'pending' ? 'bg-amber-100 text-amber-700' :
                              (req.request?.fulfillmentStatus || req.fulfillmentStatus) === 'searching' ? 'bg-blue-100 text-blue-700' :
                              (req.request?.fulfillmentStatus || req.fulfillmentStatus) === 'fulfilled' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {req.request?.fulfillmentStatus || req.fulfillmentStatus || 'pending'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{req.request?.description || req.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {req.request?.goodsType || req.goodsType || 'General'}
                            </span>
                            {(req.request?.originCity || req.originCity) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {req.request?.originCity || req.originCity}
                                {(req.request?.destinationCity || req.destinationCity) && ` → ${req.request?.destinationCity || req.destinationCity}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(req.request?.createdAt || req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {req.shipper && (
                            <div className="mt-2 text-xs text-slate-500">
                              From: {req.shipper.firstName} {req.shipper.lastName} ({req.shipper.email})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button className="p-1.5 hover:bg-blue-100 rounded transition-colors" title="View Details">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-1.5 hover:bg-green-100 rounded transition-colors" title="Respond">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {marketRequests.length > 5 && (
                <Link href="/market-requests">
                  <a className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All {marketRequests.length} Requests →
                  </a>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">System Alerts</h2>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {systemAlerts.length}
                </span>
              </div>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg ${
                    alert.type === 'critical' ? 'bg-red-50 border border-red-200' :
                    alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" /> :
                       alert.type === 'warning' ? <Bell className="w-4 h-4 text-amber-600 mt-0.5" /> :
                       <Activity className="w-4 h-4 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{alert.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Overview</h2>
              <div className="space-y-4">
                {revenueData.map((month, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{month.month}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">Rs {month.revenue.toLocaleString()}</span>
                        <span className="text-xs text-green-600 ml-2">Rs {month.fees.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(month.fees / month.revenue) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">System Uptime</span>
                    <span className="text-sm font-semibold text-slate-900">{stats.systemUptime}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.systemUptime}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">API Response Time</span>
                    <span className="text-sm font-semibold text-slate-900">45ms</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">User Satisfaction</span>
                    <span className="text-sm font-semibold text-slate-900">4.8/5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                  <button onClick={() => { setShowUserModal(false); setSelectedUser(null); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{userItem.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">{userItem.name}</h3>
                            {userItem.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {userItem.status === 'suspended' && <Ban className="w-4 h-4 text-red-600" />}
                          </div>
                          <p className="text-sm text-slate-600">{userItem.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              userItem.role === 'shipper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {userItem.role}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              userItem.status === 'active' ? 'bg-green-100 text-green-700' :
                              userItem.status === 'suspended' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {userItem.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!userItem.verified && (
                          <button onClick={() => handleUserAction(userItem.id, 'verify')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                            Verify
                          </button>
                        )}
                        {userItem.status !== 'suspended' && (
                          <button onClick={() => handleUserAction(userItem.id, 'suspend')} className="px-3 py-1.5 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm">
                            Suspend
                          </button>
                        )}
                        <button onClick={() => handleUserAction(userItem.id, 'delete')} className="px-3 py-1.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Platform Configuration</h2>
                  <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform Fee Percentage</label>
                    <input
                      type="number"
                      value={config.platformFeePercentage}
                      onChange={(e) => setConfig({ ...config, platformFeePercentage: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Percentage of each transaction charged as platform fee</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Min Load Value ($)</label>
                      <input
                        type="number"
                        value={config.minLoadValue}
                        onChange={(e) => setConfig({ ...config, minLoadValue: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Max Load Value ($)</label>
                      <input
                        type="number"
                        value={config.maxLoadValue}
                        onChange={(e) => setConfig({ ...config, maxLoadValue: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoApproveCarriers}
                        onChange={(e) => setConfig({ ...config, autoApproveCarriers: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">Auto-approve Carriers</span>
                        <p className="text-xs text-slate-600">Automatically verify carrier accounts upon registration</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoApproveShippers}
                        onChange={(e) => setConfig({ ...config, autoApproveShippers: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">Auto-approve Shippers</span>
                        <p className="text-xs text-slate-600">Automatically verify shipper accounts upon registration</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.maintenanceMode}
                        onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">Maintenance Mode</span>
                        <p className="text-xs text-slate-600">Put platform in maintenance mode (users cannot access)</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowConfigModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfigSave}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Action Confirmation Modal */}
        <ConfirmModal
          isOpen={userActionConfirm.show}
          onClose={() => setUserActionConfirm({ show: false, userId: null, action: '', title: '', message: '' })}
          onConfirm={confirmUserAction}
          title={userActionConfirm.title}
          message={userActionConfirm.message}
          confirmText={userActionConfirm.action === 'delete' ? 'Delete' : 'Suspend'}
          variant={userActionConfirm.action === 'delete' ? 'danger' : 'warning'}
        />
      </div>
    </div>
  );
}
