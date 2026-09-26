import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { BUILDING_CONFIGS, BUILDING_ELEVATIONS, BUILDING_POSITIONS, getSpawnX, getSpawnY } from '../buildingPositions';

export class WorldScene extends Phaser.Scene {
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
    const worldWidth = 6500;
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

    // Main Ground 9-slice tiles
    const tileSize = 18;
    this.add.image(0, groundY, 'tile_0021').setOrigin(0, 0);
    this.add.tileSprite(tileSize, groundY, worldWidth - tileSize * 2, tileSize, 'tile_0022').setOrigin(0, 0);
    this.add.image(worldWidth - tileSize, groundY, 'tile_0023').setOrigin(0, 0);

    // All rows beneath top row (pure fill down past viewport - extended height to prevent bottom black void)
    this.add.tileSprite(0, groundY + tileSize, worldWidth, 2000, 'tile_0122').setOrigin(0, 0);

    // Scatter trees and decorative props on open ground
    this.createScatteredProps(groundY);

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
    const leftX = x - width / 2;
    const tileSize = 18;

    if (width <= tileSize) {
      // 1-tile wide platform
      this.add.image(leftX, topY, 'tile_0020').setOrigin(0, 0);
      if (height > tileSize * 2) {
        this.add.tileSprite(leftX, topY + tileSize, tileSize, height - tileSize * 2, 'tile_0120').setOrigin(0, 0);
        this.add.image(leftX, topY + height - tileSize, 'tile_0141').setOrigin(0, 0);
      } else if (height > tileSize) {
        this.add.image(leftX, topY + height - tileSize, 'tile_0141').setOrigin(0, 0);
      }
    } else {
      // 2+ tiles wide platform
      const midWidth = width - tileSize * 2;

      // Top row: tile_0021 (leftmost) -> tile_0022 (repeated middle) -> tile_0023 (rightmost)
      this.add.image(leftX, topY, 'tile_0021').setOrigin(0, 0);
      if (midWidth > 0) {
        this.add.tileSprite(leftX + tileSize, topY, midWidth, tileSize, 'tile_0022').setOrigin(0, 0);
      }
      this.add.image(leftX + width - tileSize, topY, 'tile_0023').setOrigin(0, 0);

      if (height > tileSize * 2) {
        const bodyHeight = height - tileSize * 2;
        const bodyY = topY + tileSize;
        const bottomY = topY + height - tileSize;

        // Body rows: tile_0121 (leftmost) -> tile_0122 (repeated middle) -> tile_0123 (rightmost)
        this.add.tileSprite(leftX, bodyY, tileSize, bodyHeight, 'tile_0121').setOrigin(0, 0);
        if (midWidth > 0) {
          this.add.tileSprite(leftX + tileSize, bodyY, midWidth, bodyHeight, 'tile_0122').setOrigin(0, 0);
        }
        this.add.tileSprite(leftX + width - tileSize, bodyY, tileSize, bodyHeight, 'tile_0123').setOrigin(0, 0);

        // Bottom row: tile_0141 (leftmost) -> tile_0142 (repeated middle) -> tile_0143 (rightmost)
        this.add.image(leftX, bottomY, 'tile_0141').setOrigin(0, 0);
        if (midWidth > 0) {
          this.add.tileSprite(leftX + tileSize, bottomY, midWidth, tileSize, 'tile_0142').setOrigin(0, 0);
        }
        this.add.image(leftX + width - tileSize, bottomY, 'tile_0143').setOrigin(0, 0);
      } else if (height > tileSize) {
        // Platform between 18px and 36px high: Top row + Bottom row
        const bottomY = topY + height - tileSize;
        this.add.image(leftX, bottomY, 'tile_0141').setOrigin(0, 0);
        if (midWidth > 0) {
          this.add.tileSprite(leftX + tileSize, bottomY, midWidth, tileSize, 'tile_0142').setOrigin(0, 0);
        }
        this.add.image(leftX + width - tileSize, bottomY, 'tile_0143').setOrigin(0, 0);
      }
    }

