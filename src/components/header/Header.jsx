import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  const isLoggedIn = !!token;
  const userData = user ? JSON.parse(user) : null;
  const isAdmin = userData?.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <img src={logo} alt="SkyRoute Logo" className="header__logo-image" />
          </Link>
          <nav className="header__nav">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/" 
                  className="header__nav-link"
                >
                  MAIN
                </Link>
                <Link 
                  to="/login" 
                  className="header__nav-link"
                >
                  LOG IN
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="header__nav-link"
                >
                  PROFILE
                </Link>
                <Link 
                  to="/bookings" 
                  className="header__nav-link"
                >
                  BOOKINGS
                </Link>
                <Link 
                  to="/history" 
                  className="header__nav-link"
                >
                  HISTORY
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="header__nav-link"
                  >
                    ADMIN
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="header__nav-link header__nav-link--button"
                >
                  LOGOUT
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
