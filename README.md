# SkyRoute Frontend

A React + Tailwind CSS frontend application for an airline booking system.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Header, Footer, etc.)
│   ├── forms/          # Form components
│   ├── search/         # Search-related components
│   └── admin/          # Admin-specific components
├── layouts/            # Layout components for different sections
│   ├── PublicLayout.jsx
│   ├── UserLayout.jsx
│   └── AdminLayout.jsx
├── pages/              # Page components
│   ├── public/         # Public pages (Home, Search, Flight Details)
│   ├── auth/           # Authentication pages (Login, Register, Forgot Password)
│   ├── user/           # User pages (Profile, Bookings, History)
│   └── admin/          # Admin pages (Dashboard, Management pages)
├── config/             # Configuration files
│   └── api.js          # API endpoints configuration
├── App.jsx             # Main App component
├── index.js            # Entry point
└── index.css           # Global styles with Tailwind CSS
```

## Features

- **Public Pages**: Home, Search, Flight Details
- **Authentication**: Login, Register, Forgot Password
- **User Dashboard**: Profile, Bookings, Booking Details, History
- **Admin Panel**: Dashboard, Airports, Aircrafts, Routes, Flights, Bookings, Users management
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **API Integration**: Configured to connect with backend on port 8080

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. The application will open at `http://localhost:3000`

## Backend Configuration

The application is configured to connect to a backend API running on `http://localhost:8080`.

API endpoints are defined in `src/config/api.js` and include:

- Authentication endpoints
- Flight search and booking endpoints
- User management endpoints
- Admin management endpoints

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 18
- React Router DOM
- Tailwind CSS
- Create React App
# skyroute-frontend
