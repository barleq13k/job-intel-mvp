# Job Intelligence MVP

A small job discovery tool that fetches real remote job listings, ranks them against a user-defined search profile, and explains why each job was shown.

The MVP is designed for validation: it favors transparent, deterministic ranking over opaque AI matching. The goal is to help testers decide which jobs to apply to, inspect later, skip, or check for eligibility.

## Core Philosophy

Job search tools often hide why a result appears. This project does the opposite.

- Deterministic scoring is the source of truth.
- Match reasons should be visible and understandable.
- Location and country restrictions should stay truthful.
- Seniority and complexity should affect execution confidence, not fake relevance.
- Future AI should explain, summarize, and clarify. It should not replace or secretly change the ranking.

## Current MVP Features

- Real job ingestion from supported public sources.
- Rule-based scoring from profile fields such as target roles, skills, keywords, location, work mode, experience level, and avoid keywords.
- Transparent match reasons and score components.
- Source diagnostics and malformed-row skipping.
- Country/location restriction handling, including multi-country restriction logic.
- Senior-aware execution calibration for aligned roles.
- Recommendation labels such as Apply first, Inspect later, Stretch, Low priority, and Check eligibility.
- Reason-chip severity styling for positive, caution, and blocker signals.
- Local search/result restore via `localStorage`.
- Local job status tracking for New, Saved, Applied, and Skipped.
- Quick access shortcuts for Saved, Applied, and Skipped jobs in the latest loaded/restored result set.
- Minimal PWA metadata and app icons.
- Warm, restrained UI polish with light and dark modes.

## Current Architecture

Frontend:
- Vite 5
- React 18
- Tailwind CSS
- Plain React state
- Browser `localStorage` for latest search snapshot and job statuses

Backend:
- Cloudflare Worker
- Single API endpoint: `POST /api/jobs/search`
- No database
- No auth
- No queues
- No background jobs
- No embeddings
- No Groq or other AI service

## Current Job Sources

- Himalayas: primary real job source, fetched through its public remote jobs API.
- Remotive: secondary real public API source with limited public result behavior.
- Real Python Fake Jobs: deterministic fake/static source used for regression and fallback testing.

The app does not use LinkedIn scraping, browser automation, private APIs, or account-based sources.

## What AI Does Not Do

There is no AI ranking in the current MVP.

AI does not:
- assign scores
- change rankings
- override location restrictions
- ignore avoid keywords
- decide eligibility
- hide penalties
- replace deterministic scoring

Future AI may help summarize long descriptions, explain existing scoring signals in clearer language, extract structured requirements, or suggest questions to verify before applying. It should remain optional and non-intrusive.

## Screenshots

Screenshots can be added here after first deployment.

Suggested captures:
- Search profile panel and ranked results
- A card with positive/caution/restriction chips
- Saved/Applied/Skipped quick access
- Mobile/narrow-width layout

## Local Development Setup

Install dependencies separately for the Worker and frontend.

```powershell
cd C:\dev\job-intel-mvp\worker
npm install
npm run dev
```

In another terminal:

```powershell
cd C:\dev\job-intel-mvp\frontend
npm install
npm run dev
```

Local frontend dev runs on Vite and proxies `/api` to the Worker at `http://127.0.0.1:8787` by default.

Useful checks:

```powershell
cd C:\dev\job-intel-mvp\worker
npm run test:source
npm run test:scoring
npm run check
```

```powershell
cd C:\dev\job-intel-mvp\frontend
npm run build
```

## Frontend / Backend Structure

```text
frontend/
  index.html
  public/
    manifest.webmanifest
    app icons
  src/
    main.jsx
    styles.css

worker/
  src/
    index.js
  test/
    scoring-regression.mjs
    source-reliability.mjs
  wrangler.jsonc

docs/
  implementation, scoring, API, deployment, and roadmap notes
```

## Deployment Overview

Expected first deployment path:

- Frontend: Cloudflare Pages or another static host serving `frontend/dist`.
- Backend: Cloudflare Workers via Wrangler.

Frontend build:

```powershell
cd frontend
npm run build
```

Worker deploy:

```powershell
cd worker
npm run deploy
```

Set `VITE_API_BASE_URL` in the frontend environment only if the deployed frontend calls a separate Worker origin. Leave it empty when `/api/jobs/search` resolves on the same origin or through a Cloudflare route.

## Current Limitations

- No accounts or authentication.
- No database or persistent server-side job archive.
- Saved/Applied/Skipped statuses are local to the browser and only reference jobs in the latest loaded/restored result set.
- No AI summaries yet.
- No semantic matching, embeddings, or vector search.
- Source quality varies by upstream provider.
- Remotive public API result volume may be limited.
- Himalayas pagination is intentionally conservative.
- Salary display depends on source-provided text and is not normalized deeply.
- Scoring is transparent but heuristic.

## Validation Stage Status

This MVP is ready for first-user validation after deployment.

Primary validation questions:
- Do users trust the ranking and reasons?
- Do restriction warnings prevent wasted applications?
- Do decision labels help users triage faster?
- Does Save/Applied/Skipped provide enough lightweight workflow value without accounts?
- Which real source produces the most useful job leads?

## Future Roadmap

High-level ideas only:

- Deploy and collect first tester feedback.
- Refine scoring weights from real search examples.
- Improve source-specific normalization.
- Add better structured requirement extraction.
- Add optional AI summaries and explanation polish.
- Consider persistent profiles or saved-job storage only after validation shows it is needed.
- Add more real job sources only when quality justifies the maintenance cost.

## Contribution / Development Notes

- Keep changes narrow and testable.
- Preserve the `POST /api/jobs/search` contract unless intentionally changing the API.
- Prefer explicit rule-based scoring over opaque matching.
- Do not add auth, databases, queues, browser automation, embeddings, or AI services without a clear product reason.
- Update docs when behavior, source support, deployment, or scoring interpretation changes.

## License

License not selected yet.
