import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const FlightDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flight, setFlight] = useState(null);
  const [returnFlight, setReturnFlight] = useState(null);
  const [airportsMap, setAirportsMap] = useState({});

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnFlightId = searchParams.get('return');

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

  const [passengers, setPassengers] = useState([{ name: '', birthDate: '' }]);
  const [seats, setSeats] = useState(1);
  useEffect(() => {
    if (token && userProfile) {
      setPassengers([{ name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(), birthDate: userProfile.birthDate || '' }]);
    }
  }, [token, userProfile]);

  const addPassenger = () => setPassengers(prev => [...prev, { name: '', birthDate: '' }]);
  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const attemptBooking = async () => {
    if (!token) {
      alert('You must log in to book a flight.');
      const redirect = `${location.pathname}${location.search || ''}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    const names = passengers.map(p => p.name?.trim()).filter(Boolean);
    const dates = passengers.map(p => p.birthDate?.trim()).filter(Boolean);
    if (names.length !== passengers.length || dates.length !== passengers.length) {
      alert('Please complete all passenger details.');
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
      await res.json();

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
      }

      alert(returnFlight ? 'Round-trip booking created successfully.' : 'Booking created successfully.');
      navigate('/bookings');
    } catch (err) {
      alert(err.message || 'Failed to create booking');
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

  const renderFlightCard = (flightData, label) => {
    const { originCity, originCode, destinationCity, destinationCode } = getFlightDetails(flightData);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
            <div className="font-bold text-gray-900">{flightData.flightNumber}</div>
          </div>
          <div className="text-emerald-700 text-xl font-bold">€{Number(flightData.price || 0).toFixed(2)}</div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 text-gray-800">
            <div className="text-lg font-semibold">{originCity}</div>
            <div className="px-2 py-0.5 bg-gray-100 rounded text-sm font-semibold">{originCode}</div>
            <div className="text-gray-500">→</div>
            <div className="text-lg font-semibold">{destinationCity}</div>
            <div className="px-2 py-0.5 bg-gray-100 rounded text-sm font-semibold">{destinationCode}</div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Departure</div>
              <div className="text-gray-900 font-semibold">
                {formatDate(flightData.departureTime || flightData.departureDate)}
              </div>
              <div className="text-gray-700">{formatTime(flightData.departureTime || flightData.departureDate)}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Arrival</div>
              <div className="text-gray-900 font-semibold">
                {formatDate(flightData.arrivalTime || flightData.arrivalDate)}
              </div>
              <div className="text-gray-700">{formatTime(flightData.arrivalTime || flightData.arrivalDate)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalPrice = useMemo(() => {
    let total = Number(flight?.price || 0);
    if (returnFlight) {
      total += Number(returnFlight.price || 0);
    }
    return total;
  }, [flight, returnFlight]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner with destination image and uppercase city */}
      {(destinationCity || destinationCode) && (
        <div className="relative">
          {destinationImage ? (
            <img src={destinationImage} alt={destinationCity} className="w-full h-72 object-cover" />
          ) : (
            <div className="w-full h-72 bg-gradient-to-r from-blue-600 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="container mx-auto px-4">
              <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-wide" style={{ textTransform: 'uppercase' }}>
                {destinationCity} {destinationCode && <span>({destinationCode})</span>}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && flight && (
          <div className="space-y-6">
            {returnFlight && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Round-trip Flight</h2>
                <div className="text-2xl font-bold text-emerald-700">Total: €{totalPrice.toFixed(2)}</div>
              </div>
            )}

            {/* Outbound flight card */}
            {renderFlightCard(flight, returnFlight ? 'Outbound Flight' : '')}

            {/* Return flight card */}
            {returnFlight && renderFlightCard(returnFlight, 'Return Flight')}

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-3">Booking</h2>
              {!token ? (
                <p className="text-gray-700">To book this flight, please log in. <button className="text-blue-600 underline" onClick={() => {
                  const redirect = `${location.pathname}${location.search || ''}`;
                  navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
                }}>Log in</button></p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                    <input type="number" min="1" max={flight.availableSeats || 10} value={seats} onChange={(e) => setSeats(e.target.value)} className="border rounded px-3 py-2 w-32" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-800">Passengers</div>
                    {passengers.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="border rounded px-3 py-2"
                          placeholder={`Passenger full name #${idx + 1}`}
                          value={p.name}
                          onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                        />
                        <input
                          className="border rounded px-3 py-2"
                          type="date"
                          value={p.birthDate}
                          onChange={(e) => updatePassenger(idx, 'birthDate', e.target.value)}
                        />
                      </div>
                    ))}
                    <button className="text-sm text-blue-600 underline" onClick={addPassenger}>Add passenger</button>
                  </div>
                  {returnFlight && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Price:</span>
                        <span className="text-2xl font-bold text-emerald-700">€{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded" onClick={attemptBooking}>
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