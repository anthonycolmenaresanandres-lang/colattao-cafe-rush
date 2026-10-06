# Colattao menu/game flow audit - 2026-10-06

Authority: Anthony approved focused improvements and, after checks pass, scoped push, PR, merge and Git-integrated Vercel release (Sentinel_fd0104db99b081918b012d97ceb5e47e). Delegated from task 01a0fe62-9a92-753c-abfd-f14c4ca470de. No application submissions, client messages, payments, claims, secrets, service installs or new dependencies.

Source: anthonycolmenaresanandres-lang/colattao-cafe-rush; isolated C:\dev\amma\worktrees\colattao-flow-audit-20261005; branch codex/menu-flow-audit-20261005; fresh remote main e7d618535b7b2d7e106ec120aea253dcef1a9507. Public https://colattao-cafe-rush.vercel.app/menu and / match main, not the untouched unmerged minimal-menu branch 22f403d. Source fix a604ebc9b13ef6437845cb3a9e90151a2383e202.

## Reproduced defect and focused fix

Live 844x390 game: main height 560px; canvas y64..512; Pause y512..556, below the viewport during timed play. Browser geometry and before screenshot confirm the forced overflow.

src/components/FallExperience.tsx:41 replaces min-h-[560px] with min-h-0. Existing h-[100svh], flex sizing, Phaser resize path, 44px controls, focus treatment, logos, assets, menu, scoring and rewards are preserved. No redesign or other application source changes.

## Verification passed on exact source candidate

- Targeted ESLint (system Node, eslint src/components/FallExperience.tsx): exit 0.
- Production next build --webpack: exit 0; compiled, TypeScript passed, all 20 static pages generated. Production build ID h4ttJQnz433kUIPrbeiEy; local next start HTTP 200.
- 844x390: document 844x390, main 390px, canvas y64..342, Pause y342..386. Before/after screenshots inspected at the same viewport/game state; controls fit after the fix.
- 568x320: document 568x320, canvas height 208px, Pause y272..316.
- 390x844: document 390x844, canvas height 732px, Pause y796..840.
- 320x568: document 320x568, main 568px, canvas height 456px, Pause y520..564.
- 1440x900: document 1440x900, main 900px/max-width 470px, canvas height 788px, Pause y852..896.
- Pause click shows Rush paused and Resume aria-pressed=true; Enter resumes. Natural timed loss disables Pause; existing game-region Enter restarts, returns TAP DRINKS +10 and enables Pause. Replay screenshot inspected.
- The flavors removes game and restores lower Play focus; keyboard Space selects Caramel Apple and updates image/description.
- View fall menu resolves /menu#fall-drinks; mobile menu has no horizontal overflow or failed loaded images. Menu game link returns landing. No captured console errors.
- Earlier read-only live checks: Browse menu exposes seven links; Kitchen resolves /menu#cocina; California Sandwich Details opens by keyboard with description/photo. No actionable Bodega defect confirmed in the bounded earlier audit; no Bodega code changed.

Guidelines audit: only the existing height class changes; layout/focus/control patterns remain established. git diff --check passes. No guest notes, reward claims, payments, requests/email/traffic, game rules, dependencies or settings changed.

## Limits and release handoff

Desktop Pause was disabled after the natural timeout; this is expected result feedback, not a defect. Desktop geometry passed; pause/resume behavior passed at 844x390. Physical Safari/Android hardware and a complete winning reward flow remain unverified. Browser captures were inspected in tool output; saving PNG files in the data-center directory was denied by the browser filesystem sandbox. No permissions were broadened. The local application server will be stopped at handoff.

Release proceeds only through the scoped GitHub PR with exact-head checks; no direct push to main. Hosted preview, merge and production verification results will be recorded in the final handoff.
