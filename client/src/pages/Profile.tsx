import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { User, Mail, Phone, Building, Star, Calendar, MapPin, Edit2, Shield, Award, Home, X, Save, Lock, Loader2, FileText, Upload, CheckCircle, Clock, AlertCircle, CreditCard, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function Profile() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [, navigate] = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
  });

  // Carrier verification documents state
  const [verificationDocs, setVerificationDocs] = useState<{
    nic: { file: File | null; preview: string; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
    license: { file: File | null; preview: string; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
    companyReg: { file: File | null; preview: string; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
    vehicleReg: { file: File | null; preview: string; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
  }>({
    nic: { file: null, preview: '', status: 'pending' },
    license: { file: null, preview: '', status: 'pending' },
    companyReg: { file: null, preview: '', status: 'pending' },
    vehicleReg: { file: null, preview: '', status: 'pending' },
  });
  const [businessLocation, setBusinessLocation] = useState('');
  const [savingDocs, setSavingDocs] = useState(false);

  const handleDocUpload = (docType: 'nic' | 'license' | 'companyReg' | 'vehicleReg', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File size must be less than 5MB');
      return;
    }
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      addToast('error', 'Only PDF, JPG, and PNG files are allowed');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setVerificationDocs(prev => ({
        ...prev,
        [docType]: { file, preview: reader.result as string, status: 'uploaded' }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocuments = async () => {
    setSavingDocs(true);
    try {
      // In a real app, upload files to server
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast('success', 'Documents submitted for verification. Admin will review within 24-48 hours.');
    } catch (error) {
      addToast('error', 'Failed to save documents');
    } finally {
      setSavingDocs(false);
    }
  };
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin?redirect=/profile');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        if (updateUser) {
          updateUser(updatedUser);
        }
        addToast('success', 'Profile updated successfully!');
        setShowEditModal(false);
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Failed to update profile');
      }
    } catch (error) {
      addToast('error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      addToast('error', 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (response.ok) {
        addToast('success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        addToast('error', error.error || 'Failed to change password');
      }
    } catch (error) {
      addToast('error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Profile</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account information</p>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-slate-600 mt-1">{user.companyName || 'No company'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'shipper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="font-medium text-slate-900">{user.phone}</p>
                </div>
              </div>
              {user.companyName && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Building className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Company</p>
                    <p className="font-medium text-slate-900">{user.companyName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-600">Rating</span>
                </div>
                <span className="font-semibold text-slate-900">4.8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Completed</span>
                </div>
                <span className="font-semibold text-slate-900">156</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-600">Member Since</span>
                </div>
                <span className="font-semibold text-slate-900">2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Security</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-slate-900">Change Password</p>
                <p className="text-sm text-slate-600 mt-1">Update your password regularly</p>
              </button>
              <button 
                onClick={() => addToast('info', 'Two-Factor Authentication will be available soon.')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-600 mt-1">Add an extra layer of security</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Preferences</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-slate-900">Notification Settings</p>
                <p className="text-sm text-slate-600 mt-1">Manage email and SMS alerts</p>
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-slate-900">Language & Region</p>
                <p className="text-sm text-slate-600 mt-1">English (Pakistan)</p>
              </button>
            </div>
          </div>
        </div>

        {/* Verification Documents Section - For Carriers */}
        {user.role === 'carrier' && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Verification Documents
                </h2>
                <p className="text-sm text-slate-600 mt-1">Upload your documents for KYC verification</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Verification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIC / CNIC - Required for Pakistan */}
              <div className={`border rounded-lg p-4 transition-colors ${verificationDocs.nic.status === 'uploaded' ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">NIC / CNIC</h3>
                      <p className="text-xs text-slate-500">National Identity Card (Pakistan)</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">Required</span>
                </div>
                <label className="block">
                  {verificationDocs.nic.status === 'uploaded' ? (
                    <div className="border-2 border-green-300 rounded-lg p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Document Uploaded</p>
                      <p className="text-xs text-green-600 mt-1">{verificationDocs.nic.file?.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or JPG (max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocUpload('nic', e)} />
                </label>
              </div>

              {/* Driving License - Required */}
              <div className={`border rounded-lg p-4 transition-colors ${verificationDocs.license.status === 'uploaded' ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Driving License</h3>
                      <p className="text-xs text-slate-500">Valid commercial driving license</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">Required</span>
                </div>
                <label className="block">
                  {verificationDocs.license.status === 'uploaded' ? (
                    <div className="border-2 border-green-300 rounded-lg p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Document Uploaded</p>
                      <p className="text-xs text-green-600 mt-1">{verificationDocs.license.file?.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or JPG (max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocUpload('license', e)} />
                </label>
              </div>

              {/* Vehicle Registration - Required */}
              <div className={`border rounded-lg p-4 transition-colors ${verificationDocs.vehicleReg.status === 'uploaded' ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Vehicle Registration</h3>
                      <p className="text-xs text-slate-500">Vehicle registration certificate</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">Required</span>
                </div>
                <label className="block">
                  {verificationDocs.vehicleReg.status === 'uploaded' ? (
                    <div className="border-2 border-green-300 rounded-lg p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Document Uploaded</p>
                      <p className="text-xs text-green-600 mt-1">{verificationDocs.vehicleReg.file?.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or JPG (max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocUpload('vehicleReg', e)} />
                </label>
              </div>

              {/* Company Registration - Optional */}
              <div className={`border rounded-lg p-4 transition-colors ${verificationDocs.companyReg.status === 'uploaded' ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Company Registration</h3>
                      <p className="text-xs text-slate-500">NTN / Business registration (if applicable)</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">Optional</span>
                </div>
                <label className="block">
                  {verificationDocs.companyReg.status === 'uploaded' ? (
                    <div className="border-2 border-green-300 rounded-lg p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Document Uploaded</p>
                      <p className="text-xs text-green-600 mt-1">{verificationDocs.companyReg.file?.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or JPG (max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocUpload('companyReg', e)} />
                </label>
              </div>

              {/* Pin Location - Optional */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-green-300 transition-colors md:col-span-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Business Location</h3>
                      <p className="text-xs text-slate-500">Pin your office/yard location for verification</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">Optional</span>
                </div>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="Paste Google Maps link or GPS coordinates"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            {/* Required Documents Notice */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Required Documents for Pakistan/China Routes</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    To operate on CPEC routes, you must upload: NIC/CNIC, Driving License, and Vehicle Registration.
                    Company Registration is optional but recommended for business accounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSaveDocuments}
                disabled={savingDocs}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingDocs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
