import React from 'react';
import { EventBus } from '../game/EventBus';
import { contactLinks } from '../data/content';

export const ContactPanel: React.FC = () => {
  const handleClose = () => {
    EventBus.emit('panel-closed');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CONTACT & LINKS</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✖
          </button>
        </div>
        <div className="modal-body contact-list">
          <p className="contact-intro">Feel free to reach out via any of these channels:</p>
          {contactLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <span className="platform">{link.platform}</span>
              <span className="link-label">{link.label} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPanel;
