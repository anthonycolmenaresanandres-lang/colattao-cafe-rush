# Colattao autumn menu

## Source and edit boundary

- Base: `colattao-cafe-rush` main `d2dbac4`; branch `codex/colattao-autumn-menu`.
- The live customer menu belongs to this repository's `src/app/menu/page.tsx`, not AMMA's held `/m/[id]`.
- `ColattaoButterflyLogoMotion.tsx` and its CSS module implement the former canvas logo/menu morph. They are no longer imported by `/menu`; the R&D motion route can still use them.
- `page.tsx` owns category/item markup, navigation, item details, menu JSON-LD, metadata, guest-note mount and footer. `MenuCategory.tsx` is not used by this route.
- `src/data/colattaoMenu.ts` supplies every category and item. The existing `seasonal-drinks` group and Matcha Lemonade details are retained. Four fall drinks are added as the first `fall-drinks` group.
- `ChurroAffogatoBanner.tsx` is preserved and now appears beside Tea & More. The old Matcha `SeasonalFeatureBanner.tsx` does not exist on the current main baseline.

## Design

The single visual signature is the asymmetric pile on the first menu card's rim.
The compact chalkboard promo uses the existing Colattao logo, Playfair display
type and Inter utility type. Palette: chalk #f5e9d0, green board #182522,
copper #c78b53, ceramic blue #87adbc and ink #34241b.
Pumpkin, apple, cinnamon and twig line art is static, decorative and outside copy.
The banner uses live text for readability rather than embedding the reference poster.

## Components

- `FallPromo.tsx`: server-rendered brand treatment and native `#fall-drinks` anchor.
- `HarvestAccents.tsx`: small static inline SVG, hidden from assistive technology.
- `AutumnAtmosphere.tsx`: the only new client boundary. Ten deterministic positioners:
  four anchor leaves, three loose leaves, three edge leaves. Includes a 44px pause control.
- `MotionController.ts`: passive scroll/wheel/touch listeners, input-gated wind, one
  requestAnimationFrame loop that sleeps when calm, and observer/visibility cleanup.
- `leafMotion.ts`: pure descent, rocking, resize handoff and corner-placement curves.
- `FallingLeafLayer.tsx`: body portal with twelve reusable slots, outside card clipping.
- `autumn.module.css`: scoped autumn styling, including route-scoped reduced-motion scrolling.

## Motion contract

Anchor leaves remain static. Loose leaves rustle and stay attached. Only edge leaves
release. Native scroll velocity is filtered over 120ms and wind decays over 200ms.
Filtered wind above 1.05 can release one leaf; above 2.1 can add a second after
190ms. Normal releases have a 1150ms cooldown. Two airborne leaves is the hard limit.
Category-link navigation does not supply wind; native inertia remains eligible.

An exact visual handoff copies the source's artwork, size, transform origin and
current pose into one viewport slot, hiding the original in the same frame.
That slot retains its identity through `loosen -> falling -> settling -> landed`.
Release takes 280ms, descent scales with actual distance (usually 4–6 seconds),
and settling takes 420ms. Vertical travel is monotonic; drift and rocking use
continuous curves with matched endpoint velocities. No mid-flight opacity fade.

The corner pile starts empty. It retains up to five arrivals per side, ten total,
mostly cropped below the screen edge. When a side is full, its new leaves travel
completely below the viewport, including their rotated bounds, before being retired.
Twelve slots bound memory: ten landed plus two airborne. Vacated rim positions
refill with new identities only while fully offscreen and after all flights finish.
Landed leaves are never taken back. Reverse scrolling never rewinds a flight.

Only transforms change per frame. Decorative layers cannot receive pointer events.
Hidden tabs and manual pause freeze active time. Focusing an editable control hides
the viewport decoration and suspends flight until focus clears, keeping the guest
note/keyboard area clear. Reduced motion leaves static foliage and retires flights.
An offscreen rim stops rustling; flights continue to their destination. Resizing
rebases the remaining path from its current pose/velocity. If the new floor is
above a leaf, it continues downward offscreen. Landed leaves remain bottom-pinned.
Listeners, observer, portal and frame loop are cleaned up on unmount.

