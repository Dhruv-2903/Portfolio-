import Phaser from 'phaser';

export class WorldScene extends Phaser.Scene {
  private groundTile!: Phaser.GameObjects.TileSprite;
  public buildings: Phaser.GameObjects.Sprite[] = [];
  public player!: Phaser.Physics.Arcade.Sprite;

  private keyLeft?: Phaser.Input.Keyboard.Key;
  private keyRight?: Phaser.Input.Keyboard.Key;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;

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

    // Define player animations
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 143, end: 151 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 325, end: 326 }),
        frameRate: 2,
        repeat: -1
      });
    }

    // Create physics-enabled player sprite sitting flush on top of the ground strip at x: 100
    this.player = this.physics.add.sprite(100, groundY, 'player');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
    this.player.play('idle');

    // Register input controls (Left/Right Arrow keys AND A/D keys)
    if (this.input.keyboard) {
      this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    // Set camera to follow player horizontally only
    this.cameras.main.startFollow(this.player, true, 0.1, 0);
  }

  update() {
    if (!this.player || !this.player.body) return;

    const isLeft = (this.keyLeft && this.keyLeft.isDown) || (this.keyA && this.keyA.isDown);
    const isRight = (this.keyRight && this.keyRight.isDown) || (this.keyD && this.keyD.isDown);

    if (isLeft && !isRight) {
      this.player.setVelocityX(-120);
      this.player.setVelocityY(0);
      this.player.setFlipX(true);
      this.player.anims.play('walk', true);
    } else if (isRight && !isLeft) {
      this.player.setVelocityX(120);
      this.player.setVelocityY(0);
      this.player.setFlipX(false);
      this.player.anims.play('walk', true);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.player.anims.play('idle', true);
    }
  }
}
