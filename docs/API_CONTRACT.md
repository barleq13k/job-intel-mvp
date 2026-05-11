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
    "avoid_keywords": ["senior", "manager"],
    "strongest_skills": ["workflow"]
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
- `strongest_skills`: array of high-confidence skills that should boost only when found.

Missing optional fields are treated as empty/default values.

## Source Fields

Supported `source.type` values:

- `realpython_fake_jobs`
- `remotive`

Unsupported source types return `400`.

## Response

```json
{
  "jobs": [
    {
      "id": "job_001",
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
        "source_type": "api"
      }
    }
  ],
  "count": 1,
  "source": {
    "type": "remotive",
    "name": "Remotive"
  }
}
```

## Notes

- `salary` is `null` when unavailable.
- `details` contains 2-4 simple description bullets when possible.
- `metadata.source_type` is currently `api` for Remotive and `scraper` for Real Python.
- Backend returns all jobs sorted by score.
- Frontend hides jobs below score `25`.
