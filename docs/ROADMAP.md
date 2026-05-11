# Roadmap

## Current MVP

- User-driven job profile form.
- Single Worker API endpoint: `POST /api/jobs/search`.
- Real Python Fake Jobs fallback/testing source.
- Remotive real public API source.
- Rule-based ranking and execution likelihood.
- Ranked dashboard with score, reasons, compensation when available, and job links.
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

Groq reranking:
- Add only after the rule-based baseline is stable.
- Use for reranking/summarization, not as a replacement for all validation and scoring.

## Future Speculative Ideas

- AI profile summarization.
- Resume parsing.
- Persistent user profiles.
- Saved jobs.
- Portfolio ingestion.
- Job application tracking.
- More real job sources.
- Structured requirement extraction.
- Semantic reranking.

These are future ideas, not implemented architecture.
