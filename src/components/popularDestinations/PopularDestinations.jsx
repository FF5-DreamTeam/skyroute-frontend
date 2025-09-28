import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './PopularDestinations.css';

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const [routesResponse, airportsResponse] = await Promise.all([
          fetch(API_ENDPOINTS.ROUTES.BASE),
          fetch(API_ENDPOINTS.AIRPORTS.BASE)
        ]);

        if (!routesResponse.ok || !airportsResponse.ok) {
          throw new Error(`Failed to fetch data: ${routesResponse.status} ${airportsResponse.status}`);
        }

        const [routes, airports] = await Promise.all([
          routesResponse.json(),
          airportsResponse.json()
        ]);


        const destinationIds = [...new Set(routes.map(route => route.destination.id))];
        const destinationAirports = airports.filter(airport => 
          destinationIds.includes(airport.id)
        );

        const destinationsWithPrices = destinationAirports.slice(0, 6).map((airport, index) => {    
          const basePrices = {
            'New York': 450,
            'Los Angeles': 380,
            'London': 320,
            'Paris': 280,
            'Tokyo': 650,
            'Dubai': 420,
            'Singapore': 480,
            'Hong Kong': 520,
            'Frankfurt': 290,
            'Madrid': 250,
            'Rome': 270,
            'Amsterdam': 310,
            'Zurich': 350,
            'Vienna': 320,
            'Istanbul': 180,
            'Doha': 380,
            'Seoul': 580,
            'Beijing': 420,
            'Sydney': 720
          };
          
          const basePrice = basePrices[airport.city] || 300;
          const variation = Math.floor(Math.random() * 100) - 50;
          const minPrice = Math.max(99, basePrice + variation);
          
          return {
            ...airport,
            minPrice: minPrice
          };
        });

        setDestinations(destinationsWithPrices);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError(error.message);
        
        setDestinations([
          { 
            id: 1, 
            city: 'Barcelona', 
            code: 'BCN', 
            minPrice: 299, 
            imageUrl: 'https://res.cloudinary.com/skyroute/image/upload/v1758530554/hotel-arc-la-rambla-monumentos-edificios-visitar-barrio-eixample-barcelona-1_tkygay.webp' 
          },
          { 
            id: 2, 
            city: 'Madrid', 
            code: 'MAD', 
            minPrice: 249, 
            imageUrl: 'https://res.cloudinary.com/skyroute/image/upload/v1758530433/photo-1539037116277-4db20889f2d4_hqolhb.jpg' 
          },
          { 
            id: 3, 
            city: 'London', 
            code: 'LHR', 
            minPrice: 189, 
            imageUrl: 'https://res.cloudinary.com/skyroute/image/upload/v1758529627/big-ben-westminster-bridge-sunset-london-uk_s6rdrj.jpg' 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const getCityImage = (destination) => {
    if (destination.imageUrl) {
      return destination.imageUrl;
    }
    
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
  };

  if (loading) {
    return (
      <section className="popular-destinations">
        <div className="popular-destinations__container">
          <h2 className="popular-destinations__title">
            POPULAR DESTINATIONS
          </h2>
          <div className="popular-destinations__loading">
            <div className="popular-destinations__spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
  }

  const totalPages = Math.ceil(destinations.length / itemsPerPage);
  const currentDestinations = destinations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage(prev => prev > 0 ? prev - 1 : totalPages - 1);
  };

  const handleNext = () => {
    setCurrentPage(prev => prev < totalPages - 1 ? prev + 1 : 0);
  };

  return (
    <section className="popular-destinations">
      <div className="popular-destinations__container">
        <h2 className="popular-destinations__title">
          POPULAR DESTINATIONS
        </h2>
        
        <div className="popular-destinations__grid">
          {currentDestinations.map((destination) => (
            <div
              key={destination.id}
              className="popular-destinations__card"
            >
              <div className="popular-destinations__card-image-container">
                <img
                  src={getCityImage(destination)}
                  alt={destination.city}
                  className="popular-destinations__card-image"
                />
              </div>
              
              <div className="popular-destinations__card-accent">
                <div className="popular-destinations__card-content">
                  <h3 className="popular-destinations__card-title">
                    {destination.city.toUpperCase()}
                  </h3>
                  {destination.minPrice && (
                    <p className="popular-destinations__card-price">
                      from €{destination.minPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {destinations.length > itemsPerPage && (
          <div className="popular-destinations__navigation">
            <button 
              className="popular-destinations__nav-button"
              onClick={handlePrevious}
            >
              <svg className="popular-destinations__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="popular-destinations__nav-button"
              onClick={handleNext}
            >
              <svg className="popular-destinations__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDestinations;
