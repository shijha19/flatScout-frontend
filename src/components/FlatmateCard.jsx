
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FlatmateCard({ profile, alreadyConnected }) {
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check connection status on mount
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;
        
        // Prioritize using the document's _id (which is always a valid ObjectId)
        // Fall back to userId only if _id is not available and is in ObjectId format
        let connectToUserId = profile._id;
        if (!connectToUserId) {
          const userId = profile.userId;
          if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
            connectToUserId = userId;
          } else if (profile.userEmail) {
            // As a last resort, use userEmail (backend can handle this now)
            connectToUserId = profile.userEmail;
          }
        }
        
        if (!connectToUserId) return;

        const res = await fetch(`/api/connection/connection-status?userEmail=${encodeURIComponent(userEmail)}&targetUserId=${connectToUserId}`);
        const data = await res.json();
        
        if (res.ok) {
          setConnectionStatus(data.status);
        }
      } catch (err) {
        console.error('Error checking connection status:', err);
      }
    };

    if (alreadyConnected) {
      setConnectionStatus('connected');
    } else {
      checkConnectionStatus();
    }
  }, [profile, alreadyConnected]);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) throw new Error("You must be logged in to connect.");
      
      // Always use actualUserId (the receiver's User ObjectId) if available
      let connectToUserId = profile.actualUserId;
      // Fallbacks for legacy data
      if (!connectToUserId) {
        if (profile._id && /^[a-fA-F0-9]{24}$/.test(profile._id)) {
          connectToUserId = profile._id;
        } else if (profile.userId && /^[a-fA-F0-9]{24}$/.test(profile.userId)) {
          connectToUserId = profile.userId;
        } else if (profile.userEmail) {
          connectToUserId = profile.userEmail;
        }
      }
      if (!connectToUserId) {
        throw new Error("Unable to connect to this user. Profile data may be incomplete.");
      }
      
      const res = await fetch("/api/connection/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, connectToUserId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send connection request");
      
      setConnectionStatus('request_sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'connected':
        return "Connected";
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
        return "bg-gradient-to-r from-green-200 to-green-300";
      case 'request_sent':
        return "bg-gradient-to-r from-yellow-200 to-yellow-300";
      case 'request_received':
        return "bg-gradient-to-r from-blue-200 to-blue-300";
      default:
        return "bg-gradient-to-r from-pink-200 to-yellow-200";
    }
  };

  const isButtonDisabled = () => {
    return connecting || connectionStatus !== 'not_connected';
  };

  return (
    <div
      className="group border p-5 rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg flex flex-col items-center cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-200 relative w-full max-w-xs min-h-[420px]"
      onClick={() => {
        // Use actualUserId if available (this is the User's _id from backend enhancement)
        // Otherwise, prioritize using the document's _id, fall back to userId if it's in ObjectId format
        let navId = profile.actualUserId || profile._id;
        if (!navId) {
          const userId = profile.userId;
          if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
            navId = userId;
          } else if (profile.userEmail) {
            // For navigation with email, we need to encode it properly
            navId = encodeURIComponent(profile.userEmail);
          } else if (userId) {
            // Last resort: try the userId even if it's not ObjectId format
            navId = encodeURIComponent(userId);
          }
        }
        
        // Debug log to see what we're navigating with
        console.log('Navigating to flatmate profile with ID:', navId, 'original profile:', {
          actualUserId: profile.actualUserId,
          _id: profile._id,
          userId: profile.userId,
          userEmail: profile.userEmail,
          name: profile.name
        });
        
        if (navId) {
          navigate(`/flatmate/${navId}`);
        } else {
          console.error('Cannot navigate: no valid user ID found', profile);
          alert('Unable to view this profile. Profile data may be incomplete.');
        }
      }}
      title="Click to view full profile"
    >
      <div className="absolute top-3 right-3">
        <span className={`inline-block w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-400' : 
          connectionStatus === 'request_sent' ? 'bg-yellow-400' :
          connectionStatus === 'request_received' ? 'bg-blue-400' : 'bg-gray-300'
        } border-2 border-white`} title={
          connectionStatus === 'connected' ? 'Connected' :
          connectionStatus === 'request_sent' ? 'Request Sent' :
          connectionStatus === 'request_received' ? 'Request Received' : 'Not connected'
        }></span>
      </div>
      <img
        src={profile.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}`}
        alt="Flatmate"
        className="w-24 h-24 rounded-full mb-3 border-4 border-blue-200 object-cover shadow"
      />
      <h3 className="text-xl font-extrabold text-gray-800 mb-1 group-hover:underline">{profile.name || 'Anonymous'}</h3>
      <div className="text-gray-500 text-sm mb-2 italic text-center line-clamp-2 max-w-xs">{profile.bio}</div>
      <div className="flex flex-wrap gap-2 mb-2 justify-center">
        <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">{profile.gender}</span>
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-900 text-xs font-semibold">{profile.locationPreference || profile.location}</span>
        <span className="px-2 py-1 rounded bg-green-50 text-green-900 text-xs font-semibold">Budget: ₹{profile.budget}</span>
        <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-900 text-xs font-semibold">Prefers: {profile.preferredGender}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 justify-center">
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">Cleanliness: {profile.habits?.cleanliness || profile.cleanliness}</span>
        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">Smoking: {profile.habits?.smoking || profile.smoking}</span>
        <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs">Pets: {profile.habits?.pets || profile.pets}</span>
        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs">Sleep: {profile.habits?.sleep || profile.sleep}</span>
      </div>
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      <button
        className={`mt-2 px-5 py-2 bg-neutral-700 text-white font-semibold rounded-xl shadow hover:bg-neutral-800 transition disabled:opacity-50 z-10`}
        onClick={e => { e.stopPropagation(); handleConnect(); }}
        disabled={isButtonDisabled()}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
