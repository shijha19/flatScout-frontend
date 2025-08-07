import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FlatmateProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('not_connected');

  useEffect(() => {
    // Decode the userId in case it's URL-encoded (e.g., if it's an email)
    const decodedUserId = decodeURIComponent(userId);
    console.log('FlatmateProfile loading with userId:', userId, 'decoded:', decodedUserId);
    setLoading(true);
    fetch(`/api/flatmates/profile/full/${encodeURIComponent(decodedUserId)}`)
      .then(res => res.json())
      .then(res => {
        console.log('FlatmateProfile API response:', res);
        if (res.error || res.message) {
          setError(res.error || res.message);
          setData(null);
        } else {
          setData(res);
          // Check connection status
          checkConnectionStatus();
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('FlatmateProfile API error:', err);
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [userId]);

  const checkConnectionStatus = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const decodedUserId = decodeURIComponent(userId);
      const res = await fetch(`/api/connection/connection-status?userEmail=${encodeURIComponent(userEmail)}&targetUserId=${encodeURIComponent(decodedUserId)}`);
      const data = await res.json();
      
      if (res.ok) {
        setConnectionStatus(data.status);
      }
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) throw new Error("You must be logged in to connect.");
      
      const decodedUserId = decodeURIComponent(userId);
      const res = await fetch("/api/connection/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, connectToUserId: decodedUserId })
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Failed to send connection request");
      setConnectionStatus('request_sent');
    } catch (err) {
      alert(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleStartChat = () => {
    // Navigate to chat page
    navigate('/chat', { 
      state: { 
        startChatWith: {
          _id: data.user._id,
          name: data.profile?.name || data.user?.name,
          email: data.profile?.userEmail || data.user?.email,
          profilePicture: data.profile?.photoUrl || data.user?.profileImage
        }
      }
    });
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'connected':
        return "Connected!";
      case 'request_sent':
        return "Request Sent";
      case 'request_received':
        return "Request Received";
      default:
        return connecting ? "Sending..." : "Connect";
    }
  };

  const getButtonColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return "from-green-500 to-green-600";
      case 'request_sent':
        return "from-yellow-500 to-yellow-600";
      case 'request_received':
        return "from-blue-500 to-blue-600";
      default:
        return "from-pink-500 to-yellow-500";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-600">{error}</div>
      </div>
    </div>
  );
  
  if (!data) return null;

  const { user, profile } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-pink-600 hover:text-pink-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Find Flatmates
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.name || 'User')}&size=128`}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-pink-200 shadow-lg object-cover"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-pink-700 mb-2">
                  {profile?.name || user?.name || 'Anonymous'}
                </h1>
                <p className="text-gray-600 text-lg mb-3">
                  {profile?.locationPreference || user?.location || "Location not specified"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {profile?.gender && (
                    <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-sm font-semibold">
                      {profile.gender}
                    </span>
                  )}
                  {profile?.budget && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                      Budget: ₹{profile.budget}
                    </span>
                  )}
                  {profile?.preferredGender && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                      Prefers: {profile.preferredGender}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <button
                    onClick={handleConnect}
                    disabled={connecting || connectionStatus !== 'not_connected'}
                    className={`px-6 py-3 bg-gradient-to-r ${getButtonColor()} text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {getButtonText()}
                  </button>
                  
                  {/* Chat Button - Only show if connected */}
                  {connectionStatus === 'accepted' && (
                    <button
                      onClick={handleStartChat}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Start Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-8">
            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile?.userEmail || user?.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user?.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {(profile?.bio || user?.bio) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.bio || user?.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Flatmate Preferences */}
            {profile && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Living Preferences
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Habits */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Habits & Lifestyle</h3>
                    <div className="space-y-3">
                      {profile.habits?.cleanliness && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cleanliness</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                            {profile.habits.cleanliness}
                          </span>
                        </div>
                      )}
                      {profile.habits?.smoking && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Smoking</span>
                          <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded font-medium">
                            {profile.habits.smoking}
                          </span>
                        </div>
                      )}
                      {profile.habits?.pets && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pets</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium">
                            {profile.habits.pets}
                          </span>
                        </div>
                      )}
                      {(profile.habits?.sleepTime || profile.habits?.sleep) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sleep Schedule</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                            {profile.habits.sleepTime || profile.habits.sleep}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Details</h3>
                    <div className="space-y-3">
                      {profile.ageRange && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age Range</span>
                          <span className="font-medium">{profile.ageRange}</span>
                        </div>
                      )}
                      {profile.occupation && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Occupation</span>
                          <span className="font-medium">{profile.occupation}</span>
                        </div>
                      )}
                      {profile.moveInDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Move-in Date</span>
                          <span className="font-medium">{new Date(profile.moveInDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {profile.roomType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Type</span>
                          <span className="font-medium">{profile.roomType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interests/Hobbies if available */}
            {profile?.interests && profile.interests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Interests & Hobbies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-2 bg-gradient-to-r from-pink-100 to-yellow-100 text-pink-700 rounded-full text-sm font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

console.log("FlatmateProfile loaded");
