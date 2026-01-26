import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { LoadPostingForm } from '../components/LoadPostingForm';
import { MarketRequestForm } from '../components/MarketRequestForm';
import { Package, ArrowLeft, Truck, Users, ShoppingBag } from 'lucide-react';

export default function PostLoad() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'select' | 'post-load' | 'market-request'>('select');

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-slate-500 hover:text-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              How can we help you today?
            </h1>
            <p className="text-slate-600 text-lg">
              Choose the option that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post Load Option */}
            <button
              onClick={() => setMode('post-load')}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                <Truck className="w-7 h-7 text-green-600 group-hover:text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Post a Load
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                I have cargo ready and want carriers to bid on it
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Select equipment type (20ft, 40ft, flatbed)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Upload product images & documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Receive bids from verified carriers
                </li>
              </ul>
              <div className="mt-5 text-green-600 font-medium flex items-center gap-2">
                Get Started →
              </div>
            </button>

            {/* Market Request Option */}
            <button
              onClick={() => setMode('market-request')}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Users className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Submit a Request
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                I need help finding the best transport option
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Tell us what you need transported
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Our team finds the best options
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  We negotiate on your behalf
                </li>
              </ul>
              <div className="mt-5 text-blue-600 font-medium flex items-center gap-2">
                Submit Request →
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Post Load Form
  if (mode === 'post-load') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setMode('select')}
            className="mb-6 text-slate-500 hover:text-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to options
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                Post a New Load
              </h1>
              <p className="text-slate-600 mt-2">
                Fill in the details below. Carriers will be able to view and bid on your load.
              </p>
            </div>
            
            <LoadPostingForm 
              onSuccess={(load) => {
                navigate('/loads');
              }}
              onCancel={() => setMode('select')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Market Request Form
  if (mode === 'market-request') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setMode('select')}
            className="mb-6 text-slate-500 hover:text-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to options
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                Submit a Market Request
              </h1>
              <p className="text-slate-600 mt-2">
                Tell us what you need and our team will find the best carriers for you.
              </p>
            </div>
            
            <MarketRequestForm 
              onSuccess={(request) => {
                navigate('/dashboard');
              }}
              onCancel={() => setMode('select')}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
