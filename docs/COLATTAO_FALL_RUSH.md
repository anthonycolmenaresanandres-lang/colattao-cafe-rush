# Colattao Fall Rush

## Scope

Anthony approved the researched four-drink tap-to-collect replacement on September 15, 2026. This release changes the game presentation, collectible loading/sizing, scene lifecycle, responsive layout, and the menu's game-link label. Routes and the existing win/replay event contract remain intact. Level configuration is byte-equivalent to production after newline normalization: targets 120/180/300; durations 20/25/30 seconds; +10 per good tap; bad tap loses the round.

The existing completion card and dormant reward configuration are unchanged. No new discount or redemption promise is introduced.

## Implementation

- `src/config/theme.ts`: Fall Rush title, readable instructions, four paths and labels, fall background.
- `src/game/scenes/DemoScene.ts`: one configured list drives preload and selection; all four drinks load independently. Images retain aspect ratio and animation uses their base scale. Sized-container hit areas account for Phaser's display-origin offset. Primitive labeled cups remain playable after load failure.
- The start screen draws the four drinks and uses the installed Playfair/Inter font families. Background, HUD, and overlays rebuild on resize without resetting the round. Active items retain normalized fall progress and update their positions for current dimensions.
- Collectible destruction cancels both its movement and decorative tweens. Level completion clears remaining items. Resize/media/action listeners are removed on shutdown.
- `src/components/GameCanvas.tsx` and `src/game/events/fallUi.ts`: loading status, keyboard activation of screen actions, pause/resume, hidden-tab suspension, resize observation and cleanup. Optional wobble honors reduced motion. Essential downward gameplay remains.
- `src/app/page.tsx`: four-drink promo in reserved layout space. `src/app/menu/page.tsx`: game button now names Colattao Fall Rush.

## Artwork and provenance

Art direction comes from the already-supplied owner poster at `public/assets/colattao/menu/autumn/owner-fall-menu.webp`: dark board, copper foliage and blue-and-white ceramics. Existing drink imagery is promotional generated artwork, as documented in `COLATTAO_OWNER_FALL.md`, not owner-supplied product photography.

Built-in image generation was used for the new background, Pumpkin extraction and replacement Campfire cutout. No API/CLI image-generation fallback was used. Original menu files and generated sources are preserved. Sharp only resized, padded and encoded accepted outputs for delivery.

| Delivered file under `public/assets/colattao/` | Dimensions | Bytes | Source |
| --- | --- | ---: | --- |
| `game/fall/pumpkin-pie.webp` | 256 × 256, alpha | 20,792 | Extraction from existing Pumpkin menu image; `exec-e980eb42-cff7-4cf7-b5a5-6347d3e996e3.png` |
| `game/fall/caramel-apple.webp` | 256 × 256, alpha | 20,834 | Existing `menu/autumn/caramel-apple.webp` |
| `game/fall/campfire.webp` | 256 × 256, alpha | 26,906 | Fresh transparent variant; `exec-35bd186f-a8ba-4b62-801d-d8216b789b34.png` |
| `game/fall/maple-pecan.webp` | 256 × 256, alpha | 24,878 | Existing `menu/autumn/maple-pecan.webp` |
| `backgrounds/colattao-bg-fall.webp` | 941 × 1672 | 182,022 | `exec-80104df6-71ca-4460-82fc-cbe0be6414ac.png` |

Generated sources are under `C:/Users/antho/.codex/generated_images/01a0a626-d4af-7c82-91ba-41dcd884ebaf/`. The four sprites total 93,410 bytes. The background is 95.1% smaller than the previous 3,704,549-byte summer PNG. This compares asset sizes, not measured site loading speed. Decoded RGBA memory is approximately 1 MiB for four drink textures and 6 MiB for the background.

Two Campfire extraction attempts contained baked checkerboards and were rejected. The final source and all four delivered sprites have actual alpha channels; fallback and normal paths were visually inspected.

### Final built-in prompts

**Pumpkin extraction** — input: `menu/autumn/pumpkin-pie.webp` as edit target.

> Use case: background-extraction. Edit target: supplied pumpkin latte product image. Remove ONLY the solid black background and produce a genuinely TRANSPARENT alpha background. Preserve the same blue-and-white floral ceramic mug, pumpkin, cinnamon stick, foam, lighting, and perspective. Keep dark blue handle and shadows belonging to the objects intact. Clean isolated product cutout, no black rectangle, no checkerboard painted into RGB, no white outline, no text or new objects. Entire object group inside frame with small breathing space. This is a premium mobile game collectible, viewed at 70px, maintain a bold clear silhouette.

**Campfire sprite** — new generation after rejected extractions.

