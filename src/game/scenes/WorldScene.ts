import Phaser from 'phaser';

export class WorldScene extends Phaser.Scene {
  private groundTile!: Phaser.GameObjects.TileSprite;
  public buildings: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super('WorldScene');
  }

  create() {
    const worldWidth = 3200;
    const worldHeight = 270;

    // Set camera and world bounds for side-scrolling
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Sky / Background gradient fill
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x24243e, 0x302b63, 1);
    graphics.fillRect(0, 0, worldWidth, worldHeight);

    // Add some subtle pixel stars in the background
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, worldWidth);
      const y = Phaser.Math.Between(10, worldHeight - 50);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.9);
      const size = Phaser.Math.Between(1, 2);
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha);
      star.setScrollFactor(0.8); // Parallax depth effect
    }

    // Top edge line of ground
    const groundHeight = 24;
    const groundY = worldHeight - groundHeight;

    // Repeating ground tile stretched across full strip width
    this.groundTile = this.add.tileSprite(0, groundY, worldWidth, groundHeight, 'ground');
    this.groundTile.setOrigin(0, 0);

    // Add ground physics body if needed
    const groundGroup = this.physics.add.staticGroup();
    groundGroup.add(this.groundTile);

    // Building definitions: exact left-to-right order (About, Skills, Projects, Contact)
    const buildingConfigs = [
      { key: 'building-about', name: 'About', x: 450 },
      { key: 'building-skills', name: 'Skills', x: 1150 },
      { key: 'building-projects', name: 'Projects', x: 1850 },
      { key: 'building-contact', name: 'Contact', x: 2550 }
    ];

    const targetHeight = 145; // Target display height for buildings

    this.buildings = buildingConfigs.map((cfg) => {
      // Set origin (0.5, 1) so building bottom edge snaps directly to the ground top line (groundY)
      const sprite = this.add.sprite(cfg.x, groundY, cfg.key);
      sprite.setOrigin(0.5, 1);

      // Scale building to maintain consistent proportion with 270px viewport height
      const scale = targetHeight / sprite.height;
      sprite.setScale(scale);

      // Add label banner above building
      const labelY = groundY - (sprite.height * scale) - 12;
      const label = this.add.text(cfg.x, labelY, cfg.name.toUpperCase(), {
        font: 'bold 11px "Courier New", Courier, monospace',
        color: '#ffdd55',
        backgroundColor: '#1a1a2e',
        padding: { x: 6, y: 3 }
      });
      label.setOrigin(0.5, 0.5);

      return sprite;
    });

    // Simple camera setup (enable cursor key panning or initial camera position)
    this.cameras.main.scrollX = 0;
  }

  update() {
    // Optional scene tick updates
  }
}
