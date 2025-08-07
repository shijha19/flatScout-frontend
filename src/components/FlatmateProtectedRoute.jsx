import React from 'react';
import { Navigate } from 'react-router-dom';

const FlatmateProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('userLoggedIn');
  const hasCompletedPreferences = !!localStorage.getItem('hasCompletedPreferences');
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in but hasn't completed preferences, redirect to preferences form
  if (!hasCompletedPreferences) {
    return <Navigate to="/edit-flatmate-preferences?from=incomplete" replace />;
  }
  
  return children;
};

export default FlatmateProtectedRoute;
