import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Bell, Check, CheckCheck, Trash2, Package, DollarSign, Truck, 
  AlertCircle, MessageSquare, Star, Settings, X, Filter, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

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
  bid_received: <DollarSign className="w-5 h-5 text-green-600" />,
  bid_accepted: <Check className="w-5 h-5 text-green-600" />,
  bid_rejected: <X className="w-5 h-5 text-red-500" />,
  bid_expired: <AlertCircle className="w-5 h-5 text-amber-500" />,
  load_posted: <Package className="w-5 h-5 text-blue-600" />,
  load_assigned: <Truck className="w-5 h-5 text-green-600" />,
  load_cancelled: <X className="w-5 h-5 text-red-500" />,
  shipment_pickup: <Truck className="w-5 h-5 text-blue-600" />,
  shipment_delivered: <Check className="w-5 h-5 text-green-600" />,
  shipment_delayed: <AlertCircle className="w-5 h-5 text-amber-500" />,
  payment_received: <DollarSign className="w-5 h-5 text-green-600" />,
  payment_due: <DollarSign className="w-5 h-5 text-red-500" />,
  document_required: <AlertCircle className="w-5 h-5 text-amber-500" />,
  message_received: <MessageSquare className="w-5 h-5 text-blue-600" />,
  rating_received: <Star className="w-5 h-5 text-amber-500" />,
  account_alert: <Settings className="w-5 h-5 text-red-500" />,
  system: <Bell className="w-5 h-5 text-slate-600" />,
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'border-l-4 border-l-red-500 bg-red-50',
  high: 'border-l-4 border-l-amber-500 bg-amber-50',
  normal: 'bg-white',
  low: 'bg-white opacity-75',
};

export default function Notifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params = filter === 'unread' ? '?unread_only=true' : '';
      const response = await fetch(`/api/notifications${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        let filtered = data;
        if (filter === 'read') {
          filtered = data.filter((n: Notification) => n.read);
        }
        setNotifications(filtered);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      addToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, filter]);

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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
        addToast('success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      addToast('error', 'Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        addToast('success', 'Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      addToast('error', 'Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/notifications/read', {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => !n.read));
        addToast('success', 'Read notifications deleted');
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      addToast('error', 'Failed to delete notifications');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Please sign in</h2>
          <p className="text-slate-500 mb-4">You need to be signed in to view notifications</p>
          <button 
            onClick={() => navigate('/signin')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-green-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-slate-600 mt-1">Stay updated on your loads, bids, and shipments</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button 
              onClick={fetchNotifications}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 p-2 mb-6 flex gap-2">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.filter(n => n.read).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key 
                  ? 'bg-green-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        {notifications.some(n => n.read) && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={deleteAllRead}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Delete all read
            </button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No notifications</h3>
            <p className="text-slate-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications yet."
                : "You'll see updates about your loads, bids, and shipments here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border border-slate-200 overflow-hidden transition-all hover:shadow-md ${
                  PRIORITY_STYLES[notification.priority] || 'bg-white'
                } ${!notification.read ? 'ring-2 ring-blue-100' : ''}`}
              >
                <div 
                  onClick={() => handleNotificationClick(notification)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      {NOTIFICATION_ICONS[notification.type] || <Bell className="w-5 h-5 text-slate-500" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-base ${!notification.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.priority === 'urgent' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Urgent</span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">High Priority</span>
                        )}
                        {notification.link && (
                          <span className="text-green-600">Click to view →</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
