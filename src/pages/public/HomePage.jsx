import React from 'react';
import { HeroSearch, PopularDestinations, Footer } from '../../components';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSearch />
      <PopularDestinations />
      <Footer />
    </div>
  );
};

export default HomePage;
