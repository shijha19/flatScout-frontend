import React from 'react';

export default function OAuthTest() {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const testAuthEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/test');
      const data = await response.json();
      console.log('Auth test response:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Auth test error:', error);
      alert('Error testing auth endpoint: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OAuth Test Page
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test Google OAuth functionality
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={testAuthEndpoint}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Test Auth Endpoint
          </button>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign in with Google
          </button>
          <div className="text-xs text-gray-500 mt-4">
            <p>Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>First, click "Test Auth Endpoint" to verify backend is running</li>
              <li>Then click "Sign in with Google" to test OAuth flow</li>
              <li>Make sure both backend (port 5000) and frontend (port 3000) are running</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
