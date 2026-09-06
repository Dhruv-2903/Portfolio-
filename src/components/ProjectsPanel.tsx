import React from 'react';
import { EventBus } from '../game/EventBus';
import { projectsData } from '../data/content';

export const ProjectsPanel: React.FC = () => {
  const handleClose = () => {
    EventBus.emit('panel-closed');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>PROJECTS</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✖
          </button>
        </div>
        <div className="modal-body projects-list">
          {projectsData.map((proj) => (
            <div key={proj.id} className="project-card">
              <h3>{proj.title}</h3>
              <p>{proj.description}</p>
              <div className="tags-container">
                {proj.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="pixel-tag mini">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="project-links">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="pixel-btn">
                    GitHub 🔗
                  </a>
                )}
                {proj.demoUrl && (
                  <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="pixel-btn accent">
                    Demo 🚀
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPanel;