> Create a single transparent-background PNG game sprite: one blue-and-white floral porcelain cappuccino cup on a matching saucer, filled with foamy coffee and cocoa dusting. One toasted marshmallow on a thin skewer across the rim, a small piece of dark chocolate and one white marshmallow beside the cup. Realistic premium food photograph style, three-quarter front view. Entire cup and saucer fully visible, centered with 8 percent margin. The output must have a genuine transparent alpha channel around the object and inside the handle. Isolated cutout with empty invisible surroundings. No backdrop, no black background, no white background, no tabletop, no gray checkerboard, no pattern outside the ceramic, no text, no logo. Actual alpha transparency is essential, not a visual drawing of transparency. This is one small collectible for an autumn coffee game.

**Background** — new generation from the approved art direction.

> Use case: stylized-concept. Asset: premium autumn cafe mobile game background, portrait 941:1672 aspect ratio. Create a beautifully textured dark charcoal espresso chalkboard with an exceptionally restrained autumn still-life frame. The center MUST remain very dark, calm, low contrast, mostly empty, for falling game objects. All decorative props hug the extreme perimeter: small copper and russet maple/oak leaves at top left and top right; a subtle thin antique copper hand-drawn rectangular rim; one small pumpkin and cinnamon cluster very low bottom left; one tiny red apple and pecan cluster very low bottom right; restrained delicate faded cobalt-blue botanical chalk flourishes at outer edges inspired by blue-and-white ceramic cafe cups. Warm amber sidelight, tactile photographic leaf and ingredient detail, sophisticated autumn coffee house mood, cream and copper highlights only at edges. Top center clear for logo and score. Overall 85 percent calm dark board; do not put large foreground drinks or food in center; no objects in central x24%-77% and y6%-87%; even outer areas should be low contrast where game objects fall. NO text, NO letters, NO logos, NO cups, NO people, NO Halloween, NO emoji, NO icons, NO glitter, NO full-screen leaf storm. Premium editorial food styling mixed with subtle vintage chalkboard finish, not flat generic cartoon. Entire border visible inside frame.

## Verification

Targeted ESLint: zero warnings/errors. Production build and TypeScript passed.

`scripts/verify-fall-game.js` runs through `agent-browser eval --stdin` against a local server. It locates the mounted game through React's browser-only component references; it adds no application test hook and refuses non-local hostnames. It verifies four distinct items, actual scaled dimensions during motion, 360px-source sizing, hit-area bounds, fallback art, +10 scoring, all three targets/timers, 600-point cumulative completion, real completion-card replay, bad-tap loss, timeout, pause/resume and restart cleanup.

Additional browser checks:

- Native browser pointer tap on the visible drink center adds exactly +10. This caught and corrected the container hit-area offset that direct scoring tests would not catch.
- Resize from 390 × 844 to 320 × 568 retained score 10 and time 20. Small-phone and 430px screens fit without horizontal overflow or truncated promo title.
- Reduced-motion mode disables collectible sway/scale animation while downward travel continues.
- Switching to another real browser tab for 82,948 ms preserved time 20; returning resumed the scene.
- Blocking all four image URLs and the background still produces readable primitive cups and working +10 scoring.
- Menu has all four exact drink names, valid section anchors, the updated game link, and no game canvas after navigation.
- The complete gameplay verification also passed against the local production bundle.
- At 844 × 390, a 560px minimum page height preserves the controls and permits normal page scrolling. This corrected overlapping content in the first landscape review; the canvas remains 365px tall in that case.
- A 3.5-second level-three requestAnimationFrame sample at 390 × 844 recorded 195 frames, 18.0ms median and 18.1ms p95 with up to six active items. The live summer game in the same headless Chromium environment recorded 189 frames with the same median/p95. This short sample shows no observed regression; it is not a device benchmark or a 60fps guarantee.

Screenshots are in the parent task workspace: `fall-start-320.png`, `fall-start-430.png`, `fall-gameplay-390.png`, `fall-fallback.png`, `fall-production-390.png`. Physical iPhone/Safari and Android hardware have not been tested. Moving-target gameplay is not claimed to be fully screen-reader accessible; keyboard activation covers the screen actions.

## Release and rollback

The feature branch is `codex/colattao-fall-rush`, starting from production `5c5f156edf55444d3267ec2c9af04619e3a2b3a8`. Git integration creates a Vercel preview when pushed. Record the exact preview commit and checks in the handoff before requesting Anthony's approval to merge to main.

Preserve deployment protection. Authorized preview inspection uses Vercel CLI; do not disable protection or print bypass secrets. Production has not been changed by the implementation phase.

For an approved release, recheck production first, record its deployment, merge only the reviewed PR head, and verify the public alias. If rollback is required, restore the previous approved deployment or revert the scoped release, covering scene code and asset configuration together. Summer assets are retained.
