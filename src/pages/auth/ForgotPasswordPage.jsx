import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    token: searchParams.get('token') || '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(searchParams.get('token') ? 'reset' : 'request');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Password reset instructions have been sent to your email');
      } else {
        setError(data.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH.LOGIN.replace('/login', '/reset-password')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Password has been successfully reset');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <form onSubmit={step === 'request' ? handleRequestReset : handleResetPassword} className="auth-form">
            {step === 'request' ? (
              <>
                <h2 className="auth-title">Reset Password</h2>
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
              </>
            ) : (
              <>
                <h2 className="auth-title">Set New Password</h2>
                <div className="auth-form-group">
                  <label htmlFor="newPassword" className="auth-label">
                    New Password:
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="auth-input"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : step === 'request' ? 'SEND RESET LINK' : 'RESET PASSWORD'}
            </button>

            <div className="auth-links">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;