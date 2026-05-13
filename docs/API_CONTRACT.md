# API Contract

## `POST /api/jobs/search`

Searches the selected source, normalizes jobs, scores them against the user profile, and returns frontend-ready job objects.

## Request

```json
{
  "profile": {
    "target_roles": ["Python"],
    "skills": ["script"],
    "keywords": ["remote", "entry level"],
    "location": "Philippines",
    "work_mode": "any",
    "experience_level": "junior",
    "avoid_keywords": ["senior", "manager"]
  },
  "source": {
    "type": "remotive"
  }
}
```

## Profile Fields

- `target_roles`: array of role or role-skill strings.
- `skills`: array of relevant skill strings.
- `keywords`: array of extra search and ranking keywords.
- `location`: preferred location text.
- `work_mode`: `any`, `remote`, `hybrid`, or `onsite`.
- `experience_level`: `beginner`, `junior`, `intermediate`, `senior`, or `any`.
- `avoid_keywords`: array of terms that should penalize matching jobs.
- `strongest_skills`: legacy optional array still accepted for compatibility, but no longer sent by the frontend form.

Missing optional fields are treated as empty/default values.

Comma-separated frontend inputs preserve spaces inside each value. For example, `java script, css, node` is parsed as `["javascript", "css", "node"]`, not split on spaces.

Common technology aliases are normalized in frontend parsing and backend profile normalization:

- `java script` -> `javascript`
- `node js` -> `node.js`
- `nodejs` -> `node.js`
- `react js` -> `react`
- `type script` -> `typescript`

## Source Fields

Supported `source.type` values:

- `realpython_fake_jobs`
- `remotive`
- `himalayas`

Unsupported source types return `400`.

## Source Error Response

Source fetch, timeout, invalid JSON, or invalid source-shape failures return `502` with the existing `error` field and additive source diagnostics:

```json
{
  "error": "Remotive request timed out after 8000ms.",
  "source": {
    "type": "remotive",
    "name": "Remotive",
    "status": "error",
    "message": "Remotive request timed out after 8000ms.",
    "dropped_count": 0
  }
}
```

## Response

```json
{
  "jobs": [
    {
      "id": "remotive_12345",
      "title": "Python Programmer (Entry-Level)",
      "company": "Example Corp",
      "location": "Remote",
      "employment_type": null,
      "salary": "$40k - $60k",
      "source": "Remotive",
      "url": "https://example.com/job",
      "normalized": {
        "title": "python programmer entry level",
        "company": "example corp"
      },
      "scoring": {
        "score": 82,
        "match_reasons": [
          "Python is the primary title focus",
          "Entry-level role matches your preference"
        ],
        "execution_likelihood": "possible_fit",
        "components": {
          "role_match_score": 49,
          "skill_match_score": 8,
          "keyword_match_score": 16,
          "seniority_match_score": 18,
          "execution_likelihood_score": 4,
          "location_workmode_score": 0,
          "penalties": -13
        }
      },
      "summary": "Short readable summary.",
      "details": [
        "Short bullet extracted from description",
        "Another short bullet"
      ],
      "metadata": {
        "ingested_at": "2026-05-12T12:00:00Z",
        "source_type": "api",
        "source_job_id": "12345"
      }
    }
  ],
  "count": 1,
  "source": {
    "type": "remotive",
    "name": "Remotive",
    "status": "ok",
    "message": "Remotive returned 1 jobs.",
    "dropped_count": 0
  }
}
```

## Notes

