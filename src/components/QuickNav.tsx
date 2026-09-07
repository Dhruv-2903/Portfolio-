import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './QuickNav.css';

export const QuickNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Skills', path: '/skills' },
    { label: 'Projects', path: '/projects' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="quick-nav-container" aria-label="Quick Navigation">
      <button
        className="quick-nav-toggle"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰ NAV'}
      </button>

      <ul className={`quick-nav-list ${isOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.path} className="quick-nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `quick-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default QuickNav;
