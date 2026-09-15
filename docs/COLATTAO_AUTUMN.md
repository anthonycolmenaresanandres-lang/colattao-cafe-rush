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
copper #c78b53, ceramic blue #87adbc, ink #34241b, placeholder magenta #d60083.
Pumpkin, apple, cinnamon and twig line art is static, decorative and outside copy.
The banner uses live text for readability rather than embedding the reference poster.

## Components

- `FallPromo.tsx`: server-rendered brand treatment and native `#fall-drinks` anchor.
- `HarvestAccents.tsx`: small static inline SVG, hidden from assistive technology.
- `AutumnAtmosphere.tsx`: the only new client boundary. Ten deterministic positioners:
  four anchor leaves, three loose leaves, three edge leaves. Includes a 44px pause control.
- `MotionController.ts`: passive scroll/wheel/touch listeners, input-gated wind, one
  requestAnimationFrame loop that sleeps when calm, and observer/visibility cleanup.
- `autumn.module.css`: scoped autumn styling, including route-scoped reduced-motion scrolling.

## Motion contract

Anchor leaves never move. Loose leaves rustle and remain attached. Only edge leaves
can enter `rest -> loosen -> falling -> spent`. Speeds above 1.25 px/ms may loosen
one leaf; above 3 px/ms may loosen a second, with a hard cap of two active leaves.
A 900ms cooldown prevents repeated bursts; an escalating flick can add its second
leaf during the first 220ms. There is no idle fall, automatic replenishment or rain.

The positioner switches from absolute to fixed at its exact current viewport box.
Its child retains the current transform; the same DOM node leaves the pile.
Falling uses elapsed active time, with a 140ms loosen and 1900ms tumble/fade.
Reverse scrolling only changes resting rustle; airborne progression never rewinds.
Leaves drift toward the narrow outside gutters as they descend.

Only transform and opacity change per frame. Position is assigned once at detachment.
Decorations cannot receive pointer events; only the pause control can.
Hidden documents and manual pause freeze progression. An offscreen ledge stops
rustling; already visible airborne leaves finish their short fall. Reduced motion
keeps the pile static and retires airborne leaves. Resize retires them rather than
teleporting them. All listeners, observers and frames are cleaned up on unmount.

## Asset replacement and removal

The supplied image sheet is **not used**. The one 80x96 transparent SVG is a solid
magenta implementation placeholder at:
`public/assets/colattao/menu/autumn/leaf-placeholder.svg`.
Replace this file with final transparent art keeping its viewBox and stem orientation,
or change `LEAF_SRC` in `AutumnAtmosphere.tsx`. The layout and motion stay independent.
No particle, physics or animation package was added.

To remove motion only, remove the `AutumnAtmosphere` import and mount; all menu
content and the promo continue to render on the server. To reverse the autumn
presentation, remove the fall group, restore the previous page promo/morph mounts
from this branch's base, and remove the autumn imports/wrappers. Do not touch game,
reward, note, auth, API, payments or backend files.

## Verification

Review preview: https://colattao-cafe-rush-cvdq11d4w.vercel.app/menu
Vercel reports Ready, target Preview. The existing Vercel sign-in protection
is retained; the unauthenticated browser reaches the sign-in page.
Production main remains `d2dbac4`.

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

## Next implementation prompt

In this Colattao worktree, replace only the placeholder leaf art with Anthony's
approved transparent illustrated leaves. Preserve geometry, motion states, menu
data, game/reward logic, guest notes, auth and backend. Run targeted lint and
`npm.cmd run build`, recheck mobile motion, and provide a Vercel preview URL.
Do not publish or merge to production without Anthony's explicit approval.
