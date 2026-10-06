# Colattao short-landscape catch correction - 2026-10-06

Local-only corrective work for PR21 review4195732615. Branch codex/colattao-landscape-playfield-20261006, base production23c621f1e148551d6f97f4e1abc3ab1a5ab4ec20; isolated existing worktree C:\dev\amma\worktrees\colattao-flow-audit-20261005. No new push/merge/deploy, customer action, prize claim, API write, dependency/service or secret change.

## Confirmed regression

The previous release verified visible controls/replay/navigation but missed drink catchability. Real local Phaser observation at568x320 reports width460, canvas208, 160px drinks with input disabled while center y155.82 is visible. An enabled drink was observed at y289.15, beyond the canvas. Original activation starts at center y212 (132px HUD +80px half-target), so a fully visible catch is impossible. At844x390, canvas278 and160px drinks likewise have no fully visible catch band: required center>212 but full visibility requires center<=198. The existing source confirms this same condition; the baseline runtime observation was at568x320.

## Small correction

For canvas heights below448px (the former minimum playfield), use a64px HUD with original30px score/time chips and readable12px level/target line; omit the redundant status/target rows. Bound drink size to one third of remaining height. Use the same HUD boundary for input and the same target size for artwork/hit geometry; retain the existing bad-item94% ratio and resize/reflow behavior. Portrait/desktop at448px or higher keep original132px HUD and136..160px collectibles.

Actual runtime after correction:

| Viewport | Canvas | HUD | Good / bad target | Fully visible catch center band |
|---|---|---|---|---|
|568x320|460x208|64|48 /45.12px|88..184px|
|844x390|454x278|64|71.33 /67.05px|99.67..242.33px|
|390x844|382x732|132|148.98 /140.04px|206.49..657.51px|

At650ms fall duration, the208px canvas now offers about223ms fully visible input and335ms including the partially visible exit band, compared with no fully visible input and about121ms clipped input before. The shortest existing550ms duration offers about189ms fully visible input. Targets, durations, spawn delays/probabilities, +10 scoring, loss rules and5%/600-point reward payload remain unchanged.

## Runtime verification and limits

A local-only route mounts the real GameCanvas/BootScene/DemoScene and replaces reward delivery with an EventBus GAME_WON observer; reward UI is absent. No requests or synthetic score changes. CUA performs native browser pointer clicks at observed actual sprite coordinates. Automation dispatch cannot reliably hit fast moving targets, so the fixture holds scene timer/tween clocks when a fully visible good target becomes input-enabled, then releases after the actual pointer handler destroys it. Natural randomness and original level targets remain; this is a controlled-clock integration check, not proof of human real-time touch difficulty.

-568x320:60 actual good-item pointer catches; levels120,180,300 completed through existing transition controls. Mock GAME_WON payload: score600, rewardPercent5, wonAt1791295625652. No live claim/delivery or mounted reward UI.
-844x390:12 pointer catches complete level1 at120; the existing Next Level action starts level2. Resize to390x844 rebuilds the original portrait HUD/art and preserves progression; actual portrait pointer catch increments0->10. Pause shows Rush paused/Resume.
-568x320 primitive fallback: fixture skips texture preload; fallback cups/X render, real pointer catch increments0->10. Enhanced texture path used for full win.
-No captured console errors in the local fixtures. Both short-screen views and portrait screenshots visually inspected. Screenshot saving remains browser-sandbox blocked; no permission changes.
-Test-only initial mount before dev CSS caused an oversized fixture canvas; starting through a user gesture after CSS loads restores exact production-like454x278 geometry. No production sizing change was introduced for that fixture artifact.

QA route and temporary GameCanvas scene probes/clock holds removed before production checks. Reproducible local fixture archives remain untracked in verification/*.txt, outside application routes. Final code changes are DemoScene HUD/input geometry, the small fallLayout helper and scoped invariant tests. No changes to GameCanvas, FallExperience or reward/request handling.

## Final checks

Four scoped geometry tests passed: fully visible touch-target bands at both landscape sizes, original portrait/desktop dimensions and valid bad/good target sizes across short canvas heights. Targeted ESLint and production build results are appended at handoff. No publication is authorized by this follow-up; parent reviews exact change/evidence before any new release. Physical touch devices and a real-time winning session remain unverified.

Final verification: targeted ESLint exit0; node --test scripts/tests/fall-layout.test.mjs passed4/4; production next build --webpack exit0, TypeScript passed and20/20 static pages generated. Initial build's stale .next/dev/types reference to removed QA route was cleared only from generated cache, then the clean build passed. Route table contains no QA route. GameCanvas/FallExperience diff is empty; LEVELS configuration byte comparison against production baseline is identical. Source guidelines audit: existing controls/focus/pause remain, minimum tested touch targets45.12px, compact HUD preserves score/time/target and original brand typography; no new DOM interaction pattern. Screenshots compared in the local fixture at the same568x320 state. Build/lint/server stopped; audit port3217 has no listener. No new release.

## Bounded normal-clock verification and fresh release approval

Fresh approval Sentinel_4d6c9ca845b481918824629bd5c3f585 authorizes scoped push/draftPR/review/CI/merge and Git-integrated Vercel release after the normal-speed checks. This supersedes this report's earlier local-only publication boundary for this exact correction.

Passive observation fixture: all target motion, timers, spawn randomness and input remain natural; timerScale=1/tweenScale=1 throughout. No hold query, injected input or score changes. Native CUA pointer clicks use screenshot-first/fresh-position observations. One bounded attempt per landscape size; reward delivery remains mocked with no reward UI/API claim.

-568x320:12 normal-speed good catches complete120-point level1 (time11 remaining; game elapsed10179.966ms / wall10210.200ms); native Next Level starts level2. Two further catches reach20 points. The bounded driver stopped after24s; natural level2 timeout later observed20/180. Full normal-clock win was not proved. Later uncaught good targets measured fully visible windows199.9..316.7ms and total visible windows299.9..466.5ms; actual canvas460x208 and48px targets.
-844x390:12 normal-speed catches complete120-point level1 (time10 remaining; game elapsed10779.970ms / wall11073.700ms); level2 reaches150/180 before its natural timeout. No bad-item loss in that attempt. Fast uncaught good targets measured199.9..366.7ms fully visible and316.9..549.9ms total visible; actual canvas454x278 and71.33px targets. Full normal-clock win was not proved.
-390x844:actual canvas382x732 and148.98px drinks match original portrait dimensions; a normal-speed pointer catch increments0->10 (game2332.314ms / wall2351.700ms). Existing Pause shows Rush paused/Resume.

Normal-speed visibility, catchability and actual level progression passed at both landscape sizes. Automated full normal-speed winning and physical touchscreen play remain unverified; the earlier600-point win remains explicitly controlled-clock integration evidence only. No retries/loops beyond the bounded attempts to manufacture a win. Passive GameCanvas probes and QA route removed; source matches e434d20 exactly. Existing local lint/4 tests/full production build apply unchanged; hosted exact-head CI/preview required. All owned local servers stopped; no further local heavy checks needed absent source change.
