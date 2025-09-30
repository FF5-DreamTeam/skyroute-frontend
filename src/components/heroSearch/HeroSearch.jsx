import React, { useState, useEffect } from 'react';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import backgroundImg from '../../assets/images/background-img.jpg';
import { API_ENDPOINTS } from '../../config/api';
import './HeroSearch.css';

const HeroSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    outbound: '',
    return: '',
    passengers: 1
  });
  const [tripType, setTripType] = useState('one-way');
  const [extraBudget, setExtraBudget] = useState('');
  const [extraCity, setExtraCity] = useState('');
  const [extraOrigin, setExtraOrigin] = useState('');
  const [showExtraFromDropdown, setShowExtraFromDropdown] = useState(false);
  const [showExtraToDropdown, setShowExtraToDropdown] = useState(false);
  const [extraFromSearch, setExtraFromSearch] = useState('');
  const [extraToSearch, setExtraToSearch] = useState('');
  
  const [airports, setAirports] = useState([]);
  const [filteredFromAirports, setFilteredFromAirports] = useState([]);
  const [filteredToAirports, setFilteredToAirports] = useState([]);
  const [filteredExtraFromAirports, setFilteredExtraFromAirports] = useState([]);
  const [filteredExtraToAirports, setFilteredExtraToAirports] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    const fetchAllAirports = async () => {
      try {
        setLoading(true);
        setError(null);

        const collected = [];
        let page = 0;
        const pageSize = 100;
        let totalPages = 1;
        let usedPagination = false;

        while (page < totalPages) {
          const pagedRes = await fetch(`${API_ENDPOINTS.AIRPORTS.BASE}?page=${page}&size=${pageSize}`);
          if (!pagedRes.ok) break;
          const pagedData = await pagedRes.json();
          if (pagedData && Array.isArray(pagedData.content)) {
            usedPagination = true;
            collected.push(...pagedData.content);
            totalPages = typeof pagedData.totalPages === 'number' ? pagedData.totalPages : page + 1;
            page += 1;
          } else {
            break;
          }
        }

        let rawAirports;
        if (usedPagination) {
          rawAirports = collected;
        } else {
          const response = await fetch(API_ENDPOINTS.AIRPORTS.BASE);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error('Invalid data format received from API');
          rawAirports = data;
        }

        const validAirports = rawAirports.filter(airport => 
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
        setFilteredExtraFromAirports(validAirports);
        setFilteredExtraToAirports(validAirports);
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
        setFilteredExtraFromAirports(fallbackAirports);
        setFilteredExtraToAirports(fallbackAirports);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAirports();
  }, []);

  useEffect(() => {
    if (airports.length === 0) return;
    
    const params = new URLSearchParams(location.search);
    const origin = params.get('origin') || '';
    const destination = params.get('destination') || '';
    const departureDate = params.get('departureDate') || '';
    const returnDate = params.get('returnDate') || '';
    const passengers = params.get('passengers') || '1';
    const city = params.get('city'); 

    if (city) return;

    const findAirport = (query) => {
      if (!query) return null;
      return airports.find(airport => 
        airport.code === query || 
        airport.city.toLowerCase() === query.toLowerCase() ||
        airport.name.toLowerCase().includes(query.toLowerCase())
      );
    };

    const originAirport = findAirport(origin);
    const destinationAirport = findAirport(destination);

    setSearchData(prev => ({
      ...prev,
      from: originAirport ? `${originAirport.city} (${originAirport.code})` : origin,
      to: destinationAirport ? `${destinationAirport.city} (${destinationAirport.code})` : destination,
      outbound: departureDate,
      return: returnDate,
      passengers: parseInt(passengers) || 1
    }));

    setFromSearch(originAirport ? `${originAirport.city} (${originAirport.code})` : origin);
    setToSearch(destinationAirport ? `${destinationAirport.city} (${destinationAirport.code})` : destination);
  }, [location.search, airports]);

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

  useEffect(() => {
    if (extraFromSearch && extraFromSearch.trim() !== '') {
      const filtered = airports.filter(airport => 
        airport && 
        airport.city && 
        airport.code &&
        (airport.city.toLowerCase().includes(extraFromSearch.toLowerCase()) ||
         airport.code.toLowerCase().includes(extraFromSearch.toLowerCase()) ||
         (airport.name && airport.name.toLowerCase().includes(extraFromSearch.toLowerCase())))
      );
      setFilteredExtraFromAirports(filtered);
    } else {
      setFilteredExtraFromAirports(airports);
    }
  }, [extraFromSearch, airports]);

  useEffect(() => {
    if (extraToSearch && extraToSearch.trim() !== '') {
      const filtered = airports.filter(airport => 
        airport && 
        airport.city && 
        airport.code &&
        (airport.city.toLowerCase().includes(extraToSearch.toLowerCase()) ||
         airport.code.toLowerCase().includes(extraToSearch.toLowerCase()) ||
         (airport.name && airport.name.toLowerCase().includes(extraToSearch.toLowerCase())))
      );
      setFilteredExtraToAirports(filtered);
    } else {
      setFilteredExtraToAirports(airports);
    }
  }, [extraToSearch, airports]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const formatDateForBackend = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const extractAirportCode = (displayText) => {
      const match = displayText.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : displayText;
    };
    
    const queryParams = new URLSearchParams({
      origin: extractAirportCode(searchData.from),
      destination: extractAirportCode(searchData.to),
      departureDate: formatDateForBackend(searchData.outbound),
      passengers: searchData.passengers
    });
    
    if (tripType === 'round-trip' && searchData.return) {
      queryParams.set('returnDate', formatDateForBackend(searchData.return));
    }
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

  const handleExtraFromInputChange = (e) => {
    const value = e.target.value;
    setExtraFromSearch(value);
    setExtraOrigin(value);
    setShowExtraFromDropdown(true);
  };

  const handleExtraToInputChange = (e) => {
    const value = e.target.value;
    setExtraToSearch(value);
    setExtraCity(value);
    setShowExtraToDropdown(true);
  };

  const selectExtraAirport = (airport, type) => {
    if (!airport || !airport.city || !airport.code) {
      return;
    }
    
    const displayText = `${airport.city} (${airport.code})`;
    if (type === 'from') {
      setExtraOrigin(displayText);
      setExtraFromSearch(displayText);
      setShowExtraFromDropdown(false);
    } else {
      setExtraCity(displayText);
      setExtraToSearch(displayText);
      setShowExtraToDropdown(false);
    }
  };

  const handleExtraFromFocus = () => {
    setExtraFromSearch('');
    setExtraOrigin('');
    setShowExtraFromDropdown(true);
  };

  const handleExtraToFocus = () => {
    setExtraToSearch('');
    setExtraCity('');
    setShowExtraToDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.hero-search__dropdown-container')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
        setShowExtraFromDropdown(false);
        setShowExtraToDropdown(false);
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

            <div className="hero-search__extra-card">
              <div className="hero-search__extra-title">Additional search</div>
              <form
                className="hero-search__extra-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const budgetNum = extraBudget ? Number(extraBudget) : null;
                  const search = new URLSearchParams();
                  if (budgetNum !== null && !Number.isNaN(budgetNum)) {
                    search.append('budget', String(budgetNum));
                  }
                  if (extraCity && extraCity.trim()) {
                    search.append('city', extraCity.trim());
                  }
                  if (extraOrigin && extraOrigin.trim()) {
                    search.append('origin', extraOrigin.trim());
                  }
                  navigate(`/search?${search.toString()}`);
                }}
              >
                <div className="hero-search__extra-row">
                  <div className="hero-search__extra-group">
                    <label className="hero-search__extra-label">From city</label>
                    <div className="hero-search__dropdown-container">
                      <input
                        type="text"
                        placeholder="e.g. London"
                        value={extraFromSearch}
                        onChange={handleExtraFromInputChange}
                        onFocus={handleExtraFromFocus}
                        className="hero-search__form-input"
                        autoComplete="off"
                      />
                      {showExtraFromDropdown && (
                        <div className="hero-search__dropdown">
                          {loading ? (
                            <div className="hero-search__dropdown-loading">
                              Loading airports...
                            </div>
                          ) : filteredExtraFromAirports.length > 0 ? (
                            filteredExtraFromAirports
                              .filter(airport => airport && airport.id && airport.city && airport.code)
                              .map((airport) => (
                                <div
                                  key={airport.id}
                                  className="hero-search__dropdown-item"
                                  onClick={() => selectExtraAirport(airport, 'from')}
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
                  <div className="hero-search__extra-group">
                    <label className="hero-search__extra-label">To city</label>
                    <div className="hero-search__dropdown-container">
                      <input
                        type="text"
                        placeholder="e.g. Madrid"
                        value={extraToSearch}
                        onChange={handleExtraToInputChange}
                        onFocus={handleExtraToFocus}
                        className="hero-search__form-input"
                        autoComplete="off"
                      />
                      {showExtraToDropdown && (
                        <div className="hero-search__dropdown">
                          {loading ? (
                            <div className="hero-search__dropdown-loading">
                              Loading airports...
                            </div>
                          ) : filteredExtraToAirports.length > 0 ? (
                            filteredExtraToAirports
                              .filter(airport => airport && airport.id && airport.city && airport.code)
                              .map((airport) => (
                                <div
                                  key={airport.id}
                                  className="hero-search__dropdown-item"
                                  onClick={() => selectExtraAirport(airport, 'to')}
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
                <div className="hero-search__extra-row">
                  <div className="hero-search__extra-group">
                    <label className="hero-search__extra-label">Max budget (€)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 300"
                      value={extraBudget}
                      onChange={(e) => setExtraBudget(e.target.value)}
                      className="hero-search__form-input"
                    />
                  </div>
                </div>
                <div className="hero-search__extra-row">
                  <div className="hero-search__extra-group">
                    <button type="submit" className="hero-search__extra-button">Search</button>
                  </div>
                </div>
              </form>
            </div>
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
                    <DatePickerInput
                      value={searchData.outbound ? dayjs(searchData.outbound).toDate() : null}
                      onChange={(date) => {
                        const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                        setSearchData(prev => ({ ...prev, outbound: value }));
                      }}
                      placeholder="Select date"
                      valueFormat="DD/MM/YYYY"
                      dropdownType="popover"
                      popoverProps={{ withinPortal: true, position: 'bottom-start', offset: 8, zIndex: 3000 }}
                      clearable
                      required
                      minDate={new Date()}
                      classNames={{ input: 'hero-date-input' }}
                    />
                  </div>
                  <div className="hero-search__form-group">
                    <label className="hero-search__form-label">
                      Return
                    </label>
                    <DatePickerInput
                      value={searchData.return ? dayjs(searchData.return).toDate() : null}
                      onChange={(date) => {
                        const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                        setSearchData(prev => ({ ...prev, return: value }));
                      }}
                      placeholder="Select date"
                      valueFormat="DD/MM/YYYY"
                      dropdownType="popover"
                      popoverProps={{ withinPortal: true, position: 'bottom-start', offset: 8, zIndex: 3000 }}
                      clearable
                      minDate={searchData.outbound ? dayjs(searchData.outbound).toDate() : new Date()}
                      disabled={tripType === 'one-way'}
                      classNames={{ input: 'hero-date-input' }}
                    />
                  </div>
                </div>
                
                <div className="hero-search__form-group">
                  <label className="hero-search__form-label">Trip type</label>
                  <div className="hero-search__toggle">
                    <button
                      type="button"
                      className={`hero-search__toggle-btn ${tripType === 'one-way' ? 'hero-search__toggle-btn--active' : ''}`}
                      onClick={() => setTripType('one-way')}
                    >
                      One-way
                    </button>
                    <button
                      type="button"
                      className={`hero-search__toggle-btn ${tripType === 'round-trip' ? 'hero-search__toggle-btn--active' : ''}`}
                      onClick={() => setTripType('round-trip')}
                    >
                      Round-trip
                    </button>
                  </div>
                </div>

                <div className="hero-search__form-group">
                  <label className="hero-search__form-label">
                    Number of passengers
                  </label>
                  <div className="hero-search__passenger-selector">
                    <button
                      type="button"
                      className="hero-search__passenger-btn hero-search__passenger-btn--minus"
                      onClick={() => {
                        if (searchData.passengers > 1) {
                          setSearchData(prev => ({ ...prev, passengers: prev.passengers - 1 }));
                        }
                      }}
                      disabled={searchData.passengers <= 1}
                    >
                      −
                    </button>
                    <div className="hero-search__passenger-display">
                      {searchData.passengers} {searchData.passengers === 1 ? 'passenger' : 'passengers'}
                    </div>
                    <button
                      type="button"
                      className="hero-search__passenger-btn hero-search__passenger-btn--plus"
                      onClick={() => {
                        if (searchData.passengers < 10) {
                          setSearchData(prev => ({ ...prev, passengers: prev.passengers + 1 }));
                        }
                      }}
                      disabled={searchData.passengers >= 10}
                    >
                      +
                    </button>
                  </div>
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
