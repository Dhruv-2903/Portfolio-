import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { BUILDING_CONFIGS, BUILDING_ELEVATIONS, getSpawnX, getSpawnY } from '../buildingPositions';

export class WorldScene extends Phaser.Scene {
  private groundTile!: Phaser.GameObjects.TileSprite;
  public buildings: Phaser.GameObjects.Sprite[] = [];
  public player!: Phaser.Physics.Arcade.Sprite;
  private buildingGroup!: Phaser.Physics.Arcade.StaticGroup;

  private interactionZones: { id: string; zone: Phaser.GameObjects.Zone }[] = [];
  private activeBuildingId: string | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private isPanelOpen: boolean = false;
  private spawnNear?: string;

  private isTouchLeftDown: boolean = false;
  private isTouchRightDown: boolean = false;

  private keyLeft?: Phaser.Input.Keyboard.Key;
  private keyRight?: Phaser.Input.Keyboard.Key;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keySpace?: Phaser.Input.Keyboard.Key;
  private keyUp?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyC?: Phaser.Input.Keyboard.Key;
  private keyE?: Phaser.Input.Keyboard.Key;
  private keyEnter?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('WorldScene');
  }

  init(data?: { spawnNear?: string }) {
    this.spawnNear = data?.spawnNear || this.registry.get('spawnNear');
  }

  create() {
    const worldWidth = 3200;
    const worldHeight = 270;
    const minY = -250;
    const totalHeight = worldHeight - minY;

    // Set camera and world bounds expanded vertically to handle platform jumps
    this.cameras.main.setBounds(0, minY, worldWidth, totalHeight);
    this.physics.world.setBounds(0, minY, worldWidth, totalHeight);

    // Sky / Background gradient fill covering entire expanded vertical range
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x24243e, 0x302b63, 1);
    graphics.fillRect(0, minY, worldWidth, totalHeight);

    // Add subtle pixel stars in background across expanded vertical height
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, worldWidth);
      const y = Phaser.Math.Between(minY + 20, worldHeight - 50);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.9);
      const size = Phaser.Math.Between(1, 2);
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha);
      star.setScrollFactor(0.8);
    }

    // Top edge line of ground
    const groundHeight = 24;
    const groundY = worldHeight - groundHeight;

    // Repeating ground tile stretched across full strip width
    this.groundTile = this.add.tileSprite(0, groundY, worldWidth, groundHeight, 'ground');
    this.groundTile.setOrigin(0, 0);

    // Create a static physics body for the ground strip so player lands on top of groundY
    const groundBody = this.add.rectangle(worldWidth / 2, groundY + groundHeight / 2, worldWidth, groundHeight);
    this.physics.add.existing(groundBody, true);

    // Static physics group for building structural colliders
    this.buildingGroup = this.physics.add.staticGroup();

    // Use single source of truth for building configurations
    const targetHeight = 145; // Target display height for buildings

    this.buildings = BUILDING_CONFIGS.map((cfg) => {
      const elevation = BUILDING_ELEVATIONS[cfg.id] || 0;
      const buildingBaseY = groundY - elevation;

      // Set origin (0.5, 1) so building bottom edge snaps directly to its platform surface
      const sprite = this.add.sprite(cfg.x, buildingBaseY, cfg.key);
      sprite.setOrigin(0.5, 1);

      // Scale building to maintain consistent proportion with 270px viewport height
      const scale = targetHeight / sprite.height;
      sprite.setScale(scale);

      // Add label banner above building
      const labelY = buildingBaseY - (sprite.height * scale) - 12;
      const label = this.add.text(cfg.x, labelY, cfg.name.toUpperCase(), {
        font: 'bold 11px "Courier New", Courier, monospace',
        color: '#ffdd55',
        backgroundColor: '#1a1a2e',
        padding: { x: 6, y: 3 }
      });
      label.setOrigin(0.5, 0.5);

      // Create a narrower static collider on the building's main upper structure
      const displayWidth = sprite.displayWidth;
      const colliderWidth = displayWidth * 0.45; // Main mass collider width
      const colliderHeight = 50;
      const colliderY = buildingBaseY - 75; // Offset upward above walking floor

      const zone = this.add.rectangle(cfg.x, colliderY, colliderWidth, colliderHeight);
      zone.setVisible(false);
      this.buildingGroup.add(zone);

      // Create invisible interaction overlap zone in front of doorway at proper elevation
      const interactZone = this.add.zone(cfg.x, buildingBaseY - 30, colliderWidth + 40, 60);
      this.physics.add.existing(interactZone, true);
      this.interactionZones.push({ id: cfg.id, zone: interactZone });

      return sprite;
    });

    // Create static platform blocks and staircases using existing terrain 'ground' tiles
    this.createPlatforms(groundY);

    // Floating "Press E" prompt text above player's head
    this.promptText = this.add.text(0, 0, 'PRESS E TO ENTER', {
      font: 'bold 10px "Courier New", Courier, monospace',
      color: '#ffffff',
      backgroundColor: '#ff2a6d',
      padding: { x: 6, y: 3 }
    });
    this.promptText.setOrigin(0.5, 1);
    this.promptText.setDepth(100);
    this.promptText.setVisible(false);

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

    if (!this.anims.exists('jump')) {
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('player', { start: 377, end: 381 }),
        frameRate: 10,
        repeat: 0
      });
    }

    // Determine starting position: spawn near building doorway if specified, else default start position
    const startX = getSpawnX(this.spawnNear);
    const startY = getSpawnY(groundY, this.spawnNear);

    // Create physics-enabled player sprite sitting flush on top of the ground/platform strip
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setSize(32, 48);
      (this.player.body as Phaser.Physics.Arcade.Body).setOffset(16, 16);
    }
    this.player.play('idle');


    // Add physics colliders for ground and building structural colliders
    this.physics.add.collider(this.player, groundBody);
    this.physics.add.collider(this.player, this.buildingGroup);

    // Register overlap listeners for interaction zones
    this.interactionZones.forEach(({ id, zone }) => {
      this.physics.add.overlap(this.player, zone, () => {
        this.activeBuildingId = id;
      });
    });

    // Interaction trigger function
    const triggerBuildingEnter = () => {
      if (this.activeBuildingId && !this.isPanelOpen) {
        this.isPanelOpen = true;
        this.promptText.setVisible(false);
        this.player.setVelocity(0, 0);
        this.player.anims.play('idle', true);
        EventBus.emit('building-entered', this.activeBuildingId);
      }
    };

    // Jump trigger function
    const triggerJump = () => {
      if (!this.player || !this.player.body || this.isPanelOpen) return;
      const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;
      if (isGrounded) {
        this.player.setVelocityY(-350);
        this.player.anims.play('jump', true);
      }
    };

    // Register input controls
    if (this.input.keyboard) {
      this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

      // Jump keys: Space, Up Arrow, W key
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

      this.keySpace.on('down', triggerJump);
      this.keyUp.on('down', triggerJump);
      this.keyW.on('down', triggerJump);

      // Register 'C' key for physics debug render toggle
      this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
      const toggleDebug = () => {
        const world = this.physics.world;
        world.drawDebug = !world.drawDebug;
        if (!world.drawDebug && world.debugGraphic) {
          world.debugGraphic.clear();
        }
      };
      this.keyC.on('down', toggleDebug);

      // Register E and Enter key for building interaction
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      this.keyE.on('down', triggerBuildingEnter);
      this.keyEnter.on('down', triggerBuildingEnter);
    }

    // Touch control EventBus listeners
    const onMoveLeftStart = () => { this.isTouchLeftDown = true; };
    const onMoveLeftStop = () => { this.isTouchLeftDown = false; };
    const onMoveRightStart = () => { this.isTouchRightDown = true; };
    const onMoveRightStop = () => { this.isTouchRightDown = false; };

    EventBus.on('move-left-start', onMoveLeftStart);
    EventBus.on('move-left-stop', onMoveLeftStop);
    EventBus.on('move-right-start', onMoveRightStart);
    EventBus.on('move-right-stop', onMoveRightStop);
    EventBus.on('interact-trigger', triggerBuildingEnter);
    EventBus.on('jump-trigger', triggerJump);

    // Listen for panel-closed event to resume player controls
    const onPanelClosed = () => {
      this.isPanelOpen = false;
      this.isTouchLeftDown = false;
      this.isTouchRightDown = false;
    };
    EventBus.on('panel-closed', onPanelClosed);

    this.events.once('shutdown', () => {
      EventBus.off('move-left-start', onMoveLeftStart);
      EventBus.off('move-left-stop', onMoveLeftStop);
      EventBus.off('move-right-start', onMoveRightStart);
      EventBus.off('move-right-stop', onMoveRightStop);
      EventBus.off('interact-trigger', triggerBuildingEnter);
      EventBus.off('jump-trigger', triggerJump);
      EventBus.off('panel-closed', onPanelClosed);
    });

    // Set camera to follow player on both X and Y axes smoothly
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

  }

  update() {
    if (!this.player || !this.player.body) return;

    // Reset active building detection every frame before physics overlap resolves
    let currentActiveZone: string | null = null;

    // Check overlaps manually or via body overlap test
    for (const { id, zone } of this.interactionZones) {
      if (this.physics.overlap(this.player, zone)) {
        currentActiveZone = id;
        break;
      }
    }
    this.activeBuildingId = currentActiveZone;

    // Control floating prompt UI above player head
    if (this.activeBuildingId && !this.isPanelOpen) {
      this.promptText.setPosition(this.player.x, this.player.y - 66);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    // Freeze player input if building panel is currently open
    if (this.isPanelOpen) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('idle', true);
      return;
    }

    const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;

    const isLeft = (this.keyLeft && this.keyLeft.isDown) || (this.keyA && this.keyA.isDown) || this.isTouchLeftDown;
    const isRight = (this.keyRight && this.keyRight.isDown) || (this.keyD && this.keyD.isDown) || this.isTouchRightDown;

    if (isLeft && !isRight) {
      this.player.setVelocityX(-120);
      this.player.setFlipX(true);
    } else if (isRight && !isLeft) {
      this.player.setVelocityX(120);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Animation state management: play jump when airborne, walk/idle when grounded
    if (!isGrounded) {
      this.player.anims.play('jump', true);
    } else {
      if (isLeft || isRight) {
        this.player.anims.play('walk', true);
      } else {
        this.player.anims.play('idle', true);
      }
    }
  }

  private createPlatform(x: number, topY: number, width: number, height: number = 16) {
    const platformTile = this.add.tileSprite(x, topY, width, height, 'ground');
    platformTile.setOrigin(0.5, 0);

    const platformBody = this.add.rectangle(x, topY + height / 2, width, height);
    platformBody.setVisible(false);
    this.physics.add.existing(platformBody, true);
    this.buildingGroup.add(platformBody);
  }

  private createPlatforms(groundY: number) {
    // 2-step staircase leading up to Skills (building at x = 1150, height ~60px above ground)
    this.createPlatform(1030, groundY - 30, 60, 30);
    this.createPlatform(1110, groundY - 60, 100, 60);

    // 3-step ascending jump-chain leading up to Projects (building at x = 1850, height ~120px above ground)
    this.createPlatform(1670, groundY - 40, 50, 16);
    this.createPlatform(1740, groundY - 80, 50, 16);
    this.createPlatform(1830, groundY - 120, 90, 16);

    // 2-step staircase leading down/up to Contact (building at x = 2550, height ~50px above ground)
    this.createPlatform(2450, groundY - 25, 60, 25);
    this.createPlatform(2530, groundY - 50, 90, 50);
  }
}

