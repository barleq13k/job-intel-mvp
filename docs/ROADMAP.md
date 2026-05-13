# Roadmap

## Current MVP

- User-driven job profile form.
- Worker search endpoint: `POST /api/jobs/search`.
- Optional explanation endpoint: `POST /api/jobs/explain`.
- Real Python Fake Jobs fallback/testing source.
- Remotive real public API source.
- Himalayas primary real public API source.
- Rule-based ranking and execution likelihood.
- Ranked dashboard with score, reasons, compensation when available, and job links.
- Disabled-by-default on-demand match explanations with a per-card collapsible panel.
- Local Vite + Wrangler development.

## Near-Term Priorities

Deployment:
- Deploy frontend to Cloudflare Pages or equivalent.
- Deploy Worker with Wrangler.
- Confirm production CORS and routing.

Source quality:
- Improve Remotive normalization where needed.
- Add source-specific cleanup only when directly useful.
- Keep Real Python as a predictable fallback/testing source.

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

These are future ideas, not implemented architecture.
