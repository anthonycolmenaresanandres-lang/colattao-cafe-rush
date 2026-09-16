# Colattao Fall Rush: game-start landing plan

September 16, 2026. Planning only; Anthony requested a reviewable direction first.

## Verified starting point

- Public root: https://colattao-cafe-rush.vercel.app/. Inspected live at desktop and 390 × 844 on September 16.
- The current headline is “A season worth savoring.” One large drink is visible; the four text-only flavor choices sit below the initial mobile view. The fixed mobile Play action is visible. At the current short desktop viewport, Play falls below the initial screen.
- Source: `FallCollection.tsx` and its CSS module render the landing. `FallExperience.tsx` controls direct play, return, selection retention, and focus restoration. Four 960 × 960 accepted promotional drink cutouts already exist; these are generated illustrations, not product photographs.
- This separate Colattao repository has no `OPERATIONS/CODEX_QUEUE.md`, consistent with previous entries. Latest local release record is a8edfa9; production release recorded as fc1d9d5. Reverify remote production before later implementation.

## Recommended direction

Audience: a guest opening the Colattao game link on a phone. Single job: immediately recognize Fall Rush, see the drinks, and start playing.

Create a polished game-start screen whose signature is a large collectible drink presented on a ceramic-blue light pool. Fall Rush is the principal heading. Use the four real flavor illustrations as a visible selection strip, with the active flavor enlarged above it. The selection previews drinks; it does not imply choosing a character, changing difficulty, or limiting which drinks appear in play.

Considered a four-drink hero group, but at 320px it would shrink every cup or overlap their garnishes. The recommended featured-drink stage preserves prominence while keeping all four choices discoverable. Replace decorative collection copy with a concise game instruction. Place longer flavor descriptions below the main start area rather than compressing them into it.

## Design tokens

- Espresso `#171613`: backdrop and open negative space.
- Cream `#F5E9D0`: clear title and primary reading text.
- Ceramic blue `#2E5A7C`: product stage, drawn from Colattao cups.
- Amber `#D4A24C`: active flavor and restrained fall highlights.
- Light gold `#EDCF95`: primary Play button surface.
- Muted cream `#C9BAA5`: supporting text, checked for contrast on actual backgrounds.
- Existing Press Start 2P: Fall Rush title only, responsive sizing; no pixel font for instructions.
- Existing Playfair Display: full drink names. Existing Inter: buttons, labels, instructions.

## Responsive composition

Mobile:

```text
Colattao logo                         Menu
                  FALL RUSH
      Tap the drinks. Avoid the chain coffee.

            [large featured drink]
              Full flavor name

  [Pumpkin] [Apple] [Campfire] [Maple]
                 PLAY FALL RUSH

       Selected flavor ingredients / menu link
```

- Target a roughly 280–320px featured-image stage at 390px width; size the visible cup, not merely transparent image bounds. Tune against screenshots, not a fixed promise.
- All four illustrated selectors have short readable labels and at least 48px touch targets. Use roughly 56–64px artwork with 12px minimum gaps where space allows. No stacked cards or overlapping ingredient labels.
- Target title, recognizable cup, selectors, and Play within the first 390 × 844 view. At 320 × 740 or text zoom, allow natural scrolling rather than shrinking legibility. A compact safe-area-aware Play dock may appear only after the in-flow Play leaves view; reserve space so it covers no content.
- On desktop, pair the title/instructions/Play on one side with the drink stage and flavor strip on the other. Keep content within about 1120px. Check short laptop heights so the main action remains apparent.

## Motion and interaction

- One brief, staggered drink entrance; flavor changes crossfade without layout jumps. A subtle lift on hover/selection and a tactile Play press make the interface feel playable.
- No perpetual rain of drinks, autoplay selection, flashing, fake scores, or reward claims. Static presentation under reduced-motion preferences.
- Native radio behavior, full accessible names, visible keyboard focus, selected state beyond color, and reserved image dimensions. All four flavors remain reachable if artwork fails.
- Keep exact menu names and ingredients. “Campfire Cappuccino or Matcha” may wrap; do not invent separate matcha artwork from the existing cappuccino illustration.

## Implementation sequence after planning

1. Reverify remote/main and existing handoff; use an isolated branch from the current production revision. Read installed Next.js guidance before code edits.
2. Revise only the landing composition, scoped CSS, and root title/description as warranted. Preserve direct Play, return selection/focus, and existing menu destination. Reuse accepted assets and loaded fonts.
3. Inspect desktop and mobile before/after screenshots and tune cup scale, title, selectors, and Play placement. Verify all four full names, selection behavior, image failure, keyboard, reduced motion, zoom, safe areas, and no horizontal overflow.
4. Verify real Play → game → return and replay, ensuring one canvas and no errors. Run targeted lint and the production build at final verification. Produce the reviewable preview before any release decision.

## Acceptance criteria

- Initial view clearly identifies Colattao and Fall Rush and shows a recognizable drink plus an obvious Play action.
- All four flavor choices are discoverable on the target phone view; selected artwork and name agree.
- No drink obscures another, no tiny explanatory text, and no fixed control covers a flavor or footer.
- Artwork stays sharp, responsive, and stable while loading; no unnecessary new library or font download.
- Gameplay and its current enlarged items continue working; all visual claims are backed by inspected screenshots. A plan alone cannot verify increased engagement or guarantee a visitor's attention.

## Status

Plan complete. Application source and production are unchanged.
