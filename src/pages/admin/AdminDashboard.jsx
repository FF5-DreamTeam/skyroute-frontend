import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import DataTable from '../../components/admin/DataTable';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import RoleChangeModal from '../../components/admin/RoleChangeModal';
import StatusChangeModal from '../../components/admin/StatusChangeModal';
import FlightStatusModal from '../../components/admin/FlightStatusModal';
import { adminApi } from '../../services/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'users';
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [airports, setAirports] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, type: 'delete' });
  const [roleModal, setRoleModal] = useState({ isOpen: false, item: null });
  const [roleLoading, setRoleLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, item: null });
  const [statusLoading, setStatusLoading] = useState(false);
  const [flightStatusModal, setFlightStatusModal] = useState({ isOpen: false, item: null });
  const [flightStatusLoading, setFlightStatusLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'airports', label: 'Airports', icon: '✈️' },
    { id: 'aircrafts', label: 'Aircrafts', icon: '🛩️' },
    { id: 'routes', label: 'Routes', icon: '🛣️' },
    { id: 'flights', label: 'Flights', icon: '🎫' },
    { id: 'bookings', label: 'Bookings', icon: '📋' }
  ];

  const columns = {
    users: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'userImgUrl', label: 'Image', type: 'image' }
    ],
    airports: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'imageUrl', label: 'Image', type: 'image' }
    ],
    aircrafts: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'text' }
    ],
    routes: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'originCode', label: 'Origin', type: 'text' },
      { key: 'destinationCode', label: 'Destination', type: 'text' }
    ],
    flights: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'flightNumber', label: 'Flight Number', type: 'text' },
      { key: 'availableSeats', label: 'Available Seats', type: 'text' },
      { key: 'departureTime', label: 'Departure', type: 'datetime' },
      { key: 'arrivalTime', label: 'Arrival', type: 'datetime' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'aircraftId', label: 'Aircraft ID', type: 'text' },
      { key: 'routeId', label: 'Route ID', type: 'text' },
      { key: 'available', label: 'Available', type: 'boolean' }
    ],
    bookings: [
      { key: 'bookingId', label: 'ID', type: 'text' },
      { key: 'bookingNumber', label: 'Booking #', type: 'text' },
      { key: 'flightNumber', label: 'Flight', type: 'text' },
      { key: 'bookedSeats', label: 'Seats', type: 'text' },
      { key: 'passengerNames', label: 'Passengers', type: 'text' },
      { key: 'bookingStatus', label: 'Status', type: 'text' },
      { key: 'totalPrice', label: 'Price', type: 'currency' },
      { key: 'createdAt', label: 'Created', type: 'datetime' }
    ]
  };

  const fetchData = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'users':
          response = await adminApi.users.getAll(page, 25);
          break;
        case 'airports':
          response = await adminApi.airports.getAll(page, 25);
          break;
        case 'aircrafts':
          response = await adminApi.aircrafts.getAll(page, 25);
          break;
        case 'routes':
          response = await adminApi.routes.getAll(page, 25);
          break;
        case 'flights':
          const allFlightsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/flights/admin?page=0&size=1000`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!allFlightsResponse.ok) {
            throw new Error('Failed to fetch flights');
          }
          
          const allFlightsData = await allFlightsResponse.json();
          response = {
            content: allFlightsData.content || [],
            totalPages: 1,
            totalElements: allFlightsData.content?.length || 0,
            number: 0,
            size: allFlightsData.content?.length || 0
          };
          break;
        case 'bookings':
          response = await adminApi.bookings.getAll(page, 25);
          break;
        default:
          response = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 25 };
      }
      
      
      let processedData = response.content || [];
      
      processedData = processedData.sort((a, b) => (a.id || 0) - (b.id || 0));
      
      if (activeTab === 'routes') {
        
        processedData = processedData.map((route, index) => {
          
          if (route.origin && route.destination) {
            return {
              ...route,
              id: route.id || `route-${index}`,
              originCode: `${route.origin.code} (${route.origin.city})`,
              destinationCode: `${route.destination.code} (${route.destination.city})`
            };
          }
          
          const originAirport = airports.find(airport => 
            airport.id === route.originId || 
            airport.id === parseInt(route.originId) ||
            parseInt(airport.id) === route.originId
          );
          const destinationAirport = airports.find(airport => 
            airport.id === route.destinationId || 
            airport.id === parseInt(route.destinationId) ||
            parseInt(airport.id) === route.destinationId
          );
          return {
            ...route,
            id: route.id || `route-${index}`,
            originCode: originAirport ? `${originAirport.code} (${originAirport.city})` : `ID: ${route.originId || 'N/A'}`,
            destinationCode: destinationAirport ? `${destinationAirport.code} (${destinationAirport.city})` : `ID: ${route.destinationId || 'N/A'}`
          };
        });
      } else if (activeTab === 'flights') {
        
        processedData = processedData.map((flight, index) => {
          
          if (flight.aircraft && flight.route) {
            const originCode = flight.route.origin ? `${flight.route.origin.code} (${flight.route.origin.city})` : 'N/A';
            const destinationCode = flight.route.destination ? `${flight.route.destination.code} (${flight.route.destination.city})` : 'N/A';
          return {
            ...flight,
            id: flight.id || `flight-${index}`,
            originalAircraftId: flight.aircraft.id,
            originalRouteId: flight.route.id,
            aircraftId: `${flight.aircraft.model} (${flight.aircraft.manufacturer})`,
            routeId: `${originCode} → ${destinationCode}`
          };
          }
          
          const aircraft = aircrafts.find(ac => 
            ac.id === flight.aircraftId || 
            ac.id === parseInt(flight.aircraftId) ||
            parseInt(ac.id) === flight.aircraftId
          );
          const route = routes.find(r => 
            r.id === flight.routeId || 
            r.id === parseInt(flight.routeId) ||
            parseInt(r.id) === flight.routeId
          );
          return {
            ...flight,
            id: flight.id || `flight-${index}`,
            originalAircraftId: flight.aircraftId,
            originalRouteId: flight.routeId,
            aircraftId: aircraft ? `${aircraft.model} (${aircraft.manufacturer})` : `ID: ${flight.aircraftId || 'N/A'}`,
            routeId: route ? `Route ${route.id}` : `ID: ${flight.routeId || 'N/A'}`
          };
        });
      } else if (activeTab === 'bookings') {
        processedData = processedData.map((booking, index) => {
          
          const passengerNames = Array.isArray(booking.passengerNames) 
            ? booking.passengerNames.join(', ') 
            : booking.passengerNames || 'N/A';
          
          const passengerBirthDates = Array.isArray(booking.passengerBirthDates) 
            ? booking.passengerBirthDates.join(', ') 
            : booking.passengerBirthDates || 'N/A';
          
          const validBookingId = booking.bookingId || booking.id || (index + 1);
          
          const processedBooking = {
            ...booking,
            id: validBookingId,
            bookingId: validBookingId,
            bookingNumber: booking.bookingNumber || `BK${String(validBookingId).padStart(3, '0')}`,
            flightNumber: booking.flightNumber || `SR${booking.flightId || 'N/A'}`,
            bookedSeats: booking.bookedSeats || 0,
            passengerNames: passengerNames,
            passengerBirthDates: passengerBirthDates,
            bookingStatus: booking.bookingStatus || 'UNKNOWN',
            totalPrice: booking.totalPrice || 0,
            createdAt: booking.createdAt || new Date().toISOString()
          };
          
          return processedBooking;
        });
        
        processedData = processedData.sort((a, b) => (a.bookingId || 0) - (b.bookingId || 0));
      } else {
        processedData = processedData.map((item, index) => ({
          ...item,
          id: item.id || `${activeTab}-${index}`
        }));
      }

      if (activeTab === 'airports' || activeTab === 'aircrafts' || activeTab === 'routes' || activeTab === 'flights' || activeTab === 'users' || activeTab === 'bookings') {
        processedData = processedData.sort((a, b) => (a.id || 0) - (b.id || 0));
        const pageSize = 25;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = processedData.slice(startIndex, endIndex);
        
        setData(paginatedData);
        setPagination({
          totalPages: Math.ceil(processedData.length / pageSize),
          totalElements: processedData.length,
          number: page,
          size: pageSize
        });
        return;
      }
      
      setData(processedData);
      
      let paginationData = {
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        number: response.number || 0,
        size: response.size || 25
      };
      
      if (response.page) {
        paginationData = {
          totalPages: response.page.totalPages || 0,
          totalElements: response.page.totalElements || 0,
          number: response.page.number || 0,
          size: response.page.size || 25
        };
      }
      
      setPagination(paginationData);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, airports, aircrafts, routes]);

  useEffect(() => {
    fetchData(currentPage);
  }, [activeTab, currentPage, fetchData]);

  useEffect(() => {
    if ((activeTab === 'routes' && airports.length > 0) ||
        (activeTab === 'flights' && aircrafts.length > 0 && routes.length > 0)) {
      fetchData(currentPage);
    }
  }, [airports, aircrafts, routes, activeTab, currentPage, fetchData]);

  useEffect(() => {
    fetchAirports();
    fetchAircrafts();
    fetchRoutes();
  }, []);

  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes('/admin')) {
        localStorage.removeItem('adminActiveTab');
      }
    };
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await adminApi.airports.getAll(0, 1000);
      const airportsData = response.content || [];
      setAirports(airportsData);
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const fetchAircrafts = async () => {
    try {
      const response = await adminApi.aircrafts.getAll(0, 1000);
      const aircraftsData = response.content || [];
      setAircrafts(aircraftsData);
    } catch (error) {
      console.error('Error fetching aircrafts:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await adminApi.routes.getAll(0, 1000);
      const routesData = response.content || [];
      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setModalData(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    
    let editData = { ...item };
    if (activeTab === 'flights') {
      if (item.originalAircraftId) {
        editData.aircraftId = item.originalAircraftId;
      }
      if (item.originalRouteId) {
        editData.routeId = item.originalRouteId;
      }
      
      if (!editData.aircraftId && item.aircraft && item.aircraft.id) {
        editData.aircraftId = item.aircraft.id;
      }
      if (!editData.routeId && item.route && item.route.id) {
        editData.routeId = item.route.id;
      }
    } else if (activeTab === 'bookings') {
      
      const passengerNames = Array.isArray(item.passengerNames) 
        ? item.passengerNames 
        : (item.passengerNames || '').split(',').map(name => name.trim()).filter(name => name);
      
      const passengerBirthDates = Array.isArray(item.passengerBirthDates) 
        ? item.passengerBirthDates 
        : (item.passengerBirthDates || '').split(',').map(date => {
          const trimmedDate = date.trim();
          if (trimmedDate && (trimmedDate.includes('/') || trimmedDate.includes('-'))) {
            const separator = trimmedDate.includes('/') ? '/' : '-';
            const parts = trimmedDate.split(separator);
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                return trimmedDate;  
              } else {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }
          return trimmedDate;
        }).filter(date => date);
      
      editData.passengers = passengerNames.map((name, index) => ({
        name: name.trim(),
        birthDate: passengerBirthDates[index] || ''
      }));
      
      if (editData.passengers.length === 0) {
        editData.passengers = [{ name: '', birthDate: '' }];
      }
    }
    setModalData(editData);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      item: item,
      type: 'delete'
    });
  };

  const handleConfirmDelete = async () => {
    const { item } = confirmModal;
    try {
      let response;
      
      switch (activeTab) {
        case 'users':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/users/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'airports':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/airports/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'aircrafts':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/aircrafts/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'routes':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/routes/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'flights':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/flights/admin/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'bookings':
          response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/bookings/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        default:
          throw new Error(`Unknown entity type: ${activeTab}`);
      }
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      try {
        await response.json();
      } catch (jsonError) {
      }
      
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      fetchData(currentPage);
      setConfirmModal({ isOpen: false, item: null, type: 'delete' });
    } catch (error) {
      toast.error(`Failed to delete ${activeTab.slice(0, -1)}: ${error.message}`);
      console.error('Error deleting item:', error);
    }
  };


  const handleRoleChange = (item) => {
    if (activeTab === 'users') {
      setRoleModal({
        isOpen: true,
        item: item
      });
    }
  };

  const handleConfirmRoleChange = async (newRole) => {
    const { item } = roleModal;
    setRoleLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/users/${item.id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
      toast.success('Role updated successfully');
      fetchData(currentPage);
      setRoleModal({ isOpen: false, item: null });
    } catch (error) {
      toast.error(`Failed to update role: ${error.message}`);
      console.error('Error updating role:', error);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleStatusChange = (item) => {
    if (activeTab === 'bookings') {
      setStatusModal({
        isOpen: true,
        item: item
      });
    } else if (activeTab === 'flights') {
      setFlightStatusModal({
        isOpen: true,
        item: item
      });
    }
  };

  const handleConfirmStatusChange = async (newStatus) => {
    const { item } = statusModal;
    setStatusLoading(true);
    try {
      
      const bookingId = item.bookingId || item.id;
      if (!bookingId || bookingId === -1) {
        throw new Error('Invalid booking ID');
      }
      
      await adminApi.bookings.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully');
      fetchData(currentPage);
      setStatusModal({ isOpen: false, item: null });
    } catch (error) {
      toast.error(`Failed to update booking status: ${error.message}`);
      console.error('Error updating booking status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleConfirmFlightStatusChange = async (newStatus) => {
    const { item } = flightStatusModal;
    setFlightStatusLoading(true);
    try {
      const flightId = item.id;
      if (!flightId) {
        throw new Error('Invalid flight ID');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/flights/admin/${flightId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ available: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flight status update error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
      toast.success('Flight availability updated successfully');
      fetchData(currentPage);
      setFlightStatusModal({ isOpen: false, item: null });
    } catch (error) {
      toast.error(`Failed to update flight availability: ${error.message}`);
      console.error('Error updating flight availability:', error);
    } finally {
      setFlightStatusLoading(false);
    }
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          if (modalMode === 'add') {
            await adminApi.users.create(formData);
          } else {
            await adminApi.users.update(modalData.id, formData);
          }
          break;
        case 'airports':
          if (modalMode === 'add') {
            await adminApi.airports.create(formData);
          } else {
            await adminApi.airports.update(modalData.id, formData);
          }
          break;
        case 'aircrafts':
          if (modalMode === 'add') {
            await adminApi.aircrafts.create(formData);
          } else {
            await adminApi.aircrafts.update(modalData.id, formData);
          }
          break;
        case 'routes':
          if (modalMode === 'add') {
            await adminApi.routes.create(formData);
          } else {
            await adminApi.routes.update(modalData.id, formData);
          }
          break;
        case 'flights':
          if (modalMode === 'add') {
            await adminApi.flights.create(formData);
          } else {
            await adminApi.flights.update(modalData.id, formData);
          }
          break;
        case 'bookings':
          const bookingData = {
            ...formData,
            passengerNames: formData.passengers?.map(p => p.name).filter(name => name.trim()) || [],
            passengerBirthDates: formData.passengers?.map(p => p.birthDate).filter(date => date.trim()) || []
          };
          delete bookingData.passengers; 
          
          if (modalMode === 'add') {
            await adminApi.bookings.create(bookingData);
          } else {
            await adminApi.bookings.update(modalData.id, bookingData);
          }
          break;
        default:
          throw new Error(`Unknown entity type: ${activeTab}`);
      }
      
      toast.success(`${activeTab.slice(0, -1)} ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      setModalOpen(false);
      fetchData(currentPage);
    } catch (error) {
      toast.error(`Failed to ${modalMode} ${activeTab.slice(0, -1)}`);
      console.error('Error submitting form:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchById = async (id) => {
    if (!id.trim()) {
      setSearchResults(null);
      fetchData(currentPage);
      return;
    }

    try {
      setLoading(true);
      let response;
      const searchId = parseInt(id);
      
      switch (activeTab) {
        case 'users':
          response = await adminApi.users.getById(searchId);
          break;
        case 'airports':
          response = await adminApi.airports.getById(searchId);
          break;
        case 'aircrafts':
          response = await adminApi.aircrafts.getById(searchId);
          break;
        case 'routes':
          response = await adminApi.routes.getById(searchId);
          break;
        case 'flights':
          response = await adminApi.flights.getById(searchId);
          break;
        case 'bookings':
          response = await adminApi.bookings.getById(searchId);
          break;
        default:
          throw new Error('Unknown entity type');
      }

      if (response && response.content) {
        let processedData = response.content;
        
        if (activeTab === 'routes') {
          processedData = processedData.map(route => {
            let originAirport, destinationAirport;
            
            if (route.originId && route.destinationId) {
              originAirport = airports.find(airport => airport.id === route.originId);
              destinationAirport = airports.find(airport => airport.id === route.destinationId);
            } else if (route.origin && route.destination) {
              originAirport = route.origin;
              destinationAirport = route.destination;
            }
            
            return {
              ...route,
              originCode: originAirport ? `${originAirport.code} - ${originAirport.city}` : '-',
              destinationCode: destinationAirport ? `${destinationAirport.code} - ${destinationAirport.city}` : '-'
            };
          });
        } else if (activeTab === 'flights') {
          
          processedData = processedData.map((flight, index) => {
            if (flight.aircraft && flight.route) {
              const originCode = flight.route.origin ? `${flight.route.origin.code} (${flight.route.origin.city})` : 'N/A';
              const destinationCode = flight.route.destination ? `${flight.route.destination.code} (${flight.route.destination.city})` : 'N/A';
              return {
                ...flight,
                id: flight.id || `flight-${index}`,
                originalAircraftId: flight.aircraft.id,
                originalRouteId: flight.route.id,
                aircraftId: `${flight.aircraft.model} (${flight.aircraft.manufacturer})`,
                routeId: `${originCode} → ${destinationCode}`,
                departure: originCode,
                arrival: destinationCode,
                available: flight.available ? 'Yes' : 'No'
              };
            }
            
            const aircraft = aircrafts.find(ac => 
              ac.id === flight.aircraftId || 
              ac.id === parseInt(flight.aircraftId) ||
              parseInt(ac.id) === flight.aircraftId
            );
            
            const route = routes.find(r => 
              r.id === flight.routeId || 
              r.id === parseInt(flight.routeId) ||
              parseInt(r.id) === flight.routeId
            );
            
            let originAirport, destinationAirport;
            if (route) {
              if (route.originId && route.destinationId) {
                originAirport = airports.find(airport => airport.id === route.originId);
                destinationAirport = airports.find(airport => airport.id === route.destinationId);
              } else if (route.origin && route.destination) {
                originAirport = route.origin;
                destinationAirport = route.destination;
              }
            }
            
            
            return {
              ...flight,
              id: flight.id || `flight-${index}`,
              originalAircraftId: flight.aircraftId,
              originalRouteId: flight.routeId,
              aircraftId: aircraft ? `${aircraft.model} (${aircraft.manufacturer})` : `ID: ${flight.aircraftId || 'N/A'}`,
              routeId: route ? `Route ${route.id}` : `ID: ${flight.routeId || 'N/A'}`,
              departure: originAirport ? `${originAirport.code} (${originAirport.city})` : '-',
              arrival: destinationAirport ? `${destinationAirport.code} (${destinationAirport.city})` : '-',
              available: flight.available ? 'Yes' : 'No'
            };
          });
        } else if (activeTab === 'bookings') {
          processedData = processedData.map(booking => {
            return {
              ...booking,
              status: booking.status || 'PENDING',
              createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '-'
            };
          });
        }
        
        setSearchResults(processedData);
        setData(processedData);
      } else {
        setSearchResults([]);
        setData([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`${activeTab.slice(0, -1)} with ID ${id} not found`);
      setSearchResults([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchId(value);
    
    if (value.trim() === '') {
      setSearchResults(null);
      fetchData(currentPage);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      handleSearchById(searchId);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchResults(null);
    fetchData(currentPage);
  };

  const renderTabContent = () => {
    return (
      <DataTable
        entity={activeTab}
        columns={columns[activeTab] || []}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={(activeTab === 'bookings' || activeTab === 'flights') ? handleStatusChange : null}
        onRoleChange={activeTab === 'users' ? handleRoleChange : null}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchId={searchId}
        onSearchInputChange={handleSearchInputChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={clearSearch}
        isSearching={searchResults !== null}
      />
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Admin Dashboard</h1>
        <p className="admin-dashboard__subtitle">Manage your airline system</p>
      </div>

      <div className="admin-dashboard__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(0);
              localStorage.setItem('adminActiveTab', tab.id);
            }}
          >
            <span className="admin-tab__icon">{tab.icon}</span>
            <span className="admin-tab__label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-dashboard__content">
        {renderTabContent()}
      </div>

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).slice(0, -1)}
        entity={activeTab}
        mode={modalMode}
        data={modalData}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
        airports={airports}
        aircrafts={aircrafts}
        routes={routes}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, type: 'delete' })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${activeTab.slice(0, -1)}`}
        message={`Are you sure you want to delete this ${activeTab.slice(0, -1)}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <RoleChangeModal
        isOpen={roleModal.isOpen}
        onClose={() => setRoleModal({ isOpen: false, item: null })}
        onConfirm={handleConfirmRoleChange}
        currentRole={roleModal.item?.role}
        userName={roleModal.item ? `${roleModal.item.firstName} ${roleModal.item.lastName}` : ''}
        loading={roleLoading}
      />

      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, item: null })}
        onConfirm={handleConfirmStatusChange}
        item={statusModal.item}
        loading={statusLoading}
      />

      <FlightStatusModal
        isOpen={flightStatusModal.isOpen}
        onClose={() => setFlightStatusModal({ isOpen: false, item: null })}
        onConfirm={handleConfirmFlightStatusChange}
        flight={flightStatusModal.item}
        loading={flightStatusLoading}
      />
    </div>
  );
};

export default AdminDashboard;