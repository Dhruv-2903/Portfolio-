import React from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from '../data/content';

export const ContactPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-card">
        <header className="page-header">
          <h2>GET IN TOUCH</h2>
          <Link to="/" className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>
        <main className="page-body contact-list">
          <p className="contact-intro">
            Feel free to connect or drop a message across any of the platforms below:
          </p>
          {contactLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <span className="platform">{link.platform}</span>
              <span className="link-label">{link.label}</span>
            </a>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ContactPage;
