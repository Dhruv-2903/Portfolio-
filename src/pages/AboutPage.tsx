import React from 'react';
import { Link } from 'react-router-dom';
import { aboutData } from '../data/content';

export const AboutPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-card">
        <header className="page-header">
          <h2>
            <span className="heading-pink">{aboutData.title.split(' ')[0]}</span>{' '}
            <span className="heading-white">{aboutData.title.split(' ').slice(1).join(' ')}</span>
          </h2>
          <Link to="/" state={{ from: 'about' }} className="back-btn">
            ← BACK TO TOWN
          </Link>
        </header>
        <main className="page-body">
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
        </main>
      </div>
    </div>
  );
};

export default AboutPage;
