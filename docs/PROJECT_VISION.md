# Project Vision

## Project Name

Job Intel

---

# Purpose

This project is a fast-shipping validation-stage build focused on helping users discover realistic and relevant remote job opportunities more efficiently through structured ingestion, normalization, transparent scoring, and actionable ranking.

The primary problem being solved is:

"Users waste significant time manually searching through large volumes of noisy, misleading, low-fit, or geographically restricted remote job postings."

The platform aims to reduce noise, surface actionable opportunities faster, and help users make clearer application decisions.

---

# Product Philosophy

This project prioritizes:

- transparent ranking
- fast iteration
- practical workflows
- trustworthy recommendations
- simplicity
- maintainability
- rapid validation
- low-friction deployment

This is NOT an enterprise-scale AI recruiting platform.

The goal is to ship a useful and understandable product quickly while maintaining reasonable engineering discipline and user trust.

---

# Core User Flow

1. User enters job preferences
2. System fetches jobs from selected sources
3. Jobs are normalized and validated
4. Duplicate jobs are removed
5. Deterministic scoring ranks jobs using transparent rules
6. Jobs are grouped into actionable recommendation states
7. User reviews, saves, skips, or applies to jobs

---

# Scoring Philosophy

The platform uses deterministic, rule-based scoring as the source of truth.

The scoring system evaluates:
- role relevance
- skill alignment
- location compatibility
- work-mode compatibility
- seniority fit
- execution likelihood
- complexity signals
- avoid-keyword penalties
- restriction signals

The system intentionally prioritizes:
- explainability
- user trust
- actionable filtering
- stable ranking behavior

The goal is not perfect prediction.
The goal is useful prioritization and reduced search fatigue.

---

# Future AI Layer

AI is optional and non-intrusive.

AI may later be used to:
- summarize job descriptions
- explain deterministic scores in plain language
- clarify why certain jobs are ranked higher or lower
- compare jobs against the user's stated profile
- extract structured requirements
- improve usability and interpretation

AI will NOT:
- replace deterministic scoring
- rerank jobs
- assign final scores
- override restrictions or penalties
- decide eligibility

The deterministic ranking engine remains the source of truth.

---

# Initial MVP Goals

The MVP currently focuses on:

- public-source job ingestion
- user preference input
- deterministic relevance scoring
- actionable recommendation grouping
- restriction-aware remote-job filtering
- local-only saved/applied tracking
- Cloudflare deployment
- PWA support
- lightweight frontend UX

---

# Non-Goals (V1)

The following are intentionally excluded from V1:

- enterprise scalability
- autonomous AI agents
- AI-generated rankings
- embeddings/vector search
- browser automation farms
- distributed systems
- advanced orchestration
- payment systems
- advanced authentication
- multi-tenant infrastructure
- background processing systems
- recommendation agents
- database-heavy architecture

---

# Deployment Direction

Current stack:

Frontend:
- React
- Vite
- Tailwind CSS
- PWA support

Backend:
- Cloudflare Workers

Deployment:
- Cloudflare Pages
- Cloudflare Workers

Persistence:
- browser localStorage only

No database is currently required for MVP operation.

---

# Engineering Philosophy

Prefer:
- explicit code
- readable architecture
- deterministic behavior
- transparent scoring
- low deployment friction
- maintainable systems
- narrow scoped changes
- practical UX improvements

Avoid:
- premature abstraction
- AI hype architecture
- unnecessary infrastructure complexity
- speculative scaling
- unnecessary microservices
- opaque recommendation systems
- overengineering before validation

---

# Current Product Direction

The current product direction is:

"Calm remote-job decision support."

The platform is designed to help users:
- reduce search fatigue
- identify realistic opportunities faster
- understand why jobs are recommended
- avoid misleading remote-job listings
- maintain visibility into scoring and restrictions

The product intentionally favors clarity and trust over black-box automation.
