import React from 'react';
import './StatusChangeModal.css';

const StatusChangeModal = ({ isOpen, onClose, onConfirm, item, loading }) => {
  if (!isOpen) return null;

  const statusOptions = [
    { value: 'CREATED', label: 'Created', description: 'Booking has been created but not confirmed' },
    { value: 'CONFIRMED', label: 'Confirmed', description: 'Booking is confirmed and active' },
    { value: 'CANCELLED', label: 'Cancelled', description: 'Booking has been cancelled' }
  ];

  const handleStatusSelect = (status) => {
    onConfirm(status);
  };

  return (
    <div className="status-change-modal__overlay">
      <div className="status-change-modal">
        <div className="status-change-modal__header">
          <h3>Change Booking Status</h3>
          <button 
            className="status-change-modal__close" 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="status-change-modal__content">
          <div className="status-change-modal__info">
            <p><strong>Booking:</strong> {item?.bookingNumber || 'N/A'}</p>
            <p><strong>Current Status:</strong> 
              <span className={`status-change-modal__current-status status-change-modal__current-status--${item?.bookingStatus?.toLowerCase()}`}>
                {item?.bookingStatus || 'Unknown'}
              </span>
            </p>
          </div>
          
          <div className="status-change-modal__options">
            <h4>Select New Status:</h4>
            <div className="status-change-modal__status-grid">
              {statusOptions.map((status) => (
                <div
                  key={status.value}
                  className={`status-change-modal__status-card ${
                    item?.bookingStatus === status.value ? 'status-change-modal__status-card--active' : ''
                  }`}
                  onClick={() => handleStatusSelect(status.value)}
                >
                  <div className="status-change-modal__status-value">{status.label}</div>
                  <div className="status-change-modal__status-description">{status.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="status-change-modal__footer">
          <button 
            className="status-change-modal__cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
