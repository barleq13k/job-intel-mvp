# System Flow

This document describes the current implemented MVP flow.

There is no database, auth, queue, browser automation, embeddings, Groq ranking/reranking, or AI ranking layer in the current system. Scoring is deterministic and rule-based.

There is an optional, disabled-by-default explanation endpoint. It explains one already-scored job on demand and does not participate in search, scoring, ranking, source fetching, deduplication, or persistence.

## High-Level Pipeline

```text
User search profile
  -> Frontend POST /api/jobs/search or /api/jobs/evaluate
  -> Worker source selection/fetch or manual job validation
  -> Source/manual normalization
  -> Validation
  -> Deduplication
  -> Rule-based scoring
  -> Formatting
  -> Ranked frontend cards
  -> Local browser tracking and restore
```

## 1. User Input

The user fills out the frontend search setup form.

The frontend also shows a compact dismissible intro that explains the tool's boundaries: supported source search, pasted job evaluation, deterministic tradeoff review, no auto-apply, and no pasted-URL scraping. The intro can be shown again manually without opening or changing the Setup guide.

The frontend keeps first-use guidance lightweight: define a search setup, choose a source, run a search or evaluate a pasted listing, inspect scoring reasons and eligibility/restriction signals, then save/apply/skip locally.

A first-run `Setup guide` can ask for a starting lane, skills/tools, keywords/search terms, experience level, location to check against, and short avoid/check preferences. The guide only fills existing frontend search fields, stays skippable, can be reopened manually, and does not submit a search or create any saved account or setup system.

Starter path chips can fill the existing form with beginner-friendly remote support, admin, QA/testing, or operations search values. Presets only fill the form so the user can edit anything before searching. This only updates frontend form state; it does not submit a search, add backend-only fields, or change the API payload shape.

Current profile fields include:

- target roles
- skills
- keywords
- avoid keywords
- preferred location
- work mode
- experience level
- selected source

The source selector includes short frontend descriptions for visible sources. These descriptions are expectation-setting copy only.

The frontend parses comma-separated text fields, normalizes common technology aliases, and sends the profile to the Worker.

In Evaluate Job mode, the user also provides a manual job title and pasted listing text, plus optional company, location, and URL. The URL is not fetched automatically.

The frontend validates required manual fields before request dispatch so missing titles, missing listings, and clearly too-short listings can be corrected without an unnecessary Worker request.

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

For a manually pasted listing, the frontend sends:

```text
POST /api/jobs/evaluate
```

with the same profile object plus one manual job object.

## 3. Source Selection And Fetch

The Worker validates the selected source type and fetches jobs directly.

Implemented sources:

- `himalayas`: visible primary real source using Himalayas public remote jobs API with a conservative four-page cap.
- `remotive`: visible secondary real source using Remotive public jobs API.
- `remoteok`: visible secondary real source using one RemoteOK public JSON feed request with a conservative 100-job cap and local deterministic scoring/ranking. The selected profile is not sent as RemoteOK query/tag filtering.
- `realpython_fake_jobs`: visible deterministic fake/static source for regression and fallback testing.
- `arbeitnow`: backend-supported secondary validation source using Arbeitnow's public job board API with a one-page cap; hidden from active frontend selection during source-quality review.

There is no source registry, crawler framework, browser automation, or background ingestion system.

## 4. Normalization

Source-specific normalization converts upstream rows into a consistent internal job shape.

Manual evaluation uses the same internal job shape after validating and cleaning the pasted listing text.

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

RemoteOK normalization preserves RemoteOK outbound URLs for attribution, skips the feed metadata/legal row, keeps meaningful location restriction text such as `Remote - US`, `Europe`, or `Spain`, and does not infer salary currency.

## 5. Validation

Jobs must have enough usable data to be displayed and scored.

The Worker preserves source diagnostics so the frontend can explain source behavior, partial failures, or skipped rows.

Manual job evaluation rejects missing titles, missing descriptions, extremely short descriptions, and oversized payloads before scoring.

## 6. Deduplication

The Worker deduplicates jobs before scoring.

Current dedupe behavior uses stable source IDs when available and falls back to normalized title, company, and canonical URL signals.

The goal is to reduce duplicate cards without introducing a persistent job database.

Manual evaluation returns one scored job and creates a deterministic manual source ID from the cleaned submitted fields for frontend tracking continuity.

## 7. Rule-Based Scoring

The Worker scores each normalized job against the submitted profile using deterministic rules.

Current scoring considers:

