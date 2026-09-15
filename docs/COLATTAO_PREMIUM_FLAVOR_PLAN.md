# Colattao: premium flavor landing and larger gameplay items

Status: strategy only, September15,2026. Anthony requested planning before implementation. Production remains main91191682f68999d6ef7f2e4371485c81cf803af4.

## Evidence and diagnosis
- Current live390x844 start screen gives the title and autumn frame most of the space. Its four drinks are72px (58px on compact canvases); the footer uses36px thumbnails. The most recent release only enlarged falling items to112px.
- Root page fixes the experience to a narrow viewport-height shell. The introduction is canvas text, limiting natural text wrapping, accessible product exploration and scrolling.
- Actual menu names/ingredients are available in src/data/colattaoMenu.ts. Prices say Ask; no prices, dietary claims, popularity rankings or ordering capability should be invented.
- Existing images are generated promotional artwork based on the owner's visual reference, not photographs of served products. Current256px game derivatives are too small to be the source for a300px hero on a high-density display.

## Direction: Colattao's autumn tasting collection
The page's job is to make each drink recognizable and its flavors understandable, then invite the guest to play or open the menu. The signature is an oversized drink portrait beside short, specific flavor notes; blue-and-white ceramic detail provides Colattao's recognizable accent.

Palette: espresso #1B0E08; warm parchment #F5E9D0; ceramic blue #284E77; toasted copper #A7653D; restrained gold #D4A24C. Use current Playfair Display for product headings and Inter for descriptions/controls. Existing logo stays intact. Keep leaves peripheral and sparse, with a quiet background behind the drink. Use open spacing rather than four bordered cards or repeated gold ticket controls.

## Recommended composition
Mobile: one240–300px drink portrait, depending on viewport, with its full name and ingredients. Four visible, labeled flavor controls select the portrait and description. No auto-rotation; touch and keyboard selection should work. Allow natural scrolling on small screens. Keep both Play Fall Rush and View fall menu easy to reach; make Play the main action on this game-entry route. A compact logo/menu header replaces the oversized current ticket at the top of this introduction. Desktop: portrait and copy sit beside each other in a wider landing layout; the actual game keeps a controlled play width.

```text
Colattao                                  Menu
THE FALL COLLECTION
Meet your fall favorite.

          LARGE FEATURED DRINK

Pumpkin Pie Latte
Pumpkin sauce · Shortbread syrup · Spiced cold foam

Pumpkin Pie     Caramel Apple
Campfire        Maple Pecan

[ Play Fall Rush ]       View fall menu
Tap the falling drinks. Avoid the chain coffee.
```

Flavors must read from, or remain explicitly mapped to, the menu's authoritative data:
- Pumpkin Pie Latte: pumpkin sauce, shortbread syrup, spiced cold foam.
- Caramel Apple Latte: caramel sauce, apple syrup, cinnamon powder.
- Campfire Cappuccino or Matcha: marshmallow syrup, dark chocolate, roasted marshmallow topping.
- Maple Pecan Latte: salted maple syrup, butter pecan sauce, cold foam.

Default feature: Pumpkin Pie, identified only as the first selection, not a best seller. Switching flavors changes the presentation, not gameplay rules or the four-drink collection.

## Larger items in the game
Trial responsive136px on narrow phones,144–152px on typical phones and up to160px where space permits. This is21–43% larger per dimension than current112px items. These are prototype values, not an unconditional final promise: test the crowded third level and short landscapes before choosing them.

Measure the visible cup/glass silhouette as well as its transparent image square. Use per-asset optical fitting if required so glasses do not still look undersized beside wider mugs. Keep ingredient props secondary. Expand input bounds and entry/exit/side margins with the actual visual bounds. Check wobble at both edges. Keep chain coffee legible and proportionate; its larger hit area must not crowd out adjacent drink taps.

Keep +10 scoring, existing level targets/timers and win/replay semantics. Larger tap areas affect practical difficulty, so do not claim difficulty is identical. Do not silently alter spawn rates to compensate. If dense spawns need more separation, validate and disclose the chosen positioning adjustment.

## Implementation order
1. Build a static mobile/desktop landing prototype and capture it for visual review. Use high-resolution accepted source art for hero derivatives; inspect transparency and sharpness at2x density. Prefer existing sources; new image edits, if necessary, are a separate clearly scoped production step.
2. Move the flavor introduction into an accessible HTML component. Reuse menu flavor data. Provide explicit selected-state styling, readable descriptions and meaningful image alt text.
3. Mount/preload Phaser when Play is chosen and enter the round once ready. Avoid presenting a second redundant start screen. Add an explicit return to flavors action. Keep root / and menu /menu#fall-drinks unchanged for QR links. Preserve completion/replay cleanup when transitioning between landing and game.
4. Prototype larger collectibles and run visual/tapping checks at the fastest level. Update only Colattao presentation and relevant verification assertions.
5. Final production build, targeted checks and verified preview. Production merge remains a separate approval after the concrete result is available.

Likely source scope: src/app/page.tsx; new flavor-landing component/styles; src/components/GameCanvas.tsx; src/game/scenes/DemoScene.ts; explicit game UI transition contract if needed. Avoid global CustomerHeader changes affecting other routes; use a scoped landing header or optional presentation mode. Artwork derivatives and verification notes accompany the change.

## Acceptance checks
- First screen visibly features a large drink and identifiable flavor; all four selections are discoverable.
- Correct full product names/ingredients; no invented prices or claims.
- Crisp hero art and readable type at320/390/430px plus desktop; natural small-screen scrolling, no horizontal overflow.
- Game starts once; loading/error/retry, return to flavors, completion and replay all work.
- All four larger drinks fit during wobble and remain tappable; score region protected; chain coffee has clear separation at high spawn density.
- Native pointer/touch-equivalent input, resize, pause/hidden-tab handling, reduced motion, asset failure and listener cleanup verified.
- Physical mobile hardware remains explicitly unverified until tested.

## Alternatives considered and revised
A four-across hero repeats the current small-thumbnail problem. Four full product panels on the first screen force smaller artwork or bury Play. A single hero with an accessible flavor selector gives the drink enough space while making all four flavors discoverable. Remove repeated promo thumbnails from the landing; retain a compact menu action during play only where useful.

Current screenshot: ../colattao-premium-before.png. No implementation or deployment performed in this planning pass.

## Approved execution refinement — September 15, 2026
Anthony approved implementation after another strategy pass. The final route uses a large individual portrait, espresso-charcoal ground, original white wordmark, blue ceramics and restrained gold controls. The portrait reaches 328px on standard phones and 540px on desktop. A fixed phone action bar keeps Play available while guests scroll through the full ingredients and four flavor choices. Keyboard focus explicitly reveals a choice if the bar would cover it.

Responsive gameplay was validated at 136–160px, including third-level density on a 320px viewport, enlarged native pointer input, and active-item resizing. Existing level settings remain unchanged. Implementation details and source-art provenance are in COLATTAO_PREMIUM_FLAVOR_IMPLEMENTATION.md; release state is in HANDOFF.md.
