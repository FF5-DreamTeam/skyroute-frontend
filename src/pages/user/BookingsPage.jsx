import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Text, Stack, Alert } from '@mantine/core';
import { toast } from 'sonner';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import './BookingsPage.css';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.USER_BOOKINGS}?page=${currentPage}&size=10`,
        {
          headers: getAuthHeaders(token)
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        const sortedBookings = data.content.sort((a, b) => {
          return (b.bookingId || b.id || 0) - (a.bookingId || a.id || 0);
        });
        
        console.log('Booking IDs after sorting:', sortedBookings.map(b => b.bookingId || b.id));
        
        setBookings(sortedBookings);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to fetch current bookings');
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

  const openCancelModal = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setBookingToCancel(null);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found');
      closeCancelModal();
      return;
    }

    try {
      setCancelling(true);
      
      const response = await fetch(API_ENDPOINTS.BOOKINGS.CANCEL(bookingToCancel), {
        method: 'POST',
        headers: getAuthHeaders(token)
      });

      if (response.status === 204) {
        toast.success('Booking cancelled successfully!');
        fetchBookings();
        closeCancelModal();
      } else if (response.status === 400) {
        toast.error('Invalid status transition - booking cannot be cancelled');
      } else if (response.status === 401) {
        toast.error('Unauthorized - please log in again');
        navigate('/login');
      } else if (response.status === 403) {
        toast.error('Access denied - you can only cancel your own bookings');
      } else if (response.status === 404) {
        toast.error('Booking not found');
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.message || `Failed to cancel booking (Status: ${response.status})`);
        } catch {
          toast.error(`Failed to cancel booking (Status: ${response.status})`);
        }
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

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
      case 'CREATED': return 'status-created';
      case 'CANCELLED': return 'status-cancelled';
      case 'PENDING': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getDaysUntilFlight = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffTime = departure - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-loading">Loading current bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1 className="bookings-title">My Bookings</h1>
          <p className="bookings-subtitle">All your flight bookings (newest first)</p>
        </div>

        {error && (
          <div className="bookings-error">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="bookings-empty-icon">✈️</div>
            <h3>No Bookings Found</h3>
            <p>You don't have any flight bookings yet.</p>
          </div>
        ) : (
          <div className="bookings-content">
            <div className="bookings-list">
              {bookings.map((booking) => {
                const daysUntil = getDaysUntilFlight(booking.departureTime);
                return (
                  <div key={booking.bookingId} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-number">
                        Booking #{booking.bookingNumber}
                      </div>
                      <div className={`booking-status ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </div>
                    </div>

                    {daysUntil >= 0 && (
                      <div className="booking-countdown">
                        <div className="countdown-text">
                          {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} until departure`}
                        </div>
                      </div>
                    )}

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

                    <div className="booking-price">
                      <div className="price-label">Total Price:</div>
                      <div className="price-value">€{booking.totalPrice?.toFixed(2) || '0.00'}</div>
                    </div>

                    <div className="booking-actions">
                      <button 
                        onClick={() => navigate(`/booking-details/${booking.bookingId}`)}
                        className="action-btn action-btn--primary"
                      >
                        View Details
                      </button>
                      {(booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'CREATED') && (
                        <button 
                          onClick={() => openCancelModal(booking.bookingId)}
                          disabled={loading}
                          className="action-btn action-btn--danger"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

      <Modal
        opened={cancelModalOpen}
        onClose={closeCancelModal}
        title={
          <div className="modal-title-custom">
            <span className="modal-title-icon">⚠️</span>
            <span>Cancel Booking</span>
          </div>
        }
        centered
        size="md"
        overlayProps={{ blur: 3 }}
        classNames={{
          modal: 'modal-custom',
          header: 'modal-header-custom',
          body: 'modal-body-custom',
        }}
      >
        <Stack spacing="md">
          <Alert
            icon="⚠️"
            title="Are you sure?"
            color="orange"
            variant="light"
            className="alert-warning-custom"
          >
            <Text size="sm">
              This action cannot be undone. Once cancelled, you will need to make a new booking if you wish to travel on this flight.
            </Text>
          </Alert>

          <div className="booking-id-display">
            Booking ID: <span className="booking-id-value">{bookingToCancel}</span>
          </div>

          <div className="modal-button-group">
            <Button
              variant="outline"
              color="gray"
              onClick={closeCancelModal}
              disabled={cancelling}
              className="modal-button-cancel"
            >
              ❌ Keep Booking
            </Button>
            <Button
              color="red"
              onClick={handleCancelBooking}
              loading={cancelling}
              className="modal-button-confirm"
            >
              {cancelling ? 'Cancelling...' : '✅ Yes, Cancel Booking'}
            </Button>
          </div>
        </Stack>
      </Modal>
    </div>
  );
};

export default BookingsPage;
