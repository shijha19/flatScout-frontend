import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChatContext } from "../contexts/ChatContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  
  // Chat context for unread count
  const { unreadCount } = useChatContext();
  
  // Refs for click outside functionality
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications function - moved outside useEffect so it can be called from bell icon
  const fetchNotifications = async () => {
    // Always use the ObjectId for the logged-in user
    let userId = localStorage.getItem('userId');
    console.log('[Navbar] localStorage userId:', userId);
    
    // If userId is not a valid ObjectId, try to get it from the user object in localStorage
    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id && /^[a-fA-F0-9]{24}$/.test(user._id)) {
          userId = user._id;
        }
      } catch {}
    }
    
    // If we still don't have userId, try to get it using the email
    if (!userId) {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        try {
          console.log('[Navbar] Fetching userId using email:', userEmail);
          const res = await fetch(`/api/user/by-email/${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (data.user && data.user._id) {
            userId = data.user._id;
            // Store it for future use
            localStorage.setItem('userId', userId);
            console.log('[Navbar] Got userId from email lookup:', userId);
          }
        } catch (err) {
          console.error('[Navbar] Error fetching userId by email:', err);
        }
      }
    }
    
    console.log('[Navbar] fetchNotifications called with userId:', userId);
    if (!userId) {
      console.log('[Navbar] No valid userId found, cannot fetch notifications');
      return;
    }
    try {
      const res = await fetch(`/api/notification/notifications?userId=${userId}`);
      const data = await res.json();
      console.log('[Navbar] notification response:', data);
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('[Navbar] fetchNotifications error:', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('userLoggedIn'));
    if (isLoggedIn) {
      fetchNotifications();
      checkAdminStatus();
    }
  }, [location, isLoggedIn]);

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await fetch(`/api/admin/dashboard-stats?userEmail=${encodeURIComponent(userEmail)}`);
      setIsAdmin(response.ok);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close notifications dropdown if clicked outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      // Close profile dropdown if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnectionResponse = async (requestId, action) => {
    setProcessingRequest(requestId);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const endpoint = action === 'accept' ? '/api/connection/accept-request' : '/api/connection/decline-request';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, userEmail })
      });

      const data = await res.json();
      if (res.ok) {
        // Remove the processed notification from the list
        setNotifications(prev => prev.filter(n => n._id !== requestId));
        
        // Show success message
        if (action === 'accept') {
          alert(`Connection accepted! You are now connected to ${data.connectedUser?.name || 'the user'}.`);
        }
      } else {
        alert(data.message || 'Failed to process request');
      }
    } catch (err) {
      alert('Error processing request: ' + err.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to log the activity
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        await fetch('/api/user/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }

    // Remove all user-related info from localStorage
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Check user type from localStorage
  const userType = localStorage.getItem('userType');
  
  // Updated navLinks as per user request
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore Flats", path: "/explore-flats" },
    // Feature links only for logged in users
    ...(isLoggedIn ? [
      { name: "Find Flatmate", path: "/find-flatmate" },
      { name: "Booking Calendar", path: "/booking-calendar" },
      { name: "Rent Estimator", path: "/rent-estimator" },
      // Add "List Property" link only for flat owners
      ...(userType === 'flat_owner' ? [{ name: "List Property", path: "/flat-listings" }] : [])
    ] : [])
  ];

  return (
    <nav className="bg-white border-b border-yellow-100 shadow-md fixed top-0 w-full z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            {/* Replace src with your logo image if needed */}
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR5CsZKfa9KhTSO52Fl4ij3wUT1w4I6UbD3g&s" alt="Logo" className="h-8 w-8 mr-2" />
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-[#800020] bg-clip-text text-transparent">FlatScout</Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-gray-700 hover:text-pink-600 font-medium px-2 py-1 rounded transition-colors duration-200${(location.pathname === link.path && link.name !== 'Home') ? (link.name === 'Find Flatmate' || link.name === 'Booking Calendar' ? ' bg-yellow-100 text-yellow-700' : ' bg-pink-100 text-pink-700') : ''}`}
              >
                {link.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/login"
                className={`text-gray-700 hover:text-pink-600 font-medium px-2 py-1 rounded transition-colors duration-200 ${location.pathname === '/login' ? 'bg-pink-100 text-pink-700' : ''}`}
              >
                Login / Signup
              </Link>
            )}
            {/* Notification Bell and Profile Dropdown (only when logged in) */}
            {isLoggedIn && (
              <>
                <Link
                  to="/chat"
                  className="relative ml-4 p-2 text-pink-500 hover:text-pink-600 transition-colors duration-200"
                  aria-label="Chat"
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative ml-4" ref={notificationRef}>
                  <button
                    onClick={() => {
                      console.log('[Navbar] Bell icon clicked');
                      setShowNotifications((prev) => !prev);
                      fetchNotifications(); // Fetch notifications when bell is clicked
                    }}
                    className="relative focus:outline-none"
                    aria-label="Notifications"
                  >
                    <svg className="h-7 w-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{notifications.length}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-pink-100 rounded shadow-lg py-2 z-[10000] max-h-80 overflow-y-auto">
                      <div className="px-4 py-2 font-bold text-pink-700 border-b">Connection Requests</div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500">No new connection requests.</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className="px-4 py-3 border-b last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-pink-700">{n.name}</span>
                                  <span className="text-gray-500 text-xs">({n.email})</span>
                                </div>
                                {n.direction === "received" ? (
                                  <p className="text-xs text-gray-600">wants to connect with you</p>
                                ) : (
                                  <p className="text-xs text-gray-600">You sent a request to this user</p>
                                )}
                              </div>
                            </div>
                            {n.direction === "received" && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleConnectionResponse(n._id, 'accept')}
                                  disabled={processingRequest === n._id}
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition disabled:opacity-50"
                                >
                                  {processingRequest === n._id ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleConnectionResponse(n._id, 'decline')}
                                  disabled={processingRequest === n._id}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition disabled:opacity-50"
                                >
                                  {processingRequest === n._id ? 'Processing...' : 'Decline'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="relative ml-2" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/8345/8345328.png"
                      alt="Profile"
                      className="h-8 w-8 rounded-full border-2 border-pink-300"
                    />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded shadow-lg py-2 z-[10000]">
                      <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50">Profile</Link>
                      <Link to="/report-listing" className="block px-4 py-2 text-gray-700 hover:bg-pink-50">Report Listing</Link>
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 border-t border-gray-200">
                          <span className="flex items-center">
                            <span className="text-blue-600 mr-2">⚙️</span>
                            Admin Dashboard
                          </span>
                        </Link>
                      )}
                      <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-yellow-100" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block text-gray-700 hover:text-pink-600 font-medium px-2 py-1 rounded transition-colors duration-200${(location.pathname === link.path && link.name !== 'Home') ? (link.name === 'Find Flatmate' || link.name === 'Booking Calendar' ? ' bg-yellow-100 text-yellow-700' : ' bg-pink-100 text-pink-700') : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                to="/login"
                className={`block text-gray-700 hover:text-pink-600 font-medium px-2 py-1 rounded transition-colors duration-200 ${location.pathname === '/login' ? 'bg-pink-100 text-pink-700' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Login / Signup
              </Link>
            )}
            {/* Profile Dropdown for mobile (only when logged in) */}
            {isLoggedIn && (
              <div className="mt-2 border-t pt-2">
                <Link 
                  to="/chat" 
                  className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-pink-50"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Chat</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-xs px-2 py-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50" onClick={() => setIsOpen(false)}>Profile</Link>
                <Link to="/report-listing" className="block px-4 py-2 text-gray-700 hover:bg-pink-50" onClick={() => setIsOpen(false)}>Report Listing</Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-blue-50" onClick={() => setIsOpen(false)}>
                    <span className="flex items-center">
                      <span className="text-blue-600 mr-2">⚙️</span>
                      Admin Dashboard
                    </span>
                  </Link>
                )}
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
