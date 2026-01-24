import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, Package, DollarSign, Truck, AlertCircle, MessageSquare, Star, Settings, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';

interface Notification {
  id: number;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  link: string | null;
  relatedLoadId: number | null;
  relatedBookingId: number | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  bid_received: <DollarSign className="w-4 h-4 text-green-600" />,
  bid_accepted: <Check className="w-4 h-4 text-green-600" />,
  bid_rejected: <X className="w-4 h-4 text-red-500" />,
  bid_expired: <AlertCircle className="w-4 h-4 text-amber-500" />,
  load_posted: <Package className="w-4 h-4 text-blue-600" />,
  load_assigned: <Truck className="w-4 h-4 text-green-600" />,
  load_cancelled: <X className="w-4 h-4 text-red-500" />,
  shipment_pickup: <Truck className="w-4 h-4 text-blue-600" />,
  shipment_delivered: <Check className="w-4 h-4 text-green-600" />,
  shipment_delayed: <AlertCircle className="w-4 h-4 text-amber-500" />,
  payment_received: <DollarSign className="w-4 h-4 text-green-600" />,
  payment_due: <DollarSign className="w-4 h-4 text-red-500" />,
  document_required: <AlertCircle className="w-4 h-4 text-amber-500" />,
  message_received: <MessageSquare className="w-4 h-4 text-blue-600" />,
  rating_received: <Star className="w-4 h-4 text-amber-500" />,
  account_alert: <Settings className="w-4 h-4 text-red-500" />,
  system: <Bell className="w-4 h-4 text-slate-600" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'border-l-4 border-l-red-500 bg-red-50',
  high: 'border-l-4 border-l-amber-500 bg-amber-50',
  normal: '',
  low: 'opacity-75',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications/count', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch on mount and periodically
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!user) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">You'll see updates about your loads and bids here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  } ${PRIORITY_COLORS[notification.priority] || ''}`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? 'bg-white shadow-sm' : 'bg-slate-100'
                    }`}>
                      {NOTIFICATION_ICONS[notification.type] || <Bell className="w-4 h-4 text-slate-500" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
