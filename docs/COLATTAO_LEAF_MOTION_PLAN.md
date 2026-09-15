# Colattao leaf motion — smooth fall plan

Status: planning only, 2026-09-15. No application code or production changes.
Request: make the leaves fall smoothly, with the flowing quality of the former butterflies.
Latest addition: carry the fall all the way to/beyond the visible screen edge
and accumulate leaves at the bottom.
Reference production commit: `3836421`.

## Direction

A small gust passes through the pile. One edge leaf gives a little, releases,
drifts through a broad shallow curve and rocks gently all the way to the bottom
of the screen. It either lands in a shallow pile along the bottom edge or,
when there is no safe landing space, continues completely below the screen.
A stronger gust releases a second leaf slightly later.
Resting leaves belong to the menu ledge; released leaves continue on their own
clock even after scrolling stops or reverses.

Bottom means the visible viewport edge, not the distant page footer. Leaves
that land remain visible as part of the pile. Overflow leaves leave the screen
completely. This combines full-distance falling with visible accumulation
without making a leaf disappear and then reappear as a separate pile sprite.

Keep the realistic maple/oak artwork, existing warm styling and native scrolling.
Take the butterfly component's eased curves, gentle variation and gradual
transitions as the movement reference. Preserve the leaf behavior required by
the original brief: anchored pile, limited detachment, no upward rewind.

## What the inspection found

Current source: `src/components/autumn/MotionController.ts`.

| Current behavior | Effect on the experience |
| --- | --- |
| Only 140ms to loosen and 1900ms to fall | Release is easy to miss; the descent feels hurried. |
| Opacity drops to about 0.52 in the first 418ms | Much of the movement becomes faint before it is established. |
| Sideways drift uses a linear ramp capped at 24% of the fall | Sideways speed stops suddenly around 456ms. |
| Rotation combines a 195-degree turn, fast oscillation and repeated width compression | Competing movements can look mechanical at small sizes. |
| Wind is replaced by each raw scroll sample and decays quickly | Response depends strongly on device event timing. |
| A 300ms input gate and rigid rim checks qualify detachment | Momentum scrolling and rapidly departing ledges can miss the visible release. |
| Every resize retires all active leaves | Airborne leaves can disappear on viewport changes. |
| Only three edge leaves, permanently spent | The effect stops falling after those leaves are used. |

A live Chromium probe after hydration reproduced the resize issue: two leaves
in `falling` became `spent` immediately after a synthetic resize event.
Whether mobile browser chrome is causing Anthony's specific symptom still
needs an actual-device check.

Butterfly reference: `src/components/ColattaoButterflyLogoMotion.tsx`.
Its scroll formation uses `smoothstep`, curved sinusoidal offsets, seeded
variation, and staged opacity. Its visual area also stayed onscreen through a
720–880px sticky section. Smoothness alone cannot recreate that viewing time;
released leaves therefore need their own viewport-relative flight.

## Proposed choreography

These are starting tuning targets, to be judged in a motion preview.

| Stage | Timing | Motion |
| --- | --- | --- |
| Rest/rustle | While the ledge is visible | Anchors stay fixed. Loose leaves respond with about 1–3px translation and 2–6 degrees of tilt, followed by a soft settle. |
| Yield/release | About 240–360ms | An edge leaf tilts a little and slips free. Shorten anticipation if the rim is about to leave the visible area. |
| Descent | Roughly 4–6s for a typical mobile fall; scale to actual distance | Continuous curved drift from the release point to the current viewport bottom, gently increasing downward speed, one or two slow rocking cycles, restrained tumbling. Keep the leaf visible throughout. |
| Landing | About 250–450ms at contact | Ease the same leaf into a shallow resting angle with a small final rock; no bounce. |
| Overflow/retirement | Until the complete transformed leaf is below the viewport | Continue the fall beyond the screen. Remove only after it is fully outside; do not fade midway down. |

One deliberate gust releases one leaf. A strong gust may release a second
150–250ms later. The hard maximum remains two active leaves. No continuous rain.
Vary duration, arc and phase slightly using fixed per-leaf seeds.

The timing is subordinate to completing the actual travel distance. A fixed
timer must never remove a leaf while it is still crossing the screen.

## Motion model

1. **Smooth the wind.** Filter recent scroll velocity over roughly 120–200ms.
   Accumulate a short gust before release so a single event spike cannot trigger
   a burst. Use separate start/settle thresholds and a cooldown. Recognize native
   touch momentum; exclude category jumps and history restoration.
2. **Keep the handoff continuous.** Preserve the current position, angle and
   local rustle velocity when the same leaf element detaches. Blend into the
   flight over its opening segment. Do not create a duplicate or inherit an
   unlimited upward velocity from page scrolling.
3. **Use one coherent path.** An eased spline controls sideways travel without
   abrupt stops at segment joins. A monotonic vertical path eases into descent
   and approaches a calm steady falling speed. Its destination is a measured
   bottom landing slot or a point beyond the viewport plus the leaf's rotated
   bounds. Rotation follows the path with gentle lag. Reduce width compression
   to a subtle turning cue. Opacity stays steady during visible descent.
4. **Respect available space.** Use a wider shallow arc where margins allow it.
   Narrow mobile gutters reduce lateral amplitude rather than sending the leaf
   across names, prices or controls. Account for rotated leaf bounds.
5. **Use elapsed active time.** Flight duration should remain consistent across
   30/60/120Hz rendering. Hidden tabs and pause freeze the active clock; resuming
   preserves progress. Scrolling backward never decreases flight progress.

## Bottom accumulation

- Add a fixed, pointer-transparent viewport layer for both flying and landed
  leaves. Keep each leaf's identity continuous through release, flight and
  landing. Landing must reuse its flight node rather than drawing a duplicate.
