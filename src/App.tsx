import { PhaserGame } from './game/PhaserGame';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>PIXEL PORTFOLIO</h1>
        <p>Use horizontal side-scroller navigation to explore</p>
      </header>
      <main className="game-wrapper">
        <PhaserGame />
      </main>
    </div>
  );
}

export default App;
