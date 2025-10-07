import React from 'react';
import { HeroSearch, PopularDestinations, Footer } from '../../components';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSearch />
      <div className="section-spacer"></div>
      <PopularDestinations />
      <Footer />
    </div>
  );
};

export default HomePage;
