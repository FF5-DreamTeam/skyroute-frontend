import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.USER_BOOKINGS}?page=${currentPage}&size=10&sortBy=departureTime&sortDirection=DESC`,
        {
          headers: getAuthHeaders(token)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const pastBookings = data.content.filter(booking => 
          new Date(booking.departureTime) < new Date()
        );
        setBookings(pastBookings);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to fetch booking history');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="history-loading">Loading booking history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1 className="history-title">Booking History</h1>
          <p className="history-subtitle">Your past flight bookings</p>
        </div>

        {error && (
          <div className="history-error">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">✈️</div>
            <h3>No Past Bookings</h3>
            <p>You haven't completed any flights yet.</p>
          </div>
        ) : (
          <div className="history-content">
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.bookingId} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-number">
                      Booking #{booking.bookingNumber}
                    </div>
                    <div className={`booking-status ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </div>
                  </div>

                  <div className="booking-flight">
                    <div className="flight-route">
                      <div className="route-airport">
                        <div className="airport-code">{booking.originAirport}</div>
                        <div className="airport-name">Origin</div>
                      </div>
                      <div className="route-arrow">→</div>
                      <div className="route-airport">
                        <div className="airport-code">{booking.destinationAirport}</div>
                        <div className="airport-name">Destination</div>
                      </div>
                    </div>

                    <div className="flight-details">
                      <div className="flight-time">
                        <div className="time-label">Departure</div>
                        <div className="time-value">
                          {formatDate(booking.departureTime)} at {formatTime(booking.departureTime)}
                        </div>
                      </div>
                      <div className="flight-time">
                        <div className="time-label">Arrival</div>
                        <div className="time-value">
                          {formatDate(booking.arrivalTime)} at {formatTime(booking.arrivalTime)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-passengers">
                    <div className="passengers-label">Passengers:</div>
                    <div className="passengers-list">
                      {booking.passengerNames.map((name, index) => (
                        <div key={index} className="passenger-name">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="booking-actions">
                    <button 
                      onClick={() => navigate(`/booking-details/${booking.bookingId}`)}
                      className="action-btn action-btn--primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
