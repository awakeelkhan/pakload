import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import MyVehicles from './pages/MyVehicles';
import MyBids from './pages/MyBids';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import FindLoads from './pages/FindLoads';
import FindTrucks from './pages/FindTrucks';
import PostLoad from './pages/PostLoad';
import Routes from './pages/Routes';
import TrackShipment from './pages/TrackShipment';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AdminSettings from './pages/AdminSettings';
import RoutesManagement from './pages/admin/RoutesManagement';
import PlatformConfig from './pages/admin/PlatformConfig';
import CargoCategories from './pages/admin/CargoCategories';
import PricingRules from './pages/admin/PricingRules';
import RoutePricing from './pages/admin/RoutePricing';
import AuditLogs from './pages/admin/AuditLogs';
import UserManagement from './pages/admin/UserManagement';
import Documentation from './pages/Documentation';
import HelpCenter from './pages/HelpCenter';
import OAuthCallback from './pages/OAuthCallback';
import SelectRole from './pages/SelectRole';
import KYC from './pages/KYC';
import Analytics from './pages/Analytics';
import MarketRequests from './pages/MarketRequests';
import MyRequests from './pages/MyRequests';
import ForgotPassword from './pages/ForgotPassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/profile" component={Profile} />
              <Route path="/bookings" component={MyBookings} />
              <Route path="/bids" component={MyBids} />
              <Route path="/notifications" component={Notifications} />
              <Route path="/vehicles" component={MyVehicles} />
              <Route path="/settings" component={Settings} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route path="/admin/settings/routes" component={RoutesManagement} />
              <Route path="/admin/settings/config" component={PlatformConfig} />
              <Route path="/admin/settings/categories" component={CargoCategories} />
              <Route path="/admin/settings/pricing-rules" component={PricingRules} />
              <Route path="/admin/settings/route-pricing" component={RoutePricing} />
              <Route path="/admin/settings/audit-logs" component={AuditLogs} />
              <Route path="/admin/settings/users" component={UserManagement} />
              <Route path="/loads" component={FindLoads} />
              <Route path="/trucks" component={FindTrucks} />
              <Route path="/post-load" component={PostLoad} />
              <Route path="/routes" component={Routes} />
              <Route path="/track" component={TrackShipment} />
              <Route path="/signin" component={SignIn} />
              <Route path="/signup" component={SignUp} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/oauth/callback" component={OAuthCallback} />
              <Route path="/select-role" component={SelectRole} />
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/terms" component={Terms} />
              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route path="/docs" component={Documentation} />
              <Route path="/help" component={HelpCenter} />
              <Route path="/kyc" component={KYC} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/market-requests" component={MarketRequests} />
              <Route path="/my-requests" component={MyRequests} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
