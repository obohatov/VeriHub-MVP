# VeriHub Civic — LLM Audit & Drift Dashboard

## Overview
VeriHub Civic is a full-stack MVP dashboard that helps public-facing organizations measure what LLMs say about key civic services in French (FR) and Dutch (NL). The application detects issues such as incorrect information, outdated content, ungrounded claims, and FR↔NL drift, and shows measurable "before/after" improvement after updating a verified Facts & Sources Hub.

## Current State
MVP fully functional with:
- Dashboard with audit metrics and findings overview
- Facts Hub with CRUD operations for verified facts
- Question Sets viewer with expandable questions
- Audit Runs with Mock LLM Provider
- Findings detection (incorrect, outdated, ungrounded, drift)
- Before/After comparison view

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Storage**: In-memory storage with seed data
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Project Structure
```
/client
  /src
    /components      # Reusable UI components
    /pages           # Page components
    /lib             # Utilities and types
/server
  /services          # Business logic (audit runner, scoring, drift detection, mock LLM)
  routes.ts          # API endpoints
  storage.ts         # In-memory storage
/shared
  schema.ts          # Shared TypeScript types and Zod schemas
```

## Key Features

### 1. Facts Hub
- CRUD operations for verified facts
- Fields: key, lang (fr/nl), value, sourceRef, lastVerified, linkedFactId, topic
- FR/NL pair linking
- Search and filter by language

### 2. Question Sets
- Pre-seeded question set: "Demoville Civic Services v2"
- 14 questions (7 FR, 7 NL) across topics: contact, location, hours, deadline, fees, docs
- Risk tags: deadline, eligibility, location, contact, docs, fees, hours, general

### 3. Audit Runs
- Create new audit runs with question set selection
- Mock LLM Provider returns deterministic answers with deliberate issues
- Automatic scoring and finding generation
- Status tracking: pending → running → completed/failed

### 4. Findings Detection
- **Incorrect**: Answer contradicts verified fact values
- **Outdated**: Answer uses old/outdated information
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
- `GET /api/question-sets` - List question sets
- `GET /api/questions` - List all questions
- `GET /api/audit-runs` - List audit runs
- `POST /api/audit-runs` - Create audit run
- `GET /api/audit-runs/:id` - Get audit run
- `GET /api/audit-runs/:id/findings` - Get findings for run
- `GET /api/findings` - Get all findings
- `GET /api/comparison/:baselineId/:currentId` - Compare two runs

## Seed Data
On startup, the application automatically seeds:
- 14 facts (7 FR/NL linked pairs)
- 1 question set with 14 questions

## How AI Tools Were Used
This project was built using Replit Agent, demonstrating:
- Automated full-stack application scaffolding
- Schema-first development approach
- Component-based UI architecture
- Mock LLM integration for deterministic testing
- Comprehensive scoring algorithms for LLM response evaluation

## Where MCP Could Fit
Model Context Protocol (MCP) could enhance this application by:
1. **LLM Integration**: Connecting to real LLM providers (OpenAI, Anthropic) via MCP servers
2. **Source Verification**: Using MCP to fetch and verify sources in real-time
3. **Multi-model Comparison**: Running the same questions through multiple LLMs
4. **Dynamic Fact Updates**: Connecting to external data sources for fact verification

## Running the Application
The application runs on port 5000 with:
```bash
npm run dev
```

## Design System
- Professional civic blue theme
- Light and dark mode support
- Consistent spacing and typography
- Accessible color contrast
- Responsive design
