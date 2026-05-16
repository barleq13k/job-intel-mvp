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

The frontend may also offer a sample profile to help first-time users populate these existing fields.

Planned Phase 2.2 onboarding/help should explain how these fields drive the workflow and scoring, rather than only listing available controls. This should remain frontend-first unless a later implementation proposal explicitly justifies backend changes.

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
- compare a job against the user's stated profile
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
- view source descriptions and lightweight score interpretation guidance
- see compact eligibility/restriction status when existing match reasons already include location, country, or eligibility text
- see that Saved, Applied, and Skipped are stored in the current browser only
- request an on-demand `Explain Match` panel for a visible job when the explain endpoint is available; the frontend presents it as scoring-based support text

---

The dashboard clarity features above are frontend-only. They do not change scoring, ranking, filtering, Worker logic, API contracts, localStorage storage behavior, or AI authority.

Planned UX discoverability work:
- Reopen onboarding/help after dismissal.
- Make collapsed filters easier to notice with clearer copy, accent treatment, and subtle open/close affordance.
- Explain the actual workflow: configure profile, choose a source, search or evaluate a pasted listing, inspect reasons and restrictions, then save/apply/skip locally.
- Explain scores in plain language as deterministic decision-support based on profile fields, job text, execution fit, restrictions, avoid keywords, and complexity.

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
- broad web aggregation
- Kubernetes/distributed systems

The following may be explored later but are not current MVP implementation scope:
- conservative source expansion through reliable public APIs or stable public feeds
- aggregated web search or broad web discovery as a future experimental/premium layer only
- a constrained platform-help assistant that answers Job Intel usage and scoring questions only

---

# Success Criteria

The MVP is considered successful if:

- jobs can be ingested reliably
- deterministic ranking produces useful and explainable results
- users save time identifying realistic opportunities
- dashboard is usable
- deployment is stable
