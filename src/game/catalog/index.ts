// Game catalog — registry.
//
// Add a new branded title by appending an entry here with a lazy `loadScenes`.
// Nothing else in the app needs to change except the (protected) GameCanvas boot,
// which will read `getCatalogGame(theme.game.gameId).loadScenes()` once wired.
//
// See src/game/catalog/README.md for the wiring step.

import type { CatalogGame, GameId } from "./types";

export const GAME_CATALOG: Record<GameId, CatalogGame> = {
  "colattao-rush": {
    id: "colattao-rush",
    label: "Colattao Rush",
    description: "Catch the drinks & treats, dodge the chain coffee.",
    status: "live",
    loadScenes: async () => {
      const { BootScene } = await import("@/game/scenes/BootScene");
      const { DemoScene } = await import("@/game/scenes/DemoScene");
      return [BootScene, DemoScene];
    },
  },
  "penalty-shootout": {
    id: "penalty-shootout",
    label: "Colattao Penalty Shootout",
    description: "World Cup penalty kicks — pick your corner, beat the keeper.",
    status: "beta", // built, asset-free (primitive-drawn); needs visual QA before going live
    loadScenes: async () => {
      const { PenaltyBootScene } = await import(
        "@/game/catalog/penalty-shootout/PenaltyBootScene"
      );
      const { PenaltyScene } = await import(
        "@/game/catalog/penalty-shootout/PenaltyScene"
      );
      return [PenaltyBootScene, PenaltyScene];
    },
  },
};

const DEFAULT_GAME: GameId = "colattao-rush";

/** Resolve a catalog entry, falling back to the live default for unknown ids. */
export function getCatalogGame(id?: string): CatalogGame {
  if (id && id in GAME_CATALOG) {
    return GAME_CATALOG[id as GameId];
  }
  return GAME_CATALOG[DEFAULT_GAME];
}

export type { CatalogGame, GameId } from "./types";
