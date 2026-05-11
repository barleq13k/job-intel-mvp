# System Flow

## High-Level Pipeline

User Preferences
    ↓
Scraper Trigger
    ↓
Job Fetch
    ↓
Normalization
    ↓
Validation
    ↓
Deduplication
    ↓
AI Relevance Scoring
    ↓
Formatting
    ↓
Frontend Dashboard

---

# Detailed Flow

## 1. User Input

The user provides:
- target job titles
- keywords
- remote preferences
- location preferences
- optional exclusions

This becomes the relevance context for scoring.

---

## 2. Ingestion Layer

The ingestion layer:
- fetches jobs from configured sources
- validates minimum required fields
- enforces schema consistency
- passes structured jobs into the pipeline

Primary components:
- ingest.py
- validator.py
- sources/base.py

---

## 3. Normalization

Normalization:
- standardizes text formatting
- cleans inconsistent fields
- prepares jobs for scoring and deduplication

---

## 4. Deduplication

Deduplication:
- removes repeated job entries
- reduces duplicate dashboard clutter

Initial implementation may use:
- title matching
- company matching
- URL matching

---

## 5. AI Relevance Scoring

Scoring evaluates:
- keyword relevance
- role alignment
- remote compatibility
- user preference alignment

Future AI integration may include:
- semantic relevance scoring
- summarization
- explanation generation

---

## 6. Formatting

Formatting prepares:
- frontend-ready job objects
- consistent response structure
- ranking metadata

---

## 7. Frontend Dashboard

Frontend displays:
- ranked jobs
- match scores
- match reasoning
- outbound links