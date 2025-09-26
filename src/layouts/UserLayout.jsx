import React from 'react';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">SkyRoute</h1>
            <nav className="flex space-x-4">
              <a href="/profile" className="text-gray-600 hover:text-gray-900">Profile</a>
              <a href="/bookings" className="text-gray-600 hover:text-gray-900">Bookings</a>
              <a href="/history" className="text-gray-600 hover:text-gray-900">History</a>
              <a href="/logout" className="text-gray-600 hover:text-gray-900">Logout</a>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default UserLayout;
