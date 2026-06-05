import Phaser from "phaser";

/**
 * Boot scene for the Penalty Shootout title. No external assets to preload;
 * everything is drawn with Phaser primitives, so this just hands off to play.
 */
export class PenaltyBootScene extends Phaser.Scene {
  constructor() {
    super("PenaltyBootScene");
  }

  create() {
    this.scene.start("PenaltyScene");
  }
}
