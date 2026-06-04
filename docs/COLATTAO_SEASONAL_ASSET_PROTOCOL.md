# Colattao Seasonal Asset Protocol

Use this protocol when Anthony provides new seasonal drink photos or generated assets for the Colattao digital menu banner. The Matcha Lemonade implementation is the reference pattern.

## Source Folder Pattern

Primary source image folder:

```text
C:\Users\antho\OneDrive\Desktop\Fina Calle Brand images CODEX
```

Start by inspecting the newest relevant files in that folder, then match each candidate to the drink and flavor Anthony requested. Do not assume the newest file is correct if the logo, drink, flavor, or composition is wrong.

## Reference Implementation

Current seasonal implementation:

- UI component: `src/components/SeasonalFeatureBanner.tsx`
- Menu placement and reveal behavior: `src/app/menu/page.tsx`
- Repo asset destination: `public/assets/colattao/menu/seasonal/`

Matcha Lemonade selected source files:

- Original: `ChatGPT Image 4 jun 2026, 10_14_00 a.m. (1).png`
- Strawberry: `ChatGPT Image 4 jun 2026, 10_14_00 a.m. (2).png`
- Mango: `ChatGPT Image 4 jun 2026, 10_14_01 a.m. (3).png`

Matcha Lemonade output assets:

- `matcha-lemonade-original-poster.png`
- `matcha-lemonade-strawberry-poster.png`
- `matcha-lemonade-mango-poster.png`
- `matcha-lemonade-original-banner.png`
- `matcha-lemonade-strawberry-banner.png`
- `matcha-lemonade-mango-banner.png`

The reference poster assets are 1122 x 1402 PNGs. The derived banner assets are 1200 x 675 PNGs.

## Asset Selection Factors

Select source images using these criteria:

- Most recent relevant images for the requested seasonal drink.
- Correct Colattao logo fidelity: no broken letters, warped marks, misspellings, or invented brand elements.
- Correct drink and flavor appearance: the glass, color, garnish, fruit, and flavor cues must match the requested flavor.
- Premium parchment, espresso, gold, cream, quiet-luxury style.
- Clean composition with the glass, flavor title, logo, and premium card styling readable.
- Crop suitability for a wide 16:9 banner without cutting off essential brand or drink details.
- No cheap pop-up, coupon, countdown, fake scarcity, or noisy promotional styling.

If two images are close, choose the one with better logo fidelity and cleaner drink/flavor readability before choosing based on general style.

## Required Output Assets

For each flavor, create both:

- A full poster copy per flavor.
- A wide 16:9 banner variant per flavor.

Filename rules:

- Use lowercase kebab-case.
- Include the seasonal drink slug and flavor slug.
- Use stable names that can stay in source control.
- Store all outputs under `public/assets/colattao/menu/seasonal/`.

Recommended pattern:

```text
<seasonal-drink-slug>-<flavor-slug>-poster.png
<seasonal-drink-slug>-<flavor-slug>-banner.png
```

Use WebP only when the app and review workflow already support it cleanly. PNG is acceptable for final approved artwork, especially when preserving exact generated poster fidelity matters.

## Image Handling Rules

- Preserve the logo look.
- Preserve the drink look.
- Do not stretch, squeeze, or distort source art.
- Crop and scale only as needed for the banner shape.
- Prefer a derived 16:9 display-frame treatment when the source poster is too vertical.
- Keep the glass, flavor title, Colattao logo, and premium card styling visible.
- Use subtle overlays only for readability.
- Do not add visual claims, fake badges, fake awards, fake prices, fake saved items, or fake counts.
- Regenerate only if the source image is missing, unusable, visibly broken, or fails the selection criteria.
- Keep the CSS fallback path available so the banner does not fail hard if an asset is missing.

## UI Behavior Rules

The seasonal banner belongs on `/menu`:

- Directly below the existing "Play Colattao Rush" banner.
- Above the menu sections.
- Mobile-first for 320px, 390px, and 430px widths.

Carousel behavior:

- Feature one slide per flavor.
- Autoplay every 3 to 4 seconds.
- Use smooth fade, slide, or soft zoom motion.
- Add only subtle premium gold shimmer or border motion.
- Pause on hover, focus, pointer down, or touch if practical.
- Respect `prefers-reduced-motion`.
- Keep the CTA text: `View Flavors`.

CTA behavior:

- Click or tap should scroll to `#seasonal-drinks`.
- If a matching seasonal drink flavor area exists, open or reveal it.
- If dropdown support does not exist, add a clean expandable flavor area inside Seasonal Drinks.
- Do not change menu prices.
- Do not rename existing menu items except the minimum needed to present the seasonal flavor area.

Anthony reviews deployed Vercel preview or production URLs only. Local routes are for Codex verification.

## Implementation Checklist

Before editing:

- Read `HANDOFF.md`.
- Run `python handoff.py start`.
- Run `python handoff.py show`.
- Run `git status --short`.
- Record the scoped task and protected files in the handoff.

Asset work:

- Inspect `C:\Users\antho\OneDrive\Desktop\Fina Calle Brand images CODEX`.
- Record the exact selected source filenames.
- Copy or derive poster assets into `public/assets/colattao/menu/seasonal/`.
- Derive 16:9 banner variants without distortion.
- Record whether regeneration was needed.
- Verify dimensions and filenames.

Code work:

- Update `src/components/SeasonalFeatureBanner.tsx` with the new flavor data and asset paths.
- Update `src/app/menu/page.tsx` only if a new seasonal flavor reveal area is needed.
- Keep protected game files unchanged:
  - `src/game/scenes/DemoScene.ts`
  - `src/components/GameCanvas.tsx`
  - `src/game/events/EventBus.ts`
- Do not add or modify payment, auth, database, secrets, public feedback boxes, fake saved items, or fake counts.

Verification:

```bash
npm.cmd run build
```

If the build passes and the task requires release:

- Commit the scoped files only.
- Push to the current remote.
- Use the deployed Vercel preview or production URL in the final report when available.

## Final Report Checklist

Report:

- Source folder inspected.
- Exact selected images.
- Assets created or optimized.
- Whether regeneration was needed.
- Build result.
- Commit hash.
- Push result.
- Deployed preview or production URL if available.
- Protected files unchanged.
- Prices/items unchanged except any approved seasonal flavor presentation.
- No secrets, payment code, auth code, database code, fake saved items, fake counts, or public feedback boxes added.

## Future Prompt Format: New Seasonal Drink

```text
Read HANDOFF.md, run:
python handoff.py start
python handoff.py show

Project path:
C:\Users\antho\OneDrive\Desktop\Colattao Rush

Task:
Add a seasonal feature banner for [DRINK NAME] on the digital menu page using the Colattao seasonal asset protocol.

Source images:
Use the newest relevant [DRINK NAME] images in:
C:\Users\antho\OneDrive\Desktop\Fina Calle Brand images CODEX

Flavors:
- [Flavor 1]
- [Flavor 2]
- [Flavor 3]

Requirements:
- Select source images by logo fidelity, drink/flavor accuracy, premium parchment/espresso/gold style, clean composition, and 16:9 crop suitability.
- Save full poster copies and derived 16:9 banner variants under:
  public/assets/colattao/menu/seasonal/
- Use lowercase/kebab-case filenames.
- Preserve logo and drink appearance.
- Do not distort images.
- Regenerate only if the source is missing or unusable.
- Keep CSS fallback available.
- Place the banner below Play Colattao Rush and above menu sections.
- CTA text: View Flavors.
- CTA scrolls to Seasonal Drinks and opens/reveals the matching flavor area.
- Respect prefers-reduced-motion.

Protected:
- Do not change menu prices.
- Do not change existing menu item names except the approved seasonal flavor presentation.
- Do not modify:
  src/game/scenes/DemoScene.ts
  src/components/GameCanvas.tsx
  src/game/events/EventBus.ts
- Do not add fake saved items, fake counts, public feedback boxes, payment/auth/database code, secrets, or mojibake.

Verification:
npm.cmd run build

If build passes:
Commit and push.

Final report:
- Source folder inspected
- Exact selected images
- Assets created/optimized
- Whether regeneration was needed
- Build result
- Commit hash
- Push result
- Deployed preview/production URL if available
- Protected files unchanged
- Prices/items unchanged except approved seasonal flavor presentation
- No secrets/payment/auth/database/fake feedback/fake counts added
```
