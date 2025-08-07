import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
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
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        // Store user data in localStorage for the flatmate form
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('name', data.user.name);
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
        <div className="mt-6 text-gray-500 text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
