import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  Shield, CheckCircle, XCircle, Clock, Eye, Download, 
  User, FileText, RefreshCw, Search, Filter, ArrowLeft
} from 'lucide-react';

interface KYCSubmission {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function AdminKYCReview() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/documents/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.documents || []);
      } else {
        // Use mock data if API fails
        setSubmissions([
          {
            id: 1,
            userId: 101,
            userName: 'Ahmad Khan',
            userEmail: 'ahmad@example.com',
            userRole: 'carrier',
            documentType: 'cnic_front',
            documentName: 'CNIC Front',
            fileUrl: '/uploads/documents/cnic-front-1.jpg',
            status: 'pending',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            userId: 101,
            userName: 'Ahmad Khan',
            userEmail: 'ahmad@example.com',
            userRole: 'carrier',
            documentType: 'driving_license',
            documentName: 'HTV Driving License',
            fileUrl: '/uploads/documents/license-1.jpg',
            status: 'pending',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            userId: 102,
            userName: 'Fatima Bibi',
            userEmail: 'fatima@example.com',
            userRole: 'shipper',
            documentType: 'company_registration',
            documentName: 'Company Registration',
            fileUrl: '/uploads/documents/company-reg-1.pdf',
            status: 'pending',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/documents/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId ? { ...s, status: 'approved' as const, reviewedAt: new Date().toISOString() } : s
        ));
        alert('Document approved successfully');
      } else {
        alert('Failed to approve document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document');
    }
  };

  const handleReject = async (submissionId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/documents/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId ? { ...s, status: 'rejected' as const, rejectionReason, reviewedAt: new Date().toISOString() } : s
        ));
        setRejectionReason('');
        setSelectedSubmission(null);
        alert('Document rejected');
      } else {
        alert('Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document');
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        s.userName.toLowerCase().includes(query) ||
        s.userEmail.toLowerCase().includes(query) ||
        s.documentName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading KYC submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">KYC Review</h1>
              <p className="text-slate-600">Review and verify user documents</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-amber-600">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-slate-500">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-sm text-slate-500">Approved</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => s.status === 'rejected').length}
            </div>
            <div className="text-sm text-slate-500">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
            <button
              onClick={fetchSubmissions}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No submissions found</h3>
              <p className="text-slate-500">
                {filter === 'pending' ? 'No pending KYC documents to review' : 'No documents match your filters'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{submission.userName}</h3>
                      <p className="text-sm text-slate-500">{submission.userEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {submission.userRole}
                        </span>
                        <span className="text-xs text-slate-500">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{submission.documentName}</p>
                        <p className="text-xs text-slate-500">{submission.documentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Document"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      <a
                        href={submission.fileUrl}
                        download
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {submission.status === 'pending' && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(submission.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {submission.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {submission.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Rejection Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Document</h3>
              <p className="text-sm text-slate-600 mb-4">
                Please provide a reason for rejecting this document. The user will be notified.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
