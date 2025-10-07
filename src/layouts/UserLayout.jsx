import React from 'react';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default UserLayout;
