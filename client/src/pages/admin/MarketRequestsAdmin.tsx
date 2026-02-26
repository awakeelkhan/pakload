import { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, Phone, Mail, MapPin, Package, Clock, ArrowLeft, User, CheckCircle, XCircle, Search } from 'lucide-react';
import { Link } from 'wouter';

interface MarketRequest {
  id: number;
  title: string;
  description: string;
  goodsType: string;
  quantity: number;
  unit: string;
  originCity?: string;
  destinationCity?: string;
  fulfillmentStatus: string;
  createdAt: string;
  shipper?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function MarketRequestsAdmin() {
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/market-requests/admin/all', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching market requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/market-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });
      
      if (response.ok) {
        fetchRequests();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'searching': return 'bg-blue-100 text-blue-700';
      case 'fulfilled': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Market Requests</h1>
                <p className="text-slate-600">Users looking for goods - connect with them</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
              {requests.length} Requests
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading market requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Market Requests</h2>
            <p className="text-slate-600">No users have submitted goods requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <div key={req.request?.id || req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {req.request?.title || req.title || 'Goods Request'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.request?.fulfillmentStatus || req.fulfillmentStatus)}`}>
                        {req.request?.fulfillmentStatus || req.fulfillmentStatus || 'pending'}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-4">
                      {req.request?.description || req.description || 'No description provided'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4" />
                        <span>{req.request?.goodsType || req.goodsType || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{req.request?.quantity || req.quantity} {req.request?.unit || req.unit}</span>
                      </div>
                      {(req.request?.originCity || req.originCity) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {req.request?.originCity || req.originCity}
                            {(req.request?.destinationCity || req.destinationCity) && ` → ${req.request?.destinationCity || req.destinationCity}`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(req.request?.createdAt || req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {req.shipper && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Requester Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4" />
                            <span>{req.shipper.firstName} {req.shipper.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${req.shipper.email}`} className="text-green-600 hover:underline">
                              {req.shipper.email}
                            </a>
                          </div>
                          {req.shipper.phone && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${req.shipper.phone}`} className="text-green-600 hover:underline">
                                {req.shipper.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button 
                      onClick={() => handleUpdateStatus(req.request?.id || req.id, 'searching')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Mark Reviewing
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req.request?.id || req.id, 'fulfilled')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Fulfilled
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req.request?.id || req.id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
