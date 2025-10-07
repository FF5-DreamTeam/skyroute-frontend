import React from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'dayjs/locale/en';

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

function App() {
  return (
    <MantineProvider theme={{
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      primaryColor: 'teal',
      defaultRadius: 'md',
      colors: {
        teal: [
          '#e6fcf5','#c3fae8','#96f2d7','#63e6be','#38d9a9','#20c997','#12b886','#0ca678','#099268','#087f5b'
        ]
      }
    }}
    withGlobalStyles withNormalizeCSS>
      <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0 }}>
        <Router basename={process.env.PUBLIC_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster 
            position="top-right" 
            theme="light"
            toastOptions={{
              style: {
                background: 'var(--color-background)',
                border: '1px solid var(--color-background-2)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-lg)'
              },
              className: 'custom-toast'
            }}
          />
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
          </Routes>
        </Router>
      </DatesProvider>
    </MantineProvider>
  );
}

export default App;
