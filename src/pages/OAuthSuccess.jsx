import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userLoggedIn", "true");
        // Always clear preferences flag on OAuth login to avoid stale state
        localStorage.removeItem('hasCompletedPreferences');
        // Decode the JWT to get the user's info and always update localStorage
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.name) localStorage.setItem("name", payload.name);
          if (payload.email) localStorage.setItem("userEmail", payload.email);
          // Google sometimes uses 'sub' as unique id
          if (payload._id) {
            localStorage.setItem("userId", payload._id);
          } else if (payload.sub) {
            localStorage.setItem("userId", payload.sub);
          }
          
          // Check if user has completed preferences
          if (payload.hasCompletedPreferences) {
            localStorage.setItem('hasCompletedPreferences', 'true');
            navigate("/");
          } else {
            // Double-check with server (for migration of existing users)
            try {
              const prefRes = await fetch(`/api/user/preferences-status/${encodeURIComponent(payload.email)}`);
              const prefData = await prefRes.json();
              
              if (prefRes.ok && prefData.hasCompletedPreferences) {
                localStorage.setItem('hasCompletedPreferences', 'true');
                navigate('/');
              } else {
                localStorage.removeItem('hasCompletedPreferences');
                navigate('/edit-flatmate-preferences?from=oauth');
              }
            } catch (prefErr) {
              localStorage.removeItem('hasCompletedPreferences');
              navigate('/edit-flatmate-preferences?from=oauth');
            }
          }
        } catch (e) {
          // If JWT decode fails, redirect to preferences to be safe
          navigate('/edit-flatmate-preferences?from=oauth');
        }
      }
    };

    handleOAuthSuccess();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Logging you in...</p>
        </div>
      </div>
    </div>
  );
}
