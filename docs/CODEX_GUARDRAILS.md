# Codex Guardrails

This repo is a simple MVP. Future Codex runs should preserve that simplicity.

## Do Not

- Do not add auth.
- Do not add databases yet.
- Do not add billing.
- Do not add vector search.
- Do not add embeddings.
- Do not add scraper registries.
- Do not add queues.
- Do not add orchestration systems.
- Do not add browser automation.
- Do not add agents.
- Do not add AI ranking, AI reranking, AI scoring, or AI eligibility decisions.
- Do not add chatbot UX or persistent AI conversation history.
- Do not add generic career-coach chatbot behavior.
- Do not add aggregated web search or broad web scraping in the current MVP.
- Do not persist AI explanations to localStorage unless explicitly requested.
- Do not make AI explanations enabled by default.
- Do not redesign stable APIs.
- Do not split the Worker into a large framework.
- Do not overabstract source integrations.
- Do not introduce broad dependency changes for small fixes.

## Preferred Workflow

- Use narrow, scoped prompts.
- For planned phases or behavior changes, prepare a proposal first when the task asks for one.
- Make minimal diffs.
- Preserve the current `POST /api/jobs/search` contract.
- Keep `POST /api/jobs/explain` as an on-demand explanation sidecar only.
- Treat explanation cache and rate protection as best-effort in-memory MVP safeguards, not global or persistent infrastructure.
- Keep `frontend/` as the Vite React app.
- Keep `worker/` as the Cloudflare Worker API.
- Keep `data/` for sample/reference data.
- Prefer explicit functions over framework-like abstractions.
- Preserve working local dev.
- Run frontend build and Worker syntax checks after meaningful changes.

## Change Style

- Add only what the current task needs.
- Keep scoring transparent and rule-based. AI may explain visible scoring signals only.
- Keep source integrations simple and direct.
- Treat source expansion as conservative and diagnostics-first.
- Keep any future help assistant constrained to platform help only.
- Update docs when behavior or contracts change.
- Avoid speculative architecture in code and docs.
