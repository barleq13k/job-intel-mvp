# Implementation Status

## Implemented

- Vite React frontend with Tailwind styling.
- Job search profile form.
- First-use `Try Sample Profile` action that fills the existing frontend profile form with a beginner-friendly remote support/QA-style profile.
- Source selector with:
  - Real Python Fake Jobs
  - Remotive
  - Himalayas
  - RemoteOK
  - Arbeitnow implemented in the backend but hidden from active frontend selection during source-quality review
- Source selector descriptions for visible sources, shown as frontend expectation-setting copy only.
- Comma-separated profile parsing that preserves spaces within values.
- Common technology alias normalization for JavaScript, Node.js, React, and TypeScript variants.
- Compact dismissible onboarding intro that explains source search, pasted job evaluation, tradeoff review, and product boundaries.
- `POST /api/jobs/search` Worker endpoint.
- `POST /api/jobs/evaluate` Worker endpoint for manually pasted job listings.
- Real Python static HTML ingestion.
- Remotive public API ingestion.
- Himalayas public API ingestion with conservative pagination.
- RemoteOK public JSON feed ingestion with a conservative 100-job cap, RemoteOK URL attribution preservation, location restriction text preservation, and non-inferred salary display.
- Arbeitnow public API ingestion with a conservative one-page cap while source quality is validated.
- Job normalization, validation, deduplication, scoring, sorting, and formatting.
- Manual job validation and normalization into the same deterministic scoring pipeline used by source jobs, without fetching pasted URLs.
- Frontend manual job validation for required title/listing fields and clearly too-short listings before request dispatch.
- Source reliability diagnostics, malformed-row skipping, request timeouts, stable source IDs, and deterministic job IDs for real API sources.
- Himalayas is treated as the primary real source; RemoteOK, Arbeitnow, and Remotive remain secondary limited public API sources; Real Python Fake Jobs remains a fake/static regression and fallback source.
- Rule-based scoring with match reasons.
- Broad-role category/tag-only protection that caps weak category-only evidence below Recommended for calibrated support/admin/assistant/customer-service/virtual-assistant searches, with stronger caps for clearly unrelated occupational title families.
- Execution likelihood labels: `strong_fit`, `possible_fit`, `adjacent`, `stretch`, and `lower_match`.
- Avoid keyword penalties.
- Legacy `strongest_skills` compatibility in the API.
- Experience level input that calibrates seniority fit, execution confidence, and complexity tolerance without overriding relevance, avoid keywords, or location restrictions.
- Dark mode toggle with localStorage persistence.
- Collapsible search/filter panel with localStorage persistence and a floating Filters control that opens a transient overlay for mid-scroll edits.
- Local application status tracking with localStorage-only `Saved`, `Applied`, and `Skipped` statuses; untracked jobs are implicit and can be restored with Reset.
- Lightweight localStorage tracked-job cache so Saved, Applied, and Skipped views can show minimal tracked job cards across searches.
- Result view chips for All, Saved, Applied, and Skipped; All shows the current ranked search only, while tracked views combine current results with minimal cached tracked cards from prior searches.
- Local-only notice explaining that Saved, Applied, and Skipped are stored in the current browser only, without changing localStorage behavior.
- Latest successful search profile and ranked results restore from localStorage after refresh.
- Frontend recommended-match threshold of `score >= 25`, with lower-score jobs grouped under Explore More.
- Frontend score guide near results: 70+ strong match, 50-69 possible fit, and below 50 review carefully.
- Job cards include compact decision labels that distinguish apply-first, inspect-later, stretch, low-priority, and eligibility-check cases.
- WHY SHOWN chips are display-ordered as positive signals, caution signals, then restrictions or penalties without changing backend reason generation.
- Compact frontend eligibility/restriction status on job cards when existing match reasons already contain location, country, or eligibility text.
- Light UI polish pass with warmer neutrals, softer card surfaces, calmer borders, restrained accent color, and cleaner chip/status controls.
- Ranked job cards with score, fit label, source excerpt/summary, salary when available, reasons, and outbound job link.
- Manually evaluated cards use the normal job card, local tracking, and Explain Match behavior, with a subtle manual indicator.
- Disabled-by-default `POST /api/jobs/explain` endpoint for on-demand match explanations.
- Explanation safety prep: env gate, strict request/response validation, best-effort in-memory per-IP rate protection, simple in-memory cache, and tradeoff-oriented deterministic fallback explanations.
- Explanation responses deterministically keep complexity, architecture, platform, seniority, restriction, penalty, and avoid-keyword signals in concerns rather than strengths.
- Frontend `Explain Match` button with a collapsible per-card `Scoring-based explanation` panel.
- AI explanations are not persisted to localStorage and do not use chatbot or conversation history UI.
- Frontend-only location display cleanup for timezone-only remote strings, without changing backend scoring or normalization.

Recent activation and trust/safety clarity updates are frontend/UI-only. They do not change API contracts, Worker scoring, result ordering, restriction detection, or localStorage storage semantics.

## Partially Implemented

- Deployment readiness:
  - Worker has Wrangler config and scripts.
  - Frontend has Vite build scripts.
  - No production deployment automation yet.
- Job details:
  - Backend still returns simple `details` for compatibility.
  - Frontend hides detail bullets for MVP trust because they are sliced source text, not AI-generated structured insights.
  - Structured summaries/bullets are deferred until a later summarization pass.
- Compensation:
  - Displayed when source data includes salary/hourly/budget text.
  - No salary normalization beyond basic cleanup.

## Experimental

- Execution likelihood scoring.
- Complexity and seniority penalties, including Senior-profile tolerance for aligned platform/architecture roles.
- Broad-role title context ranking.
- Category/tag-only relevance calibration for noisy source metadata, including RemoteOK tags.
- Software/technical role-domain alignment and off-domain drag.
- Script-oriented profile boosts.

These are implemented heuristics, not AI judgments.

## Planned

- Phase 2.2 guided onboarding and UX discoverability:
  - Reopenable onboarding/help after dismissal.
  - Plain-language workflow guidance that explains how to use Job Intel from profile setup through result triage.
  - Plain-language scoring explanation that connects profile fields, job-side signals, execution fit, restrictions, avoid keywords, and complexity.
  - More discoverable collapsed filter/settings control through clearer label treatment, accent styling, and subtle motion before any larger layout change.
- Deployment setup.
- Better source quality and source-specific normalization.
- Conservative phased source expansion when reliability and maintenance costs justify it.
- Continued scoring refinement from real search examples.
- Tuning of explanation copy after real usage.

## Future / Experimental

- Aggregated web search or broad web discovery may be explored later as an experimental or premium layer, but it is not current MVP scope because of source instability, quality variance, legal/maintenance concerns, and scope creep risk.
- A constrained platform-help assistant may be explored later only to answer questions about how Job Intel works, scoring philosophy, filters, sources, onboarding, and local-only tracking. It must not become a generic career coach, rank jobs, change scores, decide eligibility, or override deterministic logic.

## Intentionally Excluded From MVP

- Auth.
- Database.
- Billing.
- Background jobs.
- Queues.
- Browser automation.
- Vector search.
- Embeddings.
- Agents.
- Scraper registry.
- Multi-source orchestration.
- Broad web aggregation.
- Groq ranking or reranking integration.
- AI ranking, reranking, scoring, eligibility decisions, restriction overrides, chatbot UX, and persistent AI conversation history.
