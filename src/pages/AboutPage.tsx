import React from 'react';
import { Link } from 'react-router-dom';
import { aboutData } from '../data/content';

export const AboutPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content-wrapper">
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
          {/* Main Hero Profile Card */}
          <div className="about-hero-card">
            <div className="profile-header">
              <h3>{aboutData.name}</h3>
              <p className="role">{aboutData.role}</p>
            </div>
            <p className="bio">{aboutData.bio}</p>
          </div>

          {/* Highlights Section as Full-Width Grid */}
          <div className="highlights-section">
            <h4 className="section-subtitle">KEY HIGHLIGHTS</h4>
            <div className="highlights-grid">
              {aboutData.highlights.map((item, idx) => (
                <div key={idx} className="highlight-card">
                  <span className="bullet">▶</span>
                  <span className="highlight-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;
