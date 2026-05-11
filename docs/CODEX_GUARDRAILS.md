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
- Do not add Groq until explicitly requested.
- Do not redesign stable APIs.
- Do not split the Worker into a large framework.
- Do not overabstract source integrations.
- Do not introduce broad dependency changes for small fixes.

## Preferred Workflow

- Use narrow, scoped prompts.
- Make minimal diffs.
- Preserve the current `POST /api/jobs/search` contract.
- Keep `frontend/` as the Vite React app.
- Keep `worker/` as the Cloudflare Worker API.
- Keep `data/` for sample/reference data.
- Prefer explicit functions over framework-like abstractions.
- Preserve working local dev.
- Run frontend build and Worker syntax checks after meaningful changes.

## Change Style

- Add only what the current task needs.
- Keep scoring transparent and rule-based until AI integration is requested.
- Keep source integrations simple and direct.
- Update docs when behavior or contracts change.
- Avoid speculative architecture in code and docs.
