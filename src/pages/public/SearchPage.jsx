import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS, buildQueryString } from '../../config/api';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [airportsMap, setAirportsMap] = useState({});
  const [returnFlights, setReturnFlights] = useState([]);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [alternativeFlights, setAlternativeFlights] = useState([]);
  const [loadingAlternative, setLoadingAlternative] = useState(false);
  const [alternativeReturnFlights, setAlternativeReturnFlights] = useState([]);
  const [loadingAlternativeReturn, setLoadingAlternativeReturn] = useState(false);
  const [roundTripCombinations, setRoundTripCombinations] = useState([]);
  const [loadingCombinations, setLoadingCombinations] = useState(false);
  const [alternativeRoundTripCombinations, setAlternativeRoundTripCombinations] = useState([]);
  const [loadingAlternativeCombinations, setLoadingAlternativeCombinations] = useState(false);

  const origin = params.get('origin') || '';
  const destination = params.get('destination') || '';
  const departureDate = params.get('departureDate') || '';
  const returnDate = params.get('returnDate') || '';
  const passengers = parseInt(params.get('passengers')) || 1;
  const budget = params.get('budget');
  const city = params.get('city');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AIRPORTS.BASE);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(a => {
            if (a && a.code) map[a.code] = a;
          });
          setAirportsMap(map);
        }
      } catch {}
    };
    loadAirports();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (budget) {
          const query = buildQueryString({ page, size: 10 });
          const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.BUDGET}?${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ budget: Number(budget) })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const content = Array.isArray(data?.content) ? data.content : [];
          setResults(content);
          setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
          return;
        }

        if (city) {
          const res = await fetch(API_ENDPOINTS.FLIGHTS.PUBLIC.BY_CITY(city));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
          setTotalPages(1);
          return;
        }

        const normalizeCode = (val) => {
          if (!val) return '';
          const match = String(val).match(/\b([A-Z]{3})\b/);
          return match ? match[1] : String(val).slice(0, 3).toUpperCase();
        };
        const formatDateForBackend = (dateString) => {
          if (!dateString) return '';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
          const d = new Date(dateString);
          if (Number.isNaN(d.getTime())) return '';
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return `${dd}/${mm}/${yyyy}`;
        };

        const query = buildQueryString({
          origin: normalizeCode(origin),
          destination: normalizeCode(destination),
          departureDate: formatDateForBackend(departureDate),
          returnDate: returnDate ? formatDateForBackend(returnDate) : undefined,
          passengers: params.get('passengers') || undefined
        });
        const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const content = Array.isArray(data?.content) ? data.content : [];
        setResults(content);
        setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      } catch (err) {
        setError(err.message || 'Failed to load results');
        setResults([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const fetchAlternativeFlights = async () => {
        if (!origin || !destination || !departureDate || results.length > 0) {
          setAlternativeFlights([]);
          return;
        }

      try {
        setLoadingAlternative(true);
        setAlternativeFlights([]);

        const formatDateForBackend = (dateString) => {
          if (!dateString) return '';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const parseDdMmYyyy = (ddmmyyyy) => {
          if (!ddmmyyyy) return null;
          const [d, m, y] = ddmmyyyy.split('/').map(Number);
          if (!d || !m || !y) return null;
          return new Date(y, m - 1, d);
        };

        const extractAirportCode = (displayText) => {
          const match = displayText.match(/\(([A-Z]{3})\)/);
          return match ? match[1] : displayText;
        };

        const baseDate = parseDdMmYyyy(formatDateForBackend(departureDate));
        if (!baseDate) return;

        const alternativeDates = [];
        for (let offset = -15; offset <= 30; offset++) {
          if (offset === 0) continue; 
          const altDate = new Date(baseDate);
          altDate.setDate(altDate.getDate() + offset);
          alternativeDates.push({
            date: formatDateForBackend(altDate),
            offset: offset
          });
        }

        let hasAnyFlights = false;
        try {
          const anyFlightsQuery = buildQueryString({
            origin: extractAirportCode(origin),
            destination: extractAirportCode(destination),
            passengers
          });
          
          const anyFlightsRes = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${anyFlightsQuery}`);
          if (anyFlightsRes.ok) {
            const anyFlightsData = await anyFlightsRes.json();
            hasAnyFlights = Array.isArray(anyFlightsData?.content) && anyFlightsData.content.length > 0;
          }
        } catch (err) {
        }

        if (!hasAnyFlights) {
          setAlternativeFlights([]);
          return;
        }

        const foundFlights = [];
        const limitedDates = alternativeDates;

        for (const { date, offset } of limitedDates) {
          try {
            const query = buildQueryString({
              origin: extractAirportCode(origin),
              destination: extractAirportCode(destination),
              departureDate: date,
              passengers
            });
            
            const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${query}`);
            
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data?.content) && data.content.length > 0) {
                foundFlights.push({
                  date: date,
                  offset: offset,
                  flights: data.content.slice(0, 3)
                });
              }
            }
          } catch (err) {
          }
        }
        

        setAlternativeFlights(foundFlights);
      } catch (err) {
      } finally {
        setLoadingAlternative(false);
      }
    };

    fetchAlternativeFlights();
  }, [origin, destination, departureDate, passengers, results.length]);

  useEffect(() => {
    const fetchAlternativeReturnFlights = async () => {
      if (!origin || !destination || !returnDate || !departureDate || results.length > 0) {
        setAlternativeReturnFlights([]);
        return;
      }

      try {
        setLoadingAlternativeReturn(true);
        setAlternativeReturnFlights([]);

        const formatDateForBackend = (dateString) => {
          if (!dateString) return '';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const parseDdMmYyyy = (ddmmyyyy) => {
          if (!ddmmyyyy) return null;
          const [d, m, y] = ddmmyyyy.split('/').map(Number);
          if (!d || !m || !y) return null;
          return new Date(y, m - 1, d);
        };

        const extractAirportCode = (displayText) => {
          const match = displayText.match(/\(([A-Z]{3})\)/);
          return match ? match[1] : displayText;
        };

        const baseDate = parseDdMmYyyy(formatDateForBackend(returnDate));
        if (!baseDate) return;

        const alternativeDates = [];
        for (let offset = -15; offset <= 30; offset++) {
          if (offset === 0) continue; 
          const altDate = new Date(baseDate);
          altDate.setDate(altDate.getDate() + offset);
          alternativeDates.push({
            date: formatDateForBackend(altDate),
            offset: offset
          });
        }

        let hasAnyFlights = false;
        try {
          const anyFlightsQuery = buildQueryString({
            origin: extractAirportCode(destination),
            destination: extractAirportCode(origin),
            passengers
          });
          
          const anyFlightsRes = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${anyFlightsQuery}`);
          if (anyFlightsRes.ok) {
            const anyFlightsData = await anyFlightsRes.json();
            hasAnyFlights = Array.isArray(anyFlightsData?.content) && anyFlightsData.content.length > 0;
          }
        } catch (err) { 
        }

        if (!hasAnyFlights) {
          setAlternativeReturnFlights([]);
          return;
        }

        const foundFlights = [];
        const limitedDates = alternativeDates;

        for (const { date, offset } of limitedDates) {
          try {
            const query = buildQueryString({
              origin: extractAirportCode(destination),
              destination: extractAirportCode(origin),
              departureDate: date,
              passengers
            });
            
            const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${query}`);
            
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data?.content) && data.content.length > 0) {
                foundFlights.push({
                  date: date,
                  offset: offset,
                  flights: data.content.slice(0, 3)
                });
              }
            }
          } catch (err) {
          }
        }
        
        setAlternativeReturnFlights(foundFlights);
      } catch (err) {
      } finally {
        setLoadingAlternativeReturn(false);
      }
    };

    fetchAlternativeReturnFlights();
  }, [origin, destination, returnDate, departureDate, passengers, results.length]);

  useEffect(() => {
    const fetchReturnFlights = async () => {
        if (!origin || !destination || returnDate) {
          return;
        }
      
      try {
        setLoadingReturn(true);
        const formatDateForBackend = (dateString) => {
          if (!dateString) return '';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        const parseDdMmYyyy = (ddmmyyyy) => {
          if (!ddmmyyyy) return null;
          const [d, m, y] = ddmmyyyy.split('/').map(Number);
          if (!d || !m || !y) return null;
          return new Date(y, m - 1, d);
        };
        
        const extractAirportCode = (displayText) => {
          const match = displayText.match(/\(([A-Z]{3})\)/);
          return match ? match[1] : displayText;
        };
        
        const baseParams = {
          origin: extractAirportCode(destination),
          destination: extractAirportCode(origin),
          passengers
        };
        
        if (!departureDate) {
          setReturnFlights([]);
          return;
        }
        
        const depBase = formatDateForBackend(departureDate);
        const baseDate = parseDdMmYyyy(depBase) || new Date(departureDate);
        
        for (let offset = 0; offset <= 15; offset += 1) {
          const tryDate = new Date(baseDate);
          tryDate.setDate(tryDate.getDate() + offset);
          const tryDateStr = formatDateForBackend(tryDate);
          
          const query = buildQueryString({ ...baseParams, departureDate: tryDateStr });

          const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${query}`);

          if (res.ok) {
            const data = await res.json();
            const content = Array.isArray(data?.content) ? data.content : [];
            if (content.length > 0) {
              setReturnFlights(content);
              return;
            }
          }
        }
        setReturnFlights([]);
      } catch (err) {
      } finally {
        setLoadingReturn(false);
      }
    };

    fetchReturnFlights();
  }, [origin, destination, returnDate, departureDate, passengers]);

  useEffect(() => {
    const fetchRoundTripCombinations = async () => {
      if (!returnDate || results.length === 0) {
        setRoundTripCombinations([]);
        return;
      }

      try {
        setLoadingCombinations(true);
        
        const formatDateForBackend = (dateString) => {
          if (!dateString) return '';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
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

        const returnQuery = buildQueryString({
          origin: extractAirportCode(destination),
          destination: extractAirportCode(origin),
          departureDate: formatDateForBackend(returnDate),
          passengers
        });

        const res = await fetch(`${API_ENDPOINTS.FLIGHTS.PUBLIC.SEARCH}?${returnQuery}`);
        if (!res.ok) return;
        
        const data = await res.json();
        const returnFlights = Array.isArray(data?.content) ? data.content : [];

        const combinations = [];
        results.forEach(outboundFlight => {
          returnFlights.forEach(returnFlight => {
            combinations.push({
              id: `${outboundFlight.id}-${returnFlight.id}`,
              outbound: outboundFlight,
              return: returnFlight,
              totalPrice: Number(outboundFlight.price || 0) + Number(returnFlight.price || 0)
            });
          });
        });

        combinations.sort((a, b) => a.totalPrice - b.totalPrice);
        setRoundTripCombinations(combinations);
      } catch (err) {
         
      } finally {
        setLoadingCombinations(false);
      }
    };

    fetchRoundTripCombinations();
  }, [results, returnDate, origin, destination, passengers]);

  useEffect(() => {
    const createAlternativeRoundTripCombinations = async () => {
      if (!returnDate || alternativeFlights.length === 0 || alternativeReturnFlights.length === 0) {
        setAlternativeRoundTripCombinations([]);
        return;
      }

      try {
        setLoadingAlternativeCombinations(true);
        
        const combinations = [];
        
        alternativeFlights.forEach(({ date: outboundDate, offset: outboundOffset, flights: outboundFlights }) => {
          alternativeReturnFlights.forEach(({ date: returnDate, offset: returnOffset, flights: returnFlights }) => {
            outboundFlights.forEach(outboundFlight => {
              returnFlights.forEach(returnFlight => {
                combinations.push({
                  id: `alt-${outboundFlight.id}-${returnFlight.id}`,
                  outbound: outboundFlight,
                  return: returnFlight,
                  totalPrice: Number(outboundFlight.price || 0) + Number(returnFlight.price || 0),
                  outboundDate: outboundDate,
                  outboundOffset: outboundOffset,
                  returnDate: returnDate,
                  returnOffset: returnOffset
                });
              });
            });
          });
        });

        combinations.sort((a, b) => a.totalPrice - b.totalPrice);
        setAlternativeRoundTripCombinations(combinations);
      } catch (err) {

      } finally {
        setLoadingAlternativeCombinations(false);
      }
    };

    createAlternativeRoundTripCombinations();
  }, [alternativeFlights, alternativeReturnFlights, returnDate]);

  const goToPage = (nextPage) => {
    setPage(nextPage);
    const next = new URLSearchParams(location.search);
    next.set('page', String(nextPage));
    next.set('size', '10');
    navigate(`/search?${next.toString()}`);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 className="search-title">Search results</h1>
        {loading && <p className="loading-message">Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <div className="no-results-container">
            <p className="no-results-text">No flights found for your search criteria.</p>
            {loadingAlternative && (
              <p className="alternative-loading">Searching for alternative dates...</p>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="results-section">
            <h3 className="results-section-title">
              {returnDate ? 'Round-trip flights' : 'Outbound flights'}
            </h3>
            {returnDate ? (
              <div className="round-trip-combinations">
                {loadingCombinations ? (
                  <p className="loading-text">Loading round-trip combinations...</p>
                ) : roundTripCombinations.length > 0 ? (
                  <div className="combinations-list">
                    {roundTripCombinations.map((combination) => (
                      <div key={combination.id} className="round-trip-card">
                        <div className="round-trip-header">
                          <h4 className="round-trip-title">Round-trip package</h4>
                          <div className="round-trip-total-price">
                            €{combination.totalPrice.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="round-trip-flights">
                          <div className="flight-leg">
                            <div className="flight-leg-label">Outbound</div>
                            <div className="flight-leg-content">
                              <div className="flight-info">
                                <div className="flight-number">{combination.outbound.flightNumber || 'Flight'}</div>
                                <div className="flight-route">
                                  {(() => {
                                    if (typeof combination.outbound.origin === 'object') {
                                      const code = combination.outbound.origin.code || '';
                                      const city = combination.outbound.origin.city || airportsMap[code]?.city || '';
                                      return `${city} (${code})`;
                                    }
                                    const code = String(combination.outbound.origin || '').trim();
                                    const city = airportsMap[code]?.city || code;
                                    return `${city}${code ? ` (${code})` : ''}`;
                                  })()}
                                  {' → '}
                                  {(() => {
                                    if (typeof combination.outbound.destination === 'object') {
                                      const code = combination.outbound.destination.code || '';
                                      const city = combination.outbound.destination.city || airportsMap[code]?.city || '';
                                      return `${city} (${code})`;
                                    }
                                    const code = String(combination.outbound.destination || '').trim();
                                    const city = airportsMap[code]?.city || code;
                                    return `${city}${code ? ` (${code})` : ''}`;
                                  })()}
                                </div>
                                <div className="flight-datetime">
                                  {(() => {
                                    const dt = combination.outbound.departureTime || combination.outbound.departureDate;
                                    const at = combination.outbound.arrivalTime || combination.outbound.arrivalDate;
                                    return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                                  })()}
                                </div>
                              </div>
                              <div className="flight-price">€{Number(combination.outbound.price || 0).toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flight-leg">
                            <div className="flight-leg-label">Return</div>
                            <div className="flight-leg-content">
                              <div className="flight-info">
                                <div className="flight-number">{combination.return.flightNumber || 'Flight'}</div>
                                <div className="flight-route">
                                  {(() => {
                                    if (typeof combination.return.origin === 'object') {
                                      const code = combination.return.origin.code || '';
                                      const city = combination.return.origin.city || airportsMap[code]?.city || '';
                                      return `${city} (${code})`;
                                    }
                                    const code = String(combination.return.origin || '').trim();
                                    const city = airportsMap[code]?.city || code;
                                    return `${city}${code ? ` (${code})` : ''}`;
                                  })()}
                                  {' → '}
                                  {(() => {
                                    if (typeof combination.return.destination === 'object') {
                                      const code = combination.return.destination.code || '';
                                      const city = combination.return.destination.city || airportsMap[code]?.city || '';
                                      return `${city} (${code})`;
                                    }
                                    const code = String(combination.return.destination || '').trim();
                                    const city = airportsMap[code]?.city || code;
                                    return `${city}${code ? ` (${code})` : ''}`;
                                  })()}
                                </div>
                                <div className="flight-datetime">
                                  {(() => {
                                    const dt = combination.return.departureTime || combination.return.departureDate;
                                    const at = combination.return.arrivalTime || combination.return.arrivalDate;
                                    return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                                  })()}
                                </div>
                              </div>
                              <div className="flight-price">€{Number(combination.return.price || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="round-trip-actions">
                          <Link
                            to={`/flight/${combination.outbound.id}?return=${combination.return.id}&passengers=${passengers}`}
                            className="book-round-trip-button"
                          >
                            Book Round-trip
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-results">No round-trip combinations found for the selected dates.</p>
                )}
              </div>
            ) : (
              <div className="results-list">
                {results.map((flight) => (
            <div key={flight.id} className="flight-card">
              <div className="flight-card-content">
                <div className="flight-info">
                  <div className="flight-number">{flight.flightNumber || 'Flight'}</div>
                  <div className="flight-route">
                    {(() => {
                      if (typeof flight.origin === 'object') {
                        const code = flight.origin.code || '';
                        const city = flight.origin.city || airportsMap[code]?.city || '';
                        return `${city} (${code})`;
                      }
                      const code = String(flight.origin || '').trim();
                      const city = airportsMap[code]?.city || code;
                      return `${city}${code ? ` (${code})` : ''}`;
                    })()}
                    {' → '}
                    {(() => {
                      if (typeof flight.destination === 'object') {
                        const code = flight.destination.code || '';
                        const city = flight.destination.city || airportsMap[code]?.city || '';
                        return `${city} (${code})`;
                      }
                      const code = String(flight.destination || '').trim();
                      const city = airportsMap[code]?.city || code;
                      return `${city}${code ? ` (${code})` : ''}`;
                    })()}
                  </div>
                  <div className="flight-datetime">
                    {(() => {
                      const dt = flight.departureTime || flight.departureDate;
                      return dt ? `${formatDate(dt)} · ${formatTime(dt)}` : '';
                    })()}
                    {' → '}
                    {(() => {
                      const at = flight.arrivalTime || flight.arrivalDate;
                      return at ? `${formatDate(at)} · ${formatTime(at)}` : '';
                    })()}
                  </div>
                </div>
                <div className="return-flight-details">
                  <div className="return-flight-time">
                    {(() => {
                      const dt = flight.departureTime || flight.departureDate;
                      return dt ? formatTime(dt) : '';
                    })()}
                  </div>
                  <div className="return-flight-price">
                    €{Number(flight.price || 0).toFixed(2)}
                  </div>
                  <Link
                    to={`/flight/${flight.id}?passengers=${passengers}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
                ))}
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={page <= 0}
              onClick={() => goToPage(page - 1)}
            >Prev</button>
            <div className="pagination-info">Page {page + 1} of {totalPages}</div>
            <button
              className="pagination-button"
              disabled={page + 1 >= totalPages}
              onClick={() => goToPage(page + 1)}
            >Next</button>
          </div>
        )}

        {!loading && !error && results.length === 0 && !returnDate && (
          <div className="alternative-flights-section">
            <h3 className="alternative-flights-title">
              Available flights on alternative dates:
            </h3>
            {loadingAlternative ? (
              <p className="alternative-loading">Searching for alternative dates...</p>
            ) : alternativeFlights.length > 0 ? (
            <div className="alternative-dates-list">
              {alternativeFlights.map(({ date, offset, flights }, index) => (
                <div key={index} className="alternative-date-card">
                  <div className="alternative-date-header">
                    <h4 className="alternative-date-title">
                      {offset < 0 ? `${Math.abs(offset)} day${Math.abs(offset) > 1 ? 's' : ''} earlier` : 
                       `${offset} day${offset > 1 ? 's' : ''} later`} ({(() => {
                        const [d, m, y] = date.split('/');
                        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        });
                      })()})
                    </h4>
                    <span className="alternative-date-count">
                      {flights.length} flight{flights.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                  <div className="alternative-flights-list">
                    {flights.map((flight) => (
                      <div key={flight.id} className="alternative-flight-item">
                        <div className="alternative-flight-content">
                          <div className="alternative-flight-info">
                            <div className="alternative-flight-number">{flight.flightNumber}</div>
                            <div className="alternative-flight-route">
                              {typeof flight.origin === 'object' ? flight.origin.city : flight.origin} → 
                              {typeof flight.destination === 'object' ? flight.destination.city : flight.destination}
                            </div>
                            <div className="alternative-flight-datetime">
                              {(() => {
                                const dt = flight.departureTime || flight.departureDate;
                                const at = flight.arrivalTime || flight.arrivalDate;
                                return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                              })()}
                            </div>
                          </div>
                          <div className="alternative-flight-details">
                            <div className="alternative-flight-time">
                              {formatTime(flight.departureTime)}
                            </div>
                            <div className="alternative-flight-price">
                              €{Number(flight.price || 0).toFixed(2)}
                            </div>
                            <Link
                              to={`/flight/${flight.id}?passengers=${passengers}`}
                              className="view-details-button"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="no-results">No alternative flights found.</p>
            )}
          </div>
        )}

        {!loading && !error && results.length === 0 && returnDate && (
          <div className="alternative-round-trip-section">
            <h3 className="alternative-round-trip-title">
              Available round-trip combinations on alternative dates:
            </h3>
            {(loadingAlternative || loadingAlternativeReturn || loadingAlternativeCombinations) ? (
              <p className="alternative-loading">Loading alternative round-trip combinations...</p>
            ) : alternativeRoundTripCombinations.length > 0 ? (
            <div className="alternative-round-trip-list">
              {alternativeRoundTripCombinations.map((combination) => (
                <div key={combination.id} className="alternative-round-trip-card">
                  <div className="alternative-round-trip-header">
                    <h4 className="alternative-round-trip-title">
                      Round-trip package
                    </h4>
                    <div className="alternative-round-trip-total-price">
                      €{combination.totalPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="alternative-round-trip-flights">
                    <div className="alternative-flight-leg">
                      <div className="alternative-flight-leg-label">Outbound</div>
                      <div className="alternative-flight-leg-content">
                        <div className="alternative-flight-info">
                          <div className="alternative-flight-number">{combination.outbound.flightNumber || 'Flight'}</div>
                          <div className="alternative-flight-route">
                            {(() => {
                              if (typeof combination.outbound.origin === 'object') {
                                const code = combination.outbound.origin.code || '';
                                const city = combination.outbound.origin.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(combination.outbound.origin || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                            {' → '}
                            {(() => {
                              if (typeof combination.outbound.destination === 'object') {
                                const code = combination.outbound.destination.code || '';
                                const city = combination.outbound.destination.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(combination.outbound.destination || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                          </div>
                          <div className="alternative-flight-datetime">
                            {(() => {
                              const dt = combination.outbound.departureTime || combination.outbound.departureDate;
                              const at = combination.outbound.arrivalTime || combination.outbound.arrivalDate;
                              return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                            })()}
                          </div>
                          <div className="alternative-flight-date-offset">
                            {combination.outboundOffset > 0 ? 
                              `${combination.outboundOffset} day${combination.outboundOffset > 1 ? 's' : ''} later` : 
                              'Original date'
                            }
                          </div>
                        </div>
                        <div className="alternative-flight-price">€{Number(combination.outbound.price || 0).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="alternative-flight-leg">
                      <div className="alternative-flight-leg-label">Return</div>
                      <div className="alternative-flight-leg-content">
                        <div className="alternative-flight-info">
                          <div className="alternative-flight-number">{combination.return.flightNumber || 'Flight'}</div>
                          <div className="alternative-flight-route">
                            {(() => {
                              if (typeof combination.return.origin === 'object') {
                                const code = combination.return.origin.code || '';
                                const city = combination.return.origin.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(combination.return.origin || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                            {' → '}
                            {(() => {
                              if (typeof combination.return.destination === 'object') {
                                const code = combination.return.destination.code || '';
                                const city = combination.return.destination.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(combination.return.destination || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                          </div>
                          <div className="alternative-flight-datetime">
                            {(() => {
                              const dt = combination.return.departureTime || combination.return.departureDate;
                              const at = combination.return.arrivalTime || combination.return.arrivalDate;
                              return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                            })()}
                          </div>
                          <div className="alternative-flight-date-offset">
                            {combination.returnOffset > 0 ? 
                              `${combination.returnOffset} day${combination.returnOffset > 1 ? 's' : ''} later` : 
                              'Original date'
                            }
                          </div>
                        </div>
                        <div className="alternative-flight-price">€{Number(combination.return.price || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alternative-round-trip-actions">
                    <Link
                      to={`/flight/${combination.outbound.id}?return=${combination.return.id}&passengers=${passengers}`}
                      className="book-alternative-round-trip-button"
                    >
                      Book Round-trip
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="no-results">No alternative round-trip combinations found.</p>
            )}
          </div>
        )}

        {!returnDate && origin && destination && (
          <div className="return-flights-section">
            <h2 className="return-flights-title">Recommended return flights</h2>
            {loadingReturn ? (
              <p className="return-loading">Loading return flights...</p>
            ) : returnFlights.length > 0 ? (
              <div className="return-date-card">
                <div className="return-date-header">
                  <h4 className="return-date-title">
                    Return flights available
                  </h4>
                  <span className="return-date-count">
                    {returnFlights.length} flight{returnFlights.length !== 1 ? 's' : ''} available
                  </span>
                </div>
                <div className="return-flights-list">
                  {returnFlights.map((flight) => (
                    <div key={flight.id} className="return-flight-item">
                      <div className="return-flight-content">
                        <div className="return-flight-info">
                          <div className="return-flight-number">{flight.flightNumber || 'Flight'}</div>
                          <div className="return-flight-route">
                            {(() => {
                              if (typeof flight.origin === 'object') {
                                const code = flight.origin.code || '';
                                const city = flight.origin.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(flight.origin || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                            {' → '}
                            {(() => {
                              if (typeof flight.destination === 'object') {
                                const code = flight.destination.code || '';
                                const city = flight.destination.city || airportsMap[code]?.city || '';
                                return `${city} (${code})`;
                              }
                              const code = String(flight.destination || '').trim();
                              const city = airportsMap[code]?.city || code;
                              return `${city}${code ? ` (${code})` : ''}`;
                            })()}
                          </div>
                          <div className="return-flight-datetime">
                            {(() => {
                              const dt = flight.departureTime || flight.departureDate;
                              const at = flight.arrivalTime || flight.arrivalDate;
                              return `${dt ? formatDate(dt) + ' · ' + formatTime(dt) : ''} → ${at ? formatTime(at) : ''}`;
                            })()}
                          </div>
                        </div>
                        <div className="return-flight-details">
                          <div className="return-flight-time">
                            {(() => {
                              const dt = flight.departureTime || flight.departureDate;
                              return dt ? formatTime(dt) : '';
                            })()}
                          </div>
                          <div className="return-flight-price">
                            €{Number(flight.price || 0).toFixed(2)}
                          </div>
                          <Link
                            to={`/flight/${flight.id}?passengers=${passengers}`}
                            className="view-details-button"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="return-loading">No return flights found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
