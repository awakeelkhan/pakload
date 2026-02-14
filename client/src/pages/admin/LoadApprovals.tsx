import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, Eye, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface PendingLoad {
  id: number;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  price: string;
  pickupDate: string;
  createdAt: string;
  status: string;
  shipper?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function LoadApprovals() {
  const [pendingLoads, setPendingLoads] = useState<PendingLoad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingLoads();
  }, []);

  const fetchPendingLoads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/loads?status=pending', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingLoads(data.loads || data || []);
      }
    } catch (error) {
      console.error('Error fetching pending loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (loadId: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = action === 'approve' ? 'posted' : 'cancelled';
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
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Load Approvals</h1>
                <p className="text-slate-600">Review and approve pending loads</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium">
              {pendingLoads.length} Pending
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading pending loads...</p>
          </div>
        ) : pendingLoads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h2>
            <p className="text-slate-600">No pending loads to approve at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLoads.map((load) => (
              <div key={load.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {load.origin} → {load.destination}
                      </h3>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        Pending Approval
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4" />
                        <span>{load.cargoType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">{load.weight} kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span>PKR {parseInt(load.price || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(load.pickupDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {load.shipper && (
                      <div className="text-sm text-slate-500 mb-4">
                        Posted by: <span className="font-medium">{load.shipper.firstName} {load.shipper.lastName}</span> ({load.shipper.email})
                      </div>
                    )}

                    <div className="text-xs text-slate-400">
                      Submitted: {new Date(load.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApproval(load.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(load.id, 'reject')}
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
