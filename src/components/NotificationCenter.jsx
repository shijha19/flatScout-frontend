import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaCheck, FaEye, FaEnvelope, FaCog } from 'react-icons/fa';
import pushNotificationService from '../services/pushNotificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const notificationRef = useRef(null);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      initializePushNotifications();
    }
  }, [userEmail]);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async (pageNum = 1, reset = true) => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications/notifications?userEmail=${encodeURIComponent(userEmail)}&page=${pageNum}&limit=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializePushNotifications = async () => {
    try {
      const initialized = await pushNotificationService.initialize();
      if (initialized) {
        const status = pushNotificationService.getSubscriptionStatus();
        setPushEnabled(status.isSubscribed);
        setPushPermission(status.permission);
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });

      if (response.ok) {
        // Remove the notification from the list since it's deleted on the backend
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail })
      });

      if (response.ok) {
        // Clear all notifications since they're deleted on the backend
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const enablePushNotifications = async () => {
    try {
      const permission = await pushNotificationService.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        await pushNotificationService.subscribe(userEmail);
        setPushEnabled(true);
        
        // Show success notification
        pushNotificationService.showLocalNotification(
          'Push Notifications Enabled!',
          { body: 'You will now receive push notifications from FlatScout.' }
        );
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      alert('Failed to enable push notifications. Please try again.');
    }
  };

  const disablePushNotifications = async () => {
    try {
      await pushNotificationService.unsubscribe(userEmail);
      setPushEnabled(false);
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      alert('Failed to disable push notifications. Please try again.');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return '👥';
      case 'new_message':
        return '💬';
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return '📅';
      case 'new_match':
        return '❤️';
      case 'listing_updated':
      case 'new_listing_in_area':
        return '🏠';
      case 'rent_reminder':
        return '💰';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Accept/Decline connection handlers
  const handleAcceptConnection = async (notification) => {
    try {
      console.log('=== ACCEPT CONNECTION DEBUG ===');
      console.log('Full notification object:', JSON.stringify(notification, null, 2));
      console.log('Notification type:', notification.type);
      console.log('Notification metadata:', notification.metadata);
      console.log('metadata keys:', notification.metadata ? Object.keys(notification.metadata) : 'metadata is null/undefined');
      
      if (notification.type !== 'connection_request') {
        alert('This notification is not a connection request.');
        return;
      }
      const requestId = notification.metadata?.connectionRequestId;
      console.log('Extracted requestId:', requestId);
      if (!requestId) {
        alert('No connection request ID found in notification. Please refresh and try again.');
        return;
      }
      const res = await fetch(`/api/connection/accept-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userEmail,
        }),
      });
      const responseData = await res.json();
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        setUnreadCount(prev => Math.max(0, prev - 1));
        alert('Connection request accepted successfully!');
      } else {
        alert(`Failed to accept connection request: ${responseData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error accepting connection request.');
    }
  };

  const handleDeclineConnection = async (notification) => {
    try {
      if (notification.type !== 'connection_request') {
        alert('This notification is not a connection request.');
        return;
      }
      const requestId = notification.metadata?.connectionRequestId;
      console.log('Decline: notification:', notification);
      if (!requestId) {
        alert('No connection request ID found in notification. Please refresh and try again.');
        return;
      }
      const res = await fetch(`/api/connection/decline-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userEmail,
        }),
      });
      const responseData = await res.json();
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        setUnreadCount(prev => Math.max(0, prev - 1));
        alert('Connection request declined successfully!');
      } else {
        alert(`Failed to decline connection request: ${responseData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error declining connection request.');
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  title="Mark all as read"
                >
                  <FaCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Push Notification Settings */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaBell className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Push Notifications</span>
              </div>
              {pushPermission === 'granted' ? (
                <button
                  onClick={pushEnabled ? disablePushNotifications : enablePushNotifications}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    pushEnabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {pushEnabled ? 'Enabled' : 'Enable'}
                </button>
              ) : pushPermission === 'denied' ? (
                <span className="text-xs text-red-600">Blocked</span>
              ) : (
                <button
                  onClick={enablePushNotifications}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                >
                  Allow
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">We'll notify you when something happens!</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      getPriorityColor(notification.priority)
                    } ${!notification.read ? 'bg-blue-25' : ''}`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          {notification.actionText && (
                            <span className="text-xs text-blue-600 font-medium">
                              {notification.actionText}
                            </span>
                          )}
                        </div>
                        {/* Accept/Decline for connection requests */}
                        {notification.type === 'connection_request' && (
                          <div className="flex space-x-2 mt-2">
                            <button
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              onClick={e => {
                                e.stopPropagation();
                                handleAcceptConnection(notification);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeclineConnection(notification);
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {hasMore && (
                  <div className="p-3 text-center border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
