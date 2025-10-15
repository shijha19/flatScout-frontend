import React, { useState, useEffect } from 'react';

const ProductionDebugger = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDebugCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running production debug check...');
      const response = await fetch('/api/debug/production-check');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Production debug results:', data);
      setDebugInfo(data);
      
    } catch (err) {
      console.error('Debug check failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testFlatmateAPI = async () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId) {
      alert('No user ID found in localStorage');
      return;
    }
    
    try {
      console.log('Testing Flatmate API...');
      const url = `/api/flatmates/matches/${userId}${userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : ''}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Flatmate API response:', data);
      alert(`Flatmate API test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nCheck console for details`);
      
    } catch (err) {
      console.error('Flatmate API test failed:', err);
      alert(`Flatmate API test failed: ${err.message}`);
    }
  };

  const testNotificationAPI = async () => {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
      alert('No user email found in localStorage');
      return;
    }
    
    try {
      console.log('Testing Notification API...');
      const url = `/api/notifications/notifications?userEmail=${encodeURIComponent(userEmail)}&page=1&limit=5`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Notification API response:', data);
      alert(`Notification API test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nCheck console for details`);
      
    } catch (err) {
      console.error('Notification API test failed:', err);
      alert(`Notification API test failed: ${err.message}`);
    }
  };

  useEffect(() => {
    // Auto-run debug check on mount
    runDebugCheck();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Production Debugger</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runDebugCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Full Debug Check'}
        </button>
        
        <button
          onClick={testFlatmateAPI}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Find Flatmate API
        </button>
        
        <button
          onClick={testNotificationAPI}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Notification API
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-700">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {debugInfo && (
        <div className="space-y-4">
          <div className={`p-4 rounded ${debugInfo.overallHealth === 'HEALTHY' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
            <h3 className="font-bold text-lg">Overall Health: {debugInfo.overallHealth}</h3>
            <p className="text-sm text-gray-600">Last checked: {new Date(debugInfo.timestamp).toLocaleString()}</p>
          </div>

          {debugInfo.errors && debugInfo.errors.length > 0 && (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
              <h4 className="font-bold text-yellow-700">Issues Detected:</h4>
              <ul className="list-disc list-inside text-yellow-600">
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-bold mb-2">Environment</h4>
              <div className="text-sm space-y-1">
                <div>Node ENV: {debugInfo.environment?.nodeEnv}</div>
                <div>Frontend URL: {debugInfo.environment?.frontendUrl}</div>
                <div>Database: {debugInfo.environment?.mongoUri}</div>
              </div>
            </div>

            <div className="p-4 border rounded">
              <h4 className="font-bold mb-2">Database</h4>
              <div className="text-sm space-y-1">
                <div>Connected: {debugInfo.database?.connected ? '✅' : '❌'}</div>
                <div>Users: {debugInfo.database?.users || 0}</div>
                <div>Profiles: {debugInfo.database?.profiles || 0}</div>
              </div>
            </div>

            <div className="p-4 border rounded">
              <h4 className="font-bold mb-2">Flatmate API</h4>
              <div className="text-sm space-y-1">
                <div>Status: {debugInfo.apis?.flatmate?.working ? '✅' : '❌'}</div>
                <div>Available Profiles: {debugInfo.apis?.flatmate?.availableProfiles || 0}</div>
                {debugInfo.apis?.flatmate?.error && (
                  <div className="text-red-600">Error: {debugInfo.apis.flatmate.error}</div>
                )}
              </div>
            </div>

            <div className="p-4 border rounded">
              <h4 className="font-bold mb-2">Notification API</h4>
              <div className="text-sm space-y-1">
                <div>Status: {debugInfo.apis?.notifications?.working ? '✅' : '❌'}</div>
                <div>Notifications: {debugInfo.apis?.notifications?.notificationCount || 0}</div>
                <div>Unread: {debugInfo.apis?.notifications?.unreadCount || 0}</div>
                {debugInfo.apis?.notifications?.error && (
                  <div className="text-red-600">Error: {debugInfo.apis.notifications.error}</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-bold mb-2">Request Info</h4>
            <div className="text-sm space-y-1">
              <div>Origin: {debugInfo.request?.origin}</div>
              <div>Host: {debugInfo.request?.host}</div>
              <div>Referer: {debugInfo.request?.referer}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Run the "Full Debug Check" to see overall system health</li>
          <li>Test individual APIs to isolate specific issues</li>
          <li>Check browser console for detailed error messages</li>
          <li>Share this information with developers for troubleshooting</li>
        </ol>
      </div>
    </div>
  );
};

export default ProductionDebugger;