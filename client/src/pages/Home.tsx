import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MapPin, Truck, ShieldCheck, TrendingUp, Package, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    activeLoads: 156,
    availableTrucks: 342,
    inTransit: 89,
    completed: 2847,
    verifiedCarriers: 500,
    totalLoads: 10000,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            activeLoads: data.activeLoads || 156,
            availableTrucks: data.availableTrucks || 342,
            inTransit: data.inTransit || 89,
            completed: data.completed || 2847,
            verifiedCarriers: data.verifiedCarriers || 500,
            totalLoads: data.totalLoads || 10000,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* Hero Section with Dark Background */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {t('home.hero.title')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                {t('home.hero.subtitle')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
                <button onClick={() => navigate('/signup')} className="group inline-flex items-center px-10 h-16 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105">
                  <Sparkles className="mr-2 w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {t('header.getStartedFree', 'Get Started Free')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/signin')} className="inline-flex items-center px-10 h-16 text-lg font-semibold bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white rounded-xl transition-all transform hover:scale-105">
                  {t('header.signIn', 'Sign In')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
                <button onClick={() => navigate('/post-load')} className="inline-flex items-center px-8 h-14 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-xl transition-colors">
                  <Package className="mr-2 w-5 h-5" />
                  {t('home.hero.postLoad')}
                </button>
                <button onClick={() => navigate('/loads')} className="inline-flex items-center px-8 h-14 text-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg transition-colors">
                  <Truck className="mr-2 w-5 h-5" />
                  {t('nav.findLoads', 'Find Loads')}
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stats.verifiedCarriers}+</div>
                <div className="text-sm text-slate-400 mt-1">{t('home.stats.verifiedCarriers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalLoads.toLocaleString()}+</div>
                <div className="text-sm text-slate-400 mt-1">{t('home.stats.loadsMoved')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">25+</div>
                <div className="text-sm text-slate-400 mt-1">{t('home.stats.activeRoutes')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stats.inTransit}</div>
                <div className="text-sm text-slate-400 mt-1">{t('home.stats.inTransit')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      {!isAuthenticated && (
        <section className="py-8 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{t('home.trustBadges.freeToJoin', 'Free to Join')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{t('home.trustBadges.verifiedCarriers', '500+ Verified Carriers')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{t('home.trustBadges.realTimeTracking', 'Real-time Tracking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{t('home.trustBadges.securePayments', 'Secure Payments')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.activeLoads}</div>
                <div className="text-sm text-slate-600">{t('home.stats.activeLoads')}</div>
                <div className="text-xs text-green-600">+12 {t('home.stats.today')}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.availableTrucks}</div>
                <div className="text-sm text-slate-600">{t('home.stats.availableTrucks')}</div>
                <div className="text-xs text-blue-600">+26 {t('home.stats.thisWeek')}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.inTransit}</div>
                <div className="text-sm text-slate-600">{t('home.stats.inTransit')}</div>
                <div className="text-xs text-amber-600">{t('home.stats.liveTracking')}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.completed.toLocaleString()}</div>
                <div className="text-sm text-slate-600">{t('home.stats.completed')}</div>
                <div className="text-xs text-purple-600">{t('home.stats.thisMonth')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('home.features.title')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: t('home.features.verifiedCarriers'),
                desc: t('home.features.verifiedCarriersDesc'),
              },
              {
                icon: TrendingUp,
                title: t('home.features.quickResponses'),
                desc: t('home.features.quickResponsesDesc'),
              },
              {
                icon: Package,
                title: t('home.features.secureTransactions'),
                desc: t('home.features.secureTransactionsDesc'),
              },
              {
                icon: MapPin,
                title: t('home.features.trackEverything'),
                desc: t('home.features.trackEverythingDesc'),
              },
              {
                icon: Truck,
                title: t('home.features.routeOptimization'),
                desc: t('home.features.routeOptimizationDesc'),
              },
              {
                icon: ArrowRight,
                title: t('home.features.fastMatching'),
                desc: t('home.features.fastMatchingDesc'),
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-green-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="inline-flex items-center px-8 h-14 text-lg bg-white text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              {t('home.cta.signUp')} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/loads')}
              className="inline-flex items-center px-8 h-14 text-lg border border-white text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {t('home.hero.browseLoads')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
