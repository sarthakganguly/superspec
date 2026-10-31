# SuperSpec Documentation Index

Welcome to the **SuperSpec** documentation hub. This directory contains all technical specifications, requirements, architectural decisions, and task roadmaps for the SuperSpec platform.

---

## 📚 Documentation Map

```
docs/
├── README.md                                  # Documentation index (this file)
├── requirements.md                            # Core problem statement, product direction, and validated MVP scope
├── specifications/
│   └── gate-schemas.md                        # Gate 1-3 Pydantic schemas, validation bounds, and JSON contracts
├── decisions/                                 # Architecture Decision Records (ADRs)
│   ├── 0001-architecture-stack.md            # FastAPI, React, PostgreSQL stack selection
│   ├── 0002-traceability-signoffs.md          # RTM concept and cryptographic SHA-256 sign-offs
│   ├── 0003-project-team-rbac.md              # Project-scoped RBAC and multi-sig consensus rules
│   ├── 0004-action-items-export-engine.md     # In-memory ZIP/Markdown export packaging
│   └── 0005-deterministic-traceability-engine.md # Exact-match RTM parsing algorithm
└── tasks/                                     # Implementation Roadmap & Checklists
    ├── plan.md                                # Vertical slices and phase progression
    └── todo.md                                # Granular task acceptance criteria and verification steps
```

---

## 1. Product Requirements & Vision
- **[`requirements.md`](requirements.md)**:
  - Explains SuperSpec's role as a deterministic alternative to IBM DOORS.
  - Documents validated assumptions (structured input adoption, gate friction tolerance, universal ticket translation).
  - Outlines product non-goals (no sprint velocity tracking, no LLM guesswork, no boilerplate code generation).

---

## 2. Gate Specifications & Data Contracts
- **[`specifications/gate-schemas.md`](specifications/gate-schemas.md)**:
  - **Gate 1 (Business Requirements)**: Problem statements, target audience, KPI success metrics, scope boundaries.
  - **Gate 2 (Data Dictionary)**: Domain entities and primitive typed attributes (`String`, `Integer`, `Float`, `Boolean`, `Date`, `DateTime`, `UUID`, `JSON`).
  - **Gate 3 (User Stories / BDD)**: Story point complexity ($1 \le \text{complexity} \le 13$) and Gherkin `GIVEN` / `WHEN` / `THEN` criteria.
  - **Cross-Referencing Rules**: Strict case-insensitive name matching between Gate 2 entities and Gate 3 stories.

---

## 3. Architecture Decision Records (ADRs)
The `docs/decisions/` directory records the context, trade-offs, and consequences of critical architectural choices:
- **[ADR-001: Architecture Stack (FastAPI, React, PostgreSQL)](decisions/0001-architecture-stack.md)**
- **[ADR-002: Traceability and Cryptographic Sign-offs](decisions/0002-traceability-signoffs.md)**
- **[ADR-003: Project Team RBAC Architecture](decisions/0003-project-team-rbac.md)**
- **[ADR-004: In-Memory Action Items ZIP & Markdown Export Engine](decisions/0004-action-items-export-engine.md)**
- **[ADR-005: Deterministic Bi-Directional Traceability Matrix Engine](decisions/0005-deterministic-traceability-engine.md)**

---

## 4. Implementation Tasks & Roadmaps
- **[`tasks/plan.md`](tasks/plan.md)**: High-level overview of vertical slices from Phase 1 (Foundation & Auth) through Phase 6 (Project Team & Dynamic RBAC).
- **[`tasks/todo.md`](tasks/todo.md)**: Comprehensive checklist with detailed acceptance criteria, files touched, and verification instructions for every task.

---

## 5. Related Project Guidelines
- **[`../CONSTRAINTS.md`](../CONSTRAINTS.md)**: Repository quality floor, numeric dimensions, ratchets, and exceptions.
- **[`../AGENTS.md`](../AGENTS.md)**: Non-negotiable instructions for autonomous coding agents.
- **[`../README.md`](../README.md)**: Quick start guide, Docker Compose commands, and service URLs.
