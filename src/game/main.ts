import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scene: [BootScene, WorldScene]
};

export const StartGame = (parent: string, data?: { spawnNear?: string }): Phaser.Game => {
  const game = new Phaser.Game({ ...config, parent });
  if (data?.spawnNear) {
    game.registry.set('spawnNear', data.spawnNear);
  }
  return game;
};

export default StartGame;
