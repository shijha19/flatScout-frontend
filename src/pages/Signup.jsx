import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, isOAuthAvailable, refreshEnvironment } from '../utils/environment';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Force environment refresh on component mount
    refreshEnvironment();
    setApiUrl(getApiUrl());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !userType) {
      setError('Please fill in all fields.');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType })
      });
      const data = await response.json();
      if (response.ok) {
        // Store user data in localStorage for the flatmate form
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('userType', data.user.userType);
        localStorage.setItem('userLoggedIn', 'true');
        // Mark this as a new user who needs to complete preferences
        localStorage.removeItem('hasCompletedPreferences');
        
        setSuccess('Account created! Let\'s set up your flatmate preferences...');
        setError('');
        
        // Redirect to flatmate preferences form after a brief delay
        setTimeout(() => {
          navigate('/edit-flatmate-preferences?from=signup');
        }, 1500);
      } else {
        setError(data.message || 'Signup failed.');
        setSuccess('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-700">Create Account</h2>
        <p className="text-gray-500 mb-6 text-center">Sign up for FlatScout</p>
        {error && <div className="mb-4 text-red-500 w-full text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 w-full text-center">{success}</div>}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('flat_finder')}
                className={`p-3 text-center rounded-lg border-2 transition-all ${
                  userType === 'flat_finder' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">🔍</div>
                <div className="font-semibold text-sm">Flat Finder</div>
                <div className="text-xs text-gray-600">Looking for a place</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('flat_owner')}
                className={`p-3 text-center rounded-lg border-2 transition-all ${
                  userType === 'flat_owner' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">🏠</div>
                <div className="font-semibold text-sm">Flat Owner</div>
                <div className="text-xs text-gray-600">Have property to rent</div>
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mb-2 shadow"
          >
            Sign Up
          </button>
        </form>
        <div className="flex items-center w-full my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400 font-medium">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        {isOAuthAvailable() && (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-full font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow text-base"
            onClick={() => {
              window.open(`${getApiUrl()}/api/auth/google`, "_self");
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_17_40)">
                <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.07-10.34 7.07-17.676z" fill="#4285F4"/>
                <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H3.5v6.22C7.46 43.98 15.36 48 24.48 48z" fill="#34A853"/>
                <path d="M11.02 28.52c-.48-1.44-.76-2.98-.76-4.52s.28-3.08.76-4.52v-6.22H3.5A23.97 23.97 0 0 0 .48 24c0 3.98.96 7.76 2.68 11.02l7.86-6.5z" fill="#FBBC05"/>
                <path d="M24.48 9.54c3.52 0 6.62 1.22 9.08 3.62l6.8-6.8C36.4 2.14 30.96 0 24.48 0 15.36 0 7.46 4.02 3.5 10.24l7.86 6.22c1.9-5.68 7.2-9.9 13.12-9.9z" fill="#EA4335"/>
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <path fill="#fff" d="M0 0h48v48H0z"/>
                </clipPath>
              </defs>
            </svg>
            Continue with Google
          </button>
        )}
        {!isOAuthAvailable() && (
          <div className="w-full text-center text-sm text-gray-500 py-2">
            Google Sign-in temporarily unavailable
          </div>
        )}
        <div className="mt-6 text-gray-500 text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
