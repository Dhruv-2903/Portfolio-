import React, { useEffect, useRef, useState, useCallback } from 'react';
import { preloadGameAssets } from '../utils/assetPreloader';
import WelcomeOverlay from './WelcomeOverlay';

interface LandingScrollProps {
  onComplete: () => void;
}

const TOTAL_FRAMES = 180;

export const LandingScroll: React.FC<LandingScrollProps> = ({ onComplete }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasScrolledPastTop, setHasScrolledPastTop] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const scrollLockedRef = useRef(false);

  // Preload all 180 frame images
  useEffect(() => {
    let mounted = true;
    let count = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const frameNum = String(i).padStart(3, '0');
      const img = new Image();
      img.src = `/assets/landing/ezgif-frame-${frameNum}.jpg`;

      const handleLoad = () => {
        if (!mounted) return;
        count++;
        setLoadedCount(count);
        if (count === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsPreloaded(true);
        }
      };

      img.onload = handleLoad;
      img.onerror = handleLoad; // Resolve on error so sequence isn't blocked completely
      images[i - 1] = img;
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Draw a given frame index onto the responsive canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Fill background (pure black canvas)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image -> pillarbox (bars on left/right)
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspect;
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      // Canvas is taller than image -> letterbox (bars on top/bottom)
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    currentFrameRef.current = index;
  }, []);

  // Resize canvas to match container client dimensions (excluding scrollbars)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : document.documentElement.clientWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    if (currentFrameRef.current >= 0) {
      drawFrame(currentFrameRef.current);
    }
  }, [drawFrame]);

  // Handle end-of-scroll transition into game
  const triggerEndTransition = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;

    // Lock page scroll at bottom
    document.body.style.overflow = 'hidden';
    setIsTransitioning(true);

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 1400));
    const preloaderPromise = preloadGameAssets();

    Promise.all([minDelayPromise, preloaderPromise]).then(() => {
      sessionStorage.setItem('landingSeen', 'true');
      setIsFadingOut(true);

      setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 500); // 500ms fade-out duration
    });
  }, [onComplete]);

  // RequestAnimationFrame scroll loop
  useEffect(() => {
    if (!isPreloaded) return;

    // Ensure canvas dimensions are set and initial frame is rendered
    resizeCanvas();
    drawFrame(0);

    const handleScrollOrResize = () => {
      if (rafIdRef.current !== null) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        const container = containerRef.current;
        if (!container) return;

        const totalScrollable = container.scrollHeight - window.innerHeight;
        if (totalScrollable <= 0) return;

        const scrollY = window.scrollY || window.pageYOffset;

        // Fade out WelcomeOverlay once user moves scroll position above 0
        if (scrollY > 5) {
          setHasScrolledPastTop(true);
        }

        const progress = Math.max(0, Math.min(1, scrollY / totalScrollable));

        const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

        if (targetFrame !== currentFrameRef.current) {
          drawFrame(targetFrame);
        }

        if (progress >= 0.999 && !scrollLockedRef.current) {
          triggerEndTransition();
        }
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', resizeCanvas);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isPreloaded, drawFrame, resizeCanvas, triggerEndTransition]);

  // Cleanup scroll locking on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const progressPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div className={`landing-scroll-root ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Initial Frame Preloading Screen */}
      {!isPreloaded && (
        <div className="landing-preload-overlay">
          <div className="landing-preload-card">
            <h2 className="pixel-title"><span className="accent-word">PIXEL</span> PORTFOLIO</h2>
            <div className="pixel-subtext">INITIALIZING SCROLL EXPERIENCE...</div>
            <div className="landing-progress-bar-container">
              <div
                className="landing-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="landing-progress-text">{progressPercent}% LOADED ({loadedCount}/{TOTAL_FRAMES})</div>
          </div>
        </div>
      )}

      {/* Tall Scrollable Container */}
      <div ref={containerRef} className="landing-scroll-container">
        <div className="landing-fixed-wrapper">
          <canvas ref={canvasRef} className="landing-canvas" />

          {/* Welcome Overlay with Encrypted Text */}
          <WelcomeOverlay isVisible={isPreloaded && !hasScrolledPastTop && !isTransitioning} />

          {/* Retro Scroll Indicator Prompt */}
          {isPreloaded && !isTransitioning && (
            <div className="scroll-down-hint">
              <span>SCROLL DOWN TO ENTER</span>
              <div className="scroll-arrow">▼</div>
            </div>
          )}

          {/* End-of-Scroll Game Loading Overlay */}
          {isTransitioning && (
            <div className="landing-transition-overlay">
              <div className="landing-transition-content">
                <div className="pixel-spinner" />
                <h3 className="transition-title"><span className="accent-word">LOADING</span> WORLD...</h3>
                <p className="transition-subtitle">Preparing Retro Neighborhood</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingScroll;
