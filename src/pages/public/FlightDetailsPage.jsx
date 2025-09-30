import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../config/api';
import './FlightDetailsPage.css';

  
const DateInput = ({ value, onChange, placeholder, maxDate, inputRef }) => {
  const [displayValue, setDisplayValue] = useState(value || '');

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (ymdMatch) {
      const [y, m, d] = value.split('-');
      setDisplayValue(`${d}/${m}/${y}`);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); 
    
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    
    let formatted = input;
    if (input.length >= 2) {
      formatted = input.substring(0, 2) + '/' + input.substring(2);
    }
    if (input.length >= 4) {
      formatted = input.substring(0, 2) + '/' + input.substring(2, 4) + '/' + input.substring(4);
    }
    
    setDisplayValue(formatted);
    
    if (input.length === 8) {
      const day = input.substring(0, 2);
      const month = input.substring(2, 4);
      const year = input.substring(4, 8);
      
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (dayNum >= 1 && dayNum <= 31 && 
          monthNum >= 1 && monthNum <= 12 && 
          yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
        
        const date = new Date(yearNum, monthNum - 1, dayNum);
        
        if (date.getFullYear() === yearNum && 
            date.getMonth() === monthNum - 1 && 
            date.getDate() === dayNum &&
            (!maxDate || date <= maxDate)) {
          const ymd = `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          onChange(ymd);
        } else {
          onChange(''); 
        }
      } else {
        onChange(''); 
      }
    } else if (input.length > 0) {
      
      onChange(''); 
    } else {
      onChange(''); 
    }
  };

  const handleKeyDown = (e) => {
    if ([8, 9, 27, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="text"
      className="booking-passenger-date-input"
      placeholder={placeholder || "DD/MM/YYYY"}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      maxLength={10}
      ref={inputRef}
      aria-invalid={displayValue && displayValue.length === 10 && !value}
    />
  );
};

const FlightDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flight, setFlight] = useState(null);
  const [returnFlight, setReturnFlight] = useState(null);
  const [airportsMap, setAirportsMap] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const nameRefs = useRef([]);
  const dateRefs = useRef([]);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnFlightId = searchParams.get('return');
  const passengersCount = parseInt(searchParams.get('passengers')) || 1;

  const token = localStorage.getItem('token');
  const userProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);


  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(API_ENDPOINTS.FLIGHTS.PUBLIC.BY_ID(id));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFlight(data);

        if (returnFlightId) {
          const returnRes = await fetch(API_ENDPOINTS.FLIGHTS.PUBLIC.BY_ID(returnFlightId));
          if (returnRes.ok) {
            const returnData = await returnRes.json();
            setReturnFlight(returnData);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load flight');
      } finally {
        setLoading(false);
      }
    };
    loadFlights();
  }, [id, returnFlightId]);

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AIRPORTS.BASE);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(a => { 
            if (a && a.code) {
              map[a.code] = a;
            }
          });
          setAirportsMap(map);
        }
      } catch (err) {
        console.error('Error loading airports:', err);
      }
    };
    loadAirports();
  }, []);

  const [passengers, setPassengers] = useState(() => 
    Array.from({ length: passengersCount }, () => ({ name: '', birthDate: '' }))
  );
  const [seats, setSeats] = useState(passengersCount);
  useEffect(() => {
    if (token && userProfile) {
      const userPassenger = { 
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(), 
        birthDate: userProfile.birthDate || '' 
      };
      
      setPassengers(prev => 
        prev.map((passenger, index) => 
          index === 0 ? userPassenger : passenger
        )
      );
    }
  }, [token, userProfile, passengersCount]);

  
  useEffect(() => {
    setSeats(passengers.length);
  }, [passengers.length]);

  const addPassenger = () => {
    setPassengers(prev => [...prev, { name: '', birthDate: '' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
    }
  };
  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const attemptBooking = async () => {
    setSubmitted(true);

    
    const names = passengers.map(p => p.name?.trim()).filter(Boolean);
    const dates = passengers.map(p => p.birthDate?.trim()).filter(Boolean);
    const allNamesPresent = names.length === passengers.length;
    const allDatesPresent = dates.length === passengers.length;
    
        
    console.log('Validation check:', {
      passengers: passengers.length,
      names: names.length,
      dates: dates.length,
      allNamesPresent,
      allDatesPresent,
      passengerData: passengers.map(p => ({ name: p.name, birthDate: p.birthDate }))
    });
    
    if (!allNamesPresent || !allDatesPresent) {
      
      const firstInvalidIndex = passengers.findIndex(
        (p) => !(p.name && p.name.trim()) || !(p.birthDate && p.birthDate.trim())
      );
      const missingName = firstInvalidIndex !== -1 && !(passengers[firstInvalidIndex].name && passengers[firstInvalidIndex].name.trim());
      const el = missingName ? nameRefs.current[firstInvalidIndex] : dateRefs.current[firstInvalidIndex];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.focus) el.focus();
      }
    }
    if (!token) {
      toast.error('You must log in to book a flight.');
      const redirect = `${location.pathname}${location.search || ''}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (names.length !== passengers.length || dates.length !== passengers.length) {
      toast.error('Please complete all passenger details.');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flightId: Number(id),
          bookedSeats: Number(seats),
          passengerNames: names,
          passengerBirthDates: dates
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const outboundBooking = await res.json();

      if (returnFlightId && returnFlight) {
        const returnRes = await fetch(API_ENDPOINTS.BOOKINGS.BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            flightId: Number(returnFlightId),
            bookedSeats: Number(seats),
            passengerNames: names,
            passengerBirthDates: dates
          })
        });
        if (!returnRes.ok) throw new Error(`Failed to book return flight: HTTP ${returnRes.status}`);
        const returnBooking = await returnRes.json();
        const backendTotal = Number(outboundBooking?.totalPrice || 0) + Number(returnBooking?.totalPrice || 0);
        toast.success(`Round-trip booking created successfully. Total: €${backendTotal.toFixed(2)}`);
        navigate('/bookings');
        return;
      }

      const backendTotal = Number(outboundBooking?.totalPrice || 0);
      toast.success(`Booking created successfully. Total: €${backendTotal.toFixed(2)}`);
      navigate('/bookings');
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
    }
  };

  const getFlightDetails = (flightData) => {
    const destinationCity = (() => {
      if (!flightData) return '';
      if (typeof flightData.destination === 'object') {
        const code = flightData.destination.code || '';
        return flightData.destination.city || airportsMap[code]?.city || '';
      }
      const code = String(flightData.destination || '').trim();
      return airportsMap[code]?.city || code;
    })();

    const destinationCode = (() => {
      if (typeof flightData?.destination === 'object') {
        return flightData.destination.code || '';
      }
      if (typeof flightData?.destination === 'string') {
        const foundAirport = Object.values(airportsMap).find(airport => 
          airport.city && airport.city.toLowerCase() === flightData.destination.toLowerCase()
        );
        return foundAirport?.code || flightData.destination;
      }
      return '';
    })();

    const originCode = (() => {
      if (typeof flightData?.origin === 'object') {
        return flightData.origin.code || '';
      }
      if (typeof flightData?.origin === 'string') {
        const foundAirport = Object.values(airportsMap).find(airport => 
          airport.city && airport.city.toLowerCase() === flightData.origin.toLowerCase()
        );
        return foundAirport?.code || flightData.origin;
      }
      return '';
    })();

    const originCity = (() => {
      if (!flightData) return '';
      if (typeof flightData.origin === 'object') {
        const code = flightData.origin.code || '';
        return flightData.origin.city || airportsMap[code]?.city || '';
      }
      const code = String(flightData.origin || '').trim();
      return airportsMap[code]?.city || code;
    })();

    return { destinationCity, destinationCode, originCity, originCode };
  };

  const destinationCity = flight ? getFlightDetails(flight).destinationCity : '';
  const destinationCode = flight ? getFlightDetails(flight).destinationCode : '';
  
  const destinationImage = (() => {
    if (flight?.destination?.imageUrl) {
      return flight.destination.imageUrl;
    }
    
    if (destinationCode && airportsMap[destinationCode]?.imageUrl) {
      return airportsMap[destinationCode].imageUrl;
    }
    
    if (destinationCity) {
      const foundAirport = Object.values(airportsMap).find(airport => 
        airport.city && airport.city.toLowerCase() === destinationCity.toLowerCase()
      );
      if (foundAirport?.imageUrl) {
        return foundAirport.imageUrl;
      }
    }
    
    return '';
  })();

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

  const renderFlightCard = (flightData, label, seatsCount = 1) => {
    const { originCity, originCode, destinationCity, destinationCode } = getFlightDetails(flightData);

    return (
      <div className="flight-card">
        <div className="flight-card-header">
          <div>
            <div className="flight-card-label">{label}</div>
            <div className="flight-card-number">{flightData.flightNumber}</div>
          </div>
          <div className="flight-card-price">
            <div className="flight-price-per-seat">€{Number(flightData.price || 0).toFixed(2)}/seat</div>
            <div className="flight-price-total">Total: €{(Number(flightData.price || 0) * seatsCount).toFixed(2)}</div>
          </div>
        </div>
        <div className="flight-card-body">
          <div className="flight-route">
            <div className="flight-city">{originCity}</div>
            <div className="flight-code">{originCode}</div>
            <div className="flight-arrow">→</div>
            <div className="flight-city">{destinationCity}</div>
            <div className="flight-code">{destinationCode}</div>
          </div>

          <div className="flight-times">
            <div className="flight-time-card">
              <div className="flight-time-label">Departure</div>
              <div className="flight-time-date">
                {formatDate(flightData.departureTime || flightData.departureDate)}
              </div>
              <div className="flight-time-time">{formatTime(flightData.departureTime || flightData.departureDate)}</div>
            </div>
            <div className="flight-time-card">
              <div className="flight-time-label">Arrival</div>
              <div className="flight-time-date">
                {formatDate(flightData.arrivalTime || flightData.arrivalDate)}
              </div>
              <div className="flight-time-time">{formatTime(flightData.arrivalTime || flightData.arrivalDate)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalPrice = useMemo(() => {
    const perSeatOutbound = Number(flight?.price || 0);
    const perSeatReturn = returnFlight ? Number(returnFlight.price || 0) : 0;
    const perSeatTotal = perSeatOutbound + perSeatReturn;
    const seatsCount = Number(seats || 1);
    return perSeatTotal * seatsCount;
  }, [flight, returnFlight, seats]);

  return (
    <div className="flight-details-page">
      
      {(destinationCity || destinationCode) && (
        <div className="flight-hero">
          {destinationImage ? (
            <img src={destinationImage} alt={destinationCity} className="flight-hero-image" />
          ) : (
            <div className="flight-hero-gradient" />
          )}
          <div className="flight-hero-overlay" />
          <div className="flight-hero-content">
            <div className="flight-container">
              <h1 className="flight-hero-title">
                {destinationCity} {destinationCode && <span>({destinationCode})</span>}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="flight-container">
        {loading && <p className="flight-loading">Loading...</p>}
        {error && <p className="flight-error">{error}</p>}
        {!loading && !error && flight && (
          <div className="flight-sections">
            {returnFlight && (
              <div className="roundtrip-summary">
                <h2 className="roundtrip-title">Round-trip Flight</h2>
                <div className="roundtrip-total">Total: €{totalPrice.toFixed(2)}</div>
              </div>
            )}

            
            {renderFlightCard(flight, returnFlight ? 'Outbound Flight' : '', seats)}

            
            {returnFlight && renderFlightCard(returnFlight, 'Return Flight', seats)}

            <div className="booking-section">
              <h2 className="booking-title">Booking</h2>
              {!token ? (
                <p className="booking-login-text">To book this flight, please log in. <button className="booking-login-link" onClick={() => {
                  const redirect = `${location.pathname}${location.search || ''}`;
                  navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
                }}>Log in</button></p>
              ) : (
                <div className="booking-form">
                  <div className="booking-seats-group">
                    <label className="booking-seats-label">Seats</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={flight.availableSeats || 10} 
                      value={seats} 
                      onChange={(e) => {
                        const newSeats = Math.max(1, Math.min(flight.availableSeats || 10, parseInt(e.target.value) || 1));
                        setSeats(newSeats);

                        if (newSeats > passengers.length) {
                          const newPassengers = Array.from({ length: newSeats - passengers.length }, () => ({ name: '', birthDate: '' }));
                          setPassengers(prev => [...prev, ...newPassengers]);
                        } else if (newSeats < passengers.length) {
                         
                          setPassengers(prev => prev.slice(0, newSeats));
                        }
                      }}
                      className="booking-seats-input" 
                      title="Number of seats and passengers"
                    />
                  </div>
                  <div className="booking-passengers-group">
                    <div className="booking-passengers-label">
                      Passengers ({passengers.length} total)
                    </div>
                    {passengers.map((p, idx) => (
                      <div key={idx} className={`booking-passenger-row`}>
                        <div className="booking-passenger-inputs">
                          <input
                            className="booking-passenger-input"
                            placeholder={`Passenger full name #${idx + 1}`}
                            value={p.name}
                            onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                            ref={el => nameRefs.current[idx] = el}
                            aria-invalid={submitted && !(p.name && p.name.trim())}
                          />
                          <DateInput
                            value={p.birthDate}
                            onChange={(date) => updatePassenger(idx, 'birthDate', date)}
                            placeholder="DD/MM/YYYY"
                            maxDate={new Date()}
                            inputRef={el => dateRefs.current[idx] = el}
                          />
                        </div>
                        {passengers.length > 1 && (
                          <button 
                            className="booking-remove-passenger"
                            onClick={() => removePassenger(idx)}
                            title="Remove passenger"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {passengers.length < (flight.availableSeats || 10) && (
                      <button className="booking-add-passenger" onClick={addPassenger}>
                        + Add passenger
                      </button>
                    )}
                  </div>
                  <div className="booking-total">
                    <div className="booking-total-row">
                      <span className="booking-total-label">Total Price:</span>
                      <span className="booking-total-price">€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="booking-button" onClick={attemptBooking} disabled={submitted && (
                    passengers.some(p => !(p.name && p.name.trim())) ||
                    passengers.some(p => !(p.birthDate && p.birthDate.trim()))
                  )}>
                    {returnFlight ? 'Book Round-trip' : 'Book now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightDetailsPage;