import React from 'react';
import { Link } from 'react-router-dom';
import SkillsBook from '../components/SkillsBook';

export const SkillsPage: React.FC = () => {
  return (
    <div className="page-container skills-page-container">
      <header className="page-header nav-bar">
        <h2>SKILLS DIRECTORY</h2>
        <Link to="/" state={{ from: 'skills' }} className="back-btn">
          ← BACK TO TOWN
        </Link>
      </header>
      <main className="skills-book-main">
        <SkillsBook />
      </main>
    </div>
  );
};

export default SkillsPage;
