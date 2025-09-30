import { API_ENDPOINTS } from '../config/api';

const priceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 

const FALLBACK_PRICES = {
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
  'Sydney': 720,
  'Barcelona': 299,
  'Milan': 260,
  'Berlin': 240,
  'Prague': 200,
  'Budapest': 190,
  'Warsaw': 180,
  'Copenhagen': 300,
  'Stockholm': 320,
  'Oslo': 350,
  'Helsinki': 280
};

export const getMinPricesForDestinations = async (destinations) => {
  try {
    
    const cacheKey = destinations.map(d => d.city).sort().join(',');
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    
    const destinationCodes = destinations.map(dest => dest.code).filter(Boolean);
    
    if (destinationCodes.length === 0) {
      return destinations.map(dest => ({
        ...dest,
        minPrice: FALLBACK_PRICES[dest.city] || 300
      }));
    }

    const response = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.MIN_PRICES}?destinations=${destinationCodes.join(',')}`);
    
    if (response.ok) {
      const priceData = await response.json();
      
      
      const destinationsWithPrices = destinations.map(dest => {
        const apiPrice = priceData.find(price => 
          price.destinationCode === dest.code || 
          price.destinationCity === dest.city
        );
        
        return {
          ...dest,
          minPrice: apiPrice ? apiPrice.minPrice : (FALLBACK_PRICES[dest.city] || 300)
        };
      });

      
      priceCache.set(cacheKey, {
        data: destinationsWithPrices,
        timestamp: Date.now()
      });

      return destinationsWithPrices;
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to fetch real prices, using fallback:', error.message);
    
    
    return destinations.map(dest => ({
      ...dest,
      minPrice: FALLBACK_PRICES[dest.city] || 300
    }));
  }
};

export const getMinPriceForDestination = async (destinationCode, destinationCity) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.MIN_PRICES}?destination=${destinationCode}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.minPrice || FALLBACK_PRICES[destinationCity] || 300;
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to fetch real price, using fallback:', error.message);
    return FALLBACK_PRICES[destinationCity] || 300;
  }
};

export const clearPriceCache = () => {
  priceCache.clear();
};

export const getCacheStats = () => {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.keys())
  };
};
