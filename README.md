# SkyRoute Frontend

[![temp-Imageil-Xg8l.avif](https://i.postimg.cc/C5D6cGMc/temp-Imageil-Xg8l.avif)](https://postimg.cc/Lg9TXZ1P)

A modern React frontend application for an airline booking system with comprehensive admin management capabilities.

[⬆️ Back to Top](#table-of-contents)

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
  - [Public Features](#public-features)
  - [Authentication](#authentication)
  - [User Dashboard](#user-dashboard)
  - [Admin Panel](#admin-panel)
  - [UI/UX Features](#uiux-features)
  - [Technical Features](#technical-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Backend Configuration](#backend-configuration)
  - [API Endpoints](#api-endpoints)
  - [Authentication Details](#authentication-details)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
  - [Core Technologies](#core-technologies)
  - [UI Libraries](#ui-libraries)
  - [Utilities](#utilities)
  - [Development Tools](#development-tools)
- [Project Architecture](#project-architecture)
  - [Component Structure](#component-structure)
  - [State Management](#state-management)
  - [API Integration](#api-integration)
  - [Styling](#styling)
- [Deployment](#deployment)
  - [Production Build](#production-build)
  - [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── header/         # Header component with navigation
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   └── index.js
│   ├── footer/         # Footer component
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   └── index.js
│   ├── heroSearch/     # Hero search section with main and additional search
│   │   ├── HeroSearch.jsx
│   │   ├── HeroSearch.css
│   │   └── index.js
│   ├── popularDestinations/ # Popular destinations component
│   │   ├── PopularDestinations.jsx
│   │   ├── PopularDestinations.css
│   │   └── index.js
│   └── admin/          # Admin-specific components
│       ├── AdminModal.jsx      # Universal modal for CRUD operations
│       ├── AdminModal.css      # Modal styles
│       ├── DataTable.jsx       # Data table with pagination and search
│       ├── DataTable.css       # Table styles
│       ├── ConfirmModal.jsx    # Confirmation dialogs
│       ├── ConfirmModal.css    # Confirmation modal styles
│       ├── RoleChangeModal.jsx # User role management
│       ├── RoleChangeModal.css # Role change modal styles
│       ├── StatusChangeModal.jsx # Booking status management
│       ├── StatusChangeModal.css # Status change modal styles
│       ├── FlightStatusModal.jsx # Flight availability management
│       └── FlightStatusModal.css # Flight status modal styles
├── layouts/            # Layout components for different sections
│   ├── PublicLayout.jsx
│   ├── UserLayout.jsx
│   └── AdminLayout.jsx
├── pages/              # Page components
│   ├── public/         # Public pages (Home, Search, Flight Details)
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── SearchPage.css
│   │   ├── FlightDetailsPage.jsx
│   │   └── FlightDetailsPage.css
│   ├── auth/           # Authentication pages (Login, Register, Forgot Password)
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── AuthPages.css
│   ├── user/           # User pages (Profile, Bookings, Booking Details, History)
│   │   ├── ProfilePage.jsx
│   │   ├── ProfilePage.css
│   │   ├── BookingsPage.jsx
│   │   ├── BookingsPage.css
│   │   ├── BookingsPageFilters.css
│   │   ├── BookingDetailsPage.jsx
│   │   ├── BookingDetailsPage.css
│   │   ├── HistoryPage.jsx
│   │   └── HistoryPage.css
│   └── admin/          # Admin pages (Centralized Dashboard)
│       ├── AdminDashboard.jsx  # Main admin dashboard with tabs
│       └── AdminDashboard.css  # Dashboard styles

```

## Features

### Public Features

- **Home Page**: Hero search section with popular destinations
- **Flight Search**: Advanced search with filters (date, price, airports)
- **Flight Details**: Detailed flight information with booking functionality
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Authentication

- **User Registration**: Complete user registration with validation
- **User Login**: Secure login with JWT token authentication
- **Password Recovery**: Forgot password functionality
- **Session Management**: Token-based authentication with localStorage

### User Dashboard

- **Profile Management**: Complete profile with photo upload, personal details
- **Booking Management**: View, cancel, and manage flight bookings
- **Booking Details**: Detailed view of individual bookings with passenger info
- **Booking History**: Historical view of all past bookings
- **Real-time Validation**: Form validation with immediate feedback

### Admin Panel

- **Centralized Dashboard**: Single-page interface with tabbed navigation
- **Entity Management**: Full CRUD operations for all entities
  - **Users**: Manage user accounts, roles, and permissions
  - **Airports**: Airport information and image management
  - **Aircrafts**: Aircraft fleet management with capacity tracking
  - **Routes**: Flight route management with airport connections
  - **Flights**: Flight scheduling with real-time validation
  - **Bookings**: Booking management and status updates
- **Advanced Features**:
  - **Search by ID**: Quick entity lookup functionality on each tab
  - **Bulk Operations**: Mass data management capabilities
  - **Real-time Validation**: Form validation with capacity checks
  - **Image Management**: Upload and preview images for airports/users
  - **Status Management**: Change booking and flight statuses
  - **Role Management**: User role assignment and updates
- **Responsive Design**: Fully responsive admin interface
- **Data Tables**: Paginated tables with sorting and filtering
- **Modal System**: Universal modal system for all CRUD operations
- **Tabbed Interface**: Easy navigation between different entity types

### UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Components**: Rich UI with Mantine components
- **Form Validation**: Real-time validation with user feedback
- **Loading States**: Proper loading indicators throughout
- **Error Handling**: Comprehensive error handling and user notifications
- **Accessibility**: Keyboard navigation and screen reader support

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **API Integration**: RESTful API integration with error handling
- **State Management**: React hooks for state management
- **Form Handling**: Advanced form handling with validation
- **Date Management**: Date picker integration with dayjs
- **File Upload**: Image upload functionality
- **Search & Filter**: Advanced search and filtering capabilities

[⬆️ Back to Top](#table-of-contents)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 8080

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd skyroute-front
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. The application will open at `http://localhost:3000`

### Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Backend Configuration

The application is configured to connect to a backend API running on `http://localhost:8080`.

### API Endpoints

API endpoints are defined in `src/config/api.js` and include:

- **Authentication**: Login, register, password recovery
- **Public**: Flight search, flight details, airport data
- **User**: Profile management, bookings, booking history
- **Admin**: Full CRUD operations for all entities

### Authentication Details

The application uses JWT (JSON Web Token) authentication:

- Tokens are stored in localStorage
- Automatic token validation on API requests
- Protected routes require authentication
- Admin routes require admin role

[⬆️ Back to Top](#table-of-contents)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Technologies Used

### Core Technologies

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Create React App** - Build tooling and development server

### UI Libraries

- **Mantine** - React components library
  - DatePickerInput for date selection
  - Modal, Button, Text, Stack, Alert components
- **React Phone Number Input** - International phone number input
- **Sonner** - Toast notifications

### Utilities

- **dayjs** - Date manipulation library
- **React Hooks** - State management and side effects

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

[⬆️ Back to Top](#table-of-contents)

## Project Architecture

### Component Structure

- **Layout Components**: Provide consistent page layouts (Public, User, Admin)
- **Page Components**: Main application pages organized by user type
- **Admin Components**: Specialized admin interface components with universal modals
- **Search Components**: Hero search with main and additional search functionality
- **Modal System**: Universal modal system for all CRUD operations
- **Navigation Components**: Header and footer with responsive design

### State Management

- React hooks (useState, useEffect, useCallback)
- Context API for global state
- Local component state for UI interactions

### API Integration

- Centralized API configuration
- Service layer for admin operations
- Error handling and loading states
- Token-based authentication

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS for complex components
- CSS custom properties for theming
- Responsive design patterns

[⬆️ Back to Top](#table-of-contents)

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

[⬆️ Back to Top](#table-of-contents)
