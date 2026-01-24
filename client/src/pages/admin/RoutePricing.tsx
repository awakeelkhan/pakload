import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MapPin, Plus, Edit2, Trash2, Search, ChevronRight } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

interface RoutePricing {
  id: number;
  routeId: number;
  origin: string;
  destination: string;
  basePrice: string;
  surgeMultiplier: string;
  status: string;
}

export default function RoutePricing() {
  const [, navigate] = useLocation();
  const [routePricing, setRoutePricing] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<RoutePricing | null>(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    basePrice: '',
    surgeMultiplier: '1.0',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; pricingId: number | null }>({
    show: false,
    pricingId: null,
  });

  useEffect(() => {
    fetchRoutePricing();
  }, []);

  const fetchRoutePricing = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/route-pricing');
      const data = await response.json();
      setRoutePricing(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching route pricing:', error);
      setRoutePricing([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPricing 
        ? `/api/admin/route-pricing/${editingPricing.id}`
        : '/api/admin/route-pricing';
      
      await fetch(url, {
        method: editingPricing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      fetchRoutePricing();
      setShowModal(false);
      setEditingPricing(null);
      setFormData({ origin: '', destination: '', basePrice: '', surgeMultiplier: '1.0' });
    } catch (error) {
      console.error('Error saving route pricing:', error);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, pricingId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.pricingId) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/admin/route-pricing/${deleteConfirm.pricingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchRoutePricing();
      setDeleteConfirm({ show: false, pricingId: null });
    } catch (error) {
      console.error('Error deleting route pricing:', error);
      setDeleteConfirm({ show: false, pricingId: null });
    }
  };

  const filteredPricing = routePricing.filter(rp =>
    rp.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rp.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate('/admin/settings')} className="hover:text-gray-700">Admin Settings</button>
            <ChevronRight className="w-4 h-4" />
            <span>Route Pricing</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-purple-600" />
                Route Pricing
              </h1>
              <p className="mt-2 text-gray-600">Set route-specific pricing and surge multipliers</p>
            </div>
            <button
              onClick={() => { setEditingPricing(null); setFormData({ origin: '', destination: '', basePrice: '', surgeMultiplier: '1.0' }); setShowModal(true); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Route Pricing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surge Multiplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPricing.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No route pricing configured. Click "Add Route Pricing" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredPricing.map((rp) => (
                    <tr key={rp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{rp.origin} → {rp.destination}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">${rp.basePrice}</td>
                      <td className="px-6 py-4 text-gray-900">{rp.surgeMultiplier}x</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rp.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditingPricing(rp); setFormData({ origin: rp.origin, destination: rp.destination, basePrice: rp.basePrice, surgeMultiplier: rp.surgeMultiplier }); setShowModal(true); }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(rp.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, pricingId: null })}
        onConfirm={confirmDelete}
        title="Delete Route Pricing"
        message="Are you sure you want to delete this route pricing? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingPricing ? 'Edit Route Pricing' : 'Add Route Pricing'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Kashgar, China"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Islamabad, Pakistan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surge Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.surgeMultiplier}
                    onChange={(e) => setFormData({ ...formData, surgeMultiplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {editingPricing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
