# VeriHub Civic — LLM Audit & Drift Dashboard

A full-stack dashboard that helps public-facing organizations measure what LLMs say about key civic services in French (FR) and Dutch (NL). The application detects issues such as incorrect information, outdated content, ungrounded claims, and FR↔NL drift, and shows measurable "before/after" improvement after updating a verified Facts & Sources Hub.

## Why this matters

LLM answers scale. A single outdated link, wrong phone number, missing deadline, or inconsistent FR/NL instruction can propagate across thousands of interactions and cause real-world harm: missed deadlines, incorrect submissions, extra helpdesk load, and loss of trust.

VeriHub Civic turns "AI said something wrong" into a measurable operational loop:
1. Run recurring audits with realistic question sets (per language)
2. Produce an actionable issue map
3. Fix verified facts / sources
4. Re-run the audit and measure before/after

## Features

- **Dashboard**: Overview with metrics, finding counts by type/severity/language
- **Facts Hub**: CRUD operations for verified facts with FR/NL pairs
- **Question Sets**: Pre-defined question sets for auditing LLM responses
- **Audit Runs**: Execute audits with different LLM providers (mock-baseline, mock-after, openai)
- **Findings Detection**: Automatic detection of incorrect, outdated, ungrounded, and drift issues
- **Before/After Comparison**: Compare two audit runs to see improvements

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at http://localhost:5000

### Running Tests

```bash
# Run all tests
npx vitest run

# Run unit tests only
npx vitest run server/tests/unit

# Run integration tests only
npx vitest run server/tests/integration

# Watch mode
npx vitest
```

### Docker Deployment

```bash
# Build and run with docker-compose
docker compose up --build

# Access the application at http://localhost
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/data/sources # Verified markdown sources
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       └── lib/            # Utilities and types
├── server/                 # Backend Express application
│   ├── db/                 # Database schema and connection
│   ├── loaders/            # Artifact loaders (JSON/YAML)
│   ├── services/           # Business logic
│   └── tests/              # Unit and integration tests
│       ├── unit/
│       └── integration/
├── shared/                 # Shared TypeScript types
├── data/                   # Data artifacts
│   ├── facts/              # Facts seed data
│   ├── mock/               # Mock LLM answers
│   ├── question_sets/      # Question set definitions
│   └── scoring_rules.yaml  # Scoring configuration
├── openapi.yaml            # OpenAPI 3.1 specification
└── docs/                   # Documentation
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_MODE` | Database mode (`sqlite` or `postgres`) | `sqlite` |
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - |

## API Documentation

OpenAPI specification is available at `openapi.yaml`.

### Key Endpoints

- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/facts` - List all facts
- `POST /api/facts` - Create a fact
- `GET /api/question-sets` - List question sets
- `GET /api/audit-runs` - List audit runs
- `POST /api/audit-runs` - Create audit run
- `GET /api/audit-runs/:id/findings` - Get findings for run
- `GET /api/comparison/:baselineId/:currentId` - Compare two runs

## Data Artifacts

### Facts Seed (`data/facts/facts_seed_v2.json`)
28 facts with FR/NL pairs covering:
- Appointment links
- Contact information (phone, email, address)
- Opening hours
- Deadline days
- Fees and payment methods
- Required documents

### Question Set (`data/question_sets/question_set_demoville_fr_nl_v2.json`)
26 questions (13 FR, 13 NL) covering various civic service topics.

### Mock LLM Answers
- `mock_llm_answers_baseline.json` - Initial answers with issues
- `mock_llm_answers_after.json` - Improved answers after fact updates

### Scoring Rules (`data/scoring_rules.yaml`)
Configuration for:
- Risk weights by category
- Outdated detection threshold (180 days)
- Citation markers for grounded checks
- Drift detection patterns

## LLM Providers

### mock-baseline
Returns pre-defined answers with intentional issues (incorrect values, missing citations, etc.)

### mock-after
Returns improved answers that match verified facts better.

### openai (not implemented)
Placeholder for real OpenAI integration.

## Deployment

### Render/Fly.io/Railway

1. Set environment variables:
   - `DB_MODE=postgres`
   - `DATABASE_URL=<your-postgres-url>`

2. Build command: `npm run build`

3. Start command: `npm run start`

### Docker

```bash
docker compose up --build
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. TypeScript check
2. Unit tests
3. Integration tests (SQLite)
4. Build

## How MCP Could Fit

Model Context Protocol (MCP) could enhance this application by exposing tools:

1. **search_facts(query, lang)** - Search verified facts
2. **list_findings(run_id, type?, severity_min?)** - List findings with filters
3. **create_audit_run(question_set_id, provider)** - Trigger new audits
4. **get_comparison(baseline_id, current_id)** - Get comparison data

MCP would enable:
- Real-time fact verification from external sources
- Multi-model LLM comparison
- Integration with document management systems
- Automated fact updates from trusted sources

## 3-Minute Demo Script

1. **Dashboard**: Show latest metrics and overview of findings
2. **Question Sets**: Show FR/NL pairs and risk tags
3. **Audit Runs**: Start a new run (baseline)
4. **Findings**: Filter by type (incorrect/ungrounded/drift)
5. **Facts Hub**: Open a fact and click sourceRef
6. **Run again (after)**: Show comparison page
7. **Close**: "This is regression testing for public information in the AI era"

## Contributing

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

## Screenshots

### Dashboard — key metrics and severity overview
![Dashboard view showing total findings, critical issues, FR/NL drift, and severity distribution](docs/screenshots/dashboard.png)

The dashboard summarizes the most recent audit results: total findings across runs, critical issues (severity 8–10), FR/NL drift count, and a severity distribution breakdown.

### Findings — actionable issue list with suggested fixes
![Findings view showing filters, issue cards, and suggested fixes for incorrect answers and FR/NL drift](docs/screenshots/findings.png)

The findings page provides a filterable list of detected issues (incorrect, outdated, ungrounded, FR/NL drift). Each item includes evidence (expected vs actual) and a suggested fix to reduce real-world harm (wrong fees, outdated links, inconsistent procedures across languages).

---


## License

MIT
