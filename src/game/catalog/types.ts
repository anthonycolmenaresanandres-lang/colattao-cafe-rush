// Game catalog — type contract.
//
// The catalog lets one café-in-a-box deployment swap which branded Phaser game
// is live (Colattao Rush, Penalty Shootout, future titles) WITHOUT rewriting the
// boot path. Each entry lazy-loads its own scenes so Phaser is only pulled into
// the bundle for the title actually being played.
//
// IMPORTANT: this module must stay Phaser-runtime-free at load time. The only
// Phaser reference here is `import type` (erased at compile), so importing the
// catalog metadata from server/theme code never pulls Phaser into a server bundle.

import type Phaser from "phaser";

/** Canonical catalog identifiers. Source of truth for the union used in theme.ts. */
export type GameId = "colattao-rush" | "penalty-shootout";

/** A Phaser Scene subclass constructed by Phaser.Game (no constructor args). */
export type SceneClass = new () => Phaser.Scene;

export interface CatalogGame {
  id: GameId;
  /** Human label for menus / dashboards. */
  label: string;
  /** One-line pitch shown in catalog UIs. */
  description: string;
  /** Lifecycle: live = wired & QA'd; beta = built, needs visual QA; coming-soon = stub. */
  status: "live" | "beta" | "coming-soon";
  /**
   * Lazy scene loader. Returns the ordered scene list to hand to Phaser.Game's
   * `scene` array. Dynamic imports keep each title's code out of other bundles.
   */
  loadScenes: () => Promise<SceneClass[]>;
}