- target role relevance
- skills and strongest skill compatibility
- keywords
- broad-role category/tag-only protection for calibrated role families such as support, admin, assistant, customer service, and virtual assistant
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

When a broad role query receives only category/tag overlap, the Worker caps recommendation confidence below the frontend Recommended threshold instead of hiding the job. Clearly unrelated occupational title families receive a stronger cap. Those lower-confidence results can still be inspected under Explore More.

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

- jobs with `score >= 25` appear in the Start Here/Recommended section
- lower-score jobs remain available under Explore More
- a lightweight score guide explains that scores help users decide whether a job is worth their effort before applying
- Start Here/Recommended copy is calibrated as best available matches from the current search, not a guarantee that every card is a 70+ strong fit
- decision labels summarize actionability as `Apply First`, `Inspect First`, or `Low Priority`
- reason chips show positive, caution, and blocker signals
- reason chips are display-ordered as positive signals first, caution signals second, and restrictions or penalties last
- a small `Before applying, check` section appears only when existing caution or blocker match reasons justify a practical review prompt
- country/location restrictions remain visible
- eligibility/restriction-like match reasons can appear as compact frontend status near job metadata; positive eligibility, caution, and blocked signals are visually distinguished without changing Worker reason generation
- outbound job links open the source posting
- manually evaluated cards show `Manual Paste` as the source with a subtle manual indicator
- search/profile filters can be manually collapsed; when collapsed, a fixed overlay panel supports mid-scroll edits without changing form state or results
- each job card may show an `Explain Match` button
- explanations open in a collapsible per-card `Scoring-based explanation` panel and are support text only

These frontend clarity layers do not change Worker scoring, ranking, grouping, filtering, API contracts, or restriction detection.

Planned Phase 2.2 frontend-only display improvements:

- Make collapsed filters easier to spot with clearer label treatment, accent styling, and subtle open/close affordance.
- Add reopenable help/onboarding that explains score interpretation in plain language.
- Keep the help layer informational only; it must not change requests, scoring, ranking, filtering, localStorage data semantics, or source behavior.

## 10. Local Tracking And Restore

The frontend uses browser `localStorage` only.

Stored locally:

- latest successful search profile
- latest successful result set
- dark mode preference
- hidden/shown onboarding preference
- first-run Setup guide completion preference
- collapsed/open search filter panel preference; transient overlay-open state is not persisted
- job statuses: Saved, Applied, Skipped; untracked is the implicit default
- minimal tracked job display cache for Saved, Applied, and Skipped continuity across searches

Manual pasted job input is not separately persisted by the backend. The frontend may restore the latest frontend-ready scored result snapshot in the same localStorage mechanism used for source searches.

The result view chips are All, Saved, Applied, and Skipped. All shows the current ranked search results only. Saved, Applied, and Skipped prefer full jobs from the current loaded or restored result set, then add minimal previously tracked cards when those jobs are not in the current search results. They do not represent a full server-side archive.

The UI includes a small notice that Saved, Applied, and Skipped are stored in the current browser only. This notice does not change the localStorage keys, cache contents, or tracking behavior.

Tracked job cache key:

```text
job-intel-job-cache
```

Setup guide completion key:

```text
job-intel-first-run-onboarding-complete
```

Cached tracked jobs store only minimal display fields: `id`, `title`, `company`, `location`, `source`, `score`, `status`, and `updated_at`.

AI explanations are not saved to localStorage in the current implementation.

## On-Demand Explanation Flow

```text
User clicks Explain Match
  -> Frontend POST /api/jobs/explain
  -> Worker validates one already-scored job object and current profile
  -> Worker returns disabled/config/fallback explanation, cached explanation, or validated AI explanation
  -> Frontend displays a collapsible per-card scoring-based explanation panel
```

Explanation behavior:

- disabled by default through `AI_EXPLAIN_ENABLED`
- uses the existing frontend job object as input
- is optional, on-demand, and non-authoritative
- explains score tradeoffs: what helped, what limited the score, why the score landed in its range, and what to verify
- is presented in the frontend as generated from visible scoring signals
- keeps concern-like signals such as complexity, platform, architecture, seniority, restrictions, penalties, and avoid keywords in explanation concerns
- does not fetch jobs
- does not rescore jobs
- does not modify rankings or scores
- does not decide eligibility or override restrictions
- does not use chatbot UX or persistent AI conversation state
- does not persist explanation text to localStorage
- returns a deterministic fallback shape when AI is disabled, unavailable, times out, or returns invalid output
- uses best-effort in-memory cache and per-IP rate protection, not persistent or global production-grade enforcement
