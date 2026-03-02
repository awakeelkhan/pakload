import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoadPostingForm } from '../components/LoadPostingForm';
import { MarketRequestForm } from '../components/MarketRequestForm';
import { CarrierAvailabilityForm } from '../components/CarrierAvailabilityForm';
import { Package, ArrowLeft, Truck, Users, ShoppingBag, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PostLoad() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<'select' | 'post-load' | 'market-request' | 'carrier-availability'>('select');
  
  const isCarrier = user?.role === 'carrier';
  const isShipper = user?.role === 'shipper';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=/post-load');
    }
  }, [isAuthenticated, navigate]);

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
            {t('postLoad.selection.backToDashboard')}
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {isCarrier ? t('postLoad.selection.carrierTitle') : t('postLoad.selection.howCanWeHelp')}
            </h1>
            <p className="text-slate-600 text-lg">
              {isCarrier 
                ? t('postLoad.selection.carrierSubtitle')
                : t('postLoad.selection.chooseOption')}
            </p>
          </div>

          <div className={`grid grid-cols-1 ${isCarrier ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
            {/* Post Load Option - Only for Shippers and Admins */}
            {(isShipper || isAdmin) && (
              <button
                onClick={() => setMode('post-load')}
                className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                  <Truck className="w-7 h-7 text-green-600 group-hover:text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {t('postLoad.selection.postLoad')}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {t('postLoad.selection.postLoadDesc')}
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.selectEquipment')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.uploadImages')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.receiveBids')}
                  </li>
                </ul>
                <div className="mt-5 text-green-600 font-medium flex items-center gap-2">
                  {t('postLoad.selection.getStarted')} →
                </div>
              </button>
            )}

            {/* Carrier Availability Option - Only for Carriers */}
            {isCarrier && (
              <button
                onClick={() => setMode('carrier-availability')}
                className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                  <MapPin className="w-7 h-7 text-green-600 group-hover:text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {t('postLoad.selection.postAvailability')}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {t('postLoad.selection.postAvailabilityDesc')}
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.selectTruckType')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.setAvailableCity')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('postLoad.selection.getMatchedLoads')}
                  </li>
                </ul>
                <div className="mt-5 text-green-600 font-medium flex items-center gap-2">
                  {t('postLoad.selection.postAvailabilityBtn')} →
                </div>
              </button>
            )}

            {/* Market Request Option - For Shippers */}
            {(isShipper || isAdmin) && (
              <button
                onClick={() => setMode('market-request')}
                className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                  <Users className="w-7 h-7 text-blue-600 group-hover:text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {t('postLoad.selection.transportRequest')}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {t('postLoad.selection.transportRequestDesc')}
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.tellUsNeeds')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.teamFinds')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.weNegotiate')}
                  </li>
                </ul>
                <div className="mt-5 text-blue-600 font-medium flex items-center gap-2">
                  {t('postLoad.selection.submitRequest')} →
                </div>
              </button>
            )}

            {/* Carrier Service Request - For Carriers */}
            {isCarrier && (
              <button
                onClick={() => setMode('market-request')}
                className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                  <Users className="w-7 h-7 text-blue-600 group-hover:text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {t('postLoad.selection.requestLoadMatching')}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {t('postLoad.selection.requestLoadMatchingDesc')}
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.tellPreferredRoutes')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.teamMatchesShippers')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('postLoad.selection.getNotifiedLoads')}
                  </li>
                </ul>
                <div className="mt-5 text-blue-600 font-medium flex items-center gap-2">
                  {t('postLoad.selection.submitRequest')} →
                </div>
              </button>
            )}
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
            {t('postLoad.selection.backToOptions')}
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

  // Carrier Availability Form
  if (mode === 'carrier-availability') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setMode('select')}
            className="mb-6 text-slate-500 hover:text-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('postLoad.selection.backToOptions')}
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                Post Truck Availability
              </h1>
              <p className="text-slate-600 mt-2">
                Let shippers know your truck is available. They can contact you for loads.
              </p>
            </div>
            
            <CarrierAvailabilityForm 
              onSuccess={() => {
                navigate('/my-vehicles');
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
            {t('postLoad.selection.backToOptions')}
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
              onSuccess={() => {
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
