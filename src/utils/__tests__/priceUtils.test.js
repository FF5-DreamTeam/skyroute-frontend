import { getMinPricesForDestinations, getMinPriceForDestination, clearPriceCache } from '../priceUtils';

global.fetch = jest.fn();

describe('priceUtils', () => {
  beforeEach(() => {
    fetch.mockClear();
    clearPriceCache();
  });

  describe('getMinPricesForDestinations', () => {
    it('should return destinations with fallback prices when API fails', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const destinations = [
        { id: 1, city: 'Barcelona', code: 'BCN' },
        { id: 2, city: 'Madrid', code: 'MAD' }
      ];

      const result = await getMinPricesForDestinations(destinations);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('minPrice');
      expect(result[1]).toHaveProperty('minPrice');
      expect(result[0].minPrice).toBeGreaterThan(0);
    });

    it('should return destinations with API prices when API succeeds', async () => {
      const mockApiResponse = [
        { destinationCode: 'BCN', minPrice: 299 },
        { destinationCode: 'MAD', minPrice: 249 }
      ];

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      });

      const destinations = [
        { id: 1, city: 'Barcelona', code: 'BCN' },
        { id: 2, city: 'Madrid', code: 'MAD' }
      ];

      const result = await getMinPricesForDestinations(destinations);

      expect(result).toHaveLength(2);
      expect(result[0].minPrice).toBe(299);
      expect(result[1].minPrice).toBe(249);
    });

    it('should use cache for repeated requests', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ destinationCode: 'BCN', minPrice: 299 }])
      });

      const destinations = [{ id: 1, city: 'Barcelona', code: 'BCN' }];

      
      await getMinPricesForDestinations(destinations);
      expect(fetch).toHaveBeenCalledTimes(1);

      
      await getMinPricesForDestinations(destinations);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMinPriceForDestination', () => {
    it('should return fallback price when API fails', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getMinPriceForDestination('BCN', 'Barcelona');

      expect(result).toBe(299); 
    });

    it('should return API price when API succeeds', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ minPrice: 299 })
      });

      const result = await getMinPriceForDestination('BCN', 'Barcelona');

      expect(result).toBe(299);
    });
  });
});
