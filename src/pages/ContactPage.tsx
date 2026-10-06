import React from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from '../data/content';

export const ContactPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content-wrapper">
        <header className="page-header">
          <h2>
            <span className="heading-pink">GET</span>{' '}
            <span className="heading-white">IN TOUCH</span>
          </h2>
          <Link to="/" state={{ from: 'contact' }} className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>

        <main className="page-body">
          <p className="contact-intro">
            Feel free to connect or drop a message across any of the platforms below:
          </p>
          <div className="contact-grid">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContactPage;
