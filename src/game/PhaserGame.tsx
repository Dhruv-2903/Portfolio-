import { useEffect, useRef } from 'react';
import { StartGame } from './main';
import { EventBus } from './EventBus';

export interface PhaserGameRef {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  spawnNear?: string;
}

export const PhaserGame = ({ currentActiveScene, spawnNear }: IProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Guard against React 18/19 StrictMode double-mounting
    if (gameRef.current === null) {
      gameRef.current = StartGame('game-container', { spawnNear });

      if (currentActiveScene) {
        EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
          currentActiveScene(scene_instance);
        });
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      EventBus.removeListener('current-scene-ready');
    };
  }, [currentActiveScene, spawnNear]);

  return (
    <div
      id="game-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default PhaserGame;
