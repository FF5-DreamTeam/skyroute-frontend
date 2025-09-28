import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <img src={logo} alt="SkyRoute Logo" className="header__logo-image" />
          </Link>
          <nav className="header__nav">
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
