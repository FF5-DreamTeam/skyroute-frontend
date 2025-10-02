const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const getFormDataHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const adminApi = {
  users: {
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await fetch(`${API_BASE}/users?page=${page}&size=${size}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    create: async (userData) => {
      const formData = new FormData();
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      if (userData.image) {
        formData.append('image', userData.image);
      }
      
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData
      });
      return response.json();
    },
    
    update: async (id, userData) => {
      const formData = new FormData();
      if (userData.firstName) formData.append('firstName', userData.firstName);
      if (userData.lastName) formData.append('lastName', userData.lastName);
      if (userData.email) formData.append('email', userData.email);
      if (userData.password) formData.append('password', userData.password);
      if (userData.image) formData.append('image', userData.image);
      
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData
      });
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('User not found');
      }
      return { content: [await response.json()] };
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  airports: {
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await fetch(`${API_BASE}/airports`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch airports');
        }
        const data = await response.json();
        return {
          content: Array.isArray(data) ? data : [],
          totalPages: 1,
          totalElements: Array.isArray(data) ? data.length : 0,
          number: 0,
          size: Array.isArray(data) ? data.length : 10
        };
      } catch (error) {
        console.error('Error fetching airports:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    create: async (airportData) => {
      const formData = new FormData();
      formData.append('code', airportData.code);
      formData.append('city', airportData.city);
      if (airportData.image) {
        formData.append('image', airportData.image);
      }
      
      const response = await fetch(`${API_BASE}/airports`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData
      });
      return response.json();
    },
    
    update: async (id, airportData) => {
      const formData = new FormData();
      if (airportData.code) formData.append('code', airportData.code);
      if (airportData.city) formData.append('city', airportData.city);
      if (airportData.image) formData.append('image', airportData.image);
      
      const response = await fetch(`${API_BASE}/airports/${id}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData
      });
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/airports/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Airport not found');
      }
      return { content: [await response.json()] };
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/airports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  aircrafts: {
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await fetch(`${API_BASE}/aircrafts`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch aircrafts');
        }
        const data = await response.json();
        return {
          content: Array.isArray(data) ? data : [],
          totalPages: 1,
          totalElements: Array.isArray(data) ? data.length : 0,
          number: 0,
          size: Array.isArray(data) ? data.length : 10
        };
      } catch (error) {
        console.error('Error fetching aircrafts:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    create: async (aircraftData) => {
      const response = await fetch(`${API_BASE}/aircrafts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(aircraftData)
      });
      return response.json();
    },
    
    update: async (id, aircraftData) => {
      const response = await fetch(`${API_BASE}/aircrafts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(aircraftData)
      });
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/aircrafts/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Aircraft not found');
      }
      return { content: [await response.json()] };
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/aircrafts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  routes: {
    getAll: async (page = 0, size = 10) => {
      try {
        const response = await fetch(`${API_BASE}/routes`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch routes');
        }
        const data = await response.json();
        return {
          content: Array.isArray(data) ? data : [],
          totalPages: 1,
          totalElements: Array.isArray(data) ? data.length : 0,
          number: 0,
          size: Array.isArray(data) ? data.length : 10
        };
      } catch (error) {
        console.error('Error fetching routes:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    create: async (routeData) => {
      const response = await fetch(`${API_BASE}/routes`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Route creation error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    
    update: async (id, routeData) => {
      const response = await fetch(`${API_BASE}/routes/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Route update error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/routes/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Route not found');
      }
      return { content: [await response.json()] };
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/routes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  flights: {
    getAll: async (page = 0, size = 10, sort = 'departureTime', direction = 'ASC') => {
      try {
        const response = await fetch(`${API_BASE}/flights/admin?page=${page}&size=${size}&sort=${sort}&direction=${direction}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch flights');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching flights:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/flights/admin/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Flight not found');
      }
      return { content: [await response.json()] };
    },
    
    create: async (flightData) => {
      const response = await fetch(`${API_BASE}/flights/admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(flightData)
      });
      return response.json();
    },
    
    update: async (id, flightData) => {
      const response = await fetch(`${API_BASE}/flights/admin/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(flightData)
      });
      return response.json();
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/flights/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  bookings: {
    getAll: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
      try {
        const response = await fetch(`${API_BASE}/bookings?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 };
      }
    },
    
    
    
    create: async (bookingData) => {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });
      return response.json();
    },
    
    update: async (id, bookingData) => {
      // For bookings, we need to update passenger names and birth dates separately
      // since there's no general update endpoint
      const promises = [];
      
      if (bookingData.passengerNames && bookingData.passengerNames.length > 0) {
        promises.push(
          fetch(`${API_BASE}/bookings/${id}/passenger-names`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData.passengerNames)
          })
        );
      }
      
      if (bookingData.passengerBirthDates && bookingData.passengerBirthDates.length > 0) {
        promises.push(
          fetch(`${API_BASE}/bookings/${id}/passenger-birth-dates`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData.passengerBirthDates)
          })
        );
      }
      
      if (promises.length === 0) {
        throw new Error('No passenger data to update');
      }
      
      const responses = await Promise.all(promises);
      
      // Check if all requests were successful
      for (const response of responses) {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }
      
      // Return the booking data (we'll fetch the updated booking)
      return adminApi.bookings.getById(id);
    },
    
    updateStatus: async (id, status) => {
      const response = await fetch(`${API_BASE}/bookings/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    },
    
    confirm: async (id) => {
      const response = await fetch(`${API_BASE}/bookings/${id}/confirm`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.json();
    },
    
    cancel: async (id) => {
      const response = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.json();
    },
    
    updatePassengerNames: async (id, names) => {
      const response = await fetch(`${API_BASE}/bookings/${id}/passenger-names`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ names })
      });
      return response.json();
    },
    
    updatePassengerBirthDates: async (id, birthDates) => {
      const response = await fetch(`${API_BASE}/bookings/${id}/passenger-birth-dates`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ birthDates })
      });
      return response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE}/bookings/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      return { content: [await response.json()] };
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  }
};
