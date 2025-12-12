import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from './Icons';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navigation">
      <div className="nav-content">
        <div className="nav-logo">
          <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img" />
          <span className="nav-logo-text">ISCAE</span>
        </div>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <HomeIcon size={20} color="#ffffff" />
          <span>Maison</span>
        </Link>
        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
          <span>À propos</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;

