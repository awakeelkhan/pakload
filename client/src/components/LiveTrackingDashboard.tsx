import { useState, useEffect } from 'react';
import { 
  MapPin, Truck, Clock, CheckCircle, AlertTriangle, 
  Navigation, RefreshCw, Package, Calendar, ArrowRight,
  Wifi, WifiOff, History
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface LocationUpdate {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
}

interface StatusUpdate {
  id: string;
  status: string;
  checkpointType?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  timestamp: string;
}

interface TrackingData {
  loadId: number;
  currentStatus: string;
  currentLocation: LocationUpdate | null;
  statusHistory: StatusUpdate[];
  locationHistory: LocationUpdate[];
  lastSyncedAt: string | null;
}

interface LiveTrackingDashboardProps {
  loadId: number;
  origin: string;
  destination: string;
  onClose?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  assigned: { label: 'Assigned', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Package },
  picked: { label: 'Picked Up', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle },
  in_transit: { label: 'In Transit', color: 'text-green-600', bgColor: 'bg-green-100', icon: Truck },
  at_checkpoint: { label: 'At Checkpoint', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: MapPin },
  customs_clearance: { label: 'Customs Clearance', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: AlertTriangle },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-200', icon: CheckCircle },
  delayed: { label: 'Delayed', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle },
  issue_reported: { label: 'Issue Reported', color: 'text-red-700', bgColor: 'bg-red-200', icon: AlertTriangle },
};

export default function LiveTrackingDashboard({ loadId, origin, destination, onClose }: LiveTrackingDashboardProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchTrackingData();

    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTrackingData();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadId, autoRefresh]);

  const fetchTrackingData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/tracking/${loadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
        setLastRefresh(new Date());
        setError(null);
      } else {
        setError('Failed to fetch tracking data');
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get route path for polyline
  const getRoutePath = (): [number, number][] => {
    if (!trackingData?.locationHistory) return [];
    return trackingData.locationHistory.map(loc => [loc.latitude, loc.longitude]);
  };

  // Get map center
  const getMapCenter = (): [number, number] => {
    if (trackingData?.currentLocation) {
      return [trackingData.currentLocation.latitude, trackingData.currentLocation.longitude];
    }
    // Default to Pakistan center
    return [30.3753, 69.3451];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600">Loading tracking data...</p>
      </div>
    );
  }

  const currentStatusConfig = getStatusConfig(trackingData?.currentStatus || 'assigned');
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Live Tracking</h3>
              <p className="text-green-100 text-sm">Load #{loadId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-white/20' : 'bg-white/10'}`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>
            <button
              onClick={fetchTrackingData}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
              title="Refresh now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route Summary */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-900">{origin}</p>
              <p className="text-xs text-slate-500">Origin</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="text-center">
              <MapPin className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-900">{destination}</p>
              <p className="text-xs text-slate-500">Destination</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${currentStatusConfig.bgColor}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${currentStatusConfig.color}`} />
              <span className={`font-semibold ${currentStatusConfig.color}`}>
                {currentStatusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[300px] relative">
        <MapContainer
          center={getMapCenter()}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route path */}
          {getRoutePath().length > 1 && (
            <Polyline
              positions={getRoutePath()}
              color="#059669"
              weight={3}
              opacity={0.7}
            />
          )}

          {/* Current location marker */}
          {trackingData?.currentLocation && (
            <Marker
              position={[trackingData.currentLocation.latitude, trackingData.currentLocation.longitude]}
              icon={truckIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Current Location</p>
                  <p className="text-sm text-slate-600">
                    {getTimeSince(trackingData.currentLocation.timestamp)}
                  </p>
                  {trackingData.currentLocation.speed && (
                    <p className="text-xs text-slate-500">
                      Speed: {Math.round(trackingData.currentLocation.speed * 3.6)} km/h
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Last synced indicator */}
        <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-lg shadow text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last updated: {getTimeSince(lastRefresh.toISOString())}
        </div>

        {/* No location data message */}
        {!trackingData?.currentLocation && (
          <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Waiting for location data...</p>
              <p className="text-sm text-slate-500">Driver will start sharing location after pickup</p>
            </div>
          </div>
        )}
      </div>

      {/* Current Location Details */}
      {trackingData?.currentLocation && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Current Location</p>
              <p className="text-xs text-green-600">
                Lat: {trackingData.currentLocation.latitude.toFixed(6)}, 
                Lng: {trackingData.currentLocation.longitude.toFixed(6)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">{formatTimestamp(trackingData.currentLocation.timestamp)}</p>
              {trackingData.lastSyncedAt && (
                <p className="text-xs text-green-600">
                  Synced: {getTimeSince(trackingData.lastSyncedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="p-4 border-t border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          Status History
        </h4>
        
        {trackingData?.statusHistory && trackingData.statusHistory.length > 0 ? (
          <div className="space-y-3">
            {trackingData.statusHistory.slice().reverse().map((status, index) => {
              const config = getStatusConfig(status.status);
              const Icon = config.icon;
              
              return (
                <div key={status.id || index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${config.color}`}>{config.label}</p>
                      <p className="text-xs text-slate-500">{formatTimestamp(status.timestamp)}</p>
                    </div>
                    <p className="text-sm text-slate-600">{status.location}</p>
                    {status.notes && (
                      <p className="text-xs text-slate-500 mt-1">{status.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">No status updates yet</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={fetchTrackingData}
              className="ml-auto text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
