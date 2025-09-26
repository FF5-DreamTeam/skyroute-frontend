import React from 'react';

const Header = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">SkyRoute</h1>
          <nav className="flex space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="/search" className="text-gray-600 hover:text-gray-900">Search</a>
            <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
