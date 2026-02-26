import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Package, MapPin, Calendar, DollarSign, Clock, CheckCircle, XCircle, 
  AlertCircle, User, Truck, MessageSquare, Star, Phone, Mail, 
  ChevronDown, ChevronUp, Filter, RefreshCw, Bell, FileText
} from 'lucide-react';
import { useToast } from '../components/Toast';
import BiltyInvoice from '../components/BiltyInvoice';

interface Bid {
  id: number;
  loadId: number;
  carrierId: number;
  price: string;
  status: string;
  pickupDate: string;
  deliveryDate: string;
  notes: string | null;
  createdAt: string;
  load?: {
    id: number;
    origin: string;
    destination: string;
    cargoType: string;
    cargoWeight: string;
    price: string;
    trackingNumber: string;
  };
  carrier?: {
    id: number;
    firstName: string;
    lastName: string;
    companyName: string;
    rating: string;
    phone?: string;
    email?: string;
  };
}

export default function MyBids() {
  const [, navigate] = useLocation();
  const { addToast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBid, setExpandedBid] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [processingBid, setProcessingBid] = useState<number | null>(null);
  const [showBilty, setShowBilty] = useState<Bid | null>(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      // Handle paginated response
      const bidsArray = data.bookings || data || [];
      setBids(Array.isArray(bidsArray) ? bidsArray : []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      addToast('error', 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    setProcessingBid(bidId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/quotes/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        addToast('success', 'Bid accepted! Booking confirmed.');
        fetchBids(); // Refresh the list
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      addToast('error', 'Failed to accept bid');
    } finally {
      setProcessingBid(null);
    }
  };

  const handleRejectBid = async (bidId: number) => {
    setProcessingBid(bidId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/quotes/${bidId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ reason: 'Shipper declined the bid' }),
      });

      if (response.ok) {
        addToast('success', 'Bid rejected');
        fetchBids(); // Refresh the list
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Failed to reject bid');
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      addToast('error', 'Failed to reject bid');
    } finally {
      setProcessingBid(null);
    }
  };

  const handleWithdrawBid = async (bidId: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;
    
    setProcessingBid(bidId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/quotes/${bidId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ reason: 'Carrier withdrew the bid' }),
      });

      if (response.ok) {
        addToast('success', 'Bid withdrawn successfully');
        fetchBids();
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Failed to withdraw bid');
      }
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      addToast('error', 'Failed to withdraw bid');
    } finally {
      setProcessingBid(null);
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const pendingCount = bids.filter(b => b.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'in_transit':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Bid Management
              {pendingCount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full flex items-center gap-1">
                  <Bell className="w-4 h-4" /> {pendingCount} New
                </span>
              )}
            </h1>
            <p className="text-slate-600 mt-1">Review and manage bids on your loads</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={fetchBids}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button 
              onClick={() => navigate('/post-load')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Post New Load
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 p-2 mb-6 flex gap-2">
          {[
            { key: 'all', label: 'All Bids', count: bids.length },
            { key: 'pending', label: 'Pending', count: bids.filter(b => b.status === 'pending').length },
            { key: 'confirmed', label: 'Accepted', count: bids.filter(b => b.status === 'confirmed' || b.status === 'in_transit').length },
            { key: 'cancelled', label: 'Rejected', count: bids.filter(b => b.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading bids...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No bids found</h3>
            <p className="text-slate-500 mb-4">
              {filter === 'all' 
                ? "You haven't received any bids yet. Post a load to start receiving bids from carriers."
                : `No ${filter} bids found.`}
            </p>
            <button 
              onClick={() => navigate('/post-load')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Post a Load
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <div 
                key={bid.id} 
                className={`bg-white rounded-xl border ${
                  bid.status === 'pending' ? 'border-amber-300 shadow-md' : 'border-slate-200'
                } overflow-hidden`}
              >
                {/* Bid Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Load Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-bold text-slate-900">
                          {bid.load?.origin || 'Unknown'} → {bid.load?.destination || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {bid.load?.cargoType || 'General'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Pickup: {bid.pickupDate?.split('T')[0] || 'TBD'}
                        </span>
                        <span>Tracking: {bid.load?.trackingNumber || 'N/A'}</span>
                      </div>

                      {/* Carrier Info */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {bid.carrier?.companyName || `${bid.carrier?.firstName || 'Unknown'} ${bid.carrier?.lastName || ''}`}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{parseFloat(bid.carrier?.rating || '0').toFixed(1)} Rating</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bid Amount & Status */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        Rs {parseFloat(bid.price || '0').toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500 mb-2">
                        vs Rs {parseFloat(bid.load?.price || '0').toLocaleString()} asking
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                    className="mt-4 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    {expandedBid === bid.id ? (
                      <>Hide Details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show Details <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedBid === bid.id && (
                  <div className="border-t border-slate-200 p-6 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bid Details */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Bid Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Bid Amount:</span>
                            <span className="font-medium">Rs {parseFloat(bid.price || '0').toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Platform Fee (5%):</span>
                            <span className="font-medium">Rs {(parseFloat(bid.price || '0') * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-slate-900 font-semibold">Total:</span>
                            <span className="font-bold text-green-600">Rs {(parseFloat(bid.price || '0') * 1.05).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mt-4">
                            <span className="text-slate-600">Pickup Date:</span>
                            <span className="font-medium">{bid.pickupDate?.split('T')[0] || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Est. Delivery:</span>
                            <span className="font-medium">{bid.deliveryDate?.split('T')[0] || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Submitted:</span>
                            <span className="font-medium">{new Date(bid.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Carrier Message */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Carrier Message</h4>
                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                          <MessageSquare className="w-5 h-5 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600">
                            {bid.notes || 'No message provided by carrier.'}
                          </p>
                        </div>

                        {/* Contact Info - Hidden for privacy, only shown after booking confirmed */}
                        {bid.carrier && bid.status === 'confirmed' && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Carrier Contact (Booking Confirmed)</h4>
                            <p className="text-sm text-green-700">
                              Contact details are shared via in-app messaging for your security.
                            </p>
                          </div>
                        )}
                        {bid.carrier && bid.status === 'pending' && (
                          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <h4 className="font-semibold text-slate-700 mb-1">Contact Information</h4>
                            <p className="text-sm text-slate-600">
                              Carrier contact details will be available after you accept this bid.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {bid.status === 'pending' && (
                      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={processingBid === bid.id}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                          {processingBid === bid.id ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                          Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          disabled={processingBid === bid.id}
                          className="flex-1 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject Bid
                        </button>
                      </div>
                    )}

                    {bid.status === 'confirmed' && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Bid Accepted - Booking Confirmed</span>
                          </div>
                          <button
                            onClick={() => setShowBilty(bid)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
                          >
                            <FileText className="w-4 h-4" />
                            View Bilty / Invoice
                          </button>
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          The carrier has been notified and will contact you to arrange pickup.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bilty Invoice Modal */}
      {showBilty && showBilty.load && showBilty.carrier && (
        <BiltyInvoice
          booking={{
            id: showBilty.id,
            trackingNumber: showBilty.load.trackingNumber || `LP-${showBilty.id.toString().padStart(6, '0')}`,
            loadId: showBilty.loadId,
            status: showBilty.status,
            createdAt: showBilty.createdAt,
            price: parseFloat(showBilty.price) || 0,
            currency: 'PKR',
          }}
          load={{
            origin: showBilty.load.origin || 'N/A',
            destination: showBilty.load.destination || 'N/A',
            cargoType: showBilty.load.cargoType || 'General',
            weight: showBilty.load.cargoWeight || 'N/A',
            pickupDate: showBilty.pickupDate?.split('T')[0] || 'TBD',
            deliveryDate: showBilty.deliveryDate?.split('T')[0] || 'TBD',
          }}
          shipper={{
            name: 'Shipper',
            phone: 'Contact via platform',
            email: 'Contact via platform',
          }}
          carrier={{
            name: `${showBilty.carrier.firstName || ''} ${showBilty.carrier.lastName || ''}`.trim() || 'Carrier',
            company: showBilty.carrier.companyName,
            phone: 'Contact via platform',
            email: 'Contact via platform',
          }}
          onClose={() => setShowBilty(null)}
        />
      )}
    </div>
  );
}
