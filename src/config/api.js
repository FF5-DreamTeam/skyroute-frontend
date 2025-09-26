// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  
  // Flight endpoints
  FLIGHTS: `${API_BASE_URL}/api/flights`,
  SEARCH_FLIGHTS: `${API_BASE_URL}/api/flights/search`,
  
  // Booking endpoints
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKING_DETAILS: (id) => `${API_BASE_URL}/api/bookings/${id}`,
  
  // User endpoints
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  USER_BOOKINGS: `${API_BASE_URL}/api/user/bookings`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_AIRPORTS: `${API_BASE_URL}/api/admin/airports`,
  ADMIN_AIRCRAFTS: `${API_BASE_URL}/api/admin/aircrafts`,
  ADMIN_ROUTES: `${API_BASE_URL}/api/admin/routes`,
  ADMIN_FLIGHTS: `${API_BASE_URL}/api/admin/flights`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/admin/bookings`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
};

export default API_BASE_URL;
