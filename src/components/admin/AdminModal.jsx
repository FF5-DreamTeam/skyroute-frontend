import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
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
  const [showDropdown, setShowDropdown] = useState({});
  const [searchTerm, setSearchTerm] = useState({});
  const [filteredOptions, setFilteredOptions] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        
        const formDataToSet = { ...data };
        
        if (data.origin && data.origin.id) {
          formDataToSet.originId = data.origin.id;
        }
        if (data.destination && data.destination.id) {
          formDataToSet.destinationId = data.destination.id;
        }
        
        Object.keys(formDataToSet).forEach(key => {
          if (key.includes('Time') && typeof formDataToSet[key] === 'string') {
            formDataToSet[key] = new Date(formDataToSet[key]);
          }
        });

        if (entity === 'bookings' && formDataToSet.passengers) {
          formDataToSet.bookedSeats = formDataToSet.passengers.length;
        }
        
        setFormData(formDataToSet);
        const initialSearchTerms = {};
        
        if (data.originId) {
          const airport = airports.find(airport => airport.id === data.originId);
          if (airport) {
            initialSearchTerms.originId = `${airport.code} - ${airport.city}`;
          }
        } else if (data.origin) {
          initialSearchTerms.originId = `${data.origin.code} - ${data.origin.city}`;
        }
        
        if (data.destinationId) {
          const airport = airports.find(airport => airport.id === data.destinationId);
          if (airport) {
            initialSearchTerms.destinationId = `${airport.code} - ${airport.city}`;
          }
        } else if (data.destination) {
          initialSearchTerms.destinationId = `${data.destination.code} - ${data.destination.city}`;
        }
        if (data.aircraftId) {
          const aircraft = aircrafts.find(aircraft => aircraft.id === data.aircraftId);
          if (aircraft) {
            initialSearchTerms.aircraftId = `${aircraft.model} (${aircraft.manufacturer}) - ${aircraft.capacity} seats`;
          }
        }
        if (data.routeId) {
          const route = routes.find(route => route.id === data.routeId);
          if (route) {
            const originAirport = airports.find(airport => airport.id === route.originId);
            const destinationAirport = airports.find(airport => airport.id === route.destinationId);
            const originName = originAirport ? `${originAirport.code} (${originAirport.city})` : `ID: ${route.originId}`;
            const destinationName = destinationAirport ? `${destinationAirport.code} (${destinationAirport.city})` : `ID: ${route.destinationId}`;
            initialSearchTerms.routeId = `${originName} → ${destinationName}`;
          }
        }
        setSearchTerm(initialSearchTerms);
      } else {
        setFormData(getDefaultFormData(entity));
        setSearchTerm({});
      }
      setErrors({});
      setShowDropdown({});
      setFilteredOptions({});
      setDropdownPosition({});
    }
  }, [isOpen, mode, data, entity, airports, aircrafts, routes]);

  useEffect(() => {
    if (isOpen && mode === 'edit' && data) {
      const timer = setTimeout(() => {
        const selectFields = document.querySelectorAll('input[name="originId"], input[name="destinationId"], input[name="aircraftId"], input[name="routeId"]');
        
        selectFields.forEach((input) => {
          const fieldKey = input.name;
          
          if (fieldKey) {
            const inputRect = input.getBoundingClientRect();
            setDropdownPosition(prev => ({
              ...prev,
              [fieldKey]: {
                top: inputRect.bottom + 8,
                left: inputRect.left,
                width: inputRect.width
              }
            }));
          }
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, data, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideModal = !event.target.closest('.admin-modal');
      const isOnMantineCalendar = event.target.closest('.mantine-Popover-dropdown') || 
                                 event.target.closest('.mantine-DatePickerInput-input') ||
                                 event.target.closest('.mantine-DatePickerInput-calendar') ||
                                 event.target.closest('[data-mantine-datepicker]');
      
      if (isOutsideModal && !isOnMantineCalendar) {
        setShowDropdown({});
        setDropdownPosition({});
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown({});
        setDropdownPosition({});
      }
    };

    const handleBodyClick = (event) => {
      const isOnMantineCalendar = event.target.closest('.mantine-Popover-dropdown') || 
                                 event.target.closest('.mantine-DatePickerInput-input') ||
                                 event.target.closest('.mantine-DatePickerInput-calendar') ||
                                 event.target.closest('[data-mantine-datepicker]');
      
      if (!isOnMantineCalendar) {
        const popovers = document.querySelectorAll('.mantine-Popover-dropdown');
        popovers.forEach(popover => {
          if (popover.style.display !== 'none') {
            popover.style.display = 'none';
          }
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleBodyClick);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleBodyClick);
      };
    }
  }, [isOpen]);

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
          bookedSeats: 1,
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
    setFormData(prev => {
      const newPassengers = [...prev.passengers, { name: '', birthDate: '' }];
      return {
        ...prev,
        passengers: newPassengers,
        bookedSeats: newPassengers.length
      };
    });
  };

  const removePassenger = (index) => {
    setFormData(prev => {
      const newPassengers = prev.passengers.filter((_, i) => i !== index);
      return {
        ...prev,
        passengers: newPassengers,
        bookedSeats: newPassengers.length
      };
    });
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

    if (name === 'availableSeats' && entity === 'flights' && formData.aircraftId) {
      const aircraftCapacity = getAircraftCapacity(formData.aircraftId);
      if (aircraftCapacity && parseInt(value) > aircraftCapacity) {
        setErrors(prev => ({
          ...prev,
          [name]: `Available seats (${value}) cannot exceed aircraft capacity (${aircraftCapacity})`
        }));
      }
    }

    if (name === 'bookedSeats' && entity === 'bookings') {
      const seatsCount = parseInt(value) || 0;
      const currentPassengers = formData.passengers || [];
      
      if (seatsCount > currentPassengers.length) {
        const passengersToAdd = seatsCount - currentPassengers.length;
        const newPassengers = [...currentPassengers];
        for (let i = 0; i < passengersToAdd; i++) {
          newPassengers.push({ name: '', birthDate: '' });
        }
        setFormData(prev => ({
          ...prev,
          passengers: newPassengers
        }));
      } else if (seatsCount < currentPassengers.length) {
        const passengersToKeep = currentPassengers.slice(0, seatsCount);
        setFormData(prev => ({
          ...prev,
          passengers: passengersToKeep
        }));
      }
    }
  };

  const handleDateChange = (date, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: date
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleMantineDateChange = (date, fieldName) => {
    const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const getAircraftCapacity = (aircraftId) => {
    const aircraft = aircrafts.find(aircraft => aircraft.id === aircraftId);
    return aircraft ? aircraft.capacity : null;
  };

  const handleSelectSearch = (fieldKey, value, event) => {
    setSearchTerm(prev => ({ ...prev, [fieldKey]: value }));
    setShowDropdown(prev => ({ ...prev, [fieldKey]: true }));
    
    if (!dropdownPosition[fieldKey] && event) {
      const inputRect = event.target.getBoundingClientRect();
      setDropdownPosition(prev => ({
        ...prev,
        [fieldKey]: {
          top: inputRect.bottom + 8,
          left: inputRect.left,
          width: inputRect.width
        }
      }));
    }
    
    let options = [];
    if (fieldKey === 'originId' || fieldKey === 'destinationId') {
      options = airports.filter(airport => 
        airport.city.toLowerCase().includes(value.toLowerCase()) ||
        airport.code.toLowerCase().includes(value.toLowerCase())
      );
    } else if (fieldKey === 'aircraftId') {
      options = aircrafts.filter(aircraft => 
        aircraft.model.toLowerCase().includes(value.toLowerCase()) ||
        aircraft.manufacturer.toLowerCase().includes(value.toLowerCase())
      );
    } else if (fieldKey === 'routeId') {
      options = routes.filter(route => {
        let originAirport, destinationAirport;
        
        if (route.originId && route.destinationId) {
          originAirport = airports.find(airport => airport.id === route.originId);
          destinationAirport = airports.find(airport => airport.id === route.destinationId);
        } else if (route.origin && route.destination) {
          originAirport = route.origin;
          destinationAirport = route.destination;
        }
        
        const originName = originAirport ? `${originAirport.code} (${originAirport.city})` : `ID: ${route.originId || 'unknown'}`;
        const destinationName = destinationAirport ? `${destinationAirport.code} (${destinationAirport.city})` : `ID: ${route.destinationId || 'unknown'}`;
        const routeText = `${originName} → ${destinationName}`;
        return routeText.toLowerCase().includes(value.toLowerCase());
      });
    }
    
    setFilteredOptions(prev => ({ ...prev, [fieldKey]: options }));
  };

  const handleSelectOption = (fieldKey, option) => {
    setFormData(prev => ({ ...prev, [fieldKey]: option.id }));
    setSearchTerm(prev => ({ ...prev, [fieldKey]: getDisplayText(fieldKey, option) }));
    setShowDropdown(prev => ({ ...prev, [fieldKey]: false }));

    if (fieldKey === 'aircraftId' && entity === 'flights' && formData.availableSeats) {
      const aircraftCapacity = getAircraftCapacity(option.id);
      if (aircraftCapacity && parseInt(formData.availableSeats) > aircraftCapacity) {
        setErrors(prev => ({
          ...prev,
          availableSeats: `Available seats (${formData.availableSeats}) cannot exceed aircraft capacity (${aircraftCapacity})`
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          availableSeats: ''
        }));
      }
    }
  };

  const getDisplayText = (fieldKey, option) => {
    if (!option || !option.id) return '';
    
    if (fieldKey === 'originId' || fieldKey === 'destinationId') {
      const airport = airports.find(airport => airport.id === option.id);
      if (airport) {
        return `${airport.code} - ${airport.city}`;
      }
    } else if (fieldKey === 'aircraftId') {
      const aircraft = aircrafts.find(aircraft => aircraft.id === option.id);
      if (aircraft) {
        return `${aircraft.model} (${aircraft.manufacturer}) - ${aircraft.capacity} seats`;
      }
    } else if (fieldKey === 'routeId') {
      const route = routes.find(route => route.id === option.id);
      if (route) {
        let originAirport, destinationAirport;
        
        if (route.originId && route.destinationId) {
          originAirport = airports.find(airport => airport.id === route.originId);
          destinationAirport = airports.find(airport => airport.id === route.destinationId);
        } else if (route.origin && route.destination) {
          originAirport = route.origin;
          destinationAirport = route.destination;
        }
        
        const originName = originAirport ? `${originAirport.code} (${originAirport.city})` : `ID: ${route.originId || 'unknown'}`;
        const destinationName = destinationAirport ? `${destinationAirport.code} (${destinationAirport.city})` : `ID: ${route.destinationId || 'unknown'}`;
        return `${originName} → ${destinationName}`;
      }
    }
    return '';
  };

  const handleSelectFocus = (fieldKey, event) => {
    setSearchTerm(prev => ({ ...prev, [fieldKey]: '' }));
    setShowDropdown(prev => ({ ...prev, [fieldKey]: true }));
    
    const inputRect = event.target.getBoundingClientRect();
    setDropdownPosition(prev => ({
      ...prev,
      [fieldKey]: {
        top: inputRect.bottom + 8,
        left: inputRect.left,
        width: inputRect.width
      }
    }));
    
    let options = [];
    if (fieldKey === 'originId' || fieldKey === 'destinationId') {
      options = airports;
    } else if (fieldKey === 'aircraftId') {
      options = aircrafts;
    } else if (fieldKey === 'routeId') {
      options = routes;
    }
    
    setFilteredOptions(prev => ({ ...prev, [fieldKey]: options }));
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

    if (entity === 'flights' && formData.aircraftId && formData.availableSeats) {
      const aircraftCapacity = getAircraftCapacity(formData.aircraftId);
      if (aircraftCapacity && parseInt(formData.availableSeats) > aircraftCapacity) {
        newErrors.availableSeats = `Available seats (${formData.availableSeats}) cannot exceed aircraft capacity (${aircraftCapacity})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formattedData = { ...formData };
      
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] instanceof Date) {
          formattedData[key] = formattedData[key].toISOString();
        }
      });
      
      onSubmit(formattedData);
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
    <div className="admin-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    }}>
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
                  <div className="admin-modal__dropdown-container">
                    <input
                      type="text"
                      name={field.key}
                      value={searchTerm[field.key] || (formData[field.key] ? getDisplayText(field.key, { id: formData[field.key] }) : '') || ''}
                      onChange={(e) => handleSelectSearch(field.key, e.target.value, e)}
                      onFocus={(e) => handleSelectFocus(field.key, e)}
                      placeholder={`Select ${field.label}`}
                      className={`admin-modal__input admin-modal__dropdown-input ${errors[field.key] ? 'admin-modal__input--error' : ''}`}
                      required={field.required}
                      autoComplete="off"
                    />
                    {showDropdown[field.key] && dropdownPosition[field.key] && (
                      <div 
                        className="admin-modal__dropdown"
                        style={{
                          top: `${dropdownPosition[field.key].top}px`,
                          left: `${dropdownPosition[field.key].left}px`,
                          width: `${dropdownPosition[field.key].width}px`
                        }}
                      >
                        {filteredOptions[field.key]?.length > 0 ? (
                          filteredOptions[field.key]
                            .filter(option => option && option.id)
                            .map((option) => (
                              <div
                                key={option.id}
                                className="admin-modal__dropdown-item"
                                onClick={() => handleSelectOption(field.key, option)}
                              >
                                <div className="admin-modal__dropdown-icon">
                                  {field.options === 'airports' && '✈️'}
                                  {field.options === 'aircrafts' && '🛩️'}
                                  {field.options === 'routes' && '🛣️'}
                                </div>
                                <div className="admin-modal__dropdown-text">
                                  {getDisplayText(field.key, option)}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="admin-modal__dropdown-loading">
                            No options found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : field.type === 'datetime-local' ? (
                  <DatePicker
                    selected={formData[field.key] ? new Date(formData[field.key]) : null}
                    onChange={(date) => handleDateChange(date, field.key)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    className={`admin-modal__input ${errors[field.key] ? 'admin-modal__input--error' : ''}`}
                    placeholderText={`Select ${field.label}`}
                    required={field.required}
                    autoComplete="off"
                  />
                ) : field.type === 'date' ? (
                  <DatePickerInput
                    value={formData[field.key] ? dayjs(formData[field.key]).toDate() : null}
                    onChange={(date) => handleMantineDateChange(date, field.key)}
                    placeholder={`Select ${field.label}`}
                    labelProps={{ style: { display: 'none' } }}
                    maxDate={new Date()}
                    valueFormat="DD/MM/YYYY"
                    dropdownType="popover"
                    popoverProps={{ 
                      withinPortal: true, 
                      position: 'bottom-start', 
                      offset: 8, 
                      zIndex: 1003,
                      closeOnClickOutside: true,
                      closeOnEscape: true
                    }}
                    clearable
                    classNames={{ input: `admin-modal__input admin-modal__mantine-date ${errors[field.key] ? 'admin-modal__input--error' : ''}` }}
                    required={field.required}
                  />
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
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="admin-modal__passenger-remove"
                              title="Remove passenger"
                            >
                              ×
                            </button>
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
                            <DatePickerInput
                              value={passenger.birthDate ? dayjs(passenger.birthDate).toDate() : null}
                              onChange={(date) => {
                                const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                                setFormData(prev => ({
                                  ...prev,
                                  passengers: prev.passengers.map((p, i) => 
                                    i === index 
                                      ? { ...p, birthDate: value }
                                      : p
                                  )
                                }));
                              }}
                              placeholder="Birth Date"
                              labelProps={{ style: { display: 'none' } }}
                              maxDate={new Date()}
                              valueFormat="DD/MM/YYYY"
                              dropdownType="popover"
                              popoverProps={{ 
                                withinPortal: true, 
                                position: 'bottom-start', 
                                offset: 8, 
                                zIndex: 1003,
                                closeOnClickOutside: true,
                                closeOnEscape: true
                              }}
                              clearable
                              classNames={{ input: `admin-modal__input admin-modal__mantine-date ${errors[`passenger_${index}_birthDate`] ? 'admin-modal__input--error' : ''}` }}
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
                  <div>
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
                    {field.key === 'availableSeats' && entity === 'flights' && formData.aircraftId && (
                      <div className="admin-modal__capacity-hint">
                        Aircraft capacity: {getAircraftCapacity(formData.aircraftId)} seats
                      </div>
                    )}
                  </div>
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
