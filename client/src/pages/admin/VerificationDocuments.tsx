import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  FileText, ArrowLeft, Search, Filter, CheckCircle, XCircle, Clock, 
  Eye, Download, User, Truck, Building, CreditCard, AlertTriangle,
  ChevronDown, ChevronUp, Shield, Calendar, MapPin
} from 'lucide-react';

interface VerificationDocument {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: 'carrier' | 'shipper';
  documentType: string;
  documentName: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
}

interface ComplianceItem {
  id: number;
  category: string;
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  dueDate?: string;
  lastChecked: string;
}

export default function VerificationDocuments() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'compliance'>('documents');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'carrier' | 'shipper'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch real documents from API
      const docsResponse = await fetch('/api/documents/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        // Transform API data to match interface
        const transformedDocs: VerificationDocument[] = (docsData || []).map((doc: any) => ({
          id: doc.id,
          userId: doc.userId,
          userName: doc.userName || `User #${doc.userId}`,
          userEmail: doc.userEmail || '',
          userRole: doc.userRole || 'carrier',
          documentType: doc.documentType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Document',
          documentName: doc.documentUrl?.split('/').pop() || 'document.pdf',
          status: doc.status || 'pending',
          submittedAt: doc.createdAt || new Date().toISOString(),
          reviewedAt: doc.verifiedAt,
          reviewedBy: doc.verifiedBy ? `Admin #${doc.verifiedBy}` : undefined,
          rejectionReason: doc.rejectionReason,
          fileUrl: doc.documentUrl,
        }));
        setDocuments(transformedDocs);
      } else {
        // Fallback to empty array if API fails
        setDocuments([]);
      }

      // Static compliance items (these would typically come from a config)
      const complianceData: ComplianceItem[] = [
        {
          id: 1,
          category: 'Data Protection',
          title: 'GDPR Compliance',
          description: 'User data handling and privacy policy compliance',
          status: 'compliant',
          lastChecked: new Date().toISOString().split('T')[0],
        },
        {
          id: 2,
          category: 'Transport Regulations',
          title: 'NHA Transport License',
          description: 'National Highway Authority transport license renewal',
          status: 'compliant',
          dueDate: '2025-12-31',
          lastChecked: new Date().toISOString().split('T')[0],
        },
        {
          id: 3,
          category: 'Financial',
          title: 'FBR Tax Registration',
          description: 'Federal Board of Revenue tax compliance',
          status: 'compliant',
          lastChecked: new Date().toISOString().split('T')[0],
        },
      ];
      setComplianceItems(complianceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/documents/${docId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'verified' })
      });
      
      if (response.ok) {
        setDocuments(docs => docs.map(d => 
          d.id === docId ? { ...d, status: 'verified' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin' } : d
        ));
        alert('Document verified successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to verify document');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      alert('Failed to verify document');
    }
  };

  const handleReject = async (docId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/documents/${docId}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
        });
        
        if (response.ok) {
          setDocuments(docs => docs.map(d => 
            d.id === docId ? { ...d, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewedBy: 'Admin', rejectionReason: reason } : d
          ));
          alert('Document rejected.');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to reject document');
        }
      } catch (error) {
        console.error('Error rejecting document:', error);
        alert('Failed to reject document');
      }
    }
  };
  
  const handleViewDocument = (doc: VerificationDocument) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert('Document URL not available');
    }
  };
  
  const handleDownloadDocument = (doc: VerificationDocument) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Document URL not available');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (filterRole !== 'all' && doc.userRole !== filterRole) return false;
    if (searchQuery && !doc.userName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !doc.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'pending_review':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected':
      case 'non_compliant':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_review':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'NIC / CNIC':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Driving License':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'Company Registration':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'Vehicle Registration':
        return <Truck className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

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
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Verification & Compliance</h1>
                <p className="text-slate-600">Review user documents and manage compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
            <div className="text-sm text-slate-600">Total Documents</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50">
            <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
            <div className="text-sm text-amber-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
            <div className="text-2xl font-bold text-green-700">{verifiedCount}</div>
            <div className="text-sm text-green-600">Verified</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="text-2xl font-bold text-red-700">{rejectedCount}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            User Documents
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Platform Compliance
          </button>
        </div>

        {activeTab === 'documents' ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  <option value="carrier">Carriers</option>
                  <option value="shipper">Shippers</option>
                </select>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No documents found</div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="hover:bg-slate-50">
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              {getDocTypeIcon(doc.documentType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-slate-900">{doc.documentType}</h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(doc.status)}`}>
                                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                <User className="w-4 h-4" />
                                <span>{doc.userName}</span>
                                <span className="text-slate-400">•</span>
                                <span className={`px-1.5 py-0.5 text-xs rounded ${doc.userRole === 'carrier' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                  {doc.userRole}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Submitted: {new Date(doc.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.status === 'pending' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleVerify(doc.id); }}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReject(doc.id); }}
                                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {expandedDoc === doc.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      {expandedDoc === doc.id && (
                        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                            <div>
                              <p className="text-xs text-slate-500">File Name</p>
                              <p className="text-sm font-medium">{doc.documentName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">User Email</p>
                              <p className="text-sm font-medium">{doc.userEmail}</p>
                            </div>
                            {doc.reviewedAt && (
                              <div>
                                <p className="text-xs text-slate-500">Reviewed At</p>
                                <p className="text-sm font-medium">{new Date(doc.reviewedAt).toLocaleDateString()}</p>
                              </div>
                            )}
                            {doc.reviewedBy && (
                              <div>
                                <p className="text-xs text-slate-500">Reviewed By</p>
                                <p className="text-sm font-medium">{doc.reviewedBy}</p>
                              </div>
                            )}
                          </div>
                          {doc.rejectionReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {doc.rejectionReason}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleViewDocument(doc); }}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Document
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc); }}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* Compliance Tab */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Platform Compliance Status</h3>
              <p className="text-sm text-slate-600">Monitor regulatory and legal compliance requirements</p>
            </div>
            <div className="divide-y divide-slate-200">
              {complianceItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">{item.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                            {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last checked: {item.lastChecked}
                          </span>
                          {item.dueDate && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="w-3 h-3" />
                              Due: {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
