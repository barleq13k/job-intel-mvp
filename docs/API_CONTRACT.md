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
- Himalayas outbound job URLs are preserved from `applicationLink` when provided so users can reach the source/application page.
- Backend returns all jobs sorted by score.
- Frontend shows jobs with score `25` or higher as recommended matches and groups lower-score jobs under Explore More.
- `scoring.execution_likelihood` values are `strong_fit`, `possible_fit`, `adjacent`, `stretch`, or `lower_match`.