- `id` is a stable deterministic string derived from the source job ID when available, otherwise from normalized title, company, and canonical URL. It is no longer based on display rank.
- `salary` is `null` when unavailable.
- `details` contains 2-4 simple description bullets when possible.
- `metadata.source_type` is currently `api` for Remotive and Himalayas, and `scraper` for Real Python.
- `metadata.source_job_id` is populated when a source provides a stable upstream ID, otherwise `null`.
- `source.status`, `source.message`, and `source.dropped_count` are additive diagnostics. `dropped_count` counts malformed upstream rows skipped during source normalization.
- `source.message` may include source-specific context such as Himalayas page count, later-page partial fetch warnings, or Remotive public API batch wording. The response shape is unchanged.
- Himalayas outbound job URLs are preserved from `applicationLink` when provided so users can reach the source/application page.
- Himalayas uses a small, conservative public API page cap; Remotive uses its public API batch behavior without login or browser workarounds; Real Python Fake Jobs is a fake/static regression and fallback source.
- Backend returns all jobs sorted by score.
- Frontend shows jobs with score `25` or higher as recommended matches and groups lower-score jobs under Explore More.
- `scoring.execution_likelihood` values are `strong_fit`, `possible_fit`, `adjacent`, `stretch`, or `lower_match`.

---

## `POST /api/jobs/explain`

Explains one already-scored frontend job object against the current profile/search context.

This endpoint is on-demand only. It does not fetch jobs, rescore jobs, change rankings, mutate job objects, or modify `/api/jobs/search` behavior.

AI explanations are disabled by default unless `AI_EXPLAIN_ENABLED=true` and `GROQ_API_KEY` are configured. Disabled, missing-config, timeout, upstream-failure, invalid-model-output, and fallback responses all use the same successful response shape. Explanation output is optional, on-demand, non-authoritative, and limited to interpreting score tradeoffs; deterministic scoring and ranking remain the source of truth.

## Explain Request

```json
{
  "profile": {
    "target_roles": ["Python Automation"],
    "skills": ["Python", "Playwright"],
    "keywords": ["remote", "junior"],
    "avoid_keywords": ["senior", "manager"],
    "location": "Philippines",
    "work_mode": "remote",
    "experience_level": "junior"
  },
  "job": {
    "id": "himalayas_abc123",
    "title": "Junior QA Automation Specialist",
    "company": "Example Co",
    "location": "Remote",
    "source": "Himalayas",
    "url": "https://example.com/job",
    "salary": null,
    "summary": "Short readable summary.",
    "details": ["Short bullet extracted from description"],
    "scoring": {
      "score": 72,
      "match_reasons": ["Remote-friendly workflow"],
      "execution_likelihood": "possible_fit",
      "components": {
        "role_match_score": 20,
        "skill_match_score": 18,
        "keyword_match_score": 8,
        "seniority_match_score": 10,
        "execution_likelihood_score": 6,
        "location_workmode_score": 13,
        "penalties": -3
      }
    }
  }
}
```

## Explain Response

```json
{
  "explanation": {
    "summary": "This job has a deterministic match score of 72. Helpful role and remote-work signals lifted the score, while remaining verification items keep it from being an eligibility decision.",
    "strengths": ["Remote-friendly workflow"],
    "concerns": ["Penalties reduced the score by 3 points."],
    "verify_before_applying": ["Open the source posting and confirm the responsibilities, required skills, and application requirements."],
    "decision_support": "Use this as context for the existing deterministic score. It does not change the rank, override restrictions, or decide eligibility."
  },
  "cached": false
}
```

## Explain Error Responses

- Invalid JSON or invalid request shape returns `400` with `{ "error": "..." }`.
- Rate-limited requests return `429` with `{ "error": "..." }` and `Retry-After`.
- AI disabled, missing AI config, AI timeout, AI upstream failure, and invalid AI JSON/shape return `200` with the standard explanation response shape.

## Explain Notes

- The endpoint accepts one job that was already scored by `/api/jobs/search`.
- The endpoint does not call source APIs.
- The endpoint does not call the deterministic scoring engine.
- The endpoint does not return changed scores, changed reasons, or changed ranks.
- The endpoint explains what helped and what limited the existing score; it does not replace the visible reasons or deterministic decision support.
- Responses are validated before returning to avoid leaking raw model output.
- Successful AI-generated explanations may be cached briefly in Worker memory.
- Explanation cache and rate protection are best-effort, in-memory MVP safeguards. They are not persistent cache or global production-grade rate limiting.
