import React from 'react';
import { EventBus } from '../game/EventBus';
import { aboutData } from '../data/content';

export const AboutPanel: React.FC = () => {
  const handleClose = () => {
    EventBus.emit('panel-closed');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{aboutData.title}</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✖
          </button>
        </div>
        <div className="modal-body">
          <div className="profile-header">
            <h3>{aboutData.name}</h3>
            <p className="role">{aboutData.role}</p>
          </div>
          <p className="bio">{aboutData.bio}</p>
          <div className="highlights">
            <h4>HIGHLIGHTS</h4>
            <ul>
              {aboutData.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPanel;
