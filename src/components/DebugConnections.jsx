import React, { useState, useEffect } from 'react';

const DebugConnections = () => {
  const [profileConnections, setProfileConnections] = useState([]);
  const [chatConnections, setChatConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [stats, setStats] = useState(null);

  const loadData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('No user email found');
        setLoading(false);
        return;
      }

      // Get user data
      const userResponse = await fetch(`/api/user/by-email/${encodeURIComponent(userEmail)}`);
      const { user } = await userResponse.json();

      // Fetch from profile API
      const profileResponse = await fetch(`/api/user/connections?email=${encodeURIComponent(userEmail)}&_t=${Date.now()}`);
      const profileData = await profileResponse.json();
      setProfileConnections(profileData.connections || []);

      // Fetch from chat API
      const chatResponse = await fetch(`/api/connected-users/connected-users/${user._id}`, {
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        }
      });
      const chatData = await chatResponse.json();
      setChatConnections(chatData.connectedUsers || []);

      // Fetch connection stats
      const statsResponse = await fetch(`/api/sync/connection-stats?userEmail=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const syncConnections = async () => {
    setSyncing(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userResponse = await fetch(`/api/user/by-email/${encodeURIComponent(userEmail)}`);
      const { user } = await userResponse.json();

      const response = await fetch('/api/sync/sync-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        }
      });
      const result = await response.json();
      setSyncResult(result);
      
      // Reload data after sync
      await loadData();
    } catch (err) {
      setSyncResult({ error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div>Loading debug info...</div>;
  if (error) return <div>Error: {error}</div>;

  const missingFromChat = profileConnections
    .filter(pConn => !chatConnections.find(cConn => cConn._id === pConn._id));

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg m-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connection Debug Info</h2>
      
      {/* Sync Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Synchronization</h3>
          <button
            onClick={syncConnections}
            disabled={syncing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Connections'}
          </button>
        </div>
        
        {syncResult && (
          <div className={`p-3 rounded ${syncResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {syncResult.error ? 
              `Error: ${syncResult.error}` : 
              `Sync completed: ${syncResult.syncedConnections} connections updated out of ${syncResult.totalAcceptedRequests} total requests`
            }
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Connection Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Connection Requests (Accepted): {stats.connectionRequestsCount}</div>
            <div>User Connections Array: {stats.userConnectionsCount}</div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">
            Profile API Connections ({profileConnections.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {profileConnections.map((conn, index) => (
              <div key={conn._id || index} className="p-2 bg-blue-50 rounded">
                <div className="font-medium">{conn.name}</div>
                <div className="text-sm text-gray-600">{conn.email}</div>
                <div className="text-xs text-gray-500">ID: {conn._id}</div>
                {conn.flatmateProfile && (
                  <div className="text-xs text-green-600">Has flatmate profile</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-pink-600">
            Chat API Connections ({chatConnections.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chatConnections.map((conn, index) => (
              <div key={conn._id || index} className="p-2 bg-pink-50 rounded">
                <div className="font-medium">{conn.name}</div>
                <div className="text-sm text-gray-600">{conn.email}</div>
                <div className="text-xs text-gray-500">ID: {conn._id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {missingFromChat.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            Missing from Chat API ({missingFromChat.length}):
          </h3>
          <div className="space-y-2">
            {missingFromChat.map((conn, index) => (
              <div key={conn._id || index} className="p-2 bg-red-50 rounded">
                <div className="font-medium text-red-700">{conn.name}</div>
                <div className="text-sm text-red-600">{conn.email}</div>
                <div className="text-xs text-red-500">ID: {conn._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={loadData}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DebugConnections;
