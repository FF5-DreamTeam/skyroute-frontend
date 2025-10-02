import React, { useState } from 'react';
import './RoleChangeModal.css';

const RoleChangeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentRole, 
  userName,
  loading = false 
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole || 'USER');

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  const handleClose = () => {
    setSelectedRole(currentRole || 'USER');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="role-modal-overlay" onClick={handleClose}>
      <div className="role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="role-modal__header">
          <h3 className="role-modal__title">Change User Role</h3>
          <button 
            className="role-modal__close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="role-modal__content">
          <p className="role-modal__message">
            Change role for <strong>{userName}</strong>
          </p>
          
          <div className="role-modal__options">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="USER"
                checked={selectedRole === 'USER'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-option__input"
              />
              <div className="role-option__content">
                <div className="role-option__icon">👤</div>
                <div className="role-option__text">
                  <div className="role-option__name">USER</div>
                  <div className="role-option__description">Regular user access</div>
                </div>
              </div>
            </label>

            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={selectedRole === 'ADMIN'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-option__input"
              />
              <div className="role-option__content">
                <div className="role-option__icon">👑</div>
                <div className="role-option__text">
                  <div className="role-option__name">ADMIN</div>
                  <div className="role-option__description">Administrator access</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="role-modal__actions">
          <button
            className="role-modal__btn role-modal__btn--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="role-modal__btn role-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={loading || selectedRole === currentRole}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;
