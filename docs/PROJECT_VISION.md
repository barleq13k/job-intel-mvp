# Project Vision

## Project Name
AI-Powered Job Intelligence Platform

---

# Purpose

This project is a fast-shipping MVP focused on helping users discover relevant job opportunities more efficiently through automated scraping, filtering, normalization, and AI-assisted ranking.

The primary problem being solved is:

"Users waste significant time manually searching through large volumes of irrelevant job postings."

The platform aims to reduce noise and surface high-relevance opportunities quickly.

---

# Product Philosophy

This project prioritizes:

- fast iteration
- usable workflows
- practical deployment
- simplicity
- maintainability
- rapid validation

This is NOT an enterprise-scale architecture project.

The goal is to ship a working product quickly while maintaining reasonable engineering discipline.

---

# Core User Flow

1. User enters job preferences
2. System fetches jobs from configured sources
3. Jobs are normalized and validated
4. Duplicate jobs are removed
5. AI scoring ranks jobs by relevance
6. Ranked jobs are displayed in the UI dashboard

---

# AI Layer Purpose

AI is used to:
- improve job relevance scoring
- summarize job postings
- explain match reasoning
- reduce irrelevant results

AI is NOT the entire product.

The core product value is intelligent filtering and ranking.

---

# Initial MVP Goals

The MVP should support:

- single-source ingestion
- user preference input
- AI relevance scoring
- ranked job dashboard
- Cloudflare deployment
- PWA support

---

# Non-Goals (V1)

The following are explicitly NOT part of V1:

- enterprise scalability
- advanced orchestration
- distributed systems
- vector databases
- browser automation scaling
- payment systems
- advanced auth systems
- multi-tenant architecture
- real-time streaming infrastructure

---

# Deployment Direction

Preferred deployment stack:

Frontend:
- React
- Next.js or Vite
- Tailwind
- PWA support

Backend:
- FastAPI or Cloudflare Workers

AI:
- Groq API

Deployment:
- Cloudflare Pages
- Cloudflare Workers

Database:
- Supabase or Cloudflare D1

---

# Engineering Philosophy

Prefer:
- explicit code
- readable architecture
- simple interfaces
- low deployment friction
- maintainable systems

Avoid:
- premature abstraction
- overengineering
- unnecessary microservices
- unnecessary infrastructure complexity