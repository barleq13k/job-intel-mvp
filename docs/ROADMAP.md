# Roadmap

## Current MVP

- User-driven job profile form.
- Worker search endpoint: `POST /api/jobs/search`.
- Manual job evaluation endpoint: `POST /api/jobs/evaluate`.
- Optional explanation endpoint: `POST /api/jobs/explain`.
- Real Python Fake Jobs fallback/testing source.
- Remotive real public API source.
- Himalayas primary real public API source.
- RemoteOK real public API source with conservative feed cap and category/tag relevance calibration.
- Arbeitnow backend-supported source hidden from the frontend during source-quality review.
- Rule-based ranking and execution likelihood.
- Ranked dashboard with score, reasons, compensation when available, and job links.
- Evaluate Job mode for manually pasted listings from unsupported sources; title and listing text are required, while company, location, and URL are optional.
- LocalStorage-only search restore, theme preference, and Saved/Applied/Skipped tracking.
- Compact dismissible onboarding stored only in localStorage.
- Disabled-by-default on-demand match explanations with a per-card collapsible panel.
- Local Vite + Wrangler development.

## Near-Term Priorities

Phase 2.2: Guided Onboarding + UX Discoverability:
- Make onboarding/help reopenable after dismissal.
- Explain the actual user workflow, not only the feature list: define a profile, choose a source, run a search or paste a listing, inspect score/reasons/restrictions, then save/apply/skip locally.
- Explain scoring in plain language: scores are based on profile data, job-side signals, execution fit, restrictions, avoid keywords, and complexity.
- Keep the first pass frontend-first if possible; do not change Worker scoring, ranking, APIs, or source behavior.
- Make collapsed filters easier to spot with clearer label treatment, accent color, and subtle open/close affordance before considering any layout refactor.

Deployment:
- Deploy frontend to Cloudflare Pages or equivalent.
- Deploy Worker with Wrangler.
- Confirm production CORS and routing.

Source quality:
- Improve Remotive normalization where needed.
- Continue RemoteOK relevance validation from real searches.
- Add source-specific cleanup only when directly useful.
- Keep Real Python as a predictable fallback/testing source.
- Expand sources conservatively in phases because more source coverage improves usefulness, especially for niche searches.
- Preserve source diagnostics, visible source labels, timeout handling, malformed-row skipping, and deterministic local scoring for each added source.
- Do not introduce broad scraping, browser automation, or aggregated web search as current MVP source expansion.

Scoring refinement:
- Tune rule-based scoring from real user profiles.
- Improve description bullet extraction.
- Improve compensation display without overbuilding salary parsing.

AI explanation:
- Keep AI disabled by default unless explicitly configured.
- Use AI only to explain visible deterministic scoring signals.
- Keep score, ranking, restrictions, and eligibility decisions deterministic.
- Do not add chatbot, persistent AI conversations, AI scoring, or AI reranking.
- Keep cache and rate protection best-effort and in-memory unless a later production need justifies more infrastructure.

## Future Speculative Ideas

- AI profile summarization.
- Resume parsing.
- Persistent user profiles.
- Saved jobs.
- Portfolio ingestion.
- Job application tracking.
- More real job sources.
- Structured requirement extraction.
- Better explanation and verification prompts.
- Aggregated web search or broad web discovery as a future experimental/premium candidate only.
- A constrained platform-help assistant for onboarding, scoring, filter/source, and local-tracking questions only.

These are future ideas, not implemented architecture.

## Parked For Current MVP

- Broad scraping, browser automation, and generic web aggregation.
- Generic AI chatbot or career-coach behavior.
- AI ranking, reranking, scoring, eligibility decisions, or hidden score changes.
- Production-scale source orchestration, scraper registries, queues, or account-based/private sources.

Aggregated web search remains parked because it carries instability, source quality variance, legal and maintenance concerns, and scope creep risk that do not fit the current validation build.
