import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { CreditCard, ArrowLeft, History, CheckCircle, Clock, XCircle, Upload, FileText, X } from 'lucide-react';
import PaymentOptions from '../components/PaymentOptions';

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'pay' | 'history' | 'upload'>('pay');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [transactionRef, setTransactionRef] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof || !transactionRef) {
      alert('Please select a file and enter transaction reference');
      return;
    }

    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', paymentProof);
      formData.append('transactionRef', transactionRef);
      formData.append('type', 'payment_proof');

      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        setPaymentProof(null);
        setTransactionRef('');
        alert('Payment proof uploaded successfully! Admin will verify and confirm your payment.');
      } else {
        setUploadStatus('error');
        alert('Failed to upload payment proof. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      alert('Failed to upload payment proof. Please try again.');
    }
  };

  // Mock payment history
  const paymentHistory = [
    {
      id: 'TXN-2024-001',
      date: '2024-01-20',
      amount: 125000,
      method: 'Bank Transfer - HBL',
      status: 'completed',
      description: 'Load Booking #LP-2024-00123',
    },
    {
      id: 'TXN-2024-002',
      date: '2024-01-18',
      amount: 85000,
      method: 'EasyPaisa',
      status: 'pending',
      description: 'Load Booking #LP-2024-00118',
    },
    {
      id: 'TXN-2024-003',
      date: '2024-01-15',
      amount: 200000,
      method: 'JazzCash',
      status: 'completed',
      description: 'Load Booking #LP-2024-00105',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
              <p className="text-slate-600">Manage your payments and view transaction history</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pay')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pay'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Make Payment
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Proof
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            Payment History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pay' ? (
          <PaymentOptions
            onPaymentConfirm={(method, transactionId) => {
              console.log('Payment confirmed:', method, transactionId);
            }}
          />
        ) : activeTab === 'upload' ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Upload Payment Proof
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              After making a bank transfer or mobile wallet payment, upload your payment receipt or screenshot here for verification.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Transaction Reference / ID
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Proof (Receipt/Screenshot)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  {paymentProof ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-6 h-6 text-green-600" />
                      <span className="text-slate-900 font-medium">{paymentProof.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentProof(null);
                        }}
                        className="ml-2 p-1 hover:bg-slate-200 rounded"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleUploadProof}
                disabled={uploadStatus === 'uploading' || !paymentProof || !transactionRef}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  uploadStatus === 'uploading' || !paymentProof || !transactionRef
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Submit Payment Proof'}
              </button>

              {uploadStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Payment proof uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Transaction History</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium text-slate-900">{payment.description}</p>
                        <p className="text-sm text-slate-600">{payment.method}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {payment.date} • ID: {payment.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">PKR {payment.amount.toLocaleString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 p-4 bg-slate-100 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Need Help?</h4>
          <p className="text-sm text-slate-600">
            For payment-related queries, contact our support team at{' '}
            <a href="mailto:payments@pakload.com" className="text-green-600 hover:underline">
              payments@pakload.com
            </a>{' '}
            or call{' '}
            <a href="tel:+923001234567" className="text-green-600 hover:underline">
              +92 300 1234567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
