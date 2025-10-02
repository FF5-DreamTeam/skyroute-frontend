import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../config/api';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        toast.error('Invalid response from server');
        return;
      }

      if (response.ok) {
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          try {
            const userResponse = await fetch(`${API_ENDPOINTS.USERS.BASE}/email/${encodeURIComponent(formData.email)}`, {
              headers: {
                'Authorization': `Bearer ${data.accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              const userData = {
                email: formData.email,
                firstName: '',
                lastName: '',
                birthDate: '',
                phoneNumber: '',
                userImgUrl: null
              };
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (userError) {
            const userData = {
              email: formData.email,
              firstName: '',
              lastName: '',
              birthDate: '',
              phoneNumber: '',
              userImgUrl: null
            };
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
        const userData = JSON.parse(localStorage.getItem('user'));
        const isAdmin = userData?.role === 'ADMIN';
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        toast.success('Login successful!');
        
        if (redirect) {
          navigate(redirect);
        } else if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
            </div>


            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>

            <div className="auth-links">
              <p>Don't have an account? <Link to="/register" className="auth-link">Register!</Link></p>
              <Link to="/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;