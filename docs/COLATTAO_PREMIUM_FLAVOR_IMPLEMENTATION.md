# Premium Colattao flavor collection — implementation

## Final direction
A product-focused landing page replaces the four small canvas thumbnails with one large drink portrait, the full menu name/ingredients and four accessible flavor choices. Original Colattao logo and Playfair/Inter type remain. The presentation uses espresso, parchment, ceramic blue and restrained gold with open spacing. Desktop pairs drink/copy; phones have a large portrait, natural scrolling and a persistent Play/menu bar.

The implementation follows the refined plan in COLATTAO_PREMIUM_FLAVOR_PLAN.md. Anthony approved execution on September15,2026. This revision is prepared for preview; production requires approval of the completed result.

## Source scope and behavior
- src/app/page.tsx is now a server page with collection-specific metadata; src/components/FallExperience.tsx owns the landing/game transition and existing win/replay event contract.
- FallCollection.tsx and its CSS module isolate the new design. Actual names and descriptions come from the fall menu category; prices, dietary claims and popularity claims were not added. Native radios support keyboard flavor selection; selected flavor and Play focus are restored when leaving the game.
- Phaser mounts only after Play. The root route and menu URLs stay unchanged. The game starts directly without a duplicate introduction. GameCanvas has a30second initialization watchdog, cleanup and an explicit Reload page recovery action. Testing showed a failed dynamic module remained cached after in-place retry, so recovery intentionally reloads the page instead.
- Existing level targets/timers, scoring, reward data and menu data remain unchanged. Presentation-only direct-start registry flag defaults off, retaining the old scene introduction for any host that does not opt in.
- Falling drinks use clamp(canvasWidth*0.39,136,160) pixels; bad items use94% of that size. Active items rescale and reflow on resize; input geometry follows the container transform. Margins account for rotation. No spawn-rate, odds or speed change. Larger hit areas change practical difficulty; do not claim identical difficulty.

## Artwork provenance and delivery
All art is reused from accepted promotional generated sources, not owner product photography. No new generation or fabricated logo.

Collection WebP files are960x960 with alpha, produced by alpha trim, resize/pad and quality86 WebP encoding with Sharp. Source originals are preserved. Next Image handles responsive delivery; only the featured drink is mounted. Each file lives under public/assets/colattao/collection/.

| Asset | Accepted source under C:/Users/antho/.codex/generated_images/ | Bytes |
| --- | --- | ---: |
| pumpkin-pie.webp | 01a0a626-d4af-7c82-91ba-41dcd884ebaf/exec-e980eb42-cff7-4cf7-b5a5-6347d3e996e3.png | 161308 |
| caramel-apple.webp | 01a0a552-22f1-7e52-9345-ccdda3046e75/exec-ce5c0fac-3e9e-4915-9e05-db7dafb46161.png | 184194 |
| campfire.webp | 01a0a626-d4af-7c82-91ba-41dcd884ebaf/exec-35bd186f-a8ba-4b62-801d-d8216b789b34.png | 228562 |
| maple-pecan.webp | 01a0a552-22f1-7e52-9345-ccdda3046e75/exec-49c1a00b-0384-48d5-8222-c2db3e1c21d7.png | 226186 |
| colattao-wordmark.webp | public/assets/colattao/logo/colattao-logo.png, empty alpha margins trimmed only | 26256 |

Game sprites retain their existing asset files. Accepted original prompts and source provenance remain in COLATTAO_FALL_RUSH.md and COLATTAO_OWNER_FALL.md.

## Verification before production-build review
- Targeted ESLint clean. Existing browser harness adapted to direct play passed four sizes/textures, all three levels/600points, scoring, timeout, bad tap, completion/replay, pause/resume, primitive fallback and scene cleanup at320px,390px and desktop.
- All four flavor names/artworks load; hero is328px at390px viewport,268px at320px; no horizontal overflow and phone action remains visible.
- Native keyboard selection and return-to-flavors selection/focus/canvas removal passed.
- Third-level presentation inspected on320px. Existing spawn settings retained.
- Reduced-motion disables the landing reveal. Forced missing hero preserves flavor text and Play; all game art/background blocked still yields tappable primitive cup and10points.
- Forced scene-chunk failure shows recovery UI; unblocking and Reload page followed by Play works.
- Final production build, fresh-server native pointer/resize checks and preview state are recorded in HANDOFF.md. Physical Safari/Android hardware remains unverified.

## Final verification
- Production build and TypeScript passed after the final focus/metadata edits; targeted ESLint and diff checks passed.
- Fresh production bundle confirms the full branded document title and no canvas before Play. Native keyboard focus scrolls a covered flavor above the phone action bar; ArrowRight selects Caramel Apple and updates its full name.
- Full production gameplay harness passed at 390px: four 148.98px drink textures, all three levels and 600 cumulative points, bad taps, timeout, replay, fallback, pause/resume and restart cleanup. No gameplay source changed afterward.
- Native pointer at the larger edge scored exactly 10. Active item and hit-area sizes remained equal on resize: 136px at 320px and 160px at 430px, with no horizontal overflow.
- All four menu-derived names and hero images loaded. Returning removed the canvas and restored Play focus; fall-menu destination remains /menu#fall-drinks.
- Visual evidence: ../premium-final-390.png, ../premium-final-desktop.png, ../premium-final-mobile-flavors.png. ../premium-final-game-390.png holds four drink positions for a size comparison; it does not represent natural spawn timing.
- Browser error list was empty. Physical mobile Safari/Android testing remains unverified.
