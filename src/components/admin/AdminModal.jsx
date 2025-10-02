import React, { useState, useEffect } from 'react';
import './AdminModal.css';

const AdminModal = ({ 
  isOpen, 
  onClose, 
  title, 
  entity, 
  mode, 
  data, 
  onSubmit, 
  loading,
  airports = [],
  aircrafts = [],
  routes = []
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        setFormData({ ...data });
      } else {
        setFormData(getDefaultFormData(entity));
      }
      setErrors({});
    }
  }, [isOpen, mode, data, entity]);

  const getDefaultFormData = (entity) => {
    switch (entity) {
      case 'users':
        return {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          image: null
        };
      case 'airports':
        return {
          code: '',
          city: '',
          image: null
        };
      case 'aircrafts':
        return {
          model: '',
          manufacturer: '',
          capacity: ''
        };
      case 'routes':
        return {
          originId: '',
          destinationId: ''
        };
      case 'flights':
        return {
          flightNumber: '',
          availableSeats: '',
          departureTime: '',
          arrivalTime: '',
          price: '',
          aircraftId: '',
          routeId: '',
          available: true
        };
      case 'bookings':
        return {
          flightId: '',
          bookedSeats: '',
          passengers: [
            { name: '', birthDate: '' }
          ]
        };
      default:
        return {};
    }
  };

  const getFormFields = (entity) => {
    switch (entity) {
      case 'users':
        return [
          { key: 'firstName', label: 'First Name', type: 'text', required: true },
          { key: 'lastName', label: 'Last Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'password', label: 'Password', type: 'password', required: mode === 'add' },
          { key: 'image', label: 'Profile Image', type: 'file', required: false }
        ];
      case 'airports':
        return [
          { key: 'code', label: 'Airport Code', type: 'text', required: true, maxLength: 3 },
          { key: 'city', label: 'City', type: 'text', required: true },
          { key: 'image', label: 'Airport Image', type: 'file', required: mode === 'add' }
        ];
      case 'aircrafts':
        return [
          { key: 'model', label: 'Model', type: 'text', required: true },
          { key: 'manufacturer', label: 'Manufacturer', type: 'text', required: true },
          { key: 'capacity', label: 'Capacity', type: 'number', required: true }
        ];
      case 'routes':
        return [
          { key: 'originId', label: 'Origin Airport', type: 'select', required: true, options: 'airports' },
          { key: 'destinationId', label: 'Destination Airport', type: 'select', required: true, options: 'airports' }
        ];
      case 'flights':
        return [
          { key: 'flightNumber', label: 'Flight Number', type: 'text', required: true },
          { key: 'availableSeats', label: 'Available Seats', type: 'number', required: true },
          { key: 'departureTime', label: 'Departure Time', type: 'datetime-local', required: true },
          { key: 'arrivalTime', label: 'Arrival Time', type: 'datetime-local', required: true },
          { key: 'price', label: 'Price (€)', type: 'number', required: true, step: '0.01' },
          { key: 'aircraftId', label: 'Aircraft', type: 'select', required: true, options: 'aircrafts' },
          { key: 'routeId', label: 'Route', type: 'select', required: true, options: 'routes' },
          { key: 'available', label: 'Available', type: 'checkbox', required: false }
        ];
      case 'bookings':
        return [
          { key: 'flightId', label: 'Flight ID', type: 'number', required: true },
          { key: 'bookedSeats', label: 'Booked Seats', type: 'number', required: true },
          { key: 'passengers', label: 'Passengers', type: 'passengers', required: true }
        ];
      default:
        return [];
    }
  };

  const addPassenger = () => {
    setFormData(prev => ({
      ...prev,
      passengers: [...prev.passengers, { name: '', birthDate: '' }]
    }));
  };

  const removePassenger = (index) => {
    setFormData(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('passenger_')) {
      const [, index, field] = name.split('_');
      const passengerIndex = parseInt(index);
      setFormData(prev => ({
        ...prev,
        passengers: prev.passengers.map((passenger, i) => 
          i === passengerIndex 
            ? { ...passenger, [field]: value }
            : passenger
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fields = getFormFields(entity);

    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
      if (field.maxLength && formData[field.key]?.length > field.maxLength) {
        newErrors[field.key] = `${field.label} must be ${field.maxLength} characters or less`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const fields = getFormFields(entity);

  return (
    <div className="admin-modal-overlay" onClick={handleClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">
            {mode === 'add' ? 'Add' : 'Edit'} {title}
          </h2>
          <button 
            className="admin-modal__close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__body">
            {fields.map(field => (
              <div key={field.key} className="admin-modal__field">
                <label className="admin-modal__label">
                  {field.label}
                  {field.required && <span className="admin-modal__required">*</span>}
                </label>
                
                {field.type === 'file' ? (
                  <div className="admin-modal__file-input">
                    <input
                      type="file"
                      name={field.key}
                      onChange={handleInputChange}
                      accept="image/*"
                      className="admin-modal__file"
                    />
                    {formData[field.key] && (
                      <div className="admin-modal__file-preview">
                        <img 
                          src={typeof formData[field.key] === 'string' 
                            ? formData[field.key] 
                            : URL.createObjectURL(formData[field.key])
                          } 
                          alt="Preview"
                          className="admin-modal__preview-image"
                        />
                      </div>
                    )}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <label className="admin-modal__checkbox-label">
                    <input
                      type="checkbox"
                      name={field.key}
                      checked={formData[field.key] || false}
                      onChange={handleInputChange}
                      className="admin-modal__checkbox"
                    />
                    <span className="admin-modal__checkbox-text">Yes</span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleInputChange}
                    className={`admin-modal__input ${errors[field.key] ? 'admin-modal__input--error' : ''}`}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options === 'airports' && airports.map(airport => (
                      <option key={airport.id} value={airport.id}>
                        {airport.code} - {airport.city}
                      </option>
                    ))}
                    {field.options === 'aircrafts' && aircrafts.map(aircraft => (
                      <option key={aircraft.id} value={aircraft.id}>
                        {aircraft.model} ({aircraft.manufacturer}) - {aircraft.capacity} seats
                      </option>
                    ))}
                    {field.options === 'routes' && routes.map(route => {
                      if (route.origin && route.destination) {
                        const originName = `${route.origin.code} (${route.origin.city})`;
                        const destinationName = `${route.destination.code} (${route.destination.city})`;
                        return (
                          <option key={route.id} value={route.id}>
                            {originName} → {destinationName}
                          </option>
                        );
                      }
                      
                      const originAirport = airports.find(airport => airport.id === route.originId);
                      const destinationAirport = airports.find(airport => airport.id === route.destinationId);
                      const originName = originAirport ? originAirport.code : `ID: ${route.originId || 'N/A'}`;
                      const destinationName = destinationAirport ? destinationAirport.code : `ID: ${route.destinationId || 'N/A'}`;
                      return (
                        <option key={route.id} value={route.id}>
                          {originName} → {destinationName}
                        </option>
                      );
                    })}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.key}
                    value={Array.isArray(formData[field.key]) ? formData[field.key].join('\n') : (formData[field.key] || '')}
                    onChange={handleInputChange}
                    className={`admin-modal__input admin-modal__textarea ${errors[field.key] ? 'admin-modal__input--error' : ''}`}
                    required={field.required}
                    rows={4}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'passengers' ? (
                  <div className="admin-modal__passengers">
                    {formData.passengers?.map((passenger, index) => (
                        <div key={index} className="admin-modal__passenger">
                          <div className="admin-modal__passenger-header">
                            <span className="admin-modal__passenger-title">Passenger {index + 1}</span>
                            {formData.passengers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePassenger(index)}
                                className="admin-modal__passenger-remove"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <div className="admin-modal__passenger-fields">
                            <input
                              type="text"
                              name={`passenger_${index}_name`}
                              value={passenger.name || ''}
                              onChange={handleInputChange}
                              placeholder="Full Name"
                              className={`admin-modal__input ${errors[`passenger_${index}_name`] ? 'admin-modal__input--error' : ''}`}
                              required={field.required}
                            />
                            <input
                              type="date"
                              name={`passenger_${index}_birthDate`}
                              value={passenger.birthDate || ''}
                              onChange={handleInputChange}
                              placeholder="Birth Date (YYYY-MM-DD)"
                              className={`admin-modal__input ${errors[`passenger_${index}_birthDate`] ? 'admin-modal__input--error' : ''}`}
                              required={field.required}
                            />
                          </div>
                        </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPassenger}
                      className="admin-modal__add-passenger"
                    >
                      + Add Passenger
                    </button>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleInputChange}
                    className={`admin-modal__input ${errors[field.key] ? 'admin-modal__input--error' : ''}`}
                    required={field.required}
                    maxLength={field.maxLength}
                    step={field.step}
                  />
                )}
                
                {errors[field.key] && (
                  <span className="admin-modal__error">{errors[field.key]}</span>
                )}
              </div>
            ))}
          </div>

          <div className="admin-modal__footer">
            <button
              type="button"
              className="admin-modal__btn admin-modal__btn--cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal__btn admin-modal__btn--submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (mode === 'add' ? 'Add' : 'Update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
