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
        return "from-emerald-500 to-emerald-600";
      case 'request_sent':
        return "from-amber-500 to-amber-600";
      case 'request_received':
        return "from-blue-500 to-blue-600";
      default:
        return "from-indigo-500 to-purple-600";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Professional Header with Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
          {/* Hero Header Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
            <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.name || 'User')}&size=160&background=6366f1&color=ffffff&bold=true`}
                  alt="Profile"
                  className="w-40 h-40 rounded-2xl border-4 border-white/30 shadow-2xl object-cover backdrop-blur-sm"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
                  {profile?.name || user?.name || 'Anonymous'}
                </h1>
                <div className="flex items-center justify-center lg:justify-start text-white/80 text-lg mb-6">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile?.locationPreference || user?.location || "Location not specified"}
                </div>
                
                {/* Professional Tags */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                  {profile?.gender && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm font-medium">
                      {profile.gender}
                    </span>
                  )}
                  {profile?.budget && (
                    <span className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 rounded-xl text-sm font-medium">
                      Budget: ₹{profile.budget}
                    </span>
                  )}
                  {profile?.preferredGender && (
                    <span className="px-4 py-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-100 rounded-xl text-sm font-medium">
                      Prefers: {profile.preferredGender}
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleConnect}
                    disabled={connecting || connectionStatus !== 'not_connected'}
                    className={`px-8 py-4 bg-gradient-to-r ${getButtonColor()} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[160px]`}
                  >
                    {getButtonText()}
                  </button>
                  
                  {/* Chat Button - Only show if connected */}
                  {connectionStatus === 'accepted' && (
                    <button
                      onClick={handleStartChat}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 min-w-[160px]"
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

          {/* Main Content Grid */}
          <div className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column - Contact & About */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Contact Information Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500">Email Address</p>
                        <p className="text-sm text-slate-900 truncate">{profile?.userEmail || user?.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500">Phone Number</p>
                        <p className="text-sm text-slate-900">{user?.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {(profile?.bio || user?.bio) && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      About Me
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-slate-700 leading-relaxed">
                        {profile?.bio || user?.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Preferences & Details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Living Preferences */}
                {profile && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      Living Preferences
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Lifestyle Habits */}
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          Lifestyle & Habits
                        </h4>
                        <div className="space-y-3">
                          {profile.habits?.cleanliness && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Cleanliness</span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                                {profile.habits.cleanliness}
                              </span>
                            </div>
                          )}
                          {profile.habits?.smoking && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Smoking</span>
                              <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs rounded-full font-semibold">
                                {profile.habits.smoking}
                              </span>
                            </div>
                          )}
                          {profile.habits?.pets && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Pets</span>
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                                {profile.habits.pets}
                              </span>
                            </div>
                          )}
                          {(profile.habits?.sleepTime || profile.habits?.sleep) && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Sleep Schedule</span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                                {profile.habits.sleepTime || profile.habits.sleep}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          Personal Details
                        </h4>
                        <div className="space-y-3">
                          {profile.ageRange && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Age Range</span>
                              <span className="text-slate-900 font-semibold">{profile.ageRange}</span>
                            </div>
                          )}
                          {profile.occupation && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Occupation</span>
                              <span className="text-slate-900 font-semibold">{profile.occupation}</span>
                            </div>
                          )}
                          {profile.moveInDate && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Move-in Date</span>
                              <span className="text-slate-900 font-semibold">{new Date(profile.moveInDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {profile.roomType && (
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-slate-600 font-medium">Room Type</span>
                              <span className="text-slate-900 font-semibold">{profile.roomType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interests & Hobbies */}
                {profile?.interests && profile.interests.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      Interests & Hobbies
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                        >
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
      </div>
    </div>
  );
}

console.log("FlatmateProfile loaded");
