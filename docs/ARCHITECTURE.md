# Architecture

## Current Stack

Frontend:
- Vite 5 React app in `frontend/`
- React 18 with plain component state
- Tailwind CSS for styling
- `lucide-react` for icons
- No router, auth client, data fetching library, or state management library
- Local application tracking and the latest successful search snapshot are stored only in browser localStorage
- A compact onboarding intro can be dismissed, with that local preference stored only in browser localStorage
- The search profile panel can be manually collapsed; that local UI preference is stored only in browser localStorage, while the collapsed overlay is transient
- The existing search form includes a narrow Find Jobs/Evaluate Job mode switch for source search or manual pasted job evaluation
- First-use activation helpers include a sample profile button, visible source descriptions, and lightweight score guidance near results
- Trust clarity helpers include compact frontend eligibility/restriction status from existing match reasons and a local-only notice near Saved/Applied/Skipped controls
- Match explanations are displayed in a per-card collapsible `Scoring-based explanation` panel and are not saved to localStorage

Backend:
- Cloudflare Worker in `worker/`
- Wrangler local/dev/deploy tooling
- Single Worker module at `worker/src/index.js`
- No database, queues, background jobs, or persistence layer
- Manual job evaluation endpoint that validates pasted listing text and uses the same deterministic scoring path as source jobs
- Optional Groq-backed match explanation endpoint, disabled by default and used only for non-authoritative score interpretation

## Request Flow

1. User fills the search profile form in the frontend.
2. Frontend sends `POST /api/jobs/search` with `{ profile, source }`.
3. In local dev, Vite proxies `/api` to `http://127.0.0.1:8787`.
4. Worker validates the selected source type.
5. Worker fetches jobs from the selected source.
6. Worker normalizes, validates, deduplicates, scores, sorts, and formats jobs.
7. Frontend receives frontend-ready jobs, displays scores `>= 25` in the Start Here/Recommended section, keeps lower-score jobs available under Explore More, and shows score guidance for interpretation.
8. Frontend may interpret existing eligibility/restriction-like match reasons into compact eligible, caution, or blocked status. This does not create new restrictions or change scoring.
9. User may request an on-demand explanation for one visible job through `POST /api/jobs/explain`; this sidecar flow does not change search, scoring, ranking, restrictions, or eligibility decisions.

Manual evaluation follows the same scoring/display path, except the frontend sends one pasted job to `POST /api/jobs/evaluate`; the Worker does not fetch the pasted URL.

The frontend performs simple manual evaluation validation before dispatching requests for required title/listing fields and clearly too-short listing text. Backend validation remains the final guardrail.

## Data Flow

```text
User profile form
  -> POST /api/jobs/search or /api/jobs/evaluate
  -> source fetch or manual job validation
  -> normalization
  -> validation
  -> deduplication
  -> rule-based scoring
  -> formatting
  -> ranked dashboard cards
```

## Source Integrations

Implemented sources:
- `realpython_fake_jobs`: visible fake/static regression and demo source that scrapes static HTML from Real Python Fake Jobs.
- `remotive`: visible real source that fetches jobs from Remotive's public jobs API.
- `himalayas`: visible real source that fetches jobs from Himalayas' public remote jobs search API.
- `remoteok`: visible real source that fetches a conservative capped batch from RemoteOK's public JSON feed.
- `arbeitnow`: backend-supported source that fetches one page of jobs from Arbeitnow's public job board API, but remains hidden from the frontend during source-quality review.

There is no source registry, plugin system, crawler system, browser automation, or background ingestion. Source selection is a simple conditional branch in the Worker.

Future source expansion should remain conservative and reliability-first. More sources may improve perceived coverage for niche searches, but each added source should preserve explicit source labeling, source diagnostics, timeout/error handling, malformed-row skipping, and deterministic local scoring. Broad web aggregation, browser automation, account-based sources, and generic scraping are not current MVP architecture.

