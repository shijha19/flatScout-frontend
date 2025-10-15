import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getApiUrl } from '../utils/environment';

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const isLoggedIn = !!localStorage.getItem('userLoggedIn');
        
        if (!isLoggedIn || !userEmail) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check admin status by trying to fetch dashboard stats
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/admin/dashboard-stats?userEmail=${encodeURIComponent(userEmail)}`);
        
        if (response.status === 403) {
          setIsAdmin(false);
        } else if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!localStorage.getItem('userLoggedIn')) {
    return <Navigate to="/login" replace />;
  }

  // If not admin, redirect to home
  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
