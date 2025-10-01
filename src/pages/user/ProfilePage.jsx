import React, { useState, useEffect } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_ENDPOINTS, getMultipartHeaders } from '../../config/api';
import defaultUserImg from '../../assets/images/default-user-img.png';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    phoneNumber: '',
    password: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const isProfileComplete = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'birthDate', 'phoneNumber'];
    return requiredFields.every(field => {
      const value = formData[field];
      return value && value.trim() !== '';
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        birthDate: parsedUser.birthDate || '',
        phoneNumber: parsedUser.phoneNumber || '',
        password: '',
        image: null
      });
      setImagePreview(parsedUser.userImgUrl || defaultUserImg);
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    setLoading(false);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
        toast.error('Please enter a valid phone number.');
        setSaving(false);
        return;
      }
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      if (formData.firstName) formDataToSend.append('firstName', formData.firstName);
      if (formData.lastName) formDataToSend.append('lastName', formData.lastName);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.birthDate) formDataToSend.append('birthDate', formData.birthDate);
      if (formData.phoneNumber) formDataToSend.append('phoneNumber', formData.phoneNumber);
      if (formData.password) formDataToSend.append('password', formData.password);
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(API_ENDPOINTS.USERS.PROFILE, {
        method: 'PUT',
        headers: getMultipartHeaders(token),
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Profile updated successfully!');
        setEditing(false);
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      birthDate: user?.birthDate || '',
      phoneNumber: user?.phoneNumber || '',
      password: '',
      image: null
    });
    setImagePreview(user?.userImgUrl || defaultUserImg);
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1 className="profile-title">User Profile</h1>
            {!editing && (
              <button 
                onClick={() => setEditing(true)}
                className="profile-button profile-button--edit"
              >
                EDIT PROFILE
              </button>
            )}
          </div>

          {!isProfileComplete() && (
            <div className="profile-warning">
              <div className="profile-warning-icon">⚠️</div>
              <div className="profile-warning-text">
                <strong>Profile Update Required</strong>
                <p>Please complete all required fields to enable flight booking functionality. All fields except photo are mandatory.</p>
              </div>
            </div>
          )}

          <div className="profile-content">
            <div className="profile-image-section">
              <div className="profile-image-container">
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="profile-image"
                />
                {editing && (
                  <label className="profile-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="profile-image-input"
                    />
                    Change Photo
                  </label>
                )}
              </div>
            </div>

            <div className="profile-form">
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-label">First Name:</label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <span className="profile-value">{user?.firstName || 'N/A'}</span>
                  )}
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-label">Last Name:</label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <span className="profile-value">{user?.lastName || 'N/A'}</span>
                  )}
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Email:</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">{user?.email || 'N/A'}</span>
                )}
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Role:</label>
                <span className="profile-value profile-value--role">
                  {user?.role || 'USER'}
                </span>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Member Since:</label>
                <span className="profile-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-label">Birth Date:</label>
                {editing ? (
                    <DatePickerInput
                      value={formData.birthDate ? dayjs(formData.birthDate).toDate() : null}
                      onChange={(date) => {
                        const value = date ? dayjs(date).format('YYYY-MM-DD') : '';
                        setFormData(prev => ({ ...prev, birthDate: value }));
                      }}
                      placeholder="Select date"
                      labelProps={{ style: { display: 'none' } }}
                      maxDate={new Date()}
                      valueFormat="DD/MM/YYYY"
                      dropdownType="popover"
                      popoverProps={{ withinPortal: true, position: 'bottom-start', offset: 8, zIndex: 3000 }}
                      clearable
                      classNames={{ input: 'profile-date-input' }}
                    />
                  ) : (
                    <span className="profile-value">{user?.birthDate || 'N/A'}</span>
                  )}
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-label">Phone Number:</label>
                {editing ? (
                    <PhoneInput
                      defaultCountry="ES"
                      international
                      value={formData.phoneNumber}
                      onChange={(val) => setFormData(prev => ({ ...prev, phoneNumber: val || '' }))}
                      className="profile-input"
                    />
                  ) : (
                    <span className="profile-value">{user?.phoneNumber || 'N/A'}</span>
                  )}
                </div>
              </div>

              {editing && (
                <div className="profile-form-group">
                  <label className="profile-label">New Password (leave blank to keep current):</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="Enter new password"
                  />
                </div>
              )}


              {editing && (
                <div className="profile-actions">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="profile-button profile-button--save"
                  >
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="profile-button profile-button--cancel"
                  >
                    CANCEL
                  </button>
                </div>
              )}

              {!editing && (
                <div className="profile-actions">
                  <button 
                    onClick={handleLogout}
                    className="profile-button profile-button--logout"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;