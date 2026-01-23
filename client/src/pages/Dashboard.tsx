import { useAuth } from '../contexts/AuthContext';
import ShipperDashboard from '../components/ShipperDashboard';
import CarrierDashboard from '../components/CarrierDashboard';
import AdminDashboard from '../components/AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

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
