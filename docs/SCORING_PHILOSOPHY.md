# Scoring Philosophy

## Current Approach

Scoring is rule-based and transparent. The goal is not perfect prediction; the goal is to rank jobs usefully enough for the MVP without AI, embeddings, or persistence.

The Worker returns `scoring.score` from `0` to `100` plus reasons and component scores.

## Signals Used Today

Role relevance:
- Exact phrase matches are strongest.
- Broad single-word roles, such as `Python` or `AI`, are weighted by title context.
- Primary title focus ranks higher than secondary technology mentions.

Skill match:
- User skills are matched against title and available details.
- `strongest_skills` add an extra boost only when present in title/details.
- The source may not provide enough detail, so skill scoring stays conservative.

Keyword match:
- Exact phrase matches beat partial overlap.
- Generic terms do not drive high scores alone.
- `remote` only helps when the job text actually supports remote/hybrid/onsite matching.

Seniority fit:
- Junior/beginner profiles get boosts for junior, entry-level, assistant, intern, trainee, and similar terms.
- Senior profiles get boosts for senior/staff/lead/principal terms.
- Mismatched seniority creates penalties.

Complexity penalties:
- Complexity-heavy terms can lower score when not requested:
  - senior
  - staff
  - principal
  - lead
  - architect
  - engineer
  - manager
  - backend/back-end
  - 5 years / 8 years
  - enterprise
  - architecture

Execution likelihood:
- Separate label returned as `execution_likelihood`.
- Current labels:
  - `strong_fit`
  - `possible_fit`
  - `stretch`
  - `poor_fit`
- This label influences ranking but is still heuristic.

Avoid keyword penalties:
- `avoid_keywords` matching title/details apply clear penalties.
- Reasons include `Contains avoided keyword: X`.

Display filtering:
- Backend returns all scored jobs.
- Frontend displays only jobs with `score >= 25`.

## Current Limitations

- No AI judgment yet.
- No semantic understanding beyond rules and text matching.
- Real Python jobs have very limited detail.
- Remotive data quality varies by posting.
- Some job descriptions contain broad marketing text that can create weak matches.

## Future AI/Groq Direction

Groq may later be used for:
- reranking top candidates
- summarizing long job descriptions
- explaining fit more naturally
- extracting structured requirements
- comparing role complexity with user profile

AI should build on the current rule-based baseline, not replace the whole MVP flow at once.
