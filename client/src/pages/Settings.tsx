import { useAuth } from '../contexts/AuthContext';
import { Bell, Lock, Globe, CreditCard, Shield, Mail, Phone, User, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-600">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">SMS Notifications</p>
                  <p className="text-sm text-slate-600">Receive updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-600">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Change Password</p>
                    <p className="text-sm text-slate-600">Update your password regularly</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600">Add an extra layer of security</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>English</option>
                  <option>Urdu</option>
                  <option>Chinese (Simplified)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>Pakistan Standard Time (PKT)</option>
                  <option>China Standard Time (CST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Payment Methods</h2>
            </div>
            <button className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-slate-600 hover:text-green-600">
              + Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
