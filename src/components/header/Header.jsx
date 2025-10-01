import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isLoggedIn = !!token;
  const userData = user ? JSON.parse(user) : null;
  const isAdmin = userData?.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <Link to="/" className="header__logo" onClick={closeMobileMenu}>
            <img src={logo} alt="SkyRoute Logo" className="header__logo-image" />
          </Link>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button 
            className="header__mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="header__mobile-menu-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="header__mobile-menu">
            <div className="header__mobile-menu-content">
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/" 
                    className="header__mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    MAIN
                  </Link>
                  <Link 
                    to="/login" 
                    className="header__mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    LOG IN
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/profile" 
                    className="header__mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    PROFILE
                  </Link>
                  <Link 
                    to="/bookings" 
                    className="header__mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    BOOKINGS
                  </Link>
                  <Link 
                    to="/history" 
                    className="header__mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    HISTORY
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="header__mobile-nav-link"
                      onClick={closeMobileMenu}
                    >
                      ADMIN
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="header__mobile-nav-link header__mobile-nav-link--button"
                  >
                    LOGOUT
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
