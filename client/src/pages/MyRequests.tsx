import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Home, RefreshCw, Filter, Search, Calendar, Truck,
  Package, MapPin, DollarSign, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

interface Request {
  id: number;
  type: 'quote' | 'booking' | 'support' | 'verification';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  details?: any;
}

export default function MyRequests() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch from API - for now using mock data
      const token = localStorage.getItem('access_token');
      
      // Try to fetch real bookings/bids
      const [bookingsRes, bidsRes] = await Promise.all([
        fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/bids', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
      ]);

      let allRequests: Request[] = [];

      if (bookingsRes?.ok) {
        const bookings = await bookingsRes.json();
        const bookingRequests = (bookings || []).map((b: any) => ({
          id: b.id,
          type: 'booking' as const,
          title: `Booking #${b.id}`,
          description: `${b.origin || 'Origin'} → ${b.destination || 'Destination'}`,
          status: b.status || 'pending',
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
          details: b
        }));
        allRequests = [...allRequests, ...bookingRequests];
      }

      if (bidsRes?.ok) {
        const bids = await bidsRes.json();
        const bidRequests = (bids || []).map((b: any) => ({
          id: b.id + 1000,
          type: 'quote' as const,
          title: `Quote Request #${b.id}`,
          description: `Bid amount: $${b.amount || 0}`,
          status: b.status || 'pending',
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
          details: b
        }));
        allRequests = [...allRequests, ...bidRequests];
      }

      // Add mock data if no real data
      if (allRequests.length === 0) {
        allRequests = [
          {
            id: 1,
            type: 'quote',
            title: 'Quote Request - Kashgar to Islamabad',
            description: 'Requested quote for 20ft container shipment',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            details: { origin: 'Kashgar', destination: 'Islamabad', weight: '15000 kg' }
          },
          {
            id: 2,
            type: 'booking',
            title: 'Booking Confirmation - Electronics Shipment',
            description: 'Confirmed booking with CPEC Express',
            status: 'in_progress',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            details: { carrier: 'CPEC Express', amount: '$4,500' }
          },
          {
            id: 3,
            type: 'support',
            title: 'Support Ticket - Delivery Delay',
            description: 'Inquiry about delayed shipment',
            status: 'completed',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            details: { resolution: 'Shipment delivered successfully' }
          },
          {
            id: 4,
            type: 'verification',
            title: 'KYC Verification Request',
            description: 'Document verification for account upgrade',
            status: 'completed',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            details: { verifiedOn: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString() }
          }
        ];
      }

      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <DollarSign className="w-5 h-5" />;
      case 'booking':
        return <Truck className="w-5 h-5" />;
      case 'support':
        return <FileText className="w-5 h-5" />;
      case 'verification':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (searchTerm && !req.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">My Requests</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
            <p className="text-slate-600 mt-1">Track and manage all your requests and submissions</p>
          </div>
          <button 
            onClick={fetchRequests}
            className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'in_progress', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{requests.length}</div>
            <div className="text-sm text-slate-600">Total Requests</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-amber-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
              <p className="text-slate-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No requests found</h3>
              <p className="text-slate-500">
                {filter !== 'all' ? 'Try changing your filter' : 'You have no requests yet'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className="bg-white rounded-xl border border-slate-200 hover:border-green-200 transition-colors overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      request.type === 'quote' ? 'bg-purple-100 text-purple-600' :
                      request.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                      request.type === 'support' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getTypeIcon(request.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{request.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created: {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated: {new Date(request.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                          {getStatusIcon(request.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Details */}
                  <button
                    onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700"
                  >
                    {expandedRequest === request.id ? (
                      <><ChevronUp className="w-4 h-4" /> Hide Details</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> View Details</>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedRequest === request.id && request.details && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3">Request Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(request.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="font-medium text-slate-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      {(request.status === 'pending' || request.status === 'in_progress') && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('access_token');
                                    if (request.type === 'booking') {
                                      await fetch(`/api/bookings/${request.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ status: 'in_progress' })
                                      });
                                    }
                                    setRequests(prev => prev.map(r => 
                                      r.id === request.id ? { ...r, status: 'in_progress' as const } : r
                                    ));
                                  } catch (e) {
                                    console.error('Error updating status:', e);
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                Confirm Request
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to cancel this request?')) return;
                                  try {
                                    const token = localStorage.getItem('access_token');
                                    if (request.type === 'booking') {
                                      await fetch(`/api/bookings/${request.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ status: 'rejected' })
                                      });
                                    }
                                    setRequests(prev => prev.map(r => 
                                      r.id === request.id ? { ...r, status: 'rejected' as const } : r
                                    ));
                                  } catch (e) {
                                    console.error('Error canceling request:', e);
                                  }
                                }}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                              >
                                Cancel Request
                              </button>
                            </>
                          )}
                          {request.status === 'in_progress' && (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('access_token');
                                  if (request.type === 'booking') {
                                    await fetch(`/api/bookings/${request.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ status: 'completed' })
                                    });
                                  }
                                  setRequests(prev => prev.map(r => 
                                    r.id === request.id ? { ...r, status: 'completed' as const } : r
                                  ));
                                } catch (e) {
                                  console.error('Error completing request:', e);
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Mark as Completed
                            </button>
                          )}
                          {request.type === 'booking' && (
                            <button
                              onClick={() => navigate(`/track?id=${request.id}`)}
                              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                            >
                              Track Shipment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
