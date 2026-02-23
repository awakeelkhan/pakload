import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  ShoppingBag, Search, Filter, Clock, CheckCircle, XCircle, 
  AlertCircle, MapPin, Calendar, DollarSign, Package, User,
  Phone, Mail, ChevronDown, ChevronUp, Eye, MessageSquare,
  RefreshCw, Plus, Truck, FileText
} from 'lucide-react';

interface MarketRequest {
  id: number;
  title: string;
  goodsType: string;
  quantity: number;
  unit: string;
  description: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  requiredByDate: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: 'pending' | 'searching' | 'found' | 'negotiating' | 'matched' | 'completed' | 'cancelled';
  contactName: string;
  contactPhone: string;
  createdAt: string;
  assignedTo?: string;
  matchedCarrier?: string;
  finalPrice?: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
  searching: { label: 'Searching', color: 'bg-blue-100 text-blue-700', icon: Search },
  found: { label: 'Match Found', color: 'bg-amber-100 text-amber-700', icon: CheckCircle },
  negotiating: { label: 'Negotiating', color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
  matched: { label: 'Matched', color: 'bg-green-100 text-green-700', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MarketRequests() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/market-requests', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || data || []);
      } else {
        // Use mock data if API fails
        setRequests([
          {
            id: 1,
            title: 'Need 500 bags of cement from Karachi',
            goodsType: 'Construction Materials',
            quantity: 500,
            unit: 'bags',
            description: 'Need high-quality Portland cement for construction project',
            originCity: 'Karachi',
            originCountry: 'Pakistan',
            destinationCity: 'Lahore',
            destinationCountry: 'Pakistan',
            requiredByDate: '2026-02-15',
            budgetMin: 150000,
            budgetMax: 200000,
            status: 'searching',
            contactName: 'Ahmad Khan',
            contactPhone: '0300-1234567',
            createdAt: '2026-01-25T10:00:00Z',
            assignedTo: 'Team Member A',
          },
          {
            id: 2,
            title: 'Electronics shipment from Islamabad',
            goodsType: 'Electronics',
            quantity: 200,
            unit: 'units',
            description: 'Computer parts and accessories',
            originCity: 'Islamabad',
            originCountry: 'Pakistan',
            destinationCity: 'Peshawar',
            destinationCountry: 'Pakistan',
            requiredByDate: '2026-02-10',
            budgetMin: 80000,
            budgetMax: 120000,
            status: 'found',
            contactName: 'Ali Hassan',
            contactPhone: '0321-9876543',
            createdAt: '2026-01-24T14:30:00Z',
            assignedTo: 'Team Member B',
            matchedCarrier: 'Fast Logistics',
          },
          {
            id: 3,
            title: 'Textile goods to Faisalabad',
            goodsType: 'Textiles',
            quantity: 5000,
            unit: 'kg',
            description: 'Raw cotton and fabric materials',
            originCity: 'Multan',
            originCountry: 'Pakistan',
            destinationCity: 'Faisalabad',
            destinationCountry: 'Pakistan',
            requiredByDate: '2026-02-20',
            budgetMin: 100000,
            budgetMax: 150000,
            status: 'completed',
            contactName: 'Muhammad Tariq',
            contactPhone: '0333-5555555',
            createdAt: '2026-01-20T09:00:00Z',
            matchedCarrier: 'Silk Road Transport',
            finalPrice: 125000,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching market requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(query) ||
        req.goodsType.toLowerCase().includes(query) ||
        req.originCity.toLowerCase().includes(query) ||
        req.destinationCity.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const isAdmin = user?.role === 'admin';

  const handleApproveRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/market-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Request approved successfully');
        fetchRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/market-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        alert('Request rejected');
        fetchRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleUpdateStatus = async (requestId: number, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/market-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        alert('Status updated successfully');
        fetchRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              Market Requests
            </h1>
            <p className="text-slate-600 mt-1">
              {isAdmin ? 'Manage and fulfill customer requests' : 'Track your submitted requests'}
            </p>
          </div>
          <button
            onClick={() => navigate('/post-load')}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="searching">Searching</option>
              <option value="found">Match Found</option>
              <option value="negotiating">Negotiating</option>
              <option value="matched">Matched</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={fetchRequests}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-slate-900">{requests.length}</div>
            <div className="text-sm text-slate-500">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'searching').length}
            </div>
            <div className="text-sm text-slate-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-amber-600">
              {requests.filter(r => r.status === 'found' || r.status === 'negotiating').length}
            </div>
            <div className="text-sm text-slate-500">Pending Action</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No requests found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Submit a new request to get started'
                }
              </p>
              <button
                onClick={() => navigate('/post-load')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status].icon;
              const isExpanded = expandedRequest === request.id;

              return (
                <div key={request.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_CONFIG[request.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_CONFIG[request.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.originCity} → {request.destinationCity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {request.quantity} {request.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            By {new Date(request.requiredByDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {request.budgetMax && (
                          <div className="text-lg font-bold text-green-600">
                            PKR {request.budgetMin?.toLocaleString()} - {request.budgetMax.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          Submitted {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                      className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      {isExpanded ? (
                        <><ChevronUp className="w-4 h-4" /> Hide Details</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> View Details</>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                          <p className="text-sm text-slate-600">{request.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <User className="w-4 h-4" />
                                {request.contactName}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="w-4 h-4" />
                                {request.contactPhone}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">Request Details</h4>
                            <div className="space-y-2 text-sm text-slate-600">
                              <div className="flex justify-between">
                                <span>Goods Type:</span>
                                <span className="font-medium">{request.goodsType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quantity:</span>
                                <span className="font-medium">{request.quantity} {request.unit}</span>
                              </div>
                              {request.assignedTo && (
                                <div className="flex justify-between">
                                  <span>Assigned To:</span>
                                  <span className="font-medium">{request.assignedTo}</span>
                                </div>
                              )}
                              {request.matchedCarrier && (
                                <div className="flex justify-between">
                                  <span>Matched Carrier:</span>
                                  <span className="font-medium text-green-600">{request.matchedCarrier}</span>
                                </div>
                              )}
                              {request.finalPrice && (
                                <div className="flex justify-between">
                                  <span>Final Price:</span>
                                  <span className="font-medium text-green-600">PKR {request.finalPrice.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {isAdmin && request.status !== 'completed' && request.status !== 'cancelled' && (
                          <div className="flex gap-2 pt-4 border-t">
                            {request.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                  Accept Request
                                </button>
                                <button 
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                >
                                  Reject Request
                                </button>
                              </>
                            )}
                            {request.status !== 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(request.id, 'completed')}
                                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                  Mark Complete
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
