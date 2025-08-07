import React, { useState } from 'react';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('owner');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Network error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Email Notifications</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email to test"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="owner">Owner Notification</option>
            <option value="visitor">Visitor Confirmation</option>
          </select>
        </div>

        <button
          onClick={testEmail}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : `Send Test ${type === 'owner' ? 'Owner' : 'Visitor'} Email`}
        </button>

        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">{result.message}</p>
            {result.messageId && (
              <p className="text-sm mt-1">Message ID: {result.messageId}</p>
            )}
            {result.error && (
              <p className="text-sm mt-1">Error: {result.error}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Setup Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Configure Gmail app password in backend/.env</li>
          <li>2. Set EMAIL_USER and EMAIL_PASS variables</li>
          <li>3. Restart the backend server</li>
          <li>4. Test with your email address</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTest;
