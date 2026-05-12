# Implementation Status

## Implemented

- Vite React frontend with Tailwind styling.
- Job search profile form.
- Source selector with:
  - Real Python Fake Jobs
  - Remotive
- Comma-separated profile parsing that preserves spaces within values.
- Common technology alias normalization for JavaScript, Node.js, React, and TypeScript variants.
- `POST /api/jobs/search` Worker endpoint.
- Real Python static HTML ingestion.
- Remotive public API ingestion.
- Job normalization, validation, deduplication, scoring, sorting, and formatting.
- Rule-based scoring with match reasons.
- Execution likelihood labels: `strong_fit`, `possible_fit`, `adjacent`, `stretch`, and `lower_match`.
- Avoid keyword penalties.
- Legacy `strongest_skills` compatibility in the API.
- Experience level input.
- Dark mode toggle with localStorage persistence.
- Frontend recommended-match threshold of `score >= 25`, with lower-score jobs grouped under Explore More.
- Ranked job cards with score, fit label, summary, details, salary when available, reasons, and outbound job link.

## Partially Implemented

- Deployment readiness:
  - Worker has Wrangler config and scripts.
  - Frontend has Vite build scripts.
  - No production deployment automation yet.
- Job details:
  - Remotive descriptions produce 2-4 simple bullets.
  - Real Python has limited detail, so bullets fall back to basic metadata.
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
