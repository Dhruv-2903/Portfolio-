import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private spawnNear?: string;

  constructor() {
    super('BootScene');
  }

  init(data?: { spawnNear?: string }) {
    this.spawnNear = data?.spawnNear || this.registry.get('spawnNear');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Retro pixel-style progress bar UI
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x111122, 0.9);
    progressBox.fillRect(width / 2 - 110, height / 2 - 15, 220, 30);
    progressBox.lineStyle(2, 0x5555ff, 1);
    progressBox.strokeRect(width / 2 - 110, height / 2 - 15, 220, 30);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 32,
      text: 'LOADING WORLD...',
      style: {
        font: '12px "Courier New", Courier, monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '10px "Courier New", Courier, monospace',
        color: '#8888ff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x6666ff, 1);
      progressBar.fillRect(width / 2 - 104, height / 2 - 9, 208 * value, 18);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      this.scene.start('WorldScene', { spawnNear: this.spawnNear });
    });

    // Preload assets from /public/assets
    this.load.image('ground', '/assets/ground/ground-tile.png');
    this.load.image('tile_0020', '/assets/ground/tile_0020.png');
    this.load.image('tile_0021', '/assets/ground/tile_0021.png');
    this.load.image('tile_0022', '/assets/ground/tile_0022.png');
    this.load.image('tile_0023', '/assets/ground/tile_0023.png');
    this.load.image('tile_0120', '/assets/ground/tile_0120.png');
    this.load.image('tile_0121', '/assets/ground/tile_0121.png');
    this.load.image('tile_0122', '/assets/ground/tile_0122.png');
    this.load.image('tile_0123', '/assets/ground/tile_0123.png');
    this.load.image('tile_0141', '/assets/ground/tile_0141.png');
    this.load.image('tile_0142', '/assets/ground/tile_0142.png');
    this.load.image('tile_0143', '/assets/ground/tile_0143.png');
    this.load.image('building-about', '/assets/buildings/Building1aboutnobg.png');
    this.load.image('building-skills', '/assets/buildings/Building2Skillsnobg.png');
    this.load.image('building-projects', '/assets/buildings/Building3Projectsnobg.png');
    this.load.image('building-contact', '/assets/buildings/Building4Contactnobg.png');

    // Player spritesheet
    this.load.spritesheet('player', '/assets/player/character-spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
  }
}
