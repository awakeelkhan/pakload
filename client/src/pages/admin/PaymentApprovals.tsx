import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  CreditCard, ArrowLeft, Search, CheckCircle, XCircle, Clock, 
  Eye, User, Building, Calendar, DollarSign, Filter,
  ChevronDown, ChevronUp, AlertTriangle, Download, RefreshCw
} from 'lucide-react';

interface Payment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: 'carrier' | 'shipper';
  bookingId?: number;
  trackingNumber?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
}

export default function PaymentApprovals() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch real payment proofs from API
      const response = await fetch('/api/upload/payment-proofs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match interface
        const transformedPayments: Payment[] = (data || []).map((p: any) => ({
          id: p.id,
          userId: p.userId,
          userName: p.userName || `User #${p.userId}`,
          userEmail: p.userEmail || '',
          userRole: 'shipper' as const,
          transactionId: p.transactionRef || `TXN-${p.id}`,
          amount: 0,
          currency: 'PKR',
          paymentMethod: 'Bank Transfer',
          status: p.status === 'verified' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
          submittedAt: p.createdAt || new Date().toISOString(),
          reviewedAt: p.verifiedAt,
          reviewedBy: p.verifiedBy ? `Admin #${p.verifiedBy}` : undefined,
          notes: p.notes,
          fileUrl: p.fileUrl,
          fileName: p.fileName,
        }));
        setPayments(transformedPayments);
      } else {
        console.error('Failed to fetch payment proofs');
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    setProcessingId(paymentId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/upload/payment-proofs/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'verified' })
      });
      
      if (response.ok) {
        setPayments(payments.map(p => 
          p.id === paymentId 
            ? { ...p, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin' } 
            : p
        ));
        alert('Payment approved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessingId(paymentId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/upload/payment-proofs/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected', notes: reason })
      });
      
      if (response.ok) {
        setPayments(payments.map(p => 
          p.id === paymentId 
            ? { ...p, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin', rejectionReason: reason } 
            : p
        ));
        alert('Payment rejected.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
    if (searchQuery && 
        !payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getMethodIcon = (method: string) => {
    if (method.includes('Bank')) return <Building className="w-5 h-5 text-blue-600" />;
    if (method.includes('EasyPaisa')) return <CreditCard className="w-5 h-5 text-green-600" />;
    if (method.includes('JazzCash')) return <CreditCard className="w-5 h-5 text-red-600" />;
    return <CreditCard className="w-5 h-5 text-slate-600" />;
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Payment Approvals</h1>
                <p className="text-slate-600">Review and approve user payment submissions</p>
              </div>
            </div>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{payments.length}</div>
            <div className="text-sm text-slate-600">Total Payments</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
            <div className="text-sm text-amber-600">Pending Review</div>
            <div className="text-xs text-amber-500 mt-1">PKR {totalPending.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{rejectedCount}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No payments found</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="hover:bg-slate-50">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getMethodIcon(payment.paymentMethod)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">PKR {payment.amount.toLocaleString()}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <User className="w-4 h-4" />
                            <span>{payment.userName}</span>
                            <span className="text-slate-400">•</span>
                            <span className={`px-1.5 py-0.5 text-xs rounded ${payment.userRole === 'carrier' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {payment.userRole}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span>{payment.paymentMethod}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono">{payment.transactionId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(payment.id); }}
                              disabled={processingId === payment.id}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {processingId === payment.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(payment.id); }}
                              disabled={processingId === payment.id}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {expandedPayment === payment.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedPayment === payment.id && (
                    <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div>
                          <p className="text-xs text-slate-500">User Email</p>
                          <p className="text-sm font-medium">{payment.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Submitted At</p>
                          <p className="text-sm font-medium">{new Date(payment.submittedAt).toLocaleString()}</p>
                        </div>
                        {payment.trackingNumber && (
                          <div>
                            <p className="text-xs text-slate-500">Booking / Tracking</p>
                            <p className="text-sm font-medium font-mono">{payment.trackingNumber}</p>
                          </div>
                        )}
                        {payment.reviewedAt && (
                          <div>
                            <p className="text-xs text-slate-500">Reviewed At</p>
                            <p className="text-sm font-medium">{new Date(payment.reviewedAt).toLocaleString()}</p>
                          </div>
                        )}
                        {payment.reviewedBy && (
                          <div>
                            <p className="text-xs text-slate-500">Reviewed By</p>
                            <p className="text-sm font-medium">{payment.reviewedBy}</p>
                          </div>
                        )}
                      </div>

                      {payment.notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> {payment.notes}
                          </p>
                        </div>
                      )}

                      {payment.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {payment.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {payment.fileUrl && (
                          <>
                            <button 
                              onClick={() => window.open(payment.fileUrl, '_blank')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Payment Slip
                            </button>
                            <a 
                              href={payment.fileUrl}
                              download={payment.fileName || 'payment-slip'}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </>
                        )}
                        <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          View User Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Payment Verification Guidelines</h4>
              <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                <li>Verify the transaction ID with the respective bank or payment provider</li>
                <li>Confirm the amount matches the booking/invoice amount</li>
                <li>Check if the payment was made from a verified account</li>
                <li>For bank transfers, verify the sender's account details</li>
                <li>Contact the user if any discrepancy is found before rejecting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
