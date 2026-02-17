import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, User, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface PendingBid {
  id: number;
  loadId: number;
  carrierId: number;
  quotedPrice: string;
  estimatedDays: number;
  message: string;
  status: string;
  createdAt: string;
  carrier?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  load?: {
    origin: string;
    destination: string;
    cargoType: string;
  };
}

export default function BidApprovals() {
  const [pendingBids, setPendingBids] = useState<PendingBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBids();
  }, []);

  const fetchPendingBids = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/quotes?status=pending', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingBids(data.quotes || data || []);
      }
    } catch (error) {
      console.error('Error fetching pending bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (bidId: number, action: 'approve' | 'reject') => {
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
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bid Approvals</h1>
                <p className="text-slate-600">Review and approve pending bids</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              {pendingBids.length} Pending
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading pending bids...</p>
          </div>
        ) : pendingBids.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h2>
            <p className="text-slate-600">No pending bids to approve at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBids.map((bid) => (
              <div key={bid.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Bid: PKR {parseInt(bid.quotedPrice || '0').toLocaleString()}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Pending Approval
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4" />
                        <span>Load #{bid.loadId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{bid.estimatedDays} days delivery</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        <span>Carrier #{bid.carrierId}</span>
                      </div>
                    </div>

                    {bid.message && (
                      <div className="bg-slate-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-slate-700">{bid.message}</p>
                      </div>
                    )}

                    {bid.carrier && (
                      <div className="text-sm text-slate-500 mb-4">
                        From: <span className="font-medium">{bid.carrier.firstName} {bid.carrier.lastName}</span> ({bid.carrier.email})
                      </div>
                    )}

                    <div className="text-xs text-slate-400">
                      Submitted: {new Date(bid.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApproval(bid.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(bid.id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
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
