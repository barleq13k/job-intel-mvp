# Implementation Audit

This audit reflects the current Job Intel validation-stage repository state. It is recommendation-only: do not delete, move, or refactor files automatically from this report.

## Summary

The implemented app is currently:
- `frontend/`: Vite React + Tailwind app.
- `worker/`: Cloudflare Worker with `POST /api/jobs/search`, `POST /api/jobs/evaluate`, and disabled-by-default `POST /api/jobs/explain`.
- `docs/`: current implementation documentation.
- `data/`: synthetic demo and regression data.

`POST /api/jobs/explain` is an on-demand interpretation sidecar. It does not change deterministic search, scoring, ranking, restrictions, or eligibility decisions. Its in-memory cache and per-IP rate protection are best-effort MVP safeguards, not persistent or global enforcement.

`POST /api/jobs/evaluate` evaluates one manually pasted listing through the same deterministic scoring path as source jobs. It does not fetch pasted URLs, parse with AI, persist data, or introduce a second scoring system.

No Vite starter UI is currently rendered. No Worker starter handler is currently active. The largest drift risks are generated local dev artifacts and historical sample/contract files that are not the active implementation contract.

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
- `.gitignore` ignores `*.log`, `*.out.log`, and `*.err.log`.
- The previously tracked Worker Wrangler logs are removed from the working tree and should stay deleted.
- Frontend Vite logs may still exist locally as ignored development artifacts.

Recommendation:
- Commit tracked Worker log deletions.
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

### 3. Implementation Docs Are The Current Source Of Truth

Files:
- `README.md`
- `docs/API_CONTRACT.md`
- `docs/ARCHITECTURE.md`
- `docs/SYSTEM_FLOW.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/SCORING_PHILOSOPHY.md`

Current status:
- Root-level legacy planning markdown files are not present in the current workspace.
- The active implementation docs live under `/docs`, with `README.md` as the project overview.
- Future work should not infer Python ingestion modules, databases, browser automation, or AI ranking from older planning concepts.

Recommendation:
- Stay.
- Keep `/docs` and `README.md` aligned whenever API fields, scoring components, or sources change.

### 4. `docs/TARGET_OUTPUT.json` Is A Refreshed Example Artifact

File:
- `docs/TARGET_OUTPUT.json`

Current status:
- It has been refreshed as a valid current response-shaped example.
- It includes `jobs`, `count`, additive `source` diagnostics, `details`, `scoring.execution_likelihood`, and `scoring.components`.
- It uses an implemented public source label instead of implying unsupported LinkedIn ingestion.

Recommendation:
- Keep it as a lightweight example artifact.
- Continue treating `docs/API_CONTRACT.md` and `worker/src/index.js` as the active contract/source of truth.

### 5. `data/sample-profile.json` Is A Current Lightweight Sample

File:
- `data/sample-profile.json`

Current status:
- It includes current frontend profile fields used for a simple QA/Python automation validation search.
- `strongest_skills` remains omitted because it is a legacy optional compatibility field, not sent by the current frontend form.

Recommendation:
- Stay.
- Do not remove because it remains useful for fallback Real Python testing.

### 6. Historical Sample Files Need Clear Precedence

Files:
- `docs/TARGET_OUTPUT.json`
- `data/sample-profile.json`
- `data/sample_jobs.json`

Current status:
- Sample files are useful for quick orientation and regression-style checks, but they are not the active API contract.
- `data/sample_jobs.json` is synthetic demo/test data and should not be read as live job listings, private exports, or supported source behavior.

Recommendation:
- Treat `docs/API_CONTRACT.md` and `worker/src/index.js` as source of truth.
- Keep synthetic labels clearly non-authoritative when they could be confused for real platform exports.

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
- Frontend renders Job Intel from `frontend/src/main.jsx`.

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
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/CODEX_GUARDRAILS.md`
- `docs/SCORING_PHILOSOPHY.md`
- `docs/API_CONTRACT.md`
- `docs/ROADMAP.md`
- `docs/SYSTEM_FLOW.md`

Current status:
- These docs reflect current Vite/Worker architecture, current sources, current scoring, and current exclusions.
- They should be treated as the active implementation reference set.

Recommendation:
- Stay.
- Update whenever API fields, scoring components, or sources change.

## Recommended Cleanup Order

1. Commit tracked Worker Wrangler log deletions.
2. Keep generated local logs, build output, dependency folders, local env files, and `.wrangler/` ignored.
3. Keep `docs/TARGET_OUTPUT.json`, `data/sample-profile.json`, and `data/sample_jobs.json` clearly positioned as examples or synthetic test data.
4. Keep `/docs` and `README.md` as the implementation source of truth.

## Do Not Do From This Audit

- Do not delete files automatically.
- Do not move folders.
- Do not refactor the Worker.
- Do not add TypeScript.
- Do not add a database, auth, queues, agents, browser automation, vector search, or AI ranking/reranking.
- Do not treat the explanation cache or rate protection as production-grade global infrastructure.
