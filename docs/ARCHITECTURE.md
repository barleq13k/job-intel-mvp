# Architecture

## Current Stack

Frontend:
- Vite 5 React app in `frontend/`
- React 18 with plain component state
- Tailwind CSS for styling
- `lucide-react` for icons
- No router, auth client, data fetching library, or state management library

Backend:
- Cloudflare Worker in `worker/`
- Wrangler local/dev/deploy tooling
- Single Worker module at `worker/src/index.js`
- No database, queues, background jobs, AI service, or persistence layer

## Request Flow

1. User fills the search profile form in the frontend.
2. Frontend sends `POST /api/jobs/search` with `{ profile, source }`.
3. In local dev, Vite proxies `/api` to `http://127.0.0.1:8787`.
4. Worker validates the selected source type.
5. Worker fetches jobs from the selected source.
6. Worker normalizes, validates, deduplicates, scores, sorts, and formats jobs.
7. Frontend receives frontend-ready jobs and displays only jobs with `score >= 25`.

## Data Flow

```text
User profile form
  -> POST /api/jobs/search
  -> source fetch
  -> normalization
  -> validation
  -> deduplication
  -> rule-based scoring
  -> formatting
  -> ranked dashboard cards
```

## Source Integrations

Implemented sources:
- `realpython_fake_jobs`: scrapes static HTML from Real Python Fake Jobs.
- `remotive`: fetches jobs from Remotive's public jobs API.

There is no source registry, plugin system, crawler system, browser automation, or background ingestion. Source selection is a simple conditional branch in the Worker.

## Scoring Pipeline

Current scoring is rule-based:
- role relevance
- skill and strongest skill matches
- keyword matches
- seniority fit
- complexity penalties
- script/implementation intent
- avoid keyword penalties
- execution likelihood label
- location/work mode signals when supported by job text

The Worker returns jobs sorted by `scoring.score` descending.

## Deployment Direction

Expected deployment path:
- Frontend: Cloudflare Pages or equivalent static hosting.
- Backend: Cloudflare Workers via Wrangler.

Deployment is not fully automated in this repo yet.

## Known Limitations

- No authentication or saved profiles.
- No database or persistent job cache.
- No Groq/AI reranking yet.
- No embeddings or vector search.
- Remotive descriptions can be noisy HTML converted to text.
- Real Python jobs are fake/static and have limited details.
- Scoring is transparent but heuristic.
- Salary is shown only when a source provides it.
- Frontend filtering hides low-relevance jobs but backend still returns all scored jobs.
