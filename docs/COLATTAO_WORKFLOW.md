# Colattao Workflow

## Review and Deployment Rule

Anthony does not review local routes.

- Local build and local dev server checks are for Codex verification only.
- User-facing review must happen through a deployed Vercel preview URL or the production URL.
- Final reports must include the deployed preview URL or production URL when available.
- If a branch push creates a Vercel preview, use that preview URL for review before asking Anthony to inspect changes.
- If a production deploy is requested, report the production alias after Vercel marks it ready.

## Build Verification

Use local verification before deployment:

```bash
npm.cmd run build
```

Do not treat `localhost`, `127.0.0.1`, or local network URLs as Anthony review links.

## Ideas, Research, Development, and Parked Concepts

Colattao-related concepts belong in this repository first, unless Anthony explicitly sends them to the AMMA/Fina Calle parent system.

Use these destinations:

- `docs/COLATTAO_WORKFLOW.md` for workflow rules, review protocol, and future Codex operating notes.
- `ECOSYSTEM_MAP.md` for route ownership, live surface area, and where a concept fits in the Colattao experience.
- `WHITE_LABEL_GUIDE.md` for reusable client-pattern notes that should carry into future local-business builds.
- `CHECKPOINT.md` for current implementation state, parked work, and the next verified milestone.
- `src/app/research-and-development/` only when a concept is ready to become a customer-facing or owner-facing R&D route.

Do not park concepts only in chat. If an idea affects future Colattao work, record it in one of the destinations above.

## Future Task Prompt Requirement

Every future Colattao task should end with the best next Codex prompt, ready to paste.

The prompt should include:

- project path
- scope
- protected files
- build command
- whether to commit, push, or deploy
- required deployed preview or production URL reporting
