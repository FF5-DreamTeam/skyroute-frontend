import React from 'react';
import { Header } from '../components';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default PublicLayout;
