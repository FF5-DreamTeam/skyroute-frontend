import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import './BookingDetailsPage.css';

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [destinationImage, setDestinationImage] = useState(null);
  const [airportsMap, setAirportsMap] = useState({});

  const fetchAirports = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AIRPORTS.BASE);
      if (response.ok) {
        const airports = await response.json();
        const map = {};
        airports.forEach(airport => {
          map[airport.code] = airport;
        });
        setAirportsMap(map);
      }
    } catch (err) {
    }
  }, []);

  const fetchDestinationImage = useCallback(async (destination) => {
    try {
      if (!destination) {
        return;
      }
      
      const destinationCode = destination;
      const destinationAirport = airportsMap[destinationCode];
      
      if (destinationAirport?.imageUrl) {
        setDestinationImage(destinationAirport.imageUrl);
        return;
      }
      
      
      const foundAirport = Object.values(airportsMap).find(airport => 
        airport.city && airport.city.toLowerCase() === destination.toLowerCase()
      );
      
      if (foundAirport?.imageUrl) {
        setDestinationImage(foundAirport.imageUrl);
        return;
      }
      
      
      const cityName = destination.replace(/[^a-zA-Z\s]/g, '').trim();
      
      const imageSources = [
        `https://picsum.photos/800/300?random=${cityName.length + destination.length}`,
        `https://picsum.photos/800/300?random=${Math.floor(Math.random() * 1000)}`,
        `https://picsum.photos/800/300?blur=1`,
        '/src/assets/images/background-img.jpg'
      ];
      
      const tryImageSource = (index) => {
        if (index >= imageSources.length) {
          return;
        }
        
        const imageUrl = imageSources[index];
        const img = new Image();
        
        img.onload = () => {
          setDestinationImage(imageUrl);
        };
        
        img.onerror = () => {
          tryImageSource(index + 1);
        };
        
        img.src = imageUrl;
      };
      
      tryImageSource(0);
    } catch (err) {
     
    }
  }, [airportsMap]);

  const fetchBookingDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setDestinationImage(null); 
      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.BY_ID(bookingId)}`,
        {
          headers: getAuthHeaders(token)
        }
      );

      if (response.ok) {
        const bookingData = await response.json();
        setBooking(bookingData);
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingDetails]);

  useEffect(() => {
    if (booking?.destinationAirport && Object.keys(airportsMap).length > 0) {
     
      if (!destinationImage) {
        fetchDestinationImage(booking.destinationAirport);
      }
    }
  }, [booking?.destinationAirport, airportsMap, fetchDestinationImage, destinationImage]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(API_ENDPOINTS.BOOKINGS.CANCEL(bookingId), {
        method: 'POST',
        headers: getAuthHeaders(token)
      });

      if (response.status === 204) {
        navigate('/bookings');
      } else if (response.status === 400) {
        setError('Invalid status transition - booking cannot be cancelled');
      } else if (response.status === 401) {
        setError('Unauthorized - please log in again');
        navigate('/login');
      } else if (response.status === 403) {
        setError('Access denied - you can only cancel your own bookings');
      } else if (response.status === 404) {
        setError('Booking not found');
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to cancel booking (Status: ${response.status})`);
        } catch {
          setError(`Failed to cancel booking (Status: ${response.status})`);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getDuration = (departureTime, arrivalTime) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const diffMs = arrival - departure;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-container">
          <div className="booking-details-loading">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-container">
          <div className="booking-details-error">
            {error || 'Booking not found'}
          </div>
          <button 
            onClick={() => navigate('/bookings')}
            className="back-button"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">
        <div className="booking-details-header">
          <button 
            onClick={() => navigate('/bookings')}
            className="back-button"
          >
            ← Back to Bookings
          </button>
          <h1 className="booking-details-title">Booking Details</h1>
        </div>

        <div className="booking-details-content">
          <div className="booking-card-large">
            <div className="booking-header">
              <div className="booking-number">
                Booking #{booking.bookingNumber}
              </div>
              <div className={`booking-status ${getStatusColor(booking.bookingStatus)}`}>
                {booking.bookingStatus}
              </div>
            </div>

            <div className="destination-hero">
              {destinationImage ? (
                <div 
                  className="destination-image"
                  style={{ backgroundImage: `url(${destinationImage})` }}
                >
                  <div className="destination-overlay">
                    <h2 className="destination-name">{booking.destinationAirport}</h2>
                    <p className="destination-subtitle">Your destination awaits</p>
                  </div>
                </div>
              ) : (
                <div className="destination-placeholder">
                  <div className="destination-icon">✈️</div>
                  <h2 className="destination-name">{booking.destinationAirport || 'Destination'}</h2>
                  <p className="destination-subtitle">Your destination awaits</p>
                </div>
              )}
            </div>

            <div className="flight-details-section">
              <h3 className="section-title">Flight Information</h3>
              
              <div className="flight-route-large">
                <div className="route-airport-large">
                  <div className="airport-code-large">{booking.originAirport}</div>
                  <div className="airport-name-large">Departure</div>
                  <div className="airport-time">
                    {formatTime(booking.departureTime)}
                  </div>
                  <div className="airport-date">
                    {formatDate(booking.departureTime)}
                  </div>
                </div>
                
                <div className="route-connection">
                  <div className="flight-number">Flight {booking.flightNumber}</div>
                  <div className="flight-duration">
                    {getDuration(booking.departureTime, booking.arrivalTime)}
                  </div>
                  <div className="route-line"></div>
                </div>
                
                <div className="route-airport-large">
                  <div className="airport-code-large">{booking.destinationAirport}</div>
                  <div className="airport-name-large">Arrival</div>
                  <div className="airport-time">
                    {formatTime(booking.arrivalTime)}
                  </div>
                  <div className="airport-date">
                    {formatDate(booking.arrivalTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="passengers-section">
              <h3 className="section-title">Passengers</h3>
              
              
              <div className="passengers-list-large">
                {booking.passengerNames.map((name, index) => (
                  <div key={index} className="passenger-card">
                    <div className="passenger-avatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="passenger-info">
                      <div className="passenger-name">{name}</div>
                      {(() => {
                        const hasBirthDates = booking.passengerBirthDates && 
                                            Array.isArray(booking.passengerBirthDates) && 
                                            booking.passengerBirthDates.length > index;
                        
                        if (hasBirthDates) {
                          const birthDateStr = booking.passengerBirthDates[index];
                          
                          if (birthDateStr && birthDateStr !== 'null' && birthDateStr !== 'undefined') {
                            try {
                              let birthDate;
                              if (typeof birthDateStr === 'string') {
                                birthDate = new Date(birthDateStr);
                                if (isNaN(birthDate.getTime())) {
                                  const dateOnly = birthDateStr.split('T')[0];
                                  birthDate = new Date(dateOnly);
                                }
                              } else {
                                birthDate = new Date(birthDateStr);
                              }
                              
                              if (!isNaN(birthDate.getTime())) {
                                return (
                                  <div className="passenger-birth">
                                    Born: {birthDate.toLocaleDateString()}
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="passenger-birth">
                                    Born: {birthDateStr}
                                  </div>
                                );
                              }
                            } catch (error) {
                              return (
                                <div className="passenger-birth">
                                  Born: {birthDateStr}
                                </div>
                              );
                            }
                          }
                        }
                        
                        return null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="booking-actions-large">
              {booking.bookingStatus === 'CONFIRMED' && (
                <button 
                  onClick={handleCancelBooking}
                  disabled={loading}
                  className="action-btn-large action-btn--danger"
                >
                  {loading ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              <button 
                onClick={() => window.print()}
                disabled={loading}
                className="action-btn-large action-btn--secondary"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;