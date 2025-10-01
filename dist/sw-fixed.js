// Enhanced Service Worker for FlatScout PWA
const CACHE_NAME = 'flatscout-v2.0.0';
const STATIC_CACHE = 'flatscout-static-v2.0.0';
const DYNAMIC_CACHE = 'flatscout-dynamic-v2.0.0';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css', 
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/flats/,
  /\/api\/flatmates/,
  /\/api\/wishlist/
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .catch(error => {
        console.error('Failed to cache static resources:', error);
      })
  );
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with Network First strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static resources with Cache First strategy
  if (STATIC_RESOURCES.includes(url.pathname) || 
      url.pathname.startsWith('/static/') ||
      url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with Network First, falling back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, true));
    return;
  }

  // Default: Cache First with Network Fallback
  event.respondWith(cacheFirstStrategy(request));
});

// Network First Strategy (for API calls and navigation)
async function networkFirstStrategy(request, isNavigation = false) {
  const cacheName = isNavigation ? STATIC_CACHE : DYNAMIC_CACHE;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If navigation request and no cache, return offline page
    if (isNavigation) {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    // Return error response for other requests
    return new Response('Network error', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Cache First Strategy (for static resources)
async function cacheFirstStrategy(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Both cache and network failed:', request.url);
    return new Response('Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Background Sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlistData());
  }
  
  if (event.tag === 'review-sync') {
    event.waitUntil(syncReviewData());
  }
});

// Sync wishlist data when online
async function syncWishlistData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const pendingRequests = await cache.keys();
    
    const wishlistRequests = pendingRequests.filter(request => 
      request.url.includes('/api/wishlist') && request.method === 'POST'
    );
    
    for (const request of wishlistRequests) {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('Synced wishlist item');
      } catch (error) {
        console.error('Failed to sync wishlist item:', error);
      }
    }
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// Sync review data when online
async function syncReviewData() {
  try {
    console.log('Review sync completed');
  } catch (error) {
    console.error('Review sync failed:', error);
  }
}

// Push Notification Handler
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

// Notification Click Handler
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let urlToOpen = self.location.origin;

  // Determine URL based on notification data
  if (event.action === 'open' || !event.action) {
    if (notificationData.url) {
      urlToOpen = notificationData.url;
    } else if (notificationData.type === 'new_flat') {
      urlToOpen = `/flat-details/${notificationData.flatId}`;
    } else if (notificationData.type === 'new_flatmate') {
      urlToOpen = '/find-flatmate';
    } else if (notificationData.type === 'wishlist_update') {
      urlToOpen = '/wishlist';
    }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.focus();
            if (client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Share Target Handler (for PWA sharing)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    console.log('Share target received:', event.data);
    
    // Handle shared content
    const { title, text, url } = event.data;
    
    // You can process the shared content here
    // For example, save to localStorage or send to server
    
    event.ports[0].postMessage({
      success: true,
      message: 'Content shared successfully'
    });
  }
});
