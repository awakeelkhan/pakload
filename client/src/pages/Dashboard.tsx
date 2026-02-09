import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import ShipperDashboard from '../components/ShipperDashboard';
import CarrierDashboard from '../components/CarrierDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin?redirect=/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Admin dashboard
  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  // Shipper dashboard
  if (user.role === 'shipper') {
    return <ShipperDashboard user={user} />;
  }

  // Carrier dashboard (default)
  return <CarrierDashboard user={user} />;
}
