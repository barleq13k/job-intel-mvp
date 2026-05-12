# Implementation Status

## Implemented

- Vite React frontend with Tailwind styling.
- Job search profile form.
- Source selector with:
  - Real Python Fake Jobs
  - Remotive
  - Himalayas
- Comma-separated profile parsing that preserves spaces within values.
- Common technology alias normalization for JavaScript, Node.js, React, and TypeScript variants.
- `POST /api/jobs/search` Worker endpoint.
- Real Python static HTML ingestion.
- Remotive public API ingestion.
- Himalayas public API ingestion with conservative pagination.
- Job normalization, validation, deduplication, scoring, sorting, and formatting.
- Source reliability diagnostics, malformed-row skipping, request timeouts, stable source IDs, and deterministic job IDs for real API sources.
- Himalayas is treated as the primary real source; Remotive remains a secondary limited public API source; Real Python Fake Jobs remains a fake/static regression and fallback source.
- Rule-based scoring with match reasons.
- Execution likelihood labels: `strong_fit`, `possible_fit`, `adjacent`, `stretch`, and `lower_match`.
- Avoid keyword penalties.
- Legacy `strongest_skills` compatibility in the API.
- Experience level input.
- Dark mode toggle with localStorage persistence.
- Local application status tracking with localStorage-only `New`, `Saved`, `Applied`, and `Skipped` statuses.
- Frontend recommended-match threshold of `score >= 25`, with lower-score jobs grouped under Explore More.
- Ranked job cards with score, fit label, source excerpt/summary, salary when available, reasons, and outbound job link.

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
- Complexity and seniority penalties.
- Broad-role title context ranking.
- Software/technical role-domain alignment and off-domain drag.
- Script-oriented profile boosts.

These are implemented heuristics, not AI judgments.

## Planned

- Deployment setup.
- Better source quality and source-specific normalization.
- Continued scoring refinement from real search examples.
- Groq-assisted reranking and summarization after the rule-based MVP is stable.

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
- Groq integration.