Manual pasted jobs are not a source integration. They are user-submitted text normalized into the same internal job shape and scored once on request.

Himalayas is treated as the primary real job source and uses conservative public API pagination with a four-page cap. Later-page failures do not discard already accepted jobs. RemoteOK is a secondary real source with a conservative 100-job cap from one public feed request while source quality, latency, scoring behavior, and UI usability are evaluated; it is not query/tag-filtered before local deterministic scoring/ranking. Arbeitnow is a secondary validation source with a one-page cap while source quality and stability are evaluated. Remotive remains a secondary public API source and may return a limited public batch for a search. Real Python Fake Jobs remains a deterministic fake/static source for regression and fallback safety, not production-quality live job data.

Real sources share timeout handling, malformed-row skipping, source diagnostics, deduplication, and stable job ID behavior. Himalayas and Arbeitnow outbound links are preserved from source/application URLs for attribution and user navigation. RemoteOK outbound links remain RemoteOK URLs, location restriction text is preserved, and salary currency is not inferred from numeric bounds.

RemoteOK tags are treated as category metadata, not primary occupational identity. Calibrated broad-role searches cap category/tag-only matches below the Recommended threshold when the title lacks occupational evidence, with a stronger cap for clearly unrelated occupational families.

## Scoring Pipeline

Current scoring is rule-based:
- role relevance
- skill and strongest skill matches
- keyword matches
- title/category role-domain alignment
- seniority fit
- complexity penalties
- script/implementation intent
- avoid keyword penalties
- execution likelihood label
- location/work mode signals when supported by job text

The Worker returns jobs sorted by `scoring.score` descending.

AI explanations do not participate in ranking, scoring, eligibility, or source selection.

Frontend activation and trust/safety UI layers do not participate in ranking, scoring, eligibility, restriction detection, API contracts, or localStorage persistence semantics.

## Planned Frontend Clarity Layer

Phase 2.2 is planned as a frontend-first guided onboarding and UX discoverability pass:

- Make onboarding/help reopenable after dismissal.
- Explain the workflow from profile setup through result triage.
- Explain scoring in plain language as deterministic decision-support from profile fields, job-side signals, execution fit, restrictions, avoid keywords, and complexity.
- Make collapsed filters easier to spot without a major layout refactor unless separately approved.

This planned layer should not change Worker logic, API contracts, source fetching, scoring, ranking, filtering, or localStorage data semantics.

## Future / Experimental Layers

Aggregated web search is a future experimental/premium candidate only. Risks include instability, source quality variance, legal and maintenance concerns, and scope creep.

A help assistant is also future/experimental only. If explored, it must be constrained to platform-help behavior: explaining Job Intel workflow, scoring philosophy, filters/source behavior, onboarding, and local-only Saved/Applied/Skipped tracking. It must not become a generic career coach, rank jobs, change scores, override deterministic logic, claim eligibility, or replace visible scoring.

## Deployment Direction

Expected deployment path:
- Frontend: Cloudflare Pages or equivalent static hosting.
- Backend: Cloudflare Workers via Wrangler.

Deployment is not fully automated in this repo yet.

## Known Limitations

- No authentication or saved profiles.
- No database or persistent job cache.
- No AI ranking or reranking.
- AI explanations are disabled by default and use best-effort in-memory cache/rate protection only. This is not persistent caching or global production-grade rate limiting.
- No chatbot UX or persistent AI conversation state.
- No embeddings or vector search.
- Remotive descriptions can be noisy HTML converted to text.
- Himalayas descriptions can be rich HTML converted to text.
- Himalayas pagination is intentionally capped at four pages to prioritize stable source behavior over maximum volume.
- Remotive public API result volume can be limited for some searches.
- Real Python jobs are fake/static and have limited details.
- Scoring is transparent but heuristic.
- Salary is shown only when a source provides it.
- Frontend groups low-relevance jobs under Explore More while the backend still returns all scored jobs.
