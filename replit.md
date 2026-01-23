# VeriHub Civic — LLM Audit & Drift Dashboard

## Overview
VeriHub Civic is a full-stack dashboard that helps public-facing organizations measure what LLMs say about key civic services in French (FR) and Dutch (NL). The application detects issues such as incorrect information, outdated content, ungrounded claims, and FR↔NL drift, and shows measurable "before/after" improvement after updating a verified Facts & Sources Hub.

## Current State
Production-ready MVP with:
- Dashboard with audit metrics and findings overview
- Facts Hub with CRUD operations for verified facts
- Question Sets viewer with expandable questions
- Audit Runs with Mock LLM Provider (mock-baseline, mock-after)
- Findings detection (incorrect, outdated, ungrounded, drift)
- Before/After comparison view
- SQLite database with seeding from JSON artifacts
- OpenAPI 3.1 specification with CI validation
- Unit, integration, and frontend tests
- MCP tool server (search_facts, list_findings)
- Docker containerization
- GitHub Actions CI/CD

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: SQLite (dev) / PostgreSQL (production) with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Testing**: Vitest

## Project Structure
```
/client
  /src
    /components      # Reusable UI components
    /pages           # Page components
    /lib             # Utilities and types
  /public/data/sources  # Verified source markdown files
/server
  /db                # Database schema, connection, migrations
  /loaders           # Artifact loaders (JSON/YAML)
  /mcp               # MCP tool server (search_facts, list_findings)
  /services          # Business logic (audit runner, scoring, drift detection, mock LLM)
  /tests             # Unit and integration tests
    /unit
    /integration
  routes.ts          # API endpoints
  storage.ts         # Storage interface
/shared
  schema.ts          # Shared TypeScript types and Zod schemas
/data
  /facts             # facts_seed_v2.json
  /mock              # mock_llm_answers_baseline.json, mock_llm_answers_after.json
  /question_sets     # question_set_demoville_fr_nl_v2.json
  scoring_rules.yaml # Scoring configuration
```

## Key Features

### 1. Facts Hub
- CRUD operations for verified facts
- Fields: key, lang (fr/nl), value, sourceRef, lastVerified, linkedFactId, topic
- FR/NL pair linking
- Search and filter by language

### 2. Question Sets
- Pre-seeded question set: "DemoVille — Residence service audit (FR/NL) v2"
- 26 questions (13 FR, 13 NL) across topics
- Risk tags: deadline, eligibility, location, contact, documents, fees, hours, general

### 3. Audit Runs
- Create new audit runs with question set selection
- Provider modes: mock-baseline, mock-after, openai
- Automatic scoring and finding generation
- Status tracking: pending → running → completed/failed

### 4. Findings Detection
- **Incorrect**: Answer contradicts verified fact values
- **Outdated**: Fact verification date exceeds stale threshold (180 days)
- **Ungrounded**: Answer lacks citations and doesn't match facts
- **Drift**: FR and NL answers have inconsistent values for key fields

### 5. Before/After Comparison
- Compare two completed audit runs
- See resolved vs new findings
- Track improvements by finding type

## API Endpoints
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/facts` - List all facts
- `GET /api/facts/search?q=query` - Search facts
- `POST /api/facts` - Create fact
- `PUT /api/facts/:id` - Update fact
- `DELETE /api/facts/:id` - Delete fact
- `GET /api/question-sets` - List question sets
- `GET /api/questions` - List all questions
- `GET /api/audit-runs` - List audit runs
- `POST /api/audit-runs` - Create audit run (body: { questionSetId, provider })
- `GET /api/audit-runs/:id` - Get audit run
- `GET /api/audit-runs/:id/findings` - Get findings for run
- `GET /api/findings` - Get all findings
- `GET /api/comparison/:baselineId/:currentId` - Compare two runs

## Seed Data
On startup, the application seeds from /data artifacts:
- 28 facts (14 FR/NL linked pairs)
- 1 question set with 26 questions

## Environment Variables
- `PORT` - Server port (default: 5000)
- `DB_MODE` - sqlite or postgres (default: sqlite)
- `DATABASE_URL` - PostgreSQL connection URL
- `OPENAI_API_KEY` - For OpenAI provider (optional)

## Running Tests
```bash
# All tests
npx vitest run

# Unit tests only
npx vitest run server/tests/unit

# Integration tests only
npx vitest run server/tests/integration
```

## Docker
```bash
docker compose up --build
```

## OpenAPI
The OpenAPI specification is at `openapi.yaml`.

## How MCP Could Fit
Model Context Protocol (MCP) could enhance this application by exposing tools:
1. **search_facts(query, lang)** - Search verified facts
2. **list_findings(run_id, type?, severity_min?)** - List findings with filters
3. **create_audit_run(question_set_id, provider)** - Trigger new audits
4. **get_comparison(baseline_id, current_id)** - Get comparison data

## Design System
- Professional civic blue theme
- Light and dark mode support
- Consistent spacing and typography
- Accessible color contrast
- Responsive design
