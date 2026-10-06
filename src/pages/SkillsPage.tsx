import React from 'react';
import { Link } from 'react-router-dom';
import SkillsBook from '../components/SkillsBook';
import { skillsData } from '../data/content';

export const SkillsPage: React.FC = () => {
  return (
    <div className="page-container skills-page-container">
      <div className="page-content-wrapper">
        <header className="page-header">
          <h2>
            <span className="heading-pink">SKILLS</span>{' '}
            <span className="heading-white">DIRECTORY</span>
          </h2>
          <Link to="/" state={{ from: 'skills' }} className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>

        <main className="page-body">
          {/* Interactive Flipbook Feature */}
          <div className="skills-book-section">
            <SkillsBook />
          </div>

          {/* Full-Width Overview Grid */}
          <div className="skills-category-section">
            <h4 className="section-subtitle">SKILLS OVERVIEW</h4>
            <div className="skills-category-grid">
              {skillsData.map((categoryGroup, idx) => (
                <div key={idx} className="skills-category-card">
                  <h3 className="category-title">{categoryGroup.category}</h3>
                  <ul className="category-skills-list">
                    {categoryGroup.skills.map((skill, sIdx) => (
                      <li key={sIdx}>
                        <span className="bullet">▶</span> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkillsPage;
