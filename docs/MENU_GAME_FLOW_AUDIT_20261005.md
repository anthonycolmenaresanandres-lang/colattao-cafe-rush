# Colattao menu/game flow audit — 2026-10-05

Authority: Anthony approved focused improvements to the existing menu/game product. Delegated from task 01a0fe62-9a92-753c-abfd-f14c4ca470de. Local preparation only; no push, merge, deploy, submissions, client messages, payments, claims, secrets, service installs, or new dependencies.

Source: anthonycolmenaresanandres-lang/colattao-cafe-rush, isolated C:\dev\amma\worktrees\colattao-flow-audit-20261005, branch codex/menu-flow-audit-20261005, base origin/main e7d6185. Public deployment: https://colattao-cafe-rush.vercel.app/menu and / (Fall Rush). The live menu matches main's existing textured menu, not the unmerged minimal-menu branch 22f403d; that unrelated work remains untouched. Exact production deployment SHA was not queried.

## Reproduced defect and prepared fix

At 844x390, start Fall Rush from the live landing title. The game's main element is 560px tall despite a 390px viewport; the canvas spans y=64..512 and Pause spans y=512..556. The fixed minimum height requires scrolling during timed play to reach Pause. Live browser geometry and screenshot confirm the overflow.

src/components/FallExperience.tsx:41: replace min-h-[560px] with min-h-0. Preserve h-[100svh], navigation/control sizes, existing flex sizing and Phaser's resize path. This removes the forced overflow on short screens without changing portrait/desktop heights. Existing palette, fonts, logo, assets, menu layout, scoring and rewards remain intact.

## Bounded read-only live checks

- 390x844 menu: no horizontal overflow; image inspection found no failed loaded images.
- Browse menu expands and exposes all seven section links; Kitchen resolves to /menu#cocina.
- California Sandwich Details opens by keyboard and exposes its description/photo.
- Menu's game link resolves to /; the Fall Rush title starts the game and a single canvas loads.
- Landscape defect measurements: main height 560; Pause top 512, bottom 556; viewport height 390.
- No guest notes, reward claims, payment flows or application API mutations submitted.

## Verification status

The isolated dev server compiled / and returned HTTP 200. After-fix responsive and interaction checks remain pending: the browser runner timed out repeatedly and reset its session. Before/after screenshots could not be saved in the restricted data-center directory; the live before capture was inspected in the tool output. Targeted lint and production build were attempted; final results will be appended when available. Do not treat this as release-ready until those checks and after-fix landscape/pause/resume/retry checks pass.

Guidelines review: the one touched height class uses existing flex layout and keeps 44px controls/focus treatment; no new accessibility pattern, visual redesign or dependency.

## Next Codex prompt

In C:\dev\amma\worktrees\colattao-flow-audit-20261005 on codex/menu-flow-audit-20261005, verify only the short-screen height fix in src/components/FallExperience.tsx. Protect all menu redesign work, requests/email/traffic, rewards, game rules/assets, configuration and dependencies. Run targeted ESLint and npm.cmd run build -- --webpack. Compare unchanged live and local fixed gameplay at 844x390, 568x320, 320x568, 390x844 and desktop; verify visible Pause/Resume, retry and return-to-menu. No submissions/payments/claims or push/deploy/merge. Report the existing public production URL and local evidence without representing localhost as Anthony's review link.