# Implementation Audit

This audit reflects the current MVP repository state. It is recommendation-only: do not delete, move, or refactor files automatically from this report.

## Summary

The implemented app is currently:
- `frontend/`: Vite React + Tailwind app.
- `worker/`: Cloudflare Worker with `POST /api/jobs/search` and disabled-by-default `POST /api/jobs/explain`.
- `docs/`: current implementation documentation.
- `data/`: sample profile data.

`POST /api/jobs/explain` is an on-demand interpretation sidecar. It does not change deterministic search, scoring, ranking, restrictions, or eligibility decisions. Its in-memory cache and per-IP rate protection are best-effort MVP safeguards, not persistent or global enforcement.

No Vite starter UI is currently rendered. No Worker starter handler is currently active. The largest drift risks are stale root markdown/json files and generated local dev artifacts.

## Issues

### 1. Local Dev Log Files

Files:
- `frontend/vite.out.log`
- `frontend/vite.err.log`
- `worker/wrangler.out.log`
- `worker/wrangler.err.log`

Why stale or risky:
- These are generated runtime artifacts, not source files.
- They can preserve old server output and mislead future debugging.
- `.gitignore` already ignores `*.log`, but the files exist in the workspace.

Recommendation:
- Delete later.
- Keep ignored.
- Do not document behavior from these logs.

### 2. Build and Tool Output Directories

Folders:
- `frontend/dist/`
- `frontend/node_modules/`
- `worker/node_modules/`
- `worker/.wrangler/`

Why stale or risky:
- These are generated or installed artifacts.
- They are not source of truth.
- They can create noisy searches and confuse future audits.

Recommendation:
- Stay locally as needed for development.
- Do not commit.
- Delete/recreate later if troubleshooting dependency or build issues.

### 3. Root Product Docs Are Older Than Current Implementation

Files:
- `PROJECT_VISION.md`
- `MVP_SCOPE.md`
- `SYSTEM_FLOW.md`

Why stale or risky:
- They predate the implemented Vite + Worker MVP.
- They mention broad concepts like older AI-assisted direction, PWA support, deployment, and possible database direction.
- `SYSTEM_FLOW.md` references nonexistent Python files:
  - `ingest.py`
  - `validator.py`
  - `sources/base.py`
- These files are useful as product intent but risky as implementation guidance.

Recommendation:
- Stay as historical/product context.
- Add a short header later marking them as legacy planning docs.
- Use `/docs` as implementation source of truth.
- Do not implement Python ingestion modules just because `SYSTEM_FLOW.md` mentions them.

### 4. `TARGET_OUTPUT.json` Is Behind Current Response Shape

File:
- `TARGET_OUTPUT.json`

Why stale or risky:
- It lacks current fields:
  - `details`
  - `scoring.execution_likelihood`
  - `scoring.components`
- It uses `LinkedIn` as the source, but LinkedIn is not implemented.
- It can mislead future Codex runs into thinking there is a LinkedIn source or older response contract.

Recommendation:
- Consolidate later with `docs/API_CONTRACT.md`.
- Either update it to match current schema or archive it as an original target example.
- Do not use it as the active API contract.

### 5. `data/sample-profile.json` Is Valid But Incomplete

File:
- `data/sample-profile.json`

Why stale or risky:
- It still works because the Worker handles missing fields.
- It omits newer profile fields:
  - `experience_level`
  - `avoid_keywords`
  - `strongest_skills`
- Future tests using only this file may miss current scoring behavior.

Recommendation:
- Stay.
- Update later with the current full profile shape, or add a second sample for Remotive.
- Do not remove because it remains useful for fallback Real Python testing.

### 6. Duplicate Architecture References

Files:
- Root docs: `PROJECT_VISION.md`, `MVP_SCOPE.md`, `SYSTEM_FLOW.md`
- Current docs: `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/API_CONTRACT.md`, `docs/SCORING_PHILOSOPHY.md`

Why stale or risky:
- Root docs describe product direction and earlier intended flow.
- `/docs` describes current implementation.
- Without clear precedence, future Codex runs may follow stale root docs and add non-existent systems.

Recommendation:
- Consolidate later by adding cross-links and precedence notes.
- Treat `/docs` as current implementation truth.
- Treat root docs as historical product intent.

### 7. TypeScript/JavaScript Naming Inconsistency Risk

Files:
- `frontend/src/main.jsx`
- `worker/src/index.js`
- `frontend/package.json`

Why stale or risky:
- The project is JavaScript-only, but Vite starter prompts often assume `src/App.tsx`.
- There is no `tsconfig.json`, no `.tsx`, and no TypeScript source.
- Future prompts mentioning `App.tsx` would be wrong for this repo.

Recommendation:
- Stay JavaScript-only unless explicitly requested.
- Do not add TypeScript config casually.
- Mention `frontend/src/main.jsx` in future implementation prompts.

### 8. No Obsolete Vite Starter UI Found

Checked for:
- `Get started`
- `Edit src/App.tsx`
- default starter assets/components

Current status:
- No active Vite starter UI files were found outside generated `dist/`/dependencies.
- Frontend renders the Job Intel MVP from `frontend/src/main.jsx`.

Recommendation:
- Stay.
- No deletion needed.

### 9. No Obsolete Worker Starter Handler Found

File:
- `worker/src/index.js`

Current status:
- Worker implements the current API route and returns `404` for other paths.
- No default `Hello World` Worker starter route was found.

Recommendation:
- Stay.
- No deletion needed.

### 10. Groq Is Explanation-Only And Disabled By Default

Files:
- `docs/ROADMAP.md`
- `docs/SCORING_PHILOSOPHY.md`
- root planning docs

Why stale or risky:
- Groq may be used only by `POST /api/jobs/explain` when explicitly enabled.
- Risk comes if future Codex runs mistake Groq configuration for AI ranking, reranking, scoring, or eligibility decisions.

Recommendation:
- Stay.
- Keep wording explicit: Groq is explanation-only, disabled by default, and never part of `/api/jobs/search`.
- Do not add AI ranking, reranking, scoring, eligibility decisions, chatbot UX, or persistent AI conversation history.
- Do not persist explanation text to localStorage unless explicitly requested.

### 11. Source Integration Is Simple By Design

File:
- `worker/src/index.js`

Why risky:
- Real Python and Remotive source logic live in one Worker file.
- This is intentional for MVP simplicity, but could look like a refactor target.

Recommendation:
- Stay.
- Do not introduce a scraper registry or source framework yet.
- Only split when source count or complexity justifies it.

### 12. Current Docs Are Mostly Aligned

Files:
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/CODEX_GUARDRAILS.md`
- `docs/SCORING_PHILOSOPHY.md`
- `docs/API_CONTRACT.md`
- `docs/ROADMAP.md`

Current status:
- These docs reflect current Vite/Worker architecture, current sources, current scoring, and current exclusions.
- They should be considered more current than root planning docs.

Recommendation:
- Stay.
- Update whenever API fields, scoring components, or sources change.

## Recommended Cleanup Order

1. Delete generated `.log` files later.
2. Add legacy/context headers to root markdown files.
3. Update or archive `TARGET_OUTPUT.json`.
4. Refresh `data/sample-profile.json` with current optional fields.
5. Keep `/docs` as the implementation source of truth.

## Do Not Do From This Audit

- Do not delete files automatically.
- Do not move folders.
- Do not refactor the Worker.
- Do not add TypeScript.
- Do not add a database, auth, queues, agents, browser automation, vector search, or AI ranking/reranking.
- Do not treat the explanation cache or rate protection as production-grade global infrastructure.
