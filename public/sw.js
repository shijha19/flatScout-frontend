// Service Worker for handling push notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const options = {
      body: data.body || 'New notification from FlatScout',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      tag: data.tag || 'flatscout-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.priority === 'high' || data.priority === 'urgent',
      vibrate: data.priority === 'urgent' ? [200, 100, 200, 100, 200] : [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'FlatScout', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('FlatScout', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let urlToOpen = self.location.origin;

  // Determine URL based on notification data
  if (event.action === 'open' || !event.action) {
    if (notificationData.actionUrl) {
      urlToOpen = self.location.origin + notificationData.actionUrl;
    } else if (notificationData.type) {
      switch (notificationData.type) {
        case 'connection_request':
          urlToOpen = self.location.origin + '/profile';
          break;
        case 'new_message':
          urlToOpen = self.location.origin + '/chat';
          break;
        case 'booking_request':
          urlToOpen = self.location.origin + '/booking-calendar';
          break;
        case 'new_match':
          urlToOpen = self.location.origin + '/find-flatmate';
          break;
        default:
          urlToOpen = self.location.origin + '/dashboard';
      }
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen.replace(self.location.origin, '')) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  
  // Track notification close for analytics if needed
  const notificationData = event.notification.data || {};
  
  // You can send analytics data here
  console.log('Notification closed by user:', notificationData.type);
});

// Background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Fetch any pending notifications when back online
    console.log('Syncing notifications in background');
    
    // This would typically fetch notifications from your API
    // and show any that were missed while offline
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}