    const platformBody = this.add.rectangle(x, topY + height / 2, width, height);
    platformBody.setVisible(false);
    this.physics.add.existing(platformBody, true);
    this.buildingGroup.add(platformBody);
  }

  private createPlatforms(groundY: number) {
    const skillsX = BUILDING_POSITIONS.skills || 2300;
    const projectsX = BUILDING_POSITIONS.projects || 3900;
    const contactX = BUILDING_POSITIONS.contact || 5500;

    // 2-step staircase leading up to Skills
    this.createPlatform(skillsX - 120, groundY - 30, 60, 30);
    this.createPlatform(skillsX - 40, groundY - 60, 100, 60);

    // 3-step ascending jump-chain leading up to Projects
    this.createPlatform(projectsX - 180, groundY - 40, 50, 16);
    this.createPlatform(projectsX - 110, groundY - 80, 50, 16);
    this.createPlatform(projectsX - 20, groundY - 120, 90, 16);

    // 2-step staircase leading down/up to Contact
    this.createPlatform(contactX - 100, groundY - 25, 60, 25);
    this.createPlatform(contactX - 20, groundY - 50, 90, 50);
  }

  private createTree(x: number, groundY: number, trunkTilesCount: number = 3) {
    const tileSize = 18;
    const baseTrunkY = groundY - tileSize;

    // Stack 2-3 trunk tiles vertically (zero collision)
    this.add.image(x, baseTrunkY, 'tile_0137').setOrigin(0.5, 0);
    this.add.image(x, baseTrunkY - tileSize, 'tile_0117').setOrigin(0.5, 0);

    if (trunkTilesCount >= 3) {
      this.add.image(x, baseTrunkY - tileSize * 2, 'tile_0118').setOrigin(0.5, 0);
    }

    const topTrunkY = baseTrunkY - tileSize * (trunkTilesCount - 1);

    // Top canopy cluster (mixed tiles for fuller, rounded shape)
    // Row 1 (top of canopy)
    this.add.image(x - 9, topTrunkY - 36, 'tile_0008').setOrigin(0.5, 0);
    this.add.image(x + 9, topTrunkY - 36, 'tile_0009').setOrigin(0.5, 0);

    // Row 2 (middle of canopy)
    this.add.image(x - 18, topTrunkY - 18, 'tile_0017').setOrigin(0.5, 0);
    this.add.image(x, topTrunkY - 18, 'tile_0018').setOrigin(0.5, 0);
    this.add.image(x + 18, topTrunkY - 18, 'tile_0019').setOrigin(0.5, 0);

    // Row 3 (lower canopy)
    this.add.image(x - 18, topTrunkY, 'tile_0037').setOrigin(0.5, 0);
    this.add.image(x, topTrunkY, 'tile_0038').setOrigin(0.5, 0);
    this.add.image(x + 18, topTrunkY, 'tile_0039').setOrigin(0.5, 0);
  }

  private createScatteredProps(groundY: number) {
    // Large Trees placed in open ground zones across 6500px world
    const treePositions = [350, 1180, 1750, 2750, 3320, 4350, 4920, 5950];
    treePositions.forEach((x) => this.createTree(x, groundY, 3));

    // Bushes (tile_0096 - tile_0099)
    const bushes = [
      { x: 220, key: 'tile_0096' },
      { x: 980, key: 'tile_0097' },
      { x: 1450, key: 'tile_0098' },
      { x: 1880, key: 'tile_0099' },
      { x: 2550, key: 'tile_0096' },
      { x: 3020, key: 'tile_0097' },
      { x: 3480, key: 'tile_0098' },
      { x: 4150, key: 'tile_0099' },
      { x: 4620, key: 'tile_0096' },
      { x: 5080, key: 'tile_0097' },
      { x: 5750, key: 'tile_0098' },
      { x: 6200, key: 'tile_0099' }
    ];
    bushes.forEach((b) => {
      this.add.image(b.x, groundY, b.key).setOrigin(0.5, 1);
    });

    // Grass tufts (tile_0124, tile_0125)
    const grassTufts = [
      { x: 120, key: 'tile_0124' },
      { x: 440, key: 'tile_0125' },
      { x: 920, key: 'tile_0124' },
      { x: 1280, key: 'tile_0125' },
      { x: 1540, key: 'tile_0124' },
      { x: 1960, key: 'tile_0125' },
      { x: 2490, key: 'tile_0124' },
      { x: 2850, key: 'tile_0125' },
      { x: 3110, key: 'tile_0124' },
      { x: 3550, key: 'tile_0125' },
      { x: 4090, key: 'tile_0124' },
      { x: 4450, key: 'tile_0125' },
      { x: 4710, key: 'tile_0124' },
      { x: 5150, key: 'tile_0125' },
      { x: 5680, key: 'tile_0124' },
      { x: 6080, key: 'tile_0125' }
    ];
    grassTufts.forEach((g) => {
      this.add.image(g.x, groundY, g.key).setOrigin(0.5, 1);
    });

    // Rocks (tile_0068, tile_0069)
    const rocks = [
      { x: 270, key: 'tile_0068' },
      { x: 1100, key: 'tile_0069' },
      { x: 1620, key: 'tile_0068' },
      { x: 2660, key: 'tile_0069' },
      { x: 3180, key: 'tile_0068' },
      { x: 4260, key: 'tile_0069' },
      { x: 4780, key: 'tile_0068' },
      { x: 5850, key: 'tile_0069' },
      { x: 6300, key: 'tile_0068' }
    ];
    rocks.forEach((r) => {
      this.add.image(r.x, groundY, r.key).setOrigin(0.5, 1);
    });

    // Fence segment (tile_0105)
    this.add.image(1350, groundY, 'tile_0105').setOrigin(0.5, 1);

    // Wooden signs (tile_0084 - tile_0089)
    const signs = [
      { x: 520, key: 'tile_0087' },
      { x: 2050, key: 'tile_0085' },
      { x: 3620, key: 'tile_0084' },
      { x: 5300, key: 'tile_0086' }
    ];
    signs.forEach((s) => {
      this.add.image(s.x, groundY, s.key).setOrigin(0.5, 1);
    });
  }
}

