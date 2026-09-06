import Phaser from 'phaser';

// Shared event bus for Phaser <-> React communication
export const EventBus = new Phaser.Events.EventEmitter();
