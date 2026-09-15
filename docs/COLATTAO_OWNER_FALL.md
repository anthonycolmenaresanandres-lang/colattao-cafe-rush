# Owner-inspired fall collection

## Direction and scope

Anthony supplied the owner's Colattao fall poster and requested realistic drinks, all leaves falling, and a live merge. The poster's blue-and-white ceramics, copper foliage, chalk lettering and dark café board guide the fall section. Existing Playfair/Inter fonts, names, descriptions and prices remain. The menu's single job is readable drink selection on mobile.

The optional motion preference received no response during artwork production. The stated working choice is one finite, staggered ten-leaf cascade, replacing permanent anchors and the previous two-flight limit. No automatic replenishment. A replay is explicit. Existing reduced-motion and pause behavior still apply.

## Raster assets

Built-in imagegen was used, with the owner poster as the initial style reference. The images are generated promotional product imagery, not photographs supplied by the owner. Final files are in `public/assets/colattao/menu/autumn/`:

- `pumpkin-pie.webp`: 360×360, black background blended into the board with CSS screen. Source `exec-439220d3-e09b-4db0-bcca-74a52b3a68dd.png`.

Final built-in prompt:

> Use case: product-mockup. Generate a new photorealistic food product photograph for a premium autumn cafe menu. A real white porcelain latte mug with intricate cobalt-blue floral motifs and blue handle, pumpkin latte, thick spiced cold foam lightly dusted with cinnamon and a subtle caramel drizzle. One small natural orange pumpkin and a cinnamon stick close to the mug base. Three-quarter front camera, warm soft window-style light on the product, extremely realistic ceramic glaze, tiny foam bubbles and natural ingredient textures. Entire object and props fully visible, square frame, centered with 7 percent breathing margin, tightly grouped. Background MUST be perfectly uniform pure BLACK #000000, no texture and no gradient. The subject sits against a black void, no visible tabletop or horizon. No checkerboard, no gray squares, no background pattern, no text, no logo, no watermark, no other objects. Do not simulate transparency. Produce the actual subject on a solid black background. Elegant professional food photography, not cartoon, engraving or shiny plastic.

- `caramel-apple.webp`: 360×360, genuine alpha. Source `exec-ce5c0fac-3e9e-4915-9e05-db7dafb46161.png`.

Final built-in prompt:

> Use case: product-mockup. Asset: individual transparent web-menu drink cutout, 1:1 square composition. The input image is the OWNER PROVIDED STYLE AND PRODUCT REFERENCE, not an edit target. Create a photorealistic interpretation of ONLY the Caramel Apple Latte in the reference. One elegant clear vertically fluted glass of creamy caramel apple latte with caramel trails, subtle layered milk and espresso, thick cold foam dusted with cinnamon; one thin red apple slice at the rim. One small red apple and a single cinnamon stick sit close to its base. Three-quarter front view, warm soft café window light, true glass refraction, realistic foam and fruit skin with small natural imperfections. Entire glass and garnish visible with a small breathing margin, centered tightly for a 120px product thumbnail. Genuine transparent alpha background, including around/between the props; no table, backdrop or chalkboard. No text, branding, watermark, extra drink, cartoon, engraving or exaggerated whipped cream. Retain the owner reference’s vessel, garnish and autumn palette; professionally photographed food, not shiny plastic.

- `campfire.webp`: 360×360, black background blended into the board with CSS screen. Source `exec-a58d519b-6550-42be-8d09-ee034756e406.png`.

Final built-in prompt:

> Use case: product-mockup. Generate a new photorealistic food product photograph for a premium autumn cafe menu. A real white porcelain cappuccino cup and saucer with refined dark-blue botanical floral decoration, creamy cappuccino and dark chocolate dusting. One golden roasted marshmallow on a thin wooden skewer across the rim, two chocolate squares and one plain marshmallow at the saucer base. Three-quarter front camera, warm soft window-style light on the product, extremely realistic ceramic glaze, tiny foam bubbles and natural ingredient textures. Entire object and props fully visible, square frame, centered with 7 percent breathing margin, tightly grouped. Background MUST be perfectly uniform pure BLACK #000000, no texture and no gradient. The subject sits against a black void, no visible tabletop or horizon. No checkerboard, no gray squares, no background pattern, no text, no logo, no watermark, no other objects. Do not simulate transparency. Produce the actual subject on a solid black background. Elegant professional food photography, not cartoon, engraving or shiny plastic.

- `maple-pecan.webp`: 360×360, genuine alpha. Source `exec-49c1a00b-0384-48d5-8222-c2db3e1c21d7.png`.

