import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  Shield, Upload, Check, X, AlertCircle, FileText, Camera, 
  Building, User, CreditCard, Truck, Clock, CheckCircle,
  ChevronRight, Loader2, Eye, Download, RefreshCw
} from 'lucide-react';

interface Document {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploadedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  file?: File;
  preview?: string;
}

const DOCUMENT_TYPES = {
  shipper: [
    { id: 'cnic_front', name: 'CNIC (Front)', required: true, description: 'Clear photo of your CNIC front side' },
    { id: 'cnic_back', name: 'CNIC (Back)', required: true, description: 'Clear photo of your CNIC back side' },
    { id: 'company_registration', name: 'Company Registration', required: false, description: 'SECP/SSC registration certificate' },
    { id: 'ntn_certificate', name: 'NTN Certificate', required: false, description: 'National Tax Number certificate' },
    { id: 'address_proof', name: 'Address Proof', required: true, description: 'Utility bill or bank statement' },
  ],
  carrier: [
    { id: 'cnic_front', name: 'CNIC (Front)', required: true, description: 'Clear photo of your CNIC front side' },
    { id: 'cnic_back', name: 'CNIC (Back)', required: true, description: 'Clear photo of your CNIC back side' },
    { id: 'driving_license', name: 'HTV Driving License', required: true, description: 'Valid heavy transport vehicle license' },
    { id: 'company_registration', name: 'Company Registration', required: false, description: 'SECP/SSC registration certificate' },
    { id: 'ntn_certificate', name: 'NTN Certificate', required: false, description: 'National Tax Number certificate' },
    { id: 'vehicle_registration', name: 'Vehicle Registration', required: true, description: 'Vehicle registration book' },
    { id: 'fitness_certificate', name: 'Fitness Certificate', required: true, description: 'Valid vehicle fitness certificate' },
    { id: 'insurance', name: 'Insurance Certificate', required: true, description: 'Comprehensive vehicle insurance' },
    { id: 'route_permit', name: 'Route Permit', required: false, description: 'Provincial route permit if applicable' },
  ],
};

export default function KYC() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!user) {
    return null;
  }

  const role = user.role as 'shipper' | 'carrier';
  const requiredDocs = DOCUMENT_TYPES[role] || DOCUMENT_TYPES.shipper;

  const getDocumentStatus = (docId: string): Document | undefined => {
    return documents.find(d => d.type === docId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(docType);

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        type: docType,
        name: file.name,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        file,
        preview: reader.result as string,
      };

      setDocuments(prev => {
        const filtered = prev.filter(d => d.type !== docType);
        return [...filtered, newDoc];
      });
      setUploading(null);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = (docType: string) => {
    setSelectedDocType(docType);
    fileInputRef.current?.click();
  };

  const removeDocument = (docType: string) => {
    setDocuments(prev => prev.filter(d => d.type !== docType));
  };

  const getVerificationProgress = () => {
    const required = requiredDocs.filter(d => d.required);
    const uploaded = required.filter(d => getDocumentStatus(d.id));
    return Math.round((uploaded.length / required.length) * 100);
  };

  const handleSubmitVerification = async () => {
    setSubmitting(true);
    try {
      // Upload documents to server
      const token = localStorage.getItem('access_token');
      
      for (const doc of documents) {
        if (doc.file) {
          // First upload the file
          const formData = new FormData();
          formData.append('image', doc.file);
          
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            
            // Then create the document record
            await fetch('/api/documents/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                documentType: doc.type,
                documentUrl: uploadData.url,
              }),
            });
          }
        }
      }
      
      // Update all pending documents to show they're under review
      setDocuments(prev => prev.map(d => ({
        ...d,
        status: 'pending' as const,
      })));

      setShowSuccessModal(true);
    } catch (error) {
      alert('Failed to submit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = getVerificationProgress();
  const allRequiredUploaded = requiredDocs.filter(d => d.required).every(d => getDocumentStatus(d.id));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Documents Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Your documents have been submitted for verification. Our team will review them within 24-48 hours. 
              You'll receive a notification once the verification is complete.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Our team reviews your documents</li>
                    <li>You'll get a notification with the result</li>
                    <li>Once verified, you can access all features</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>
              <p className="text-slate-600">Complete your identity verification to unlock all features</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Verification Progress</h2>
              <p className="text-sm text-slate-500">Upload all required documents to complete verification</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{progress}%</div>
              <div className="text-sm text-slate-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${user.verified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                {user.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-medium text-slate-900">Identity</span>
              </div>
              <p className="text-sm text-slate-600">
                {user.verified ? 'Verified' : 'Pending verification'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Business</span>
              </div>
              <p className="text-sm text-slate-600">
                {role === 'carrier' ? 'Carrier Account' : 'Shipper Account'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Payment</span>
              </div>
              <p className="text-sm text-slate-600">Not configured</p>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Required Documents</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => selectedDocType && handleFileSelect(e, selectedDocType)}
            className="hidden"
          />

          <div className="space-y-4">
            {requiredDocs.map((doc) => {
              const uploaded = getDocumentStatus(doc.id);
              const isUploading = uploading === doc.id;

              return (
                <div 
                  key={doc.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    uploaded 
                      ? uploaded.status === 'verified' 
                        ? 'border-green-200 bg-green-50'
                        : uploaded.status === 'rejected'
                        ? 'border-red-200 bg-red-50'
                        : 'border-blue-200 bg-blue-50'
                      : 'border-dashed border-slate-300 hover:border-green-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        uploaded 
                          ? uploaded.status === 'verified'
                            ? 'bg-green-100'
                            : uploaded.status === 'rejected'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                          : 'bg-slate-100'
                      }`}>
                        {uploaded ? (
                          uploaded.status === 'verified' ? (
                            <Check className="w-6 h-6 text-green-600" />
                          ) : uploaded.status === 'rejected' ? (
                            <X className="w-6 h-6 text-red-600" />
                          ) : (
                            <Clock className="w-6 h-6 text-blue-600" />
                          )
                        ) : (
                          <FileText className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{doc.name}</h3>
                          {doc.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                        {uploaded && (
                          <div className="mt-2">
                            <span className={`text-xs font-medium ${
                              uploaded.status === 'verified' ? 'text-green-600' :
                              uploaded.status === 'rejected' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {uploaded.status === 'verified' ? '✓ Verified' :
                               uploaded.status === 'rejected' ? '✗ Rejected' :
                               '⏳ Under Review'}
                            </span>
                            {uploaded.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">Reason: {uploaded.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploaded?.preview && (
                        <button
                          onClick={() => window.open(uploaded.preview, '_blank')}
                          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {uploaded && uploaded.status !== 'verified' && (
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {!uploaded || uploaded.status === 'rejected' ? (
                        <button
                          onClick={() => handleUploadClick(doc.id)}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploaded ? 'Re-upload' : 'Upload'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {allRequiredUploaded 
                    ? '✓ All required documents uploaded'
                    : `${requiredDocs.filter(d => d.required && !getDocumentStatus(d.id)).length} required documents remaining`
                  }
                </p>
              </div>
              <button
                onClick={handleSubmitVerification}
                disabled={!allRequiredUploaded || submitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Verification Timeline</h3>
              <p className="text-sm text-blue-700 mt-1">
                Documents are typically reviewed within 24-48 hours. You'll receive a notification once your verification is complete.
                Make sure all documents are clear and readable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
