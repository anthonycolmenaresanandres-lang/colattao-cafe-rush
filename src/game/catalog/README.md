# Game Catalog

Lets one café-in-a-box deployment choose which branded Phaser title is live,
without rewriting the boot path. Each title lazy-loads its own scenes, so a
tenant only ships the Phaser code for the game it actually runs.

## Files
- `types.ts` — `GameId`, `CatalogGame`, `SceneClass` contract. Phaser-runtime-free
  (type-only import), so importing catalog metadata never pulls Phaser server-side.
- `index.ts` — `GAME_CATALOG` registry + `getCatalogGame(id)`.
- `penalty-shootout/` — first new title (status: **beta**, asset-free, needs visual QA).

## Selecting a title
`src/config/theme.ts` → `game.gameId` (`"colattao-rush"` | `"penalty-shootout"`).
Defaults to `colattao-rush` when omitted.

## Wiring (ONE protected edit — needs Anthony's explicit OK)
The only thing left to make the catalog drive the live game is to have
`src/components/GameCanvas.tsx` (PROTECTED) load scenes from the catalog instead
of hardcoding `[BootScene, DemoScene]`. Minimal change:

```diff
- const { BootScene } = await import("@/game/scenes/BootScene");
- const { DemoScene } = await import("@/game/scenes/DemoScene");
+ const { getCatalogGame } = await import("@/game/catalog");
+ const appTheme = (await import("@/config/theme")).default;
+ const scenes = await getCatalogGame(appTheme.game.gameId).loadScenes();
  ...
- scene: [BootScene, DemoScene],
+ scene: scenes,
```

This preserves current behavior exactly when `gameId` is `colattao-rush` (the
catalog returns `[BootScene, DemoScene]`). Switching `gameId` to
`penalty-shootout` then boots the new title. Until this edit is made, the catalog
is inert — it ships but changes nothing at runtime.

## Adding a new title
1. Add `src/game/catalog/<title>/` with a Boot scene + a play Scene.
2. Append an entry to `GAME_CATALOG` with a lazy `loadScenes()`.
3. Add its id to the `GameId` union (`types.ts`) and the `theme.ts` union.
4. Set `theme.game.gameId` to play it; QA on a real screen; flip status to `live`.
