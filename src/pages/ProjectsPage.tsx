import React from 'react';
import { Link } from 'react-router-dom';
import { projectsData } from '../data/content';

export const ProjectsPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content-wrapper">
        <header className="page-header">
          <h2>
            <span className="heading-pink">FEATURED</span>{' '}
            <span className="heading-white">PROJECTS</span>
          </h2>
          <Link to="/" state={{ from: 'projects' }} className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>

        <main className="page-body">
          <div className="projects-grid">
            {projectsData.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tags-container">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="pixel-tag mini">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-btn"
                    >
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-btn accent"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;
