import Phaser from "phaser";

/**
 * Boot scene for Colattao Penalty Rush. Preloads the branded art set
 * (crowd backdrop, keeper, ball, kicker, logo). Every asset is optional:
 * PenaltyScene checks `textures.exists()` and falls back to the original
 * primitive-drawn look for anything that failed to load.
 */

export const PENALTY_ASSETS = {
  bg: { key: "penalty-bg", url: "/assets/colattao/penalty/background-crowd-signs-v1.webp" },
  bgWinner: {
    key: "penalty-bg-winner",
    url: "/assets/colattao/penalty/background-cafe-stadium-winner-v1.webp",
  },
  keeper: { key: "penalty-keeper", url: "/assets/colattao/penalty/keeper-colattao-v1.webp" },
  ball: { key: "penalty-ball", url: "/assets/colattao/penalty/ball-colattao-v1.webp" },
  kicker: { key: "penalty-kicker", url: "/assets/colattao/penalty/kicker-colattao-v1.webp" },
  logo: { key: "penalty-logo", url: "/assets/colattao/penalty/logo.png" },
} as const;

export class PenaltyBootScene extends Phaser.Scene {
  constructor() {
    super("PenaltyBootScene");
  }

  preload() {
    // Individual load failures are non-fatal; the texture simply won't exist.
    this.load.on("loaderror", (file: { key?: string }) => {
      console.warn(`[penalty] asset failed to load: ${file?.key ?? "unknown"}`);
    });
    for (const asset of Object.values(PENALTY_ASSETS)) {
      this.load.image(asset.key, asset.url);
    }
  }

  create() {
    this.scene.start("PenaltyScene");
  }
}
