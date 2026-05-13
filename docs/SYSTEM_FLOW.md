# System Flow

This document describes the current implemented MVP flow.

There is no database, auth, queue, browser automation, embeddings, Groq ranking/reranking, or AI ranking layer in the current system. Scoring is deterministic and rule-based.

There is an optional, disabled-by-default explanation endpoint. It explains one already-scored job on demand and does not participate in search, scoring, ranking, source fetching, deduplication, or persistence.

## High-Level Pipeline

```text
User search profile
  -> Frontend POST /api/jobs/search
  -> Worker source selection
  -> Source fetch
  -> Source normalization
  -> Validation
  -> Deduplication
  -> Rule-based scoring
  -> Formatting
  -> Ranked frontend cards
  -> Local browser tracking and restore
```

## 1. User Input

The user fills out the frontend search profile form.

Current profile fields include:

- target roles
- skills
- keywords
- avoid keywords
- preferred location
- work mode
- experience level
- selected source

The frontend parses comma-separated text fields, normalizes common technology aliases, and sends the profile to the Worker.

## 2. API Request

The frontend sends:

```text
POST /api/jobs/search
```

with:

```json
{
  "profile": {},
  "source": {
    "type": "himalayas"
  }
}
```

In local development, Vite proxies `/api` to the Worker at `http://127.0.0.1:8787`.

## 3. Source Selection And Fetch

The Worker validates the selected source type and fetches jobs directly.

Implemented sources:

- `himalayas`: primary real source using Himalayas public remote jobs API.
- `remotive`: secondary real source using Remotive public jobs API.
- `realpython_fake_jobs`: deterministic fake/static source for regression and fallback testing.

There is no source registry, crawler framework, browser automation, or background ingestion system.

## 4. Normalization

Source-specific normalization converts upstream rows into a consistent internal job shape.

Normalization handles fields such as:

- title
- company
- location
- employment type
- compensation text when available
- source name
- outbound URL
- description text
- source metadata

Malformed or unusable rows are skipped and counted in source diagnostics.

## 5. Validation

Jobs must have enough usable data to be displayed and scored.

The Worker preserves source diagnostics so the frontend can explain source behavior, partial failures, or skipped rows.

## 6. Deduplication

The Worker deduplicates jobs before scoring.

Current dedupe behavior uses stable source IDs when available and falls back to normalized title, company, and canonical URL signals.

The goal is to reduce duplicate cards without introducing a persistent job database.

## 7. Rule-Based Scoring

The Worker scores each normalized job against the submitted profile using deterministic rules.

Current scoring considers:

- target role relevance
- skills and strongest skill compatibility
- keywords
- seniority fit
- execution likelihood
- platform and architecture complexity
- avoid keywords
- role-domain alignment
- location and work-mode compatibility
- country and region restrictions when detectable

The Worker returns:

- numeric score
- match reasons
- execution likelihood label
- score components

AI does not assign scores, change rankings, or override restrictions in the current MVP.

## 8. Formatting

The Worker formats scored jobs into frontend-ready objects.

Each job includes:

- stable ID
- title
- company
- location
- source
- URL
- salary or compensation text when available
- summary
- scoring object
- metadata
- basic details for API compatibility

Jobs are sorted by `scoring.score` descending before being returned.

## 9. Frontend Results Display

The frontend displays returned jobs as ranked cards.

Current display behavior:

- jobs with `score >= 25` appear as recommended matches
- lower-score jobs remain available under Explore More
- decision labels summarize actionability
- reason chips show positive, caution, and blocker signals
- reason chips are display-ordered as positive signals first, caution signals second, and restrictions or penalties last
- country/location restrictions remain visible
- outbound job links open the source posting
- each job card may show an `Explain Match` button
- explanations open in a collapsible per-card panel and are support text only

## 10. Local Tracking And Restore

The frontend uses browser `localStorage` only.

Stored locally:

- latest successful search profile
- latest successful result set
- dark mode preference
- job statuses: Saved, Applied, Skipped; untracked is the implicit default
- minimal tracked job display cache for Saved, Applied, and Skipped continuity across searches

The result view chips are All, Saved, Applied, and Skipped. All shows the current ranked search results only. Saved, Applied, and Skipped prefer full jobs from the current loaded or restored result set, then add minimal previously tracked cards when those jobs are not in the current search results. They do not represent a full server-side archive.

Tracked job cache key:

```text
job-intel-job-cache
```

Cached tracked jobs store only minimal display fields: `id`, `title`, `company`, `location`, `source`, `score`, `status`, and `updated_at`.

AI explanations are not saved to localStorage in the current implementation.

## On-Demand Explanation Flow

```text
User clicks Explain Match
  -> Frontend POST /api/jobs/explain
  -> Worker validates one already-scored job object and current profile
  -> Worker returns disabled/config/fallback explanation, cached explanation, or validated AI explanation
  -> Frontend displays a collapsible per-card panel
```

Explanation behavior:

- disabled by default through `AI_EXPLAIN_ENABLED`
- uses the existing frontend job object as input
- is optional, on-demand, and non-authoritative
- explains score tradeoffs: what helped, what limited the score, why the score landed in its range, and what to verify
- does not fetch jobs
- does not rescore jobs
- does not modify rankings or scores
- does not decide eligibility or override restrictions
- does not use chatbot UX or persistent AI conversation state
- does not persist explanation text to localStorage
- returns a deterministic fallback shape when AI is disabled, unavailable, times out, or returns invalid output
- uses best-effort in-memory cache and per-IP rate protection, not persistent or global production-grade enforcement
