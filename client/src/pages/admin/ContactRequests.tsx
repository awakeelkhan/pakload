import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  MessageSquare, 
  Check, 
  X, 
  Clock, 
  User, 
  Truck, 
  Mail, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ContactRequest {
  id: number;
  shipperId: number;
  shipperName: string;
  shipperEmail: string;
  truckId: number;
  carrierId: number;
  carrierName: string;
  vehicleType: string;
  subject: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  adminNotes: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
}

export default function ContactRequests() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState<{ [key: number]: string }>({});
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/contact-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      setUpdating(requestId);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/contact-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes[requestId] || null
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setRequests(prev => prev.map(r => r.id === requestId ? updated : r));
        alert(`Contact request ${status} successfully!`);
      } else {
        alert('Failed to update contact request');
      }
    } catch (error) {
      console.error('Error updating contact request:', error);
      alert('Failed to update contact request');
    } finally {
      setUpdating(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><X className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contact Requests</h1>
          <p className="text-slate-600 mt-1">Manage shipper requests to contact carriers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
                <p className="text-sm text-slate-600">Total Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-sm text-slate-600">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                <p className="text-sm text-slate-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by shipper, carrier, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200 text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading contact requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No contact requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{request.subject}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span><strong>Shipper:</strong> {request.shipperName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{request.shipperEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Truck className="w-4 h-4" />
                          <span><strong>Carrier:</strong> {request.carrierName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      {expandedRequest === request.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedRequest === request.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-900 mb-2">Message</h4>
                        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{request.message}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-slate-900 mb-2">Vehicle Type</h4>
                        <p className="text-slate-600">{request.vehicleType}</p>
                      </div>

                      {request.status === 'pending' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (Optional)</label>
                            <textarea
                              value={adminNotes[request.id] || ''}
                              onChange={(e) => setAdminNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                              rows={3}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                              placeholder="Add any notes about this request..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => updateRequestStatus(request.id, 'approved')}
                              disabled={updating === request.id}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {updating === request.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                              disabled={updating === request.id}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {updating === request.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {request.adminNotes && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Admin Notes</h4>
                          <p className="text-blue-800 text-sm">{request.adminNotes}</p>
                        </div>
                      )}

                      {request.approvedAt && (
                        <div className="mt-4 text-sm text-slate-500">
                          {request.status === 'approved' ? 'Approved' : 'Updated'} on {new Date(request.approvedAt).toLocaleString()}
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