- Start with an empty bottom pile. It grows only from leaves that actually
  arrive; no pre-rendered heap or extra ambient particle spawning.
- Cluster leaves asymmetrically at the bottom corners, with the center largely
  clear. Use deterministic overlapping resting slots, shallow rotations and
  partial cropping below the edge for natural depth.
- Start with a maximum visible pile height of about 24–32px and a cap of ten
  retained leaves. At most two leaves are airborne. These are preview tuning
  targets; use a bounded pool rather than unbounded accumulation.
- When full, prefer letting excess arrivals continue fully below the screen.
  An older bottommost leaf may instead slide beneath the edge to free a slot,
  coordinated with an arrival. No perpetual cleanup animation or idle loop.
- Keep the pile anchored to the screen when the page scrolls in either
  direction. It must not float back up toward the original ledge.
- Respect the visual viewport and device safe-area inset. Preserve flight
  progress through mobile toolbar height changes and smoothly update the
  destination instead of clearing the animation.
- Protect reading and input: narrow corner footprints, no interception of
  touches, and sufficient bottom clearance for the last footer controls.
  If clearance is needed, reserve it from the initial render so it does not
  create layout shift. When the guest-note keyboard is open or a focused
  control occupies the landing area, suspend new landings and conceal the
  decorative floor; preserve its stored pile for when the obstruction clears.
- Resting leaves are static. Pause freezes flight, landing and retirement.
  Reduced motion disables new animated falls and leaves any existing safe
  pile static. Clear the pile on route exit/reload; no backend or persistent
  browser storage is required.

State sequence:

`rest -> yield -> airborne -> landing -> settled -> retiring -> removed`

The overflow branch is `airborne -> fully offscreen -> removed`.

## Lifecycle corrections

- A height-only viewport resize must not hide a leaf. Keep the current flight
  origin and progress; update its bounds without snapping. On orientation/width
  changes, blend any necessary course correction from the current pose.
- Continue visible airborne motion when the upper ledge leaves view. Suspend
  that upper resting pile offscreen; preserve the bottom pile. A falling leaf
  must reach its landing slot or exit completely below the viewport before
  removal, regardless of where the original menu card has scrolled.
- Restore eligibility for later visits only after the ledge has been fully
  offscreen and all airborne leaves have finished. Refill with a new leaf cycle
  while hidden; never respawn in sight, restore a still-falling leaf, reclaim
  a leaf still visible in the bottom pile, or rewind. Use a new unique leaf
  identity for each replacement, subject to the bounded pool.
  This is a proposed repeat-visit behavior, to review in the preview.
- Keep pause, live reduced-motion changes, pointer transparency, deterministic
  initial render, observer cleanup and zero idle animation frames.

## Implementation scope

| File | Intended change |
| --- | --- |
| `src/components/autumn/MotionController.ts` | Wind filtering, release scheduling, continuous handoff, active clock, full-distance travel, landing/pile allocation, resize and offscreen lifecycle. |
| `src/components/autumn/leafMotion.ts` (new) | Pure path/rotation sampling, distance-based duration, continuous landing curves, transformed bounds and deterministic variation. |
| `src/components/autumn/FallingLeafLayer.tsx` (new) | Viewport layer owning both flying and landed nodes, with pointer transparency and a bounded pool. |
| `src/components/autumn/AutumnAtmosphere.tsx` | Motion-layer wiring, per-leaf metadata and hidden-cycle bookkeeping. |
| `src/components/autumn/autumn.module.css` | Viewport/floor layer, safe-area handling, shallow corner piles, and any initially reserved footer clearance. |

No menu data, assets, category markup, game, rewards, guest-note flow, auth,
payments or backend changes are needed. Keep the existing small client boundary;
use transforms and opacity with no new animation or physics dependency.

## Verification and success criteria

The earlier checks covered limits and navigation but missed transition quality
and resize interruption. The next pass must judge continuous movement.

- Record the same slow scroll, normal swipe, fast flick and reverse scroll
  against the current and proposed controllers.
- Inspect release and path joins frame by frame: no positional snap, abrupt
  sideways stop, early opacity loss, duplicate or phase reset.
- Follow every falling leaf to the real bottom edge. Confirm it lands in the
  pile or its entire rotated silhouette leaves the viewport before removal.
- Test repeated arrivals and a full pile: no unbounded nodes, visible popping,
  duplicate identities, covered prices/controls, or cleanup loop while idle.
- Test touch scrolling through browser-toolbar expansion/collapse on a real
  phone when available; also emulate height changes during every flight stage.
- Test pause/resume, tab hiding, orientation changes, anchor jumps, offscreen
  re-entry and repeated visits after all edge leaves have been spent.
- Test the bottom pile against the guest-note keyboard, focused controls,
  safe-area insets, the final footer links and reverse scrolling.
- Check 320/390/430px layouts and slow-device behavior; target consistent
  perceived timing, two active leaves maximum, readable content and no overflow.
- Narrow mathematical checks: continuous position/velocity at joins,
  monotonic descent/progress, correct bottom contact/complete-exit bounds,
  bounded pile retention and stable paused state.
- Run targeted lint and a final production build, then provide a Vercel preview
  with a short motion recording. Judge the preview before any new live release.

## Next implementation prompt

Implement `docs/COLATTAO_LEAF_MOTION_PLAN.md` in the Colattao worktree, limited
to the five motion files listed above plus handoff records. Preserve all menu,
artwork, game, reward and backend behavior. Verify the choreography with browser
recordings, viewport-resize checks and bottom-pile overflow/keyboard checks,
run targeted lint and `npm.cmd run build`,
and provide a Vercel preview. This planning pass does not request a new production
merge; wait for Anthony's direction for the revised live release.
