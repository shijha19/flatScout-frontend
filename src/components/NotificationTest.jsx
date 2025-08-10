import React, { useState } from 'react';
import pushNotificationService from '../services/pushNotificationService';

const NotificationTest = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const testLocalNotification = () => {
    pushNotificationService.showLocalNotification('Test Notification', {
      body: 'This is a test notification from FlatScout!',
      tag: 'test'
    });
    setMessage('Local notification shown');
  };

  const testPushSubscription = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setMessage('Please log in first');
        return;
      }

      const permission = await pushNotificationService.requestPermission();
      if (permission !== 'granted') {
        setMessage('Permission denied for notifications');
        return;
      }

      await pushNotificationService.subscribe(userEmail);
      setMessage('Successfully subscribed to push notifications');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const testServerNotification = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setMessage('Please log in first');
        return;
      }

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          title: 'Test Server Notification',
          message: 'This is a test notification from the server!',
          type: 'system_announcement'
        })
      });

      if (response.ok) {
        setMessage('Server notification sent successfully');
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.message);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Notification Testing</h2>
      
      <div className="space-y-4">
        <button 
          onClick={testLocalNotification}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Test Local Notification
        </button>
        
        <button 
          onClick={testPushSubscription}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Subscribe to Push Notifications
        </button>
        
        <button 
          onClick={testServerNotification}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Test Server Notification
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Current status: {JSON.stringify(pushNotificationService.getSubscriptionStatus())}</p>
      </div>
    </div>
  );
};

export default NotificationTest;
