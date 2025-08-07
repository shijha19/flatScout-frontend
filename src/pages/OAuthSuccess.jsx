import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userLoggedIn", "true");
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
      } catch (e) {}
      navigate("/"); // Redirect to App.jsx (main app page)
    }
  }, [location]);

  return <p>Logging you in...</p>;
}