Final built-in prompt:

> Use case: product-mockup. Asset: individual transparent web-menu drink cutout, 1:1 square composition. The input image is the OWNER PROVIDED STYLE AND PRODUCT REFERENCE, not an edit target. Create a photorealistic interpretation of ONLY the Maple Pecan Latte in the lower-right of the reference. One short elegant clear vertically fluted glass of maple pecan latte with rich warm espresso and creamy milk, thick cold foam with delicate amber maple drizzle and fine pecan-colored dusting. Three natural pecan halves and one modest copper-brown maple leaf nestle closely beside the glass base. Three-quarter front view, warm soft café window light, realistic clear glass refraction, fine foam bubbles, authentic pecan texture and natural imperfections. Entire glass and small props visible with a small breathing margin, centered tightly for a 120px product thumbnail. Genuine transparent alpha background around and between objects. No table, backdrop, chalkboard, text, logos, watermark, extra drink, cartoon, engraving or plastic 3D appearance. Preserve the owner reference’s vessel and autumn warmth; professional real food photography.

`owner-fall-menu.webp` is a size/format optimization of Anthony's original 990×1280 poster; no content edits. It is available in the compact, expandable 'View the fall collection' control. Drink images use Next Image responsive delivery; the poster is lazy-loaded. Final four drink sources total 107,878 bytes; the owner poster is 289,462 bytes before Next optimization.

Two initial ceramic images and their extraction retries baked a checkerboard into RGB output. They were rejected. Fresh solid-black photographs replaced them through the built-in image tool; no checkerboard files are referenced by the application. Original generated files remain in the Codex generated_images folder.

## Implementation

- `FallDrinkItem.tsx` renders existing menu items with an isolated art lookup; no schema change.
- `FallPromo.tsx` uses a restrained drink row and the optional original poster.
- `AutumnAtmosphere.tsx` provides ten eligible leaves, explicit cascade/replay and pause controls.
- `MotionController.ts` stages the finite cascade with exact visual handoffs, downward time-based travel, shallow corner landings and offscreen overflow. No automatic respawning or per-frame React updates.
- `leafMotion.ts` holds the release schedule and pure curves. Ten reusable DOM slots bound the entire effect.
- `page.tsx` changes only the fall category presentation. Other category rendering and all routing/data/core flows are retained.

## Verification

- Six pure motion tests, targeted ESLint and production build/TypeScript passed.
  The menu remains statically rendered; the data file matches production exactly.
- The full trace identified all ten released leaves, zero remaining on the rim,
  eight corner landings and two full offscreen exits. No backward steps, early
  opacity changes or premature removals. The ten-slot pool stays bounded.
- Normal native-scroll input starts the cascade; very slow scrolling only rustles.
  Category navigation does not trigger it. Returning from offscreen does not refill
  the rim. Explicit replay resets and runs the same finite sequence.
- Pause freezes both current poses and queued releases. Actual viewport-height
  resize and reverse scrolling preserve downward movement. Simulated document
  visibility changes freeze/resume the same state; this headless tab switch did
  not deliver real visibility events, so it is not counted as a device test.
- Guest-note input hides/freezes the layer and restores it on blur. Reduced motion
  disables both controls and keeps landed leaves static. Zero idle RAF requests.
- Verified at 320, 390, 430 and 1440px: no horizontal overflow, correct hash targets,
  readable text, four loaded drink images, and two 44px-tall controls.
- The original poster is not requested before its panel opens; it loads correctly
  when expanded. No guest note was submitted. Physical Safari testing is unavailable.
- Screenshots in the parent task directory: owner-fall-top.png,
  owner-fall-blended.png, owner-fall-cleared.png, owner-fall-drinks-320.png,
  owner-fall-430.png and owner-fall-desktop.png.

## Live release — 2026-09-15

- Live: https://colattao-cafe-rush.vercel.app/menu
- PR: https://github.com/anthonycolmenaresanandres-lang/colattao-cafe-rush/pull/13
- Merge: 9381acf5a3bed862c1a162260ee7c9c3594d0a3a; verified source head 717b277.
- Production dpl_FrAaBdVwRRbLJHmNnBGg7MJhRGG2: Ready, public alias confirmed.
- Live normal-scroll trace: ten unique released leaves, zero remaining on the rim,
  eight landings, no backward movement and a completed finite cascade. All five new
  assets return HTTP 200. Exact drink names and all hash targets are present; no
  horizontal overflow or application page errors. Menu JSON-LD retained.
- Live screenshots: ../owner-fall-live-top.png and ../owner-fall-live-drinks.png.
