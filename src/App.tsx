import { useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { AboutPanel } from './components/AboutPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ContactPanel } from './components/ContactPanel';
import './App.css';

function App() {
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);

  useEffect(() => {
    const handleBuildingEntered = (buildingId: string) => {
      setActiveBuilding(buildingId);
    };

    const handlePanelClosed = () => {
      setActiveBuilding(null);
    };

    EventBus.on('building-entered', handleBuildingEntered);
    EventBus.on('panel-closed', handlePanelClosed);

    return () => {
      EventBus.off('building-entered', handleBuildingEntered);
      EventBus.off('panel-closed', handlePanelClosed);
    };
  }, []);

  const renderActivePanel = () => {
    switch (activeBuilding) {
      case 'about':
        return <AboutPanel />;
      case 'skills':
        return <SkillsPanel />;
      case 'projects':
        return <ProjectsPanel />;
      case 'contact':
        return <ContactPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>PIXEL PORTFOLIO</h1>
        <p>Walk to a building and press E or Enter to inspect</p>
      </header>
      <main className="game-wrapper">
        <PhaserGame />
        {renderActivePanel()}
      </main>
    </div>
  );
}

export default App;
