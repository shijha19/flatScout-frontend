import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/environment';

const EnvironmentDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const info = {
      apiUrl: getApiUrl(),
      allEnvVars: import.meta.env,
      currentHost: window.location.origin,
      mode: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD
    };
    setDebugInfo(info);
  }, []);

  const testApiConnection = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      setTestResult({
        status: 'error',
        message: 'No API URL configured. Please set VITE_API_URL environment variable.'
      });
      return;
    }

    try {
      setTestResult({ status: 'testing', message: 'Testing connection...' });
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          status: 'success',
          message: `Connected successfully! Backend status: ${data.status}`,
          data
        });
      } else {
        const responseText = await response.text();
        setTestResult({
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          response: responseText,
          url: `${apiUrl}/health`
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${error.message}`,
        error: error.toString(),
        url: `${apiUrl}/health`,
        apiUrl: apiUrl
      });
    }
  };

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Environment Debug Info</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">API Configuration</h3>
          <p><strong>API URL:</strong> {debugInfo.apiUrl || 'NOT SET'}</p>
          <p><strong>Current Host:</strong> {debugInfo.currentHost}</p>
          <p><strong>Mode:</strong> {debugInfo.mode}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">Environment Variables</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(debugInfo.allEnvVars, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">API Connection Test</h3>
          <button 
            onClick={testApiConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-3"
          >
            Test API Connection
          </button>
          
          {testResult && (
            <div className={`p-3 rounded ${
              testResult.status === 'success' ? 'bg-green-100 text-green-800' :
              testResult.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              <p className="font-semibold">{testResult.message}</p>
              {testResult.data && (
                <pre className="text-sm mt-2">{JSON.stringify(testResult.data, null, 2)}</pre>
              )}
              {testResult.error && (
                <pre className="text-sm mt-2">{testResult.error}</pre>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold text-lg mb-2 text-blue-800">Troubleshooting Guide</h3>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• If API URL is "NOT SET", add VITE_API_URL to your Netlify environment variables</li>
            <li>• API URL should be your Render backend URL (e.g., https://your-app.onrender.com)</li>
            <li>• After adding environment variables, redeploy your Netlify site</li>
            <li>• Check that your backend is running at the specified URL</li>
            <li>• Verify CORS settings on your backend allow your frontend domain</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentDebug;