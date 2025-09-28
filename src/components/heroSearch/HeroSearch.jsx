import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImg from '../../assets/images/background-img.jpg';
import { API_ENDPOINTS } from '../../config/api';
import './HeroSearch.css';

const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    outbound: '',
    return: '',
    passengers: 1
  });
  
  const [airports, setAirports] = useState([]);
  const [filteredFromAirports, setFilteredFromAirports] = useState([]);
  const [filteredToAirports, setFilteredToAirports] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(API_ENDPOINTS.AIRPORTS.BASE);
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
           
            const validAirports = data.filter(airport => 
              airport && 
              typeof airport === 'object' &&
              airport.id && 
              airport.city && 
              airport.code &&
              typeof airport.city === 'string' &&
              typeof airport.code === 'string'
            ).map(airport => ({
              ...airport,
              name: `${airport.city} Airport` 
            }));  
            setAirports(validAirports);
            setFilteredFromAirports(validAirports);
            setFilteredToAirports(validAirports);
          } else {
            throw new Error('Invalid data format received from API');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching airports:', error);
        setError(error.message);
        
        const fallbackAirports = [
          { id: 1, city: 'Madrid', code: 'MAD', name: 'Madrid-Barajas Airport' },
          { id: 2, city: 'Barcelona', code: 'BCN', name: 'Barcelona-El Prat Airport' },
          { id: 3, city: 'London', code: 'LHR', name: 'London Heathrow Airport' },
          { id: 4, city: 'Paris', code: 'CDG', name: 'Charles de Gaulle Airport' },
          { id: 5, city: 'Berlin', code: 'BER', name: 'Berlin Brandenburg Airport' },
          { id: 6, city: 'Amsterdam', code: 'AMS', name: 'Amsterdam Airport Schiphol' },
          { id: 7, city: 'Rome', code: 'FCO', name: 'Leonardo da Vinci International Airport' },
          { id: 8, city: 'Vienna', code: 'VIE', name: 'Vienna International Airport' },
          { id: 9, city: 'Prague', code: 'PRG', name: 'Václav Havel Airport Prague' },
          { id: 10, city: 'Warsaw', code: 'WAW', name: 'Warsaw Chopin Airport' }
        ];
        setAirports(fallbackAirports);
        setFilteredFromAirports(fallbackAirports);
        setFilteredToAirports(fallbackAirports);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAirports();
  }, []);

  useEffect(() => {
    if (fromSearch && fromSearch.trim() !== '') {
      const filtered = airports.filter(airport => 
        airport && 
        airport.city && 
        airport.code &&
        (airport.city.toLowerCase().includes(fromSearch.toLowerCase()) ||
         airport.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
         (airport.name && airport.name.toLowerCase().includes(fromSearch.toLowerCase())))
      );
      setFilteredFromAirports(filtered);
    } else {
      setFilteredFromAirports(airports);
    }
  }, [fromSearch, airports]);

  useEffect(() => {
    if (toSearch && toSearch.trim() !== '') {
      const filtered = airports.filter(airport => 
        airport && 
        airport.city && 
        airport.code &&
        (airport.city.toLowerCase().includes(toSearch.toLowerCase()) ||
         airport.code.toLowerCase().includes(toSearch.toLowerCase()) ||
         (airport.name && airport.name.toLowerCase().includes(toSearch.toLowerCase())))
      );
      setFilteredToAirports(filtered);
    } else {
      setFilteredToAirports(airports);
    }
  }, [toSearch, airports]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      origin: searchData.from,
      destination: searchData.to,
      departureDate: searchData.outbound,
      returnDate: searchData.return,
      passengers: searchData.passengers
    });
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromSearch(value);
    setSearchData(prev => ({ ...prev, from: value }));
    setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToSearch(value);
    setSearchData(prev => ({ ...prev, to: value }));
    setShowToDropdown(true);
  };

  const selectAirport = (airport, type) => {
    if (!airport || !airport.city || !airport.code) {
      return;
    }
    
    const displayText = `${airport.city} (${airport.code})`;
    if (type === 'from') {
      setSearchData(prev => ({ ...prev, from: displayText }));
      setFromSearch(displayText);
      setShowFromDropdown(false);
    } else {
      setSearchData(prev => ({ ...prev, to: displayText }));
      setToSearch(displayText);
      setShowToDropdown(false);
    }
  };

  const handleFromFocus = () => {
    setFromSearch('');
    setSearchData(prev => ({ ...prev, from: '' }));
    setShowFromDropdown(true);
  };

  const handleToFocus = () => {
    setToSearch('');
    setSearchData(prev => ({ ...prev, to: '' }));
    setShowToDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.hero-search__dropdown-container')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <section className="hero-search">
      <div className="hero-search__container">
        <div 
          className="hero-search__background"
          style={{
            backgroundImage: `url(${backgroundImg})`
          }}
        />
        <div className="hero-search__content">
          <div className="hero-search__text">
            <h1 className="hero-search__title">
              WHERE DREAMS
            </h1>
            <h2 className="hero-search__subtitle">
              BECOME DESTINATION!
            </h2>
          </div>
          
          <div className="hero-search__form-container">
            <div className="hero-search__form-card">
              <form onSubmit={handleSearch} className="hero-search__form">
                <div className="hero-search__form-row">
                  <div className="hero-search__form-group">
                    <label className="hero-search__form-label">
                      From
                    </label>
                    <div className="hero-search__dropdown-container">
                      <input
                        type="text"
                        name="from"
                        value={fromSearch}
                        onChange={handleFromInputChange}
                        onFocus={handleFromFocus}
                        placeholder="City or Airport"
                        className="hero-search__form-input"
                        required
                        autoComplete="off"
                      />
                      {showFromDropdown && (
                        <div className="hero-search__dropdown">
                          {loading ? (
                            <div className="hero-search__dropdown-loading">
                              Loading airports...
                            </div>
                          ) : filteredFromAirports.length > 0 ? (
                            filteredFromAirports
                              .filter(airport => airport && airport.id && airport.city && airport.code)
                              .slice(0, 10)
                              .map((airport) => (
                                <div
                                  key={airport.id}
                                  className="hero-search__dropdown-item"
                                  onClick={() => selectAirport(airport, 'from')}
                                >
                                  <div className="hero-search__dropdown-city">
                                    {airport.city}
                                  </div>
                                  <div className="hero-search__dropdown-code">
                                    {airport.code}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="hero-search__dropdown-loading">
                              No airports found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hero-search__form-group">
                    <label className="hero-search__form-label">
                      To
                    </label>
                    <div className="hero-search__dropdown-container">
                      <input
                        type="text"
                        name="to"
                        value={toSearch}
                        onChange={handleToInputChange}
                        onFocus={handleToFocus}
                        placeholder="City or Airport"
                        className="hero-search__form-input"
                        required
                        autoComplete="off"
                      />
                      {showToDropdown && (
                        <div className="hero-search__dropdown">
                          {loading ? (
                            <div className="hero-search__dropdown-loading">
                              Loading airports...
                            </div>
                          ) : filteredToAirports.length > 0 ? (
                            filteredToAirports
                              .filter(airport => airport && airport.id && airport.city && airport.code)
                              .slice(0, 10)
                              .map((airport) => (
                                <div
                                  key={airport.id}
                                  className="hero-search__dropdown-item"
                                  onClick={() => selectAirport(airport, 'to')}
                                >
                                  <div className="hero-search__dropdown-city">
                                    {airport.city}
                                  </div>
                                  <div className="hero-search__dropdown-code">
                                    {airport.code}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="hero-search__dropdown-loading">
                              No airports found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="hero-search__form-row">
                  <div className="hero-search__form-group">
                    <label className="hero-search__form-label">
                      Outbound
                    </label>
                    <input
                      type="date"
                      name="outbound"
                      value={searchData.outbound}
                      onChange={handleInputChange}
                      className="hero-search__form-input"
                      required
                    />
                  </div>
                  <div className="hero-search__form-group">
                    <label className="hero-search__form-label">
                      Return
                    </label>
                    <input
                      type="date"
                      name="return"
                      value={searchData.return}
                      onChange={handleInputChange}
                      className="hero-search__form-input"
                    />
                  </div>
                </div>
                
                <div className="hero-search__form-group">
                  <label className="hero-search__form-label">
                    Number of passengers
                  </label>
                  <select
                    name="passengers"
                    value={searchData.passengers}
                    onChange={handleInputChange}
                    className="hero-search__form-input"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'passenger' : 'passengers'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="hero-search__form-button"
                >
                  SEARCH
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
