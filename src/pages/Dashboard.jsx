import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

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
      <h1>Welcome to your Dashboard!</h1>
      <p>You have successfully logged in and completed your profile setup.</p>
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
      </div>
    </div>
  );
}
