// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Utility functions
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

export const getMultipartHeaders = (token) => ({
  'Authorization': `Bearer ${token}`
});

export const API_ENDPOINTS = {
  // AUTHENTICATION
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },

  // AIRCRAFT MANAGEMENT
  AIRCRAFTS: {
    BASE: `${API_BASE_URL}/api/aircrafts`,
    BY_ID: (id) => `${API_BASE_URL}/api/aircrafts/${id}`,
  },

  // AIRPORT MANAGEMENT
  AIRPORTS: {
    BASE: `${API_BASE_URL}/api/airports`,
    BY_ID: (id) => `${API_BASE_URL}/api/airports/${id}`,
  },

  // ROUTE MANAGEMENT
  ROUTES: {
    BASE: `${API_BASE_URL}/api/routes`,
    BY_ID: (id) => `${API_BASE_URL}/api/routes/${id}`,
  },

  // BOOKING MANAGEMENT
  BOOKINGS: {
    BASE: `${API_BASE_URL}/api/bookings`,
    USER_BOOKINGS: `${API_BASE_URL}/api/bookings/user`,
    USER_BOOKINGS_FILTERED: `${API_BASE_URL}/api/bookings/user/filtered`,
    BY_ID: (id) => `${API_BASE_URL}/api/bookings/${id}`,
    UPDATE_STATUS: (id, status) => `${API_BASE_URL}/api/bookings/${id}/status?status=${status}`,
    CONFIRM: (id) => `${API_BASE_URL}/api/bookings/${id}/confirm`,
    CANCEL: (id) => `${API_BASE_URL}/api/bookings/${id}/cancel`,
    UPDATE_PASSENGER_NAMES: (id) => `${API_BASE_URL}/api/bookings/${id}/passenger-names`,
    UPDATE_PASSENGER_BIRTH_DATES: (id) => `${API_BASE_URL}/api/bookings/${id}/passenger-birth-dates`,
  },

  // FLIGHT MANAGEMENT
  FLIGHTS: {
    // Admin endpoints
    ADMIN: {
      BASE: `${API_BASE_URL}/api/flights/admin`,
      BY_ID: (id) => `${API_BASE_URL}/api/flights/admin/${id}`,
    },
    // Public endpoints
    PUBLIC: {
      SEARCH: `${API_BASE_URL}/api/flights/search`,
      SEARCH_FILTERS: `${API_BASE_URL}/api/flights/search-filters`,
      BUDGET: `${API_BASE_URL}/api/flights/budget`,
      BY_ID: (id) => `${API_BASE_URL}/api/flights/${id}`,
      BY_CITY: (city) => `${API_BASE_URL}/api/flights/city/${encodeURIComponent(city)}`,
      MIN_PRICES: `${API_BASE_URL}/api/flights/min-prices`,
    },
  },

  // USER MANAGEMENT
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    BY_EMAIL: (email) => `${API_BASE_URL}/api/users/email/${email}`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    UPDATE_ROLE: (id) => `${API_BASE_URL}/api/users/${id}/role`,
  },

  // LEGACY ENDPOINTS 
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  USER_BOOKINGS: `${API_BASE_URL}/api/user/bookings`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_AIRPORTS: `${API_BASE_URL}/api/admin/airports`,
  ADMIN_AIRCRAFTS: `${API_BASE_URL}/api/admin/aircrafts`,
  ADMIN_ROUTES: `${API_BASE_URL}/api/admin/routes`,
  ADMIN_FLIGHTS: `${API_BASE_URL}/api/admin/flights`,
  ADMIN_BOOKINGS: `${API_BASE_URL}/api/admin/bookings`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
};

export default API_BASE_URL;
