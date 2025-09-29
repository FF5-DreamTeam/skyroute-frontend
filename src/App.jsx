import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import FlightDetailsPage from './pages/public/FlightDetailsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import BookingsPage from './pages/user/BookingsPage';
import BookingDetailsPage from './pages/user/BookingDetailsPage';
import HistoryPage from './pages/user/HistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AirportsPage from './pages/admin/AirportsPage';
import AircraftsPage from './pages/admin/AircraftsPage';
import RoutesPage from './pages/admin/RoutesPage';
import FlightsPage from './pages/admin/FlightsPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import UsersPage from './pages/admin/UsersPage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        } />
        <Route path="/search" element={
          <PublicLayout>
            <SearchPage />
          </PublicLayout>
        } />
        <Route path="/flight/:id" element={
          <PublicLayout>
            <FlightDetailsPage />
          </PublicLayout>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        } />
        <Route path="/register" element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        } />
        <Route path="/forgot-password" element={
          <PublicLayout>
            <ForgotPasswordPage />
          </PublicLayout>
        } />
        <Route path="/reset-password" element={
          <PublicLayout>
            <ForgotPasswordPage />
          </PublicLayout>
        } />

        {/* User Routes */}
        <Route path="/profile" element={
          <UserLayout>
            <ProfilePage />
          </UserLayout>
        } />
        <Route path="/bookings" element={
          <UserLayout>
            <BookingsPage />
          </UserLayout>
        } />
        <Route path="/booking-details/:bookingId" element={
          <UserLayout>
            <BookingDetailsPage />
          </UserLayout>
        } />
        <Route path="/history" element={
          <UserLayout>
            <HistoryPage />
          </UserLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/admin/airports" element={
          <AdminLayout>
            <AirportsPage />
          </AdminLayout>
        } />
        <Route path="/admin/aircrafts" element={
          <AdminLayout>
            <AircraftsPage />
          </AdminLayout>
        } />
        <Route path="/admin/routes" element={
          <AdminLayout>
            <RoutesPage />
          </AdminLayout>
        } />
        <Route path="/admin/flights" element={
          <AdminLayout>
            <FlightsPage />
          </AdminLayout>
        } />
        <Route path="/admin/bookings" element={
          <AdminLayout>
            <AdminBookingsPage />
          </AdminLayout>
        } />
        <Route path="/admin/users" element={
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
