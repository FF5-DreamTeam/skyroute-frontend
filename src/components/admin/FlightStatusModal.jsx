import React, { useState } from 'react';
import './FlightStatusModal.css';

const FlightStatusModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  flight, 
  loading = false 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(flight?.available || false);

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const handleClose = () => {
    setSelectedStatus(flight?.available || false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flight-status-modal-overlay" onClick={handleClose}>
      <div className="flight-status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flight-status-modal__header">
          <h3 className="flight-status-modal__title">Update Flight Availability</h3>
          <button 
            className="flight-status-modal__close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="flight-status-modal__content">
          <div className="flight-status-modal__info">
            <p><strong>Flight:</strong> {flight?.flightNumber || 'N/A'}</p>
            <p><strong>Route:</strong> {flight?.routeId || 'N/A'}</p>
            <p><strong>Current Status:</strong> 
              <span className={`flight-status-modal__current-status ${
                flight?.available ? 'flight-status-modal__current-status--available' : 'flight-status-modal__current-status--unavailable'
              }`}>
                {flight?.available ? 'Available' : 'Unavailable'}
              </span>
            </p>
          </div>
          
          <div className="flight-status-modal__options">
            <h4>Select New Availability Status:</h4>
            <div className="flight-status-modal__status-grid">
              <div
                className={`flight-status-modal__status-card ${
                  selectedStatus === true ? 'flight-status-modal__status-card--active' : ''
                }`}
                onClick={() => setSelectedStatus(true)}
              >
                <div className="flight-status-modal__status-icon">✅</div>
                <div className="flight-status-modal__status-content">
                  <div className="flight-status-modal__status-value">Available</div>
                  <div className="flight-status-modal__status-description">Flight is available for booking</div>
                </div>
              </div>

              <div
                className={`flight-status-modal__status-card ${
                  selectedStatus === false ? 'flight-status-modal__status-card--active' : ''
                }`}
                onClick={() => setSelectedStatus(false)}
              >
                <div className="flight-status-modal__status-icon">❌</div>
                <div className="flight-status-modal__status-content">
                  <div className="flight-status-modal__status-value">Unavailable</div>
                  <div className="flight-status-modal__status-description">Flight is not available for booking</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flight-status-modal__actions">
          <button
            className="flight-status-modal__btn flight-status-modal__btn--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flight-status-modal__btn flight-status-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={loading || selectedStatus === flight?.available}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightStatusModal;
