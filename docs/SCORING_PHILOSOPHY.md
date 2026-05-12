# Scoring Philosophy

## Current Approach

Scoring is rule-based and transparent. The goal is not perfect prediction; the goal is to rank jobs usefully enough for the MVP without AI, embeddings, or persistence.

The Worker returns `scoring.score` from `0` to `100` plus reasons and component scores.

## Scoring Structure

The Worker keeps scoring in one file for MVP simplicity, but the scoring internals are organized around:

- `SCORING_WEIGHTS`: the current point values, penalties, caps, and thresholds.
- `buildScoringContext(job, profile)`: deterministic normalized job/profile text used by scoring evaluators.
- signal evaluators that return points, penalties, status metadata, and candidate human-readable reasons.
- a final reason collector that dedupes and caps `match_reasons` at 4 items.

Public response fields remain stable. `scoring.components` keeps the existing keys:

- `role_match_score`
- `skill_match_score`
- `keyword_match_score`
- `seniority_match_score`
- `execution_likelihood_score`
- `location_workmode_score`
- `penalties`

Calibration should start with `SCORING_WEIGHTS` and preserve deterministic Fake Jobs regression checks when changing score math.

## Signals Used Today

Role relevance:
- Exact phrase matches are strongest.
- Broad single-word roles, such as `Python` or `AI`, are weighted by title context.
- Primary title focus ranks higher than secondary technology mentions.
- Job category is stronger role evidence than description text, but weaker than title.
- Broad target-role matches found only in description text are intentionally light support signals.
- Software/technical profiles get a narrow title/category alignment boost for technical roles.
- Admin, sales, and office roles get a narrow off-domain drag for software/technical profiles unless the user explicitly asks for those domains.

Skill match:
- User skills are matched against title and available details.
- `strongest_skills` add an extra boost only when present in title/details.
- The source may not provide enough detail, so skill scoring stays conservative.

Keyword match:
- Exact phrase matches beat partial overlap.
- Generic terms do not drive high scores alone.
- `remote` only helps when the job text actually supports remote/hybrid/onsite matching.

Location and work mode:
- Work mode and location preference are related but scored separately.
- Remote-friendly jobs receive the remote work-mode boost only when the job appears globally remote-compatible or compatible with the user's location preference.
- Neutral location inputs such as `any`, `anywhere`, `global`, `worldwide`, `remote`, and `no preference` disable strict user-location mismatch penalties.
- If the profile includes a preferred location, exact or alias matches such as `Philippines`/`PH` align with that preference.
- Broad eligibility terms such as `Worldwide`, `Anywhere`, `Remote`, `Global`, `Asia`, `APAC`, `Southeast Asia`, and `SEA` are treated as compatible.
- Jobs restricted to another country or region stay visible but receive a modest location mismatch penalty and explain that the remote role appears outside the preferred location.
- Remote jobs with deterministic restriction phrases such as `United States only`, `US only`, `authorized to work in`, `EU only`, `Canada only`, `hiring in these states`, `work authorization`, or unavailable visa sponsorship are treated as region-restricted and keep explicit restricted-region reasons ahead of generic remote-work reasons.
- Region-restricted remote jobs do not receive the remote-friendly work-mode boost. If the user has a strict conflicting location, they receive a stronger location mismatch penalty and an `Outside preferred location` reason; blank or neutral location profiles still see the restriction reason without the user-location mismatch penalty.

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
  - `adjacent`
  - `stretch`
  - `lower_match`
- This label influences ranking but is still heuristic.
- `stretch` is reserved for concrete gap signals such as seniority mismatch, platform mismatch, architecture/leadership, or other complexity.
- Lower-score but related roles can be labeled `adjacent`; weak or off-domain roles are labeled `lower_match`.
- Description-level task-fit signals provide a small tie-break boost through `execution_likelihood_score`.
- Description-level platform/architecture complexity signals provide a small tie-break drag through `penalties`.
- Automation-oriented reasons require explicit job-side automation evidence such as automation, automated, automate, workflow automation, process automation, scripting, script, Zapier, Make.com, n8n, RPA, robotic process automation, Selenium, Playwright, Puppeteer, API automation, test automation, QA automation, or CI/CD automation. Generic workflow, support, troubleshooting, implementation, operations, product specialist, deployment, customer support, technical support, or software support wording does not produce an automation reason by itself.

Avoid keyword penalties:
- `avoid_keywords` matching title/details apply clear penalties.
- Reasons include `Contains avoided keyword: X`.

Tie-break calibration:
- Simple/task-based description terms can add up to `+6` through `execution_likelihood_score`.
- Platform/architecture complexity description terms can apply up to `-8` through `penalties`.
- These signals are intended to separate similarly matched title results, not replace title, skill, seniority, or avoid-keyword scoring.

Display filtering:
- Backend returns all scored jobs.
- Frontend displays jobs with `score >= 25` as recommended matches.
- Frontend groups lower-score jobs under Explore More so stretch roles remain inspectable.

## Current Limitations

- No AI judgment yet.
- No semantic understanding beyond rules and text matching.
- Real Python jobs have very limited detail.
- Remotive data quality varies by posting.
- Some job descriptions contain broad marketing text that can create weak matches.
- Scoring regression checks use Fake Jobs-style fixtures, not a full production source replay.

## Future AI/Groq Direction

Groq may later be used for:
- reranking top candidates
- summarizing long job descriptions
- explaining fit more naturally
- extracting structured requirements
- comparing role complexity with user profile

AI should build on the current rule-based baseline, not replace the whole MVP flow at once.
