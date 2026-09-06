import React from 'react';
import { EventBus } from '../game/EventBus';
import { skillsData } from '../data/content';

export const SkillsPanel: React.FC = () => {
  const handleClose = () => {
    EventBus.emit('panel-closed');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>SKILLS & STACK</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✖
          </button>
        </div>
        <div className="modal-body">
          {skillsData.map((cat, idx) => (
            <div key={idx} className="skill-group">
              <h4>{cat.category}</h4>
              <div className="tags-container">
                {cat.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="pixel-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsPanel;
