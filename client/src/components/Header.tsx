import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, User, LogOut, Package, Truck, Settings, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
    document.documentElement.dir = code === 'ur' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { path: '/loads', label: t('nav.findLoads') },
    { path: '/post-load', label: t('nav.postLoad') },
    { path: '/trucks', label: t('nav.findTrucks') },
    { path: '/routes', label: t('nav.routes') },
    { path: '/track', label: t('nav.trackShipment') },
    { path: '/help', label: 'Help' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LP</span>
            </div>
            <span className="text-xl font-bold text-slate-900">LoadPak</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Auth Buttons - Not Logged In */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </>
            ) : (
              /* User Menu - Logged In */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:inline">{user?.firstName || user?.email}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                        {user?.role}
                      </span>
                    </div>
                    {user?.role === 'admin' ? (
                      <>
                        <button onClick={() => { navigate('/dashboard'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Package className="w-4 h-4" />
                          Admin Dashboard
                        </button>
                        <button onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Settings className="w-4 h-4" />
                          Admin Settings
                        </button>
                        <button onClick={() => { navigate('/help'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <HelpCircle className="w-4 h-4" />
                          Help Center
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { navigate('/profile'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        <button onClick={() => { navigate('/bookings'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Package className="w-4 h-4" />
                          My Bookings
                        </button>
                        {user?.role === 'carrier' && (
                          <button onClick={() => { navigate('/vehicles'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Truck className="w-4 h-4" />
                            My Vehicles
                          </button>
                        )}
                        <button onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button onClick={() => { navigate('/help'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <HelpCircle className="w-4 h-4" />
                          Help Center
                        </button>
                      </>
                    )}
                    <div className="border-t border-slate-200 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${
                        i18n.language === lang.code ? 'bg-green-50 text-green-600' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Link href="/signin">
                    <a className="px-4 py-3 text-sm font-medium text-center text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      Sign In
                    </a>
                  </Link>
                  <Link href="/signup">
                    <a className="px-4 py-3 text-sm font-medium text-center text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      Sign Up
                    </a>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