## Asset replacement and removal

The supplied image sheet is **not used**. Anthony clarified that magenta was intended
as a removable source background, never the leaf color. The placeholder SVG was
removed and replaced with two realistic individual photographic cutouts:
`public/assets/colattao/menu/autumn/maple-copper.webp` and
`public/assets/colattao/menu/autumn/oak-russet.webp`.
Both are 160x192 transparent WebP files, generated with actual alpha so no
chroma-key background needs to reach the browser. Together they total 25,990 bytes.
Change `LEAF_ASSETS` in `AutumnAtmosphere.tsx` to replace them; preserve the tip-up,
stem-down orientation and aspect ratio. The controller does not depend on the artwork.
No particle, physics or animation package was added.

### Artwork provenance

Generated with the built-in imagegen tool, then resized and encoded to WebP with
Sharp, preserving alpha. Original output filenames:
`exec-6fab68a7-138d-4252-ad84-db24a6ab4642.png` (maple) and
`exec-ca385292-df7d-4834-977f-66d7bac92b71.png` (oak).
Both were verified to contain transparent pixels and zero visible magenta pixels.

Maple generation prompt:

> Use case: product-mockup. Production web asset: one photorealistic fallen sugar maple leaf cutout for a premium autumn café menu, NOT a picture of a website. A single beautiful naturally asymmetric maple leaf, warm burnt-orange copper with russet tips, amber veins, intricate small serrations and authentic tiny weathered imperfections, subtly curled edges and dimensional dry papery texture. Top-down macro botanical product photography, soft neutral light revealing fine veins; realistic, tactile, understated. Entire leaf and short slender stem fully visible, tip pointing up, stem down; roughly 80:96 silhouette ratio, centered, tight framing with just 5% transparent breathing room. Genuine transparent alpha background; no floor, no scenery, no cast shadow, no text, no border, no extra objects. Important correction: magenta was intended ONLY as a removable chroma-key BACKGROUND, never as the leaf color. Output the leaf already extracted on true transparent alpha so it blends directly into our web menu with zero magenta fringe. Real copper/orange natural leaf colors only. Single individual leaf, not an image sheet, not illustration, not vector, not an icon, no artificial gloss.

Oak generation prompt:

> Production web cutout: ONE photorealistic fallen red oak leaf, warm muted russet and reddish chestnut with ochre highlights and golden fine veins. Top-down macro botanical photography, natural dry papery texture, irregular rounded/slightly pointed lobes, subtle curled edges and authentic imperfections. Fully visible single leaf, tip up and short slender stem down; broad leaf silhouette about 4:5, centered, 5% margin. Soft neutral natural lighting, no cast shadow. Genuine transparent alpha background so the asset blends into a café web menu. Important: magenta means ONLY a removable chroma-key BACKGROUND, not the leaf color; output the final cutout already on transparent alpha, zero magenta fringe. No text, watermark, frame, scenery, hand, floor or other leaf. Realistic photography, not vector/icon/illustration. Independent individual asset, not an image sheet.

To remove motion only, remove the `AutumnAtmosphere` import and mount; all menu
content and the promo continue to render on the server. To reverse the autumn
presentation, remove the fall group, restore the previous page promo/morph mounts
from this branch's base, and remove the autumn imports/wrappers. Do not touch game,
reward, note, auth, API, payments or backend files.

## Original release verification

Initial placeholder-art preview (superseded by the realistic foliage correction): https://colattao-cafe-rush-cvdq11d4w.vercel.app/menu
Vercel reports Ready, target Preview. The existing Vercel sign-in protection
is retained; the unauthenticated browser reaches the sign-in page.
Original production base: `d2dbac4`. Anthony explicitly approved the realistic-foliage correction and live merge on 2026-09-15.

