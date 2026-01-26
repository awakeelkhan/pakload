import { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileText, Check, X, AlertCircle, Clock } from 'lucide-react';

interface Document {
  id?: number;
  documentType: string;
  documentNumber?: string;
  documentUrl: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
}

interface DocumentUploadProps {
  documentType: string;
  label: string;
  description?: string;
  required?: boolean;
  existingDocument?: Document;
  onUpload: (file: File, metadata: { documentType: string; documentNumber?: string; issueDate?: string; expiryDate?: string }) => Promise<void>;
}

const documentTypeLabels: Record<string, string> = {
  nic_copy: 'National ID Card (CNIC)',
  driving_license_htv: 'HTV Driving License',
  company_registration: 'Company Registration / SSC Certificate',
  vehicle_registration: 'Vehicle Registration',
  insurance_certificate: 'Insurance Certificate',
  tir_carnet: 'TIR Carnet',
  customs_clearance: 'Customs Clearance Certificate',
  route_permit: 'Route Permit',
  fitness_certificate: 'Vehicle Fitness Certificate',
  tax_certificate: 'Tax Certificate (NTN)',
  other: 'Other Document',
};

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending Verification' },
  verified: { icon: Check, color: 'text-green-600', bg: 'bg-green-50', label: 'Verified' },
  rejected: { icon: X, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
  expired: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Expired' },
};

export function DocumentUpload({ 
  documentType, 
  label, 
  description, 
  required = false, 
  existingDocument,
  onUpload 
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentNumber, setDocumentNumber] = useState(existingDocument?.documentNumber || '');
  const [issueDate, setIssueDate] = useState(existingDocument?.issueDate || '');
  const [expiryDate, setExpiryDate] = useState(existingDocument?.expiryDate || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingDocument?.documentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await onUpload(selectedFile, {
        documentType,
        documentNumber: documentNumber || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const status = existingDocument?.status || 'pending';
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            {label || documentTypeLabels[documentType] || documentType}
            {required && <span className="text-red-500">*</span>}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {existingDocument && (
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig[status].bg} ${statusConfig[status].color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig[status].label}
          </span>
        )}
      </div>

      {existingDocument && existingDocument.status === 'verified' ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Document Verified</p>
            {existingDocument.documentNumber && (
              <p className="text-xs text-green-600">Number: {existingDocument.documentNumber}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div 
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
            />
            {previewUrl ? (
              <div className="space-y-2">
                {previewUrl.includes('.pdf') ? (
                  <FileText className="h-12 w-12 mx-auto text-red-500" />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-24 mx-auto object-contain rounded"
                  />
                )}
                <p className="text-xs text-gray-500">Click to change file</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 12345-1234567-1"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Issue Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {selectedFile && (
            <button
              className="w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface RequiredDocumentsProps {
  role: 'carrier' | 'driver' | 'shipper' | 'broker';
  existingDocuments?: Document[];
  onUpload: (file: File, metadata: { documentType: string; documentNumber?: string; issueDate?: string; expiryDate?: string }) => Promise<void>;
}

const requiredDocumentsByRole: Record<string, { type: string; label: string; description: string }[]> = {
  carrier: [
    { type: 'company_registration', label: 'Company Registration', description: 'SSC or company registration certificate' },
    { type: 'nic_copy', label: 'Owner CNIC', description: 'National ID card of company owner' },
    { type: 'tax_certificate', label: 'NTN Certificate', description: 'National Tax Number certificate' },
    { type: 'insurance_certificate', label: 'Insurance', description: 'Vehicle/cargo insurance certificate' },
  ],
  driver: [
    { type: 'nic_copy', label: 'CNIC Copy', description: 'Your National ID card' },
    { type: 'driving_license_htv', label: 'HTV License', description: 'Heavy Transport Vehicle driving license' },
  ],
  shipper: [
    { type: 'company_registration', label: 'Company Registration', description: 'Business registration certificate' },
    { type: 'nic_copy', label: 'Owner CNIC', description: 'National ID card of company owner' },
    { type: 'tax_certificate', label: 'NTN Certificate', description: 'National Tax Number certificate (optional)' },
  ],
  broker: [
    { type: 'company_registration', label: 'Company Registration', description: 'Brokerage license or registration' },
    { type: 'nic_copy', label: 'Owner CNIC', description: 'National ID card' },
    { type: 'tax_certificate', label: 'NTN Certificate', description: 'National Tax Number certificate' },
  ],
};

export function RequiredDocuments({ role, existingDocuments = [], onUpload }: RequiredDocumentsProps) {
  const requiredDocs = requiredDocumentsByRole[role] || [];
  
  const getExistingDoc = (type: string) => {
    return existingDocuments.find(d => d.documentType === type);
  };

  const verifiedCount = existingDocuments.filter(d => d.status === 'verified').length;
  const progress = requiredDocs.length > 0 ? (verifiedCount / requiredDocs.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Required Documents</h3>
        <span className="text-sm text-gray-500">
          {verifiedCount} of {requiredDocs.length} verified
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {requiredDocs.map((doc) => (
          <DocumentUpload
            key={doc.type}
            documentType={doc.type}
            label={doc.label}
            description={doc.description}
            required={true}
            existingDocument={getExistingDoc(doc.type)}
            onUpload={onUpload}
          />
        ))}
      </div>
    </div>
  );
}

export default DocumentUpload;
