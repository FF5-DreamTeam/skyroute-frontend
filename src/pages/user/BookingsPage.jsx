import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Text, Stack, Alert } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import './BookingsPage.css';
import './BookingsPageFilters.css';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [allBookings, setAllBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [filters, setFilters] = useState({
    status: [],
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [sortBy, setSortBy] = useState('bookingId');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalResults, setTotalResults] = useState(0);

  const fetchAllBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      let response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.USER_BOOKINGS}?page=0&size=100`,
        {
          headers: getAuthHeaders(token)
        }
      );
      
      if (!response.ok) {
        response = await fetch(
          API_ENDPOINTS.BOOKINGS.USER_BOOKINGS,
          {
            headers: getAuthHeaders(token)
          }
        );
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllBookings(data);
        } else if (data.content && Array.isArray(data.content)) {
          setAllBookings(data.content);
        } else {
          setAllBookings([]);
        }
      } else {
        console.error('Failed to fetch bookings:', response.status, response.statusText);
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        setError(`Failed to fetch current bookings (${response.status})`);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const applyFiltersAndSort = useCallback(() => {
    if (!Array.isArray(allBookings)) {
      setBookings([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }
    
    
    let filteredBookings = allBookings.filter(booking => {
      if (filters.status.length > 0 && !filters.status.includes(booking.bookingStatus)) {
        return false;
      }
      
      if (filters.minPrice && booking.totalPrice < parseFloat(filters.minPrice)) {
        return false;
      }
      
      if (filters.maxPrice && booking.totalPrice > parseFloat(filters.maxPrice)) {
        return false;
      }
      
      if (filters.dateFrom) {
        if (!booking.createdAt) return false;
        const bookingDate = new Date(booking.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (bookingDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        if (!booking.createdAt) return false;
        const bookingDate = new Date(booking.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (bookingDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
    
    filteredBookings.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          if (a.createdAt && b.createdAt) {
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
          } else {
            aValue = a.bookingId || 0;
            bValue = b.bookingId || 0;
          }
          break;
        case 'bookingId':
          aValue = a.bookingId || 0;
          bValue = b.bookingId || 0;
          break;
        case 'totalPrice':
          aValue = parseFloat(a.totalPrice || 0);
          bValue = parseFloat(b.totalPrice || 0);
          break;
        case 'departureTime':
          aValue = a.departureTime ? new Date(a.departureTime) : new Date(0);
          bValue = b.departureTime ? new Date(b.departureTime) : new Date(0);
          break;
        case 'bookingStatus':
          aValue = (a.bookingStatus || '').toLowerCase();
          bValue = (b.bookingStatus || '').toLowerCase();
          break;
        default:
          aValue = a.bookingId || 0;
          bValue = b.bookingId || 0;
      }
      
      const result = sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
      return result;
    });
    
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    setBookings(paginatedBookings);
    setTotalPages(Math.ceil(filteredBookings.length / 10));
    setTotalResults(filteredBookings.length);
  }, [allBookings, filters, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort, allBookings]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
    setCurrentPage(0);
  };


  const clearFilters = () => {
    setFilters({
      status: [],
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(0);
  };

  const hasActiveFilters = () => {
    return filters.status.length > 0 || 
           filters.minPrice || 
           filters.maxPrice || 
           filters.dateFrom || 
           filters.dateTo;
  };

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
        fetchAllBookings();
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
      <div className="bookings-page-with-filters">
        <div className="bookings-filters">
          <h2 className="bookings-filters__title">Filters</h2>
          
          <div className="bookings-filters__section">
            <h3 className="bookings-filters__section-title">Status</h3>
            <div className="bookings-filters__checkbox-group">
              {['CONFIRMED', 'CREATED', 'CANCELLED'].map(status => (
                <div key={status} className="bookings-filters__checkbox-item">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    className="bookings-filters__checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusFilterChange(status)}
                  />
                  <label htmlFor={`status-${status}`} className="bookings-filters__checkbox-label">
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bookings-filters__section">
            <h3 className="bookings-filters__section-title">Price Range (€)</h3>
            <div className="bookings-filters__price-range">
              <div className="bookings-filters__price-inputs">
                <input
                  type="number"
                  placeholder="Min price (€)"
                  className="bookings-filters__price-input"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max price (€)"
                  className="bookings-filters__price-input"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bookings-filters__section">
            <h3 className="bookings-filters__section-title">Date Range</h3>
            <div className="bookings-filters__date-inputs">
              <DatePickerInput
                placeholder="From date"
                value={filters.dateFrom ? dayjs(filters.dateFrom).toDate() : null}
                onChange={(date) => {
                  const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                  handleFilterChange('dateFrom', value);
                }}
                clearable
                classNames={{ input: 'bookings-filters__date-input' }}
              />
              <DatePickerInput
                placeholder="To date"
                value={filters.dateTo ? dayjs(filters.dateTo).toDate() : null}
                onChange={(date) => {
                  const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                  handleFilterChange('dateTo', value);
                }}
                clearable
                classNames={{ input: 'bookings-filters__date-input' }}
              />
            </div>
          </div>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="bookings-filters__clear-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="bookings-content-with-filters">
          <div className="bookings-sort-controls">
            <div className="bookings-sort-controls__left">
              <span className="bookings-sort-controls__label">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(0);
                }}
                className="bookings-sort-controls__select"
              >
                <option value="bookingId-desc">Booking (Newest)</option>
                <option value="bookingId-asc">Booking (Oldest)</option>
                <option value="createdAt-desc">Flight Date (Latest)</option>
                <option value="createdAt-asc">Flight Date (Earliest)</option>
                <option value="totalPrice-desc">Price (High to Low)</option>
                <option value="totalPrice-asc">Price (Low to High)</option>
                <option value="departureTime-desc">Departure (Latest)</option>
                <option value="departureTime-asc">Departure (Earliest)</option>
                <option value="bookingStatus-asc">Status (A-Z)</option>
                <option value="bookingStatus-desc">Status (Z-A)</option>
              </select>
            </div>
            <div className="bookings-sort-controls__right">
              <span>{totalResults} booking{totalResults !== 1 ? 's' : ''} found</span>
            </div>
          </div>

          <div className="bookings-results-count">
            Showing <span className="bookings-results-count__number">{bookings.length}</span> of {totalResults} bookings
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