- Targeted ESLint: passed.
- Production Next.js build and TypeScript: passed; `/menu` remains statically rendered.
- Chromium viewport checks: 320, 390, 430 and 768px; no horizontal overflow or missing images.
- Observed fast flick: one edge leaf; escalating very fast flick: two maximum.
- The detaching leaves retained DOM identity, completed their fall, and remained spent.
- Anchor leaves stayed attached; slow scrolling rustled without detaching.
- Pause froze transforms; reverse scroll kept falling translation moving downward.
- Reduced motion: static computed transforms, disabled control and auto anchor scrolling.
- Idle and offscreen checks: zero requested animation frames after settling.
- Original menu data compared against main: every pre-existing category/item/price/description identical.
- All hash links have targets. Native fall CTA lands below the sticky header.
- Menu JSON-LD includes all four exact names/descriptions and no invented offers.
- Canonical URL, game href, guest form and footer retained; no guest note was submitted.
- No browser page errors observed. Device checks use Chromium emulation, not physical iOS hardware.
- Local production server: four fall entries, ten leaves, zero canvases on /menu,
  no horizontal overflow and no browser page errors.
- Realistic-foliage correction: build/TypeScript and targeted lint passed again.
  The 320px/390px checks showed both transparent assets, four fall items,
  two simultaneous falling leaves maximum, unchanged DOM identity and no overflow.

## Motion regression checks

Run `node --test scripts/autumn-motion.test.mjs` with Node 22.18+ (native TypeScript
stripping), then targeted ESLint and the final production build. Check real scroll
input, reversed scrolling, resize during flight, pause/resume, reduced motion,
editable focus, hidden tabs, offscreen refill, the ten-leaf cap and complete overflow.
Use 320px, 390px, 430px and desktop viewports. Physical iOS review remains useful;
Chromium emulation does not reproduce every Safari browser-chrome behavior.

## Live release — 2026-09-15

- Live: https://colattao-cafe-rush.vercel.app/menu
- PR: https://github.com/anthonycolmenaresanandres-lang/colattao-cafe-rush/pull/11
- Merge commit: 38364213e71276210844b097979102e5aa2311c3.
- Vercel production deployment dpl_3BdbStwMeGWopg9CxfkA8gKhfCTi: Ready.
- Public 390px browser verification: four fall items, ten realistic leaves, both
  transparent WebP assets HTTP 200, zero butterfly canvases, no horizontal overflow
  and no page errors. Existing sign-in-free production access is preserved.

## Fluid motion verification — 2026-09-15

- Pure motion tests: 5 passed (monotonic descent, continuous handoffs, no landing bounce,
  bounded corner placement, complete overflow exit). Targeted ESLint and production
  Next build/TypeScript passed. `/menu` remains statically rendered.
- Browser trace: 536 frames; two airborne maximum, no backward Y steps, no early fade,
  all four states observed and the same two leaf identities retained after landing.
- Actual 844px-to-760px resize during flight preserved both leaves. Pause froze transforms;
  resume and reverse scrolling continued downward. An actual 11.17-second hidden-tab
  interval preserved both Y coordinates exactly at the visibility event boundaries.
- Repeated visits reached ten landed leaves and stayed capped over three more cycles.
  Four overflow leaves passed completely below the viewport before recycling; zero
  premature removals. Twelve pool slots throughout; zero idle RAF requests.
- Editable focus hid decoration and restored the same retained pile on blur. Reduced
  motion disabled falls and kept the ten landed leaves static.
- 320, 390, 430 and 1440px checks: no horizontal overflow; all native hash targets exist,
  four fall entries remain, no butterfly canvas, guest form present. Source comparison
  confirms menu route, data and leaf artwork exactly match the existing production release.
- Production-mode client navigation through the game link reached `/`, removed the portal
  and removed all six window listeners. No application page errors observed.
- Screenshots are in the task directory above this checkout: autumn-fluid-landed.png,
  autumn-fluid-pile.png, autumn-fluid-320.png and autumn-fluid-desktop.png.
  Video recording was blocked by automatic approval review; frame traces and screenshots
  supplied the visual/motion evidence. Mobile checks use Chromium, not physical Safari.
