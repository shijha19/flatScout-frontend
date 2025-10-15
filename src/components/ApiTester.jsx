import React, { useState } from 'react';
import { apiMethods } from '../utils/api';

const ApiTester = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiMethods.health();
      setTestResult({
        status: 'success',
        message: 'Backend connection successful!',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Backend connection failed',
        error: error.message,
        details: error.response?.data || error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testPreferenceSave = async () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId || !userEmail) {
      setTestResult({
        status: 'error',
        message: 'Please log in first to test preference save functionality'
      });
      return;
    }

    setLoading(true);
    try {
      // Test preference save
      const testData = {
        name: 'Test User',
        gender: 'Male',
        age: 25,
        occupation: 'Software Engineer',
        hometown: 'Test City',
        languages: 'English, Hindi',
        foodPreference: 'Veg',
        socialPreference: 'Ambivert',
        hobbies: 'Reading, Gaming',
        workMode: 'Remote',
        guestPolicy: 'Occasional',
        preferredGender: 'Any',
        budget: 15000,
        locationPreference: 'Near Metro',
        habits: {
          smoking: 'No',
          pets: 'No',
          sleepTime: 'Early',
          cleanliness: 'High'
        },
        bio: 'Test bio for API testing'
      };

      const response = await apiMethods.flatmate.createProfile(userId, testData);
      
      setTestResult({
        status: 'success',
        message: 'Preference save test successful!',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Preference save test failed',
        error: error.message,
        details: error.response?.data || error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Connection Tester</h2>
      
      <div className="space-y-4">
        <button
          onClick={testHealthEndpoint}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>

        <button
          onClick={testPreferenceSave}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Preference Save (Login Required)'}
        </button>

        {testResult && (
          <div className={`p-4 rounded border ${
            testResult.status === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <h3 className="font-semibold mb-2">
              {testResult.status === 'success' ? '✅ Success' : '❌ Error'}
            </h3>
            <p className="mb-2">{testResult.message}</p>
            {testResult.data && (
              <div className="text-sm">
                <p><strong>Response:</strong></p>
                <pre className="bg-white p-2 rounded border text-xs overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
            {testResult.error && (
              <div className="text-sm">
                <p><strong>Error:</strong> {testResult.error}</p>
                {testResult.details && (
                  <pre className="bg-white p-2 rounded border text-xs overflow-auto mt-1">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Current Configuration:</h3>
        <p className="text-sm">
          <strong>User ID:</strong> {localStorage.getItem('userId') || 'Not logged in'}
        </p>
        <p className="text-sm">
          <strong>User Email:</strong> {localStorage.getItem('userEmail') || 'Not logged in'}
        </p>
        <p className="text-sm">
          <strong>Logged In:</strong> {localStorage.getItem('userLoggedIn') || 'false'}
        </p>
      </div>
    </div>
  );
};

export default ApiTester;