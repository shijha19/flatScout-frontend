
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import FlatmateProtectedRoute from './components/FlatmateProtectedRoute';
import FlatOwnerProtectedRoute from './components/FlatOwnerProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Layout from './components/Layout';
import App from './components/App';
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import FindFlatmates from './components/FindFlatmates';
import FlatmateForm from './components/FlatmateForm';
import EmailTest from './components/EmailTest';
import ExploreFlats from './pages/ExploreFlats';



import Profile from './pages/Profile';
import FlatDetails from './pages/FlatDetails';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import FlatListings from './pages/FlatListings';
import OAuthSuccess from './pages/OAuthSuccess';
import OAuthTest from './pages/OAuthTest';
import Dashboard from './pages/Dashboard';
import FlatmateProfile from './pages/FlatmateProfile';
import BookingCalendar from './pages/BookingCalendar';
import ReportListing from './pages/ReportListing';
import RentEstimator from './pages/RentEstimator';
import AdminDashboard from './pages/AdminReportDashboard';
import ChatPage from './pages/ChatPage';
import NotificationTest from './components/NotificationTest';
import WishlistPage from './pages/WishlistPage';
import EnvironmentDebug from './components/EnvironmentDebug';
import ApiTester from './components/ApiTester';

const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/explore-flats" element={<ExploreFlats />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      {/* Flatmate preferences accessible to new users */}
      <Route path="/edit-flatmate-preferences" element={<FlatmateForm />} />
      {/* Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/flat-listings" element={<FlatOwnerProtectedRoute><FlatListings /></FlatOwnerProtectedRoute>} />
      <Route path="/flats/:id" element={<ProtectedRoute><FlatDetails /></ProtectedRoute>} />
      <Route path="/find-flatmate" element={<FlatmateProtectedRoute><FindFlatmates /></FlatmateProtectedRoute>} />
      <Route path="/flatmate/:userId" element={<FlatmateProtectedRoute><FlatmateProfile /></FlatmateProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/booking-calendar" element={<ProtectedRoute><BookingCalendar /></ProtectedRoute>} />
      <Route path="/report-listing" element={<ProtectedRoute><ReportListing /></ProtectedRoute>} />
      <Route path="/rent-estimator" element={<ProtectedRoute><RentEstimator /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/test-email" element={<ProtectedRoute><EmailTest /></ProtectedRoute>} />
      <Route path="/test-notifications" element={<ProtectedRoute><NotificationTest /></ProtectedRoute>} />
      {/* Debug Page - Troubleshooting Only */}
      <Route path="/debug" element={<EnvironmentDebug />} />
      <Route path="/api-test" element={<ApiTester />} />
      {/* OAuth Test Page - Development Only */}
      <Route path="/oauth-test" element={<OAuthTest />} />
      {/* Admin Dashboard - Admin Only */}
      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      {/* OAuth success must be public so it can set login state */}
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  </Layout>
);

export default AppRoutes;
