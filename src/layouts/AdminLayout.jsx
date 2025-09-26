import React from 'react';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">SkyRoute Admin</h1>
            <nav className="flex space-x-4">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/admin/airports" className="text-gray-600 hover:text-gray-900">Airports</a>
              <a href="/admin/aircrafts" className="text-gray-600 hover:text-gray-900">Aircrafts</a>
              <a href="/admin/routes" className="text-gray-600 hover:text-gray-900">Routes</a>
              <a href="/admin/flights" className="text-gray-600 hover:text-gray-900">Flights</a>
              <a href="/admin/bookings" className="text-gray-600 hover:text-gray-900">Bookings</a>
              <a href="/admin/users" className="text-gray-600 hover:text-gray-900">Users</a>
              <a href="/logout" className="text-gray-600 hover:text-gray-900">Logout</a>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
