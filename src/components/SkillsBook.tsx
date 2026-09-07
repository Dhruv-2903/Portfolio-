import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { skillsPages, type SkillPageData } from '../data/content';
import './SkillsBook.css';

interface CoverPageProps {
  title: string;
  subtitle?: string;
  isBack?: boolean;
}

const CoverPage = React.forwardRef<HTMLDivElement, CoverPageProps>(
  ({ title, subtitle, isBack }, ref) => {
    return (
      <div className={`book-page cover-page ${isBack ? 'back-cover' : 'front-cover'}`} ref={ref}>
        <div className="cover-border">
          <div className="cover-content">
            <div className="cover-badge">{isBack ? 'FIN' : 'RETRO TECH'}</div>
            <h2 className="cover-title">{title}</h2>
            {subtitle && <p className="cover-subtitle">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }
);

CoverPage.displayName = 'CoverPage';

interface ContentPageProps {
  pageNumber: number;
  pageData: SkillPageData;
}

const ContentPage = React.forwardRef<HTMLDivElement, ContentPageProps>(
  ({ pageNumber, pageData }, ref) => {
    const formattedPageNum = String(pageNumber).padStart(2, '0');

    return (
      <div className="book-page content-page" ref={ref}>
        <div className="page-header-strip">
          <span className="page-section-tag">PAGE {formattedPageNum}</span>
          <span className="page-number">{formattedPageNum}</span>
        </div>
        <h3 className="page-title">{pageData.title}</h3>
        <p className="page-description">{pageData.description}</p>
        <div className="page-skills-list">
          <h4>SKILLS & TECH</h4>
          <ul>
            {pageData.skills.map((skill, idx) => (
              <li key={idx}>
                <span className="bullet">▶</span> {skill}
              </li>
            ))}
          </ul>
        </div>
        <div className="page-footer-strip">
          <span>PIXEL PORTFOLIO</span>
        </div>
      </div>
    );
  }
);

ContentPage.displayName = 'ContentPage';

export const SkillsBook: React.FC = () => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      // Dual page total width is 380 * 2 = 760px
      if (windowWidth < 480) {
        setScale(Math.min((windowWidth - 32) / 380, 0.85));
      } else if (windowWidth < 820) {
        setScale(Math.min((windowWidth - 48) / 760, 0.95));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="book-wrapper">
      <div
        className="book-scale-container"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <HTMLFlipBook
          width={380}
          height={500}
          size="fixed"
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="skills-flipbook"
        >
          {/* Front Cover */}
          <CoverPage
            title="SKILLS DIRECTORY"
            subtitle="Click or Drag Corner to Turn Page →"
          />

          {/* Dynamic Content Pages */}
          {skillsPages.map((pageData, index) => (
            <ContentPage
              key={index}
              pageNumber={index + 1}
              pageData={pageData}
            />
          ))}

          {/* Back Cover */}
          <CoverPage
            title="END OF DIRECTORY"
            subtitle="Thank you for viewing!"
            isBack={true}
          />
        </HTMLFlipBook>
      </div>
    </div>
  );
};

export default SkillsBook;
