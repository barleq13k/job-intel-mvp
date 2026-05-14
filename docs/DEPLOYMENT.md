# Deployment

This MVP deploys as two small Cloudflare projects:

- Frontend: Cloudflare Pages serving the Vite build from `frontend/dist`.
- Backend: Cloudflare Worker serving `POST /api/jobs/search`, `POST /api/jobs/evaluate`, and optional `POST /api/jobs/explain`.

Do not deploy from this document automatically. Create Cloudflare projects and run deploy commands manually when ready.

## Local Development

From `worker/`:

```powershell
npm install
npm run dev
```

From `frontend/` in another terminal:

```powershell
npm install
npm run dev
```

Local frontend requests use `/api/jobs/search`, `/api/jobs/evaluate`, and `/api/jobs/explain`. Vite proxies `/api` to `http://127.0.0.1:8787` by default.

Optional local override:

```powershell
$env:VITE_DEV_API_PROXY_TARGET="http://127.0.0.1:8787"
npm run dev
```

## Frontend Configuration

The frontend uses one optional build-time environment variable:

```text
VITE_API_BASE_URL=
```

Leave `VITE_API_BASE_URL` empty when the deployed Pages site can reach the Worker through the same origin or a Cloudflare route that preserves `/api` routes.

Set `VITE_API_BASE_URL` to the deployed Worker origin when the Pages site calls a separate Worker domain:

```text
VITE_API_BASE_URL=https://job-intel-worker.<account>.workers.dev
```

Do not include a trailing slash. Do not include `/api` in this value.

## Cloudflare Pages

Create a Pages project for `frontend/`.

Recommended settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: set `VITE_API_BASE_URL` only if the Worker is on a different origin

Local build check:

```powershell
cd frontend
npm run build
```

## Cloudflare Worker

The active Worker config is `worker/wrangler.jsonc`.

Current Worker settings:

- Name: `job-intel-worker`
- Entry point: `src/index.js`
- Compatibility date: `2026-05-11`
- No bindings or secrets required for `/api/jobs/search` or `/api/jobs/evaluate`
- Optional AI explanation secrets/config are required only when enabling `/api/jobs/explain`

Deploy manually from `worker/`:

```powershell
npm install
npm run deploy
```

Syntax/deploy packaging check without publishing:

```powershell
npm run check
```

## Optional AI Explanation Configuration

`POST /api/jobs/explain` is disabled by default. When disabled or missing configuration, it returns a deterministic fallback explanation with the standard explanation response shape.

Worker environment variables:

```text
AI_EXPLAIN_ENABLED=false
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
AI_EXPLAIN_TIMEOUT_MS=8000
AI_EXPLAIN_RATE_LIMIT_PER_MINUTE=10
AI_EXPLAIN_CACHE_TTL_SECONDS=1800
```

For local testing with AI enabled, create `worker/.dev.vars` locally and do not commit it. `worker/.dev.vars` is ignored by `.gitignore` and should remain local because it may contain secrets.

```text
AI_EXPLAIN_ENABLED=true
GROQ_API_KEY=<groq-api-key>
GROQ_MODEL=llama-3.1-8b-instant
```

Then run `npm run dev` from `worker/`.

For production, configure `GROQ_API_KEY` as a Worker secret and set non-secret explanation variables in Cloudflare Worker environment settings. Do not enable AI explanations unless the deterministic search/scoring behavior is already verified.

Explanation rate protection and cache are best-effort in-memory MVP safeguards. They are useful for basic local/Worker-isolate protection, but they are not persistent, shared globally, or production-grade enforcement.

## API And CORS

The frontend calls:

```text
POST /api/jobs/search
POST /api/jobs/evaluate
POST /api/jobs/explain
```

In local dev, these are proxied by Vite. In production, they resolve against `VITE_API_BASE_URL` when that variable is set, otherwise against the Pages site origin.

The Worker returns JSON for API responses and allows cross-origin `POST` requests with `Content-Type` for the MVP. This keeps a separate Pages domain and Worker domain deployable without auth or cookies.

## Common Pitfalls

- If production API calls hit the Pages domain and return `404`, set `VITE_API_BASE_URL` to the Worker origin in Cloudflare Pages and rebuild.
- If local API calls fail, make sure `npm run dev` is running in `worker/` before starting the frontend.
- If the Worker deploys under the wrong name, confirm commands are running from `worker/` and using `wrangler.jsonc`.
- If Pages shows an old API URL, trigger a new Pages build after changing `VITE_API_BASE_URL`.
- If Remotive or Real Python requests fail, check the Worker logs; those are upstream source fetches, not frontend build issues.
