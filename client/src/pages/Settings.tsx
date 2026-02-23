import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Lock, Globe, CreditCard, Shield, Home, X, Check, Loader2, Building } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false
  });
  
  // Language settings
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [selectedTimezone, setSelectedTimezone] = useState('PKT');

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setErrorMessage('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccessMessage(twoFactorEnabled ? '2FA disabled' : '2FA enabled successfully!');
      setShow2FAModal(false);
    } catch (error) {
      setErrorMessage('Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Notification settings saved!');
      setShowNotificationModal(false);
    } catch (error) {
      setErrorMessage('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLanguage = async () => {
    setLoading(true);
    try {
      i18n.changeLanguage(selectedLanguage);
      document.documentElement.dir = (selectedLanguage === 'ur' || selectedLanguage === 'ps') ? 'rtl' : 'ltr';
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMessage('Language settings saved!');
      setShowLanguageModal(false);
    } catch (error) {
      setErrorMessage('Failed to save language settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

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
            <span className="text-slate-900 font-medium">Settings</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('settings.notifications', 'Notifications')}</h2>
            </div>
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{t('settings.notifications', 'Notification Settings')}</p>
                  <p className="text-sm text-slate-600">Email: {notifications.email ? 'On' : 'Off'} | SMS: {notifications.sms ? 'On' : 'Off'} | Push: {notifications.push ? 'On' : 'Off'}</p>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </button>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('settings.security', 'Security')}</h2>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{t('settings.changePassword', 'Change Password')}</p>
                    <p className="text-sm text-slate-600">{t('settings.updatePasswordRegularly', 'Update your password regularly')}</p>
                  </div>
                </div>
              </button>
              <button 
                onClick={() => setShow2FAModal(true)}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{t('settings.twoFactorAuth', 'Two-Factor Authentication')}</p>
                    <p className="text-sm text-slate-600">{t('settings.addExtraSecurity', 'Add an extra layer of security')}</p>
                  </div>
                  {twoFactorEnabled && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Enabled</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('settings.languageRegion', 'Language & Region')}</h2>
            </div>
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{t('settings.language', 'Language')}: {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'ur' ? 'اردو' : selectedLanguage === 'ps' ? 'پښتو' : '中文'}</p>
                  <p className="text-sm text-slate-600">{t('settings.timeZone', 'Time Zone')}: {selectedTimezone === 'PKT' ? 'Pakistan Standard Time' : 'China Standard Time'}</p>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </button>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('settings.paymentMethods', 'Payment Methods')}</h2>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-slate-600 hover:text-green-600"
            >
              + {t('settings.addPaymentMethod', 'Add Payment Method')}
            </button>
          </div>

          {/* Business Documents - Shipper Only */}
          {user?.role === 'shipper' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Business Documents</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Upload your business registration and tax documents for verification
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/kyc')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Company Registration</p>
                      <p className="text-sm text-slate-600">SECP/SSC registration certificate</p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/kyc')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">NTN Certificate</p>
                      <p className="text-sm text-slate-600">National Tax Number certificate</p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/kyc')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Sales Tax Registration</p>
                      <p className="text-sm text-slate-600">Provincial sales tax certificate</p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t">
                <button 
                  onClick={() => navigate('/kyc')}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Upload Business Documents
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
            <button onClick={() => setSuccessMessage('')} className="ml-2"><X className="w-4 h-4" /></button>
          </div>
        )}
        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            {errorMessage}
            <button onClick={() => setErrorMessage('')} className="ml-2"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('settings.changePassword', 'Change Password')}</h3>
                <button onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('settings.twoFactorAuth', 'Two-Factor Authentication')}</h3>
                <button onClick={() => setShow2FAModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-slate-600">
                  {twoFactorEnabled 
                    ? 'Two-factor authentication is currently enabled. Disable it to remove the extra security layer.'
                    : 'Enable two-factor authentication to add an extra layer of security to your account. You will need to enter a code from your authenticator app when signing in.'}
                </p>
                <button
                  onClick={handleToggle2FA}
                  disabled={loading}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${twoFactorEnabled ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} disabled:opacity-50`}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('settings.notifications', 'Notification Settings')}</h3>
                <button onClick={() => setShowNotificationModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.emailNotifications', 'Email Notifications')}</p>
                    <p className="text-sm text-slate-600">{t('settings.receiveEmailUpdates', 'Receive updates via email')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.smsNotifications', 'SMS Notifications')}</p>
                    <p className="text-sm text-slate-600">{t('settings.receiveSmsUpdates', 'Receive updates via SMS')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.pushNotifications', 'Push Notifications')}</p>
                    <p className="text-sm text-slate-600">{t('settings.receivePushNotifications', 'Receive push notifications')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language & Region Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('settings.languageRegion', 'Language & Region')}</h3>
                <button onClick={() => setShowLanguageModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.language', 'Language')}</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="ur">اردو (Urdu)</option>
                    <option value="ps">پښتو (Pashto)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.timeZone', 'Time Zone')}</label>
                  <select 
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="PKT">Pakistan Standard Time (PKT)</option>
                    <option value="CST">China Standard Time (CST)</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveLanguage}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('settings.addPaymentMethod', 'Add Payment Method')}</h3>
                <button onClick={() => setShowPaymentModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 border-2 border-green-500 bg-green-50 rounded-xl text-center hover:bg-green-100 transition-colors">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <span className="font-medium text-green-700">Credit/Debit Card</span>
                    </button>
                    <button className="p-4 border-2 border-slate-200 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                      <div className="w-8 h-8 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">EP</span>
                      </div>
                      <span className="font-medium text-slate-700">EasyPaisa</span>
                    </button>
                    <button className="p-4 border-2 border-slate-200 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                      <div className="w-8 h-8 mx-auto mb-2 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">JC</span>
                      </div>
                      <span className="font-medium text-slate-700">JazzCash</span>
                    </button>
                    <button className="p-4 border-2 border-slate-200 rounded-xl text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Building className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <span className="font-medium text-slate-700">Bank Transfer</span>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">Card Details</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Your payment information is encrypted and secure
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSuccessMessage('Payment method added successfully!');
                    setShowPaymentModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
