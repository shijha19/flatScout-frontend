import React from 'react';
import { Navigate } from 'react-router-dom';

const FlatOwnerProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userType = localStorage.getItem('userType');
  
  if (!isLoggedIn) {
    // User not logged in - redirect to login
    return <Navigate to="/login" replace />;
  }
  
  if (userType !== 'flat_owner') {
    // User is not a flat owner - redirect to home with error message
    setTimeout(() => {
      alert('Access denied. Only flat owners can create property listings.');
    }, 100);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default FlatOwnerProtectedRoute;
