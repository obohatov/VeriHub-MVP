# Engineering Journey & System Architecture — VeriHub Civic

## Overview
This document outlines the engineering process and architectural decisions behind VeriHub Civic. We adopted an **AI-augmented development workflow** to rapidly prototype and harden a complex full-stack solution, moving from concept to a production-ready MVP in weeks. Our focus was on building a scalable tool tailored to the unique multilingual (FR/NL) and regulatory landscape of the Belgian market.

## Development Philosophy
To maintain high velocity without sacrificing code quality, we utilized a modern engineering stack where AI tools served as high-powered productivity accelerators, while the founders maintained strict oversight over:
- **System Architecture**: Manual design of the "Operating Loop" and database schema.
- **Multilingual Logic**: Defining the specific parameters for detecting FR/NL information drift.
- **Regulatory Alignment**: Ensuring the scoring algorithms meet the transparency requirements of the **EU AI Act**.

## Engineering Milestones

### Phase 1: Core Logic & Prototyping
Instead of building a generic AI wrapper, we engineered a system to solve specific "Information Drift" problems.
- **GEO Framework**: Implemented the "Generative Engine Optimization" logic to measure how public LLMs represent civic brands.
- **Multilingual Pipeline**: Developed a React/TypeScript interface and Express.js backend capable of handling cross-language data comparisons.
- **Mock LLM Architecture**: Built a deterministic provider system to allow rigorous testing and benchmarking without API volatility.

### Phase 2: System Hardening & Enterprise Readiness
We prioritized stability and compliance to meet the standards required by regulated Belgian sectors (Finance, Insurance, Utilities).
1. **Data Persistence Layer**
   - Migrated from volatile in-memory storage to a robust **PostgreSQL/Drizzle ORM** architecture.
   - Designed a "mode-swappable" DB layer supporting both local SQLite for development and production-grade PostgreSQL.
2. **Automated Quality Assurance**
   - Integrated an **OpenAPI 3.1 specification** as a single source of truth for the API contract.
   - Developed a comprehensive test suite using **Vitest**, covering critical unit logic (drift detection) and end-to-end integration workflows.
3. **Interoperability & MCP**
   - Engineered a **Model Context Protocol (MCP)** tool server, allowing VeriHub Civic to integrate programmatically with other enterprise AI ecosystems.

## Technical Decisions & Trade-offs
- **Provider Pattern**: We implemented a custom abstraction for LLM providers. This allows us to run cost-effective baseline audits and seamlessly swap to live models (OpenAI/Anthropic) for production runs.
- **Validation Gates**: Every piece of AI-assisted code underwent manual review and type-safety checks (TypeScript/Zod) to prevent technical debt.
- **CI/CD Integration**: Established GitHub Actions pipelines to automate linting, type-checking, and multi-environment testing.

## Roadmap & Future Engineering
VeriHub Civic is built to evolve alongside the AI landscape:
- **Automated Remediation**: Integrating with enterprise CMS APIs to allow one-click fixes of the verified Facts Hub.
- **Advanced Drift Analytics**: Moving from pattern-matching to semantic-similarity scoring for multilingual consistency.
- **EU AI Act Compliance Suite**: Expanding the reporting pack to include official "Accuracy Transparency" logs for financial institutions.
