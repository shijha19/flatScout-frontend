import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState([]);
  const [removingConnectionId, setRemovingConnectionId] = useState(null);

  // Remove connection handler
  const handleRemoveConnection = async (connIdOrEmail) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    setRemovingConnectionId(connIdOrEmail);
    try {
      const email = localStorage.getItem('userEmail');
      // Try to remove by id or email
      const res = await fetch('/api/user/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, remove: connIdOrEmail })
      });
      if (!res.ok) throw new Error('Failed to remove connection');
      setConnections(prev => prev.filter(c => (c._id || c.id || c.email) !== connIdOrEmail));
    } catch (err) {
      alert('Failed to remove connection.');
    } finally {
      setRemovingConnectionId(null);
    }
  };
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [userStats, setUserStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    reportsSubmitted: 0,
    memberSince: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("No user email found. Please log in again.");
      setLoading(false);
      return;
    }
    
    // Fetch user profile
    fetch(`/api/user/profile?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditedUser(data.user);
          setProfileImageUrl(data.user.profileImage || "");
          
          // Calculate member since in days
          if (data.user.createdAt) {
            const memberSince = Math.floor((Date.now() - new Date(data.user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            setUserStats(prev => ({ ...prev, memberSince }));
          }
        } else {
          setError(data.message || "User not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      });

    // Fetch connections
    setConnectionsLoading(true);
    fetch(`/api/user/connections?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.connections)) {
          // Only count real users (with valid email and name)
          const realConnections = data.connections.filter(
            (c) => c && c.email && c.name && c.email.includes('@') && c.name.length > 0
          );
          setConnections(realConnections);
        } else {
          setConnections([]);
        }
        setConnectionsLoading(false);
      })
      .catch(() => {
        setConnectionsError("Failed to load connections.");
        setConnectionsLoading(false);
      });

    // Fetch user statistics (mock data for now - you can implement these APIs)
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // These would be real API calls in a production app
      // For now, using mock data
      setUserStats(prev => ({
        ...prev,
        totalListings: Math.floor(Math.random() * 10) + 1,
        activeBookings: Math.floor(Math.random() * 5),
        reportsSubmitted: Math.floor(Math.random() * 3)
      }));
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageUploadLoading(true);

    try {
      // Cloudinary config for Vite
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UNSIGNED_PRESET';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      // Upload to Cloudinary
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudinaryData = await cloudinaryRes.json();
      console.log('Cloudinary response:', cloudinaryData);
      if (!cloudinaryData.secure_url) {
        const errMsg = cloudinaryData.error?.message || 'Cloudinary upload failed';
        throw new Error(errMsg);
      }

      // Save Cloudinary URL to backend
      const email = localStorage.getItem('userEmail');
      const backendRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profileImage: cloudinaryData.secure_url })
      });
      if (!backendRes.ok) throw new Error('Failed to update profile image in backend');

      setProfileImageUrl(cloudinaryData.secure_url);
      setImageUploadLoading(false);
      setShowImageModal(false);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
      setImageUploadLoading(false);
    }
  };

  const handleQuickEdit = async (field, value) => {
    try {
      const email = localStorage.getItem("userEmail");
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          [field]: value
        })
      });

      if (response.ok) {
        setUser(prev => ({ ...prev, [field]: value }));
        alert(`${field} updated successfully!`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Quick edit failed:', error);
      alert(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          ...editedUser
        })
      });

      if (response.ok) {
        setUser(editedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-center text-red-600">{error}</div>
      <button 
        onClick={() => navigate('/login')}
        className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Go to Login
      </button>
    </div>
  );
  
  if (!user) return null;

  const currentAvatar = profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=F472B6&color=fff&size=128`;

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img 
                src={currentAvatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-pink-200 shadow-lg object-cover"
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full mt-3">
              Member for {userStats.memberSince} days
            </span>
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-pink-700">{user.name}</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                title="Edit Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-500 mb-4">{user.location || "Location not specified"}</p>
            
            {/* User Stats */}
            {showStats && (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-6">
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-pink-600">{connections.length}</div>
                  <div className="text-sm text-pink-700">Connections</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Information
            </h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editedUser.name || ""}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedUser.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedUser.phone || ""}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editedUser.location || ""}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editedUser.bio || ""}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{user.phone || "Phone not provided"}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{user.location || "Location not specified"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-pink-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Bio</div>
                      <span className="text-gray-600">{user.bio || "No bio provided yet."}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connections Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connections ({connectionsLoading ? '...' : connections.length})
            </h2>
            
            {connectionsError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{connectionsError}</div>
            )}
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {connectionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading connections...</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-gray-500">No connections yet.</p>
                  <Link 
                    to="/find-flatmate" 
                    className="inline-block mt-2 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Find flatmates to connect →
                  </Link>
                </div>
              ) : (
                connections.map((conn) => {
                  const connKey = conn._id || conn.id || conn.email;
                  return (
                    <div key={connKey} className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 hover:from-pink-100 hover:to-pink-150 transition-colors border border-pink-200">
                      <div className="flex items-center gap-4">
                        {/* Profile Image */}
                        <img
                          src={conn.flatmateProfile?.photoUrl || conn.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.name || 'User')}&background=F472B6&color=fff&size=64`}
                          alt="avatar"
                          className="w-12 h-12 rounded-full border-2 border-pink-300 object-cover shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-pink-700 text-lg">{conn.name}</div>
                          {conn.flatmateProfile?.bio ? (
                            <p className="text-gray-600 text-sm italic overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4em',
                              maxHeight: '1.4em'
                            }}>
                              "{conn.flatmateProfile.bio}"
                            </p>
                          ) : (
                            <p className="text-gray-500 text-sm italic">No bio available</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          {/* Chat Button */}
                          <button
                            onClick={() => navigate('/chat', { state: { startChatWith: conn } })}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
                            title="Start Chat"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          {/* View Profile Button */}
                          <button
                            onClick={() => navigate(`/flatmate/${conn._id}`)}
                            className="p-2 text-pink-600 hover:text-pink-700 hover:bg-pink-200 rounded-full transition-colors"
                            title="View full profile"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Remove Connection Button */}
                          <button
                            onClick={() => handleRemoveConnection(connKey)}
                            className={`p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors ${removingConnectionId === connKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Remove connection"
                            disabled={removingConnectionId === connKey}
                          >
                            {removingConnectionId === connKey ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {isEditing ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold shadow hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/edit-profile"
                className="px-6 py-2 bg-violet-100 text-violet-700 rounded-lg font-semibold shadow hover:bg-violet-200 transition-colors inline-block"
              >
                Advanced Edit
              </Link>
              <Link
                to="/change-password"
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold shadow hover:bg-red-200 transition-colors inline-block"
              >
                Change Password
              </Link>
              <Link
                to="/"
                className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-semibold shadow hover:bg-green-200 transition-colors inline-block"
              >
                Home
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Update Profile Photo</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={currentAvatar} 
                  alt="Current profile" 
                  className="w-24 h-24 rounded-full mx-auto border-4 border-pink-200 object-cover"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose new photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={imageUploadLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>
              
              {imageUploadLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Or choose an avatar style:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { 
                      name: 'initials', 
                      label: 'Initials',
                      generateUrl: (size) => `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=F472B6&color=fff&size=${size}&bold=true`,
                      bgColor: 'F472B6'
                    },
                    { 
                      name: 'geometric', 
                      label: 'Geometric',
                      generateUrl: (size) => `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=3B82F6&color=fff&size=${size}&format=svg`,
                      bgColor: '3B82F6'
                    },
                    { 
                      name: 'dicebear', 
                      label: 'Fun Avatar',
                      generateUrl: (size) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "User")}&size=${size}&backgroundColor=f59e0b`,
                      bgColor: 'f59e0b'
                    },
                    { 
                      name: 'gradient', 
                      label: 'Gradient',
                      generateUrl: (size) => `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=8B5CF6&color=fff&size=${size}&rounded=true`,
                      bgColor: '8B5CF6'
                    }
                  ].map(avatarStyle => (
                    <button
                      key={avatarStyle.name}
                      onClick={async () => {
                        const newUrl = avatarStyle.generateUrl(128);
                        setProfileImageUrl(newUrl);
                        
                        // Save the new avatar to backend
                        try {
                          const email = localStorage.getItem('userEmail');
                          const backendRes = await fetch('/api/user/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, profileImage: newUrl })
                          });
                          if (backendRes.ok) {
                            setUser(prev => ({ ...prev, profileImage: newUrl }));
                          }
                        } catch (error) {
                          console.error('Failed to save avatar:', error);
                        }
                        
                        setShowImageModal(false);
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:border-pink-300 transition-colors group"
                      title={avatarStyle.label}
                    >
                      <img 
                        src={avatarStyle.generateUrl(48)}
                        alt={avatarStyle.label}
                        className="w-10 h-10 rounded-full mx-auto group-hover:scale-110 transition-transform"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">{avatarStyle.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
