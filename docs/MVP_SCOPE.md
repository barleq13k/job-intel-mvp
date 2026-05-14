# MVP Scope

## Primary Objective

Ship a usable deterministic job discovery platform with optional AI explanation support as quickly as possible.

---

# V1 Features

## Included

### User Preferences
Users can configure:
- preferred roles
- skills
- keywords
- remote/hybrid preference
- location preference
- avoid keywords
- experience level
- job source

---

### Job Ingestion And Manual Evaluation
System can:
- fetch jobs from at least one source
- evaluate a manually pasted listing through the same deterministic scoring pipeline
- ingest structured job data
- normalize jobs
- validate schema consistency

---

### Deduplication
System should:
- reduce duplicate jobs
- prevent duplicate dashboard entries

Simple duplicate logic is acceptable initially.

---

### Relevance Ranking
System currently:
- ranks jobs using deterministic scoring logic
- prioritizes jobs based on user-defined fields
- keeps deterministic scoring/ranking as the source of truth
- keeps category/tag-only evidence from making calibrated broad-role matches Recommended by itself

Optional explanation layer:

AI is disabled by default unless the Worker is explicitly configured with `AI_EXPLAIN_ENABLED=true` and Groq credentials. It is optional, on-demand, non-intrusive, and non-authoritative.

It may:
- summarize job descriptions
- explain deterministic scores in plain language
- compare a job against the user’s stated profile
- clarify why a lower-scored job may be more actionable than a higher-scored one
- identify questions to verify before applying
- improve user understanding of existing scoring signals

It will not:
- change rankings
- assign final scores
- override rule-based restrictions
- hide penalties
- decide eligibility
- replace deterministic scoring
- add chatbot UX or persistent conversation history

---

### Dashboard UI
Users can:
- browse ranked jobs
- view job summaries
- open original job links
- track Saved, Applied, and Skipped status locally in browser localStorage
- switch between Find Jobs and Evaluate Job modes in the existing workflow
- dismiss a compact onboarding intro stored only in localStorage
- request an on-demand `Explain Match` panel for a visible job when the explain endpoint is available

---

### Deployment
Application should:
- deploy successfully on Cloudflare
- support environment variables securely

---

# Explicit Non-Goals

The following are intentionally excluded from V1:

- advanced authentication systems
- team accounts
- billing/payments
- multi-region scaling
- advanced analytics
- embeddings/vector search
- recommendation agents
- autonomous AI workflows
- chatbot UX
- persistent AI conversation history
- browser automation farms
- Kubernetes/distributed systems

---

# Success Criteria

The MVP is considered successful if:

- jobs can be ingested reliably
- deterministic ranking produces useful and explainable results
- users save time identifying realistic opportunities
- dashboard is usable
- deployment is stable
