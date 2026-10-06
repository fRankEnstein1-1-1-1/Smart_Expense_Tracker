import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SparklesIcon, LogOutIcon, MenuIcon, XIcon } from './Icons';
import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  // If on login or signup, hide nav links to keep focused, but keep wordmark
  const isAuthPage = location.pathname === '/' || location.pathname === '/sign';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to={isAuthenticated ? '/home' : '/'} className="navbar-brand" onClick={closeMobile}>
          <div className="navbar-logo-icon">
            <SparklesIcon size={16} />
          </div>
          <span>Smart Expense Tracker</span>
        </NavLink>

        {!isAuthPage && (
          <nav className="navbar-nav">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              History
            </NavLink>
          </nav>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOutIcon size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            !isAuthPage && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
              >
                Sign In
              </Button>
            )
          )}
        </div>

        {!isAuthPage && (
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isAuthPage && mobileOpen && (
        <div className="mobile-menu">
          <NavLink
            to="/home"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span>History</span>
          </NavLink>
          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                block
                icon={<LogOutIcon size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="secondary"
                block
                onClick={() => {
                  navigate('/');
                  closeMobile();
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
