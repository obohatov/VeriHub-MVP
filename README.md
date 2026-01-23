# VeriHub Civic — LLM Audit & Drift Dashboard (MVP)

VeriHub Civic is a public-information integrity layer for the age of LLMs.  
This MVP helps public-facing organizations audit what an LLM answers about civic services in **FR/NL**, detect **incorrect / outdated / ungrounded / FR↔NL drift** issues, and demonstrate measurable **before/after** improvements.

> Repository: `verihub-mvp`  
> Current stack: **React + Vite + TypeScript** (client) + **Express + TypeScript** (server).  
> Current storage: **in-memory** (seeded on server start).

---

## Why this matters

LLM answers scale. A single outdated link, wrong phone number, missing deadline, or inconsistent FR/NL instruction can propagate across thousands of interactions and cause real-world harm: missed deadlines, incorrect submissions, extra helpdesk load, and loss of trust.

VeriHub Civic turns “AI said something wrong” into a measurable operational loop:
1) Run recurring audits with realistic question sets (per language)
2) Produce an actionable issue map
3) Fix verified facts / sources
4) Re-run the audit and measure before/after

---

## Core features (MVP)

### Facts & Sources Hub
- CRUD for verified facts (FR/NL)
- Fields: `key`, `lang`, `value`, `sourceRef`, `lastVerified`, `linkedFactId`, `topic`
- Search and filtering

### Question Sets
- Question sets in FR/NL with topics + risk tags
- Each question references expected fact keys (for grounding checks)

### Audit Runs
- Create audit runs from a question set
- Mock LLM provider returns deterministic answers
- System scores each answer and generates findings

### Findings types
- **incorrect**: answer contradicts verified fact value(s)
- **outdated**: fact is stale (based on `lastVerified` threshold)
- **ungrounded**: answer has no citations and does not match verified facts
- **drift**: FR and NL answers disagree for key fields (e.g., hours/link/phone)

### Before/After comparison
- Compare two audit runs (baseline vs improved)
- See resolved vs new findings and change by finding type

---

## Project Structure

```text
.
├── client/
│   ├── public/
│   │   └── data/sources/      # Verified markdown sources
│   └── src/                   # React UI
└── server/
    ├── services/              # Audit runner, scoring, drift, mock LLM provider
    └── routes.ts              # API endpoints
---
```
## Getting started (local dev)
```
```
### Prerequisites
- Node.js 20+

### Run in dev mode
```
```

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server and client:**
```bash
npm run dev
```
> App runs on: [http://localhost:5000](http://localhost:5000)

3. **Run quality checks:**
```bash
npm run check
```

---

## Data packs (artifacts)

This repo includes file-based artifacts for reproducible demos and future DB seeding:

- `data/question_sets/question_set_demoville_fr_nl_v2.json` — FR/NL realistic journeys  
- `data/facts/facts_seed_v2.json` — verified facts with freshness (`last_verified`)  
- `data/mock/mock_llm_answers_baseline.json` — baseline answers (intentionally contains issues)  
- `data/mock/mock_llm_answers_after.json` — improved answers (for before/after)  
- `data/scoring_rules.yaml` — scoring configuration  

**Verified sources (human-readable and linkable):**
- `client/public/data/sources/*.md` — accessible at `/data/sources/...`

> **Note:** The current server still seeds data from `server/storage.ts`.  
> Next step is to load seeds from `/data/*.json` and use baseline/after mock files directly.

---

## API endpoints (current)

```text
GET    /api/dashboard/metrics
GET    /api/facts
GET    /api/facts/search?q=...
GET    /api/facts/:id
POST   /api/facts
PUT    /api/facts/:id
DELETE /api/facts/:id
GET    /api/question-sets
GET    /api/questions
GET    /api/audit-runs
POST   /api/audit-runs
GET    /api/audit-runs/:id
GET    /api/audit-runs/:id/findings
GET    /api/findings
GET    /api/comparison/:baselineId/:currentId
```

---

## 3-minute demo script (quick)

1. **Dashboard**: show latest metrics and overview of findings.  
2. **Question Sets**: show FR/NL pairs and risk tags.  
3. **Audit Runs**: start a new run (baseline).  
4. **Findings**: filter by type (incorrect / ungrounded / drift) and open 1–2 findings.  
5. **Facts Hub**: open a fact and click `sourceRef` (opens `/data/sources/...`).  
6. **Run again (after)**: show comparison page (resolved findings, counts drop).  
7. **Close**: “This is regression testing for public information in the AI era.”

Full script: see `docs/demo_script_3min.md`.

---

## Roadmap

- [ ] Load seeds from `/data/*.json` (facts, questions, mock answers)
- [ ] Export and commit static OpenAPI (`openapi.yaml`)
- [ ] Add unit + integration tests
- [ ] Add Docker + docker-compose
- [ ] Add GitHub Actions CI (lint/typecheck/tests)

---

## License

MIT