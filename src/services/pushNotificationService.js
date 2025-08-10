class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isSubscribed = false;
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = null;
  }

  /**
   * Initialize the push notification service
   */
  async initialize() {
    if (!this.isSupported) {
      console.log('Push notifications are not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Get VAPID public key from server
      await this.getVapidPublicKey();

      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      this.isSubscribed = !!this.subscription;

      console.log('Push notification service initialized. Subscribed:', this.isSubscribed);
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Get VAPID public key from server
   */
  async getVapidPublicKey() {
    try {
      const response = await fetch('/api/notifications/vapid-public-key');
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      return this.vapidPublicKey;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      // Fallback key for development
      this.vapidPublicKey = 'BP8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8';
      return this.vapidPublicKey;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(userEmail) {
    if (!this.isSupported || !this.registration) {
      throw new Error('Push notifications not supported or not initialized');
    }

    if (!this.vapidPublicKey) {
      await this.getVapidPublicKey();
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          subscription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      this.subscription = subscription;
      this.isSubscribed = true;

      console.log('Successfully subscribed to push notifications');
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userEmail) {
    if (!this.isSubscribed || !this.subscription) {
      console.log('Not subscribed to push notifications');
      return;
    }

    try {
      // Unsubscribe from browser
      await this.subscription.unsubscribe();

      // Remove subscription from server
      await fetch('/api/notifications/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          endpoint: this.subscription.endpoint
        })
      });

      this.subscription = null;
      this.isSubscribed = false;

      console.log('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Check if user has permission for notifications
   */
  async checkPermission() {
    if (!this.isSupported) {
      return 'unsupported';
    }

    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show a local notification (for testing)
   */
  showLocalNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.log('Cannot show notification - permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    return {
      isSupported: this.isSupported,
      isSubscribed: this.isSubscribed,
      permission: this.isSupported ? Notification.permission : 'unsupported'
    };
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
