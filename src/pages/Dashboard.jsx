import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Check user type for conditional rendering
  const userType = localStorage.getItem('userType');
  const userName = localStorage.getItem('name') || 'User';
  const isFlatOwner = userType === 'flat_owner';

  useEffect(() => {
    // Check if user has completed preferences
    const hasCompletedPreferences = localStorage.getItem("hasCompletedPreferences");
    
    if (!hasCompletedPreferences) {
      // Redirect to preferences form
      navigate('/edit-flatmate-preferences?from=dashboard');
    }
  }, [navigate]);

  return (
    <div style={{ padding: 32 }}>
      <h1>Welcome to your Dashboard, {userName}!</h1>
      <p className="mb-4">
        You have successfully logged in and completed your profile setup as a{' '}
        <span className="font-semibold text-blue-600">
          {isFlatOwner ? 'Flat Owner' : 'Flat Finder'}
        </span>.
      </p>
      <div className="mt-6 space-y-4">
        <a 
          href="/find-flatmate" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Find Flatmates
        </a>
        <br />
        <a 
          href="/explore-flats" 
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Explore Flats
        </a>
        {/* Show List Property option only for flat owners */}
        {isFlatOwner && (
          <>
            <br />
            <a 
              href="/flat-listings" 
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              📝 List Your Property
            </a>
          </>
        )}
      </div>
    </div>
  );
}
