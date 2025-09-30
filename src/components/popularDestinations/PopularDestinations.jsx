import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { getMinPricesForDestinations } from '../../utils/priceUtils';
import './PopularDestinations.css';

const PopularDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const itemsPerPage = 3; 

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        ).slice(0, 12); 

        setLoadingPrices(true);
        const destinationsWithPrices = await getMinPricesForDestinations(destinationAirports);
        setLoadingPrices(false);
        
        setDestinations(destinationsWithPrices);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError(error.message);
        
        const fallbackDestinations = [
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
        ];
        
        setDestinations(fallbackDestinations);
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

  useEffect(() => {
    if (destinations.length <= itemsPerPage || isHovered) return; 
    
    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const totalPages = Math.ceil(destinations.length / itemsPerPage);
        return prev < totalPages - 1 ? prev + 1 : 0;
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, [destinations.length, itemsPerPage, isHovered]);

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

  const handleDestinationClick = (destination) => { 
    const searchParams = new URLSearchParams({
      city: destination.city
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <section 
      className="popular-destinations"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="popular-destinations__container">
        <h2 className="popular-destinations__title">
          POPULAR DESTINATIONS
        </h2>
        
        <div className="popular-destinations__grid">
          {currentDestinations.map((destination) => (
            <div
              key={destination.id}
              className="popular-destinations__card"
              onClick={() => handleDestinationClick(destination)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDestinationClick(destination);
                }
              }}
              title={`Search flights to ${destination.city}`}
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
                  {loadingPrices ? (
                    <div className="popular-destinations__price-loading">
                      <div className="popular-destinations__price-spinner"></div>
                      <span>Loading prices...</span>
                    </div>
                  ) : destination.minPrice ? (
                    <p className="popular-destinations__card-price">
                      from €{destination.minPrice}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {destinations.length > itemsPerPage && (
          <div className="popular-destinations__controls">
            <div className="popular-destinations__navigation">
              <button 
                className="popular-destinations__nav-button"
                onClick={handlePrevious}
                aria-label="Previous destinations"
              >
                <svg className="popular-destinations__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="popular-destinations__nav-button"
                onClick={handleNext}
                aria-label="Next destinations"
              >
                <svg className="popular-destinations__nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="popular-destinations__indicators">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`popular-destinations__indicator ${
                    index === currentPage ? 'popular-destinations__indicator--active' : ''
                  }`}
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDestinations;
