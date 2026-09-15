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

The supplied image sheet is **not used**. Anthony clarified that magenta was intended
as a removable source background, never the leaf color. The placeholder SVG was
removed and replaced with two realistic individual photographic cutouts:
`public/assets/colattao/menu/autumn/maple-copper.webp` and
`public/assets/colattao/menu/autumn/oak-russet.webp`.
Both are 160x192 transparent WebP files, generated with actual alpha so no
chroma-key background needs to reach the browser. Together they total 25,990 bytes.
Change `LEAF_ASSETS` in `AutumnAtmosphere.tsx` to replace them; preserve the tip-up,
stem-down orientation and aspect ratio. Placement and movement are unchanged.
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

## Verification

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

## Next implementation prompt

In this Colattao worktree, inspect the live autumn menu on a physical mobile device
and adjust foliage size or spacing only if needed. Preserve geometry, motion states, menu
data, game/reward logic, guest notes, auth and backend. Run targeted lint and
`npm.cmd run build`, recheck mobile motion, and provide a Vercel preview URL.
Do not publish or merge to production without Anthony's explicit approval.

## Live release — 2026-09-15

- Live: https://colattao-cafe-rush.vercel.app/menu
- PR: https://github.com/anthonycolmenaresanandres-lang/colattao-cafe-rush/pull/11
- Merge commit: 38364213e71276210844b097979102e5aa2311c3.
- Vercel production deployment dpl_3BdbStwMeGWopg9CxfkA8gKhfCTi: Ready.
- Public 390px browser verification: four fall items, ten realistic leaves, both
  transparent WebP assets HTTP 200, zero butterfly canvases, no horizontal overflow
  and no page errors. Existing sign-in-free production access is preserved.
