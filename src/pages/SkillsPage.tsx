import React from 'react';
import { Link } from 'react-router-dom';
import { skillsData } from '../data/content';

export const SkillsPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-card">
        <header className="page-header">
          <h2>SKILLS & TECHNOLOGIES</h2>
          <Link to="/" className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>
        <main className="page-body">
          {skillsData.map((categoryGroup, idx) => (
            <div key={idx} className="skill-group">
              <h4>{categoryGroup.category.toUpperCase()}</h4>
              <div className="tags-container">
                {categoryGroup.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="pixel-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default SkillsPage;
