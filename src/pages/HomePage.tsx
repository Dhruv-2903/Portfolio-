import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhaserGame } from '../game/PhaserGame';
import { TouchControls } from '../components/TouchControls';
import { EventBus } from '../game/EventBus';
import LandingScroll from '../components/LandingScroll';

export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const spawnNear = (location.state as { from?: string } | null)?.from;

  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return sessionStorage.getItem('landingSeen') !== 'true';
  });

  useEffect(() => {
    const handleBuildingEntered = (buildingId: string) => {
      navigate(`/${buildingId}`);
    };

    EventBus.on('building-entered', handleBuildingEntered);

    return () => {
      EventBus.off('building-entered', handleBuildingEntered);
    };
  }, [navigate]);

  if (showLanding) {
    return <LandingScroll onComplete={() => setShowLanding(false)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><span className="accent-word">PIXEL</span> PORTFOLIO</h1>
        <p>Walk to a building and press E or Enter to inspect</p>
      </header>
      <main className="game-wrapper">
        <PhaserGame spawnNear={spawnNear} />
        <TouchControls />
      </main>
    </div>
  );
};

export default HomePage;

