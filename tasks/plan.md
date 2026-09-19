# Implementation Plan: Requirements-to-Action Platform (MVP)

## Overview
A deterministic, Dockerized web application that allows cross-functional teams to author, validate, and manage structured requirements through a strict gate-based state machine. The MVP focuses on local deployment, strict schema validation, database-backed storage, and generating exportable artifacts for manual downstream ticket creation.

## Architecture Decisions
- **Infrastructure:** 100% Dockerized via `docker-compose`. Enables easy local home-server testing and deployment.
- **Backend:** Python + FastAPI. Chosen for high performance and strict deterministic schema validation via Pydantic.
- **Database:** PostgreSQL. Relational integrity (Users, Projects) + `JSONB` flexibility for storing dynamic requirement artifacts.
- **Frontend:** React (Vite) + TypeScript + TailwindCSS + shadcn/ui. Fast, accessible SPA served statically. Information-dense, monochrome enterprise UI.
- **Auth:** Local admin-provisioned auth (JWT). 
- **Extensibility:** Roles and Artifact Types will be extensible strings/configurations, not rigid hardcoded enums.
- **Export Strategy:** Phase I will generate downloadable, structured files (ZIP/Markdown) containing the translated action items.

## Task List
*(See `tasks/todo.md` for detailed acceptance criteria and verification steps)*

### Phase 1: Foundation & Auth (Vertical Slice 1)
- [ ] Task 1: Initialize Docker Compose Environment
- [ ] Task 2: Database Schema & API for Local Auth
- [ ] Task 3: Frontend Auth UI & Protected Routing

### Checkpoint: Foundation
- [ ] `docker-compose up` works cleanly
- [ ] User can log in and view a protected placeholder dashboard

### Phase 2: Project Management & Gate 1 (Vertical Slice 2)
- [ ] Task 4: Database Schema & API for Project Management
- [ ] Task 5: Frontend Project Dashboard
- [ ] Task 6: Gate 1 Schema Validation API (Business Requirements)
- [ ] Task 7: Frontend Gate 1 Authoring UI

### Checkpoint: Core Engine
- [ ] User can create a project
- [ ] User can submit Gate 1 requirements and pass deterministic validation

### Phase 3: Technical Gates (Vertical Slice 3)
- [ ] Task 8: Gate 2 Validation API (Data Dictionary)
- [ ] Task 9: Frontend Gate 2 Authoring UI
- [ ] Task 10: Gate 3 Validation API (User Stories)
- [ ] Task 11: Frontend Gate 3 Authoring UI

### Phase 4: Traceability & Sign-off (Vertical Slice 4)
- [ ] Task 12: Traceability Validation API (RTM Logic)
- [ ] Task 13: Frontend Traceability View
- [ ] Task 14: Cryptographic Sign-off API
- [ ] Task 15: Frontend Sign-off UI

### Phase 5: Export Engine (Vertical Slice 5)
- [ ] Task 16: Export Engine API (ZIP/Markdown Generator)
- [ ] Task 17: Frontend Export Trigger UI

### Checkpoint: Complete MVP
- [ ] End-to-end flow from Gate 1 to Baseline Export works locally.

### Phase 6: Project Team & Dynamic RBAC (Vertical Slice 6)
- [ ] Task 18: Project Members Schema & API
- [ ] Task 19: Backend Gate Authorization (Project-Level)
- [ ] Task 20: Frontend Team Management UI
- [ ] Task 21: Frontend Gate RBAC UI Adaptation
- [ ] Task 22: Dynamic Multi-Signature Sign-off

### Checkpoint: Enterprise Project Teams
- [ ] Users have strict, project-specific ownership boundaries.
- [ ] Data is viewable by all, but editable only by assigned owners.
- [ ] Multi-sig consensus dynamically adapts to the size of the project team.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex JSON schema updates breaking old projects | High | Version the Pydantic schemas explicitly. Store schema version alongside the JSONB artifact in PostgreSQL. |
| React/FastAPI CORS issues in Docker | Low | Configure standard Docker networking and explicit CORS middleware in FastAPI from day one. |
| Deterministic validation is too rigid | Medium | Start with minimal required fields (e.g., just Title and Description) and slowly add strict validation for Gherkin and NFRs as the system matures. |
| Roles enum rigidity breaking clients | Medium | Use extensible strings for Roles at the API boundary; manage valid roles via DB or config file. |
