# MVP Scope

## Primary Objective

Ship a usable AI-assisted job discovery platform as quickly as possible.

---

# V1 Features

## Included

### User Preferences
Users can configure:
- preferred roles
- keywords
- remote/hybrid preference
- location preference
- optional salary preference

---

### Job Ingestion
System can:
- fetch jobs from at least one source
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

### AI Ranking
System should:
- rank jobs by relevance
- generate simple match reasoning
- prioritize user-aligned opportunities

---

### Dashboard UI
Users can:
- browse ranked jobs
- view job summaries
- open original job links

---

### Deployment
Application should:
- deploy successfully on Cloudflare
- function as a PWA
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
- browser automation farms
- Kubernetes/distributed systems

---

# Success Criteria

The MVP is considered successful if:

- jobs can be ingested reliably
- AI ranking improves relevance
- dashboard is usable
- deployment is stable
- users save time searching jobs