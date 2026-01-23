import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, MapPin, Calendar, DollarSign, Truck, Clock, CheckCircle, AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface Booking {
  id: number;
  trackingNumber?: string;
  origin: string;
  destination: string;
  cargoType: string;
  status: string;
  progress: number;
  pickupDate: string;
  deliveryDate: string;
  price: string;
  carrierName?: string;
  load?: any;
  carrier?: any;
}

export default function MyBookings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      // Transform the data for display
      const transformedBookings = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.booking?.id || item.id,
        trackingNumber: item.load?.trackingNumber || `LP-${item.booking?.id || item.id}`,
        origin: item.load?.origin || 'N/A',
        destination: item.load?.destination || 'N/A',
        cargoType: item.load?.cargoType || 'General',
        status: item.booking?.status || item.status || 'pending',
        progress: item.booking?.progress || item.progress || 0,
        pickupDate: item.booking?.pickupDate || item.pickupDate,
        deliveryDate: item.booking?.deliveryDate || item.deliveryDate,
        price: item.booking?.price || item.price || '0',
        carrierName: item.carrier?.companyName || 'Carrier',
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">My Bookings</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-600 mt-1">Track your shipments and bookings</p>
        </div>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {booking.trackingNumber}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status === 'in_transit' ? 'In Transit' :
                       booking.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{booking.carrierName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${parseFloat(booking.price || '0').toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Origin</p>
                    <p className="font-medium text-slate-900">{booking.origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Destination</p>
                    <p className="font-medium text-slate-900">{booking.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Package className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Cargo</p>
                    <p className="font-medium text-slate-900">{booking.cargoType}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm font-semibold text-slate-900">{booking.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      booking.status === 'completed' ? 'bg-green-600' :
                      booking.status === 'in_transit' ? 'bg-blue-600' :
                      'bg-amber-600'
                    }`}
                    style={{ width: `${booking.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Pickup: {booking.pickupDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Delivery: {booking.deliveryDate}
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Track Shipment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
