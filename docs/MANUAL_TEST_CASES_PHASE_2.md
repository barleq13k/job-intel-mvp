# Manual Test Cases — Phase 2 Scoring Hardening

Purpose:
Verify scoring output quality manually without relying only on Codex checks.

Run these after scoring changes:
- frontend build
- worker check
- scoring regression script
- manual Worker route checks

---

## 1. API Shape Stability

### Input
POST /api/jobs/search with a valid profile and source.

### Expected
Response should include:
- jobs array
- each job has id
- title
- company
- location
- source
- url
- scoring.score
- scoring.match_reasons
- scoring.execution_likelihood
- scoring.components

### Pass if
No frontend/API contract fields disappear.

---

## 2. Fake Jobs Source Still Works

### Input
Use source: fake

### Expected
Fake jobs return successfully.

### Pass if
- fake source still returns jobs
- no runtime errors
- results are deterministic between repeated runs

---

## 3. Same Input, Same Ranking

### Input
Run the same profile twice:

```json
{
  "profile": {
    "target_roles": ["QA Tester", "Python Automation"],
    "keywords": ["python", "automation", "qa"],
    "avoid_keywords": ["senior", "devops"],
    "location": "remote"
  },
  "source": "fake"
}