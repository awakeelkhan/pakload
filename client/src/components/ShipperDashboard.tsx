import { Package, TrendingUp, DollarSign, Clock, MapPin, Star, CheckCircle, Calendar, BarChart3, ArrowUpRight, Bell, AlertTriangle, Users, FileText, Truck, Plus, RefreshCw, Settings, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

interface ShipperDashboardProps {
  user: any;
}

export default function ShipperDashboard({ user }: ShipperDashboardProps) {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    activeLoads: 0,
    completedLoads: 0,
    totalSpent: 0,
    avgRating: 4.8,
    pendingBids: 0,
    inTransit: 0,
    avgDeliveryTime: 4.2,
    costSavings: 12.5,
  });
  const [recentLoads, setRecentLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoad, setEditingLoad] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    price: '',
    description: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      
      // Fetch loads
      const loadsRes = await fetch('/api/loads');
      const loadsData = await loadsRes.json();
      // Handle paginated response
      const loadsArray = loadsData.loads || loadsData || [];
      
      setStats({
        activeLoads: statsData.totalLoads || loadsArray.length,
        completedLoads: statsData.completedLoads || 0,
        totalSpent: statsData.totalRevenue || 0,
        avgRating: 4.8,
        pendingBids: statsData.pendingBookings || 0,
        inTransit: statsData.activeBookings || 0,
        avgDeliveryTime: 4.2,
        costSavings: 12.5,
      });
      
      // Transform loads for display
      const transformedLoads = (Array.isArray(loadsArray) ? loadsArray : []).slice(0, 5).map((load: any) => ({
        id: load.id,
        load: `${load.origin} → ${load.destination}`,
        cargo: load.cargoType,
        weight: `${load.weight?.toLocaleString() || 0} kg`,
        bids: Math.floor(Math.random() * 10),
        status: load.status,
        amount: parseFloat(load.price) || 0,
        postedTime: new Date(load.createdAt).toLocaleDateString(),
      }));
      setRecentLoads(transformedLoads);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLoad = (load: any) => {
    setEditingLoad(load);
    setEditForm({
      origin: load.load.split(' → ')[0] || '',
      destination: load.load.split(' → ')[1] || '',
      cargoType: load.cargo || '',
      weight: load.weight?.replace(' kg', '').replace(',', '') || '',
      price: load.amount?.toString() || '',
      description: ''
    });
    setShowEditModal(true);
  };

  const handleDeleteLoad = async (loadId: number) => {
    if (!confirm('Are you sure you want to delete this load?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/loads/${loadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecentLoads(prev => prev.filter(l => l.id !== loadId));
    } catch (error) {
      console.error('Error deleting load:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLoad) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/loads/${editingLoad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin: editForm.origin,
          destination: editForm.destination,
          cargoType: editForm.cargoType,
          weight: parseFloat(editForm.weight),
          price: editForm.price,
          description: editForm.description
        })
      });
      setShowEditModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating load:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const topCarriers = [
    { id: 1, name: 'CPEC Express', rating: 4.9, trips: 45, onTime: 98, avgRate: '$0.85/km' },
    { id: 2, name: 'Silk Road Transport', rating: 4.8, trips: 67, onTime: 96, avgRate: '$0.82/km' },
    { id: 3, name: 'Mountain Movers', rating: 4.7, trips: 34, onTime: 94, avgRate: '$0.88/km' },
  ];

  const costAnalysis = [
    { month: 'Nov', spent: 45000, saved: 5600 },
    { month: 'Dec', spent: 52000, saved: 6800 },
    { month: 'Jan', spent: 48000, saved: 6200 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header with Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.firstName || 'Shipper'}! 👋
            </h1>
            <p className="text-slate-600 mt-1">Manage your shipments and optimize your logistics</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button onClick={() => navigate('/post-load')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Post New Load
            </button>
            <button onClick={() => navigate('/trucks')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium">
              <Truck className="w-5 h-5" />
              Find Trucks
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
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeLoads}</h3>
            <p className="text-sm text-slate-600 mt-1">Active Loads</p>
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
            <h3 className="text-2xl font-bold text-slate-900">{stats.completedLoads}</h3>
            <p className="text-sm text-slate-600 mt-1">Completed Loads</p>
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
            <h3 className="text-2xl font-bold text-slate-900">${stats.totalSpent.toLocaleString()}</h3>
            <p className="text-sm text-slate-600 mt-1">Total Spent</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600">{stats.costSavings}%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.avgDeliveryTime} days</h3>
            <p className="text-sm text-slate-600 mt-1">Avg Delivery Time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/post-load')} className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Post Load</span>
                </button>
                <button onClick={() => navigate('/trucks')} className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Find Trucks</span>
                </button>
                <button onClick={() => navigate('/track')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Track</span>
                </button>
                <button onClick={() => navigate('/routes')} className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer">
                  <div className="p-3 bg-amber-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Loads */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Loads</h2>
                <button onClick={() => navigate('/loads')} className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {recentLoads.map((load) => (
                  <div key={load.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      load.status === 'completed' ? 'bg-green-100' :
                      load.status === 'in_transit' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {load.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       load.status === 'in_transit' ? <Truck className="w-5 h-5 text-blue-600" /> :
                       <Clock className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">{load.load}</h3>
                          <p className="text-sm text-slate-600 mt-1">{load.cargo} • {load.weight}</p>
                          <p className="text-xs text-slate-500 mt-1">{load.bids} bids received • Posted {load.postedTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${load.amount.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            load.status === 'completed' ? 'bg-green-100 text-green-800' :
                            load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {(load.status || 'pending').replace('_', ' ')}
                          </span>
                          {/* Edit and Delete buttons for non-completed loads */}
                          {load.status !== 'completed' && load.status !== 'in_transit' && (
                            <div className="flex gap-2 mt-2 justify-end">
                              <button
                                onClick={() => handleEditLoad(load)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit Load"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLoad(load.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Load"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Cost Analysis</h2>
              <div className="space-y-4">
                {costAnalysis.map((month, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{month.month}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">${month.spent.toLocaleString()}</span>
                        <span className="text-xs text-green-600 ml-2">-${month.saved.toLocaleString()} saved</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(month.saved / month.spent) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Carriers */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Carriers</h2>
              <div className="space-y-3">
                {topCarriers.map((carrier) => (
                  <div key={carrier.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-900">{carrier.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold">{carrier.rating}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>{carrier.trips} trips</div>
                      <div>{carrier.onTime}% on-time</div>
                      <div className="col-span-2 text-green-600 font-medium">{carrier.avgRate}</div>
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
                    <p className="text-sm text-slate-900">5 new bids received</p>
                    <p className="text-xs text-slate-600 mt-1">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">Delivery completed</p>
                    <p className="text-xs text-slate-600 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">Bid expiring soon</p>
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
                    <span className="text-sm text-slate-600">Loads Posted</span>
                    <span className="text-sm font-semibold text-slate-900">24</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">On-Time Delivery</span>
                    <span className="text-sm font-semibold text-slate-900">96%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Cost Efficiency</span>
                    <span className="text-sm font-semibold text-slate-900">88%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Load Modal */}
        {showEditModal && editingLoad && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Load</h3>
                <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
                    <input
                      type="text"
                      value={editForm.origin}
                      onChange={(e) => setEditForm({...editForm, origin: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                    <input
                      type="text"
                      value={editForm.destination}
                      onChange={(e) => setEditForm({...editForm, destination: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
                    <input
                      type="text"
                      value={editForm.cargoType}
                      onChange={(e) => setEditForm({...editForm, cargoType: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
