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
- **Export Strategy:** Phase I generates downloadable, structured files (ZIP/Markdown) containing the translated action items.

## Task List
*(See [`todo.md`](todo.md) for detailed acceptance criteria and verification steps)*

### Phase 1: Foundation & Auth (Vertical Slice 1)
- [x] Task 1: Initialize Docker Compose Environment
- [x] Task 2: Database Schema & API for Local Auth
- [x] Task 3: Frontend Auth UI & Protected Routing

### Checkpoint: Foundation
- [x] `docker-compose up` works cleanly
- [x] User can log in and view a protected placeholder dashboard

### Phase 2: Project Management & Gate 1 (Vertical Slice 2)
- [x] Task 4: Database Schema & API for Project Management
- [x] Task 5: Frontend Project Dashboard
- [x] Task 6: Gate 1 Schema Validation API (Business Requirements)
- [x] Task 7: Frontend Gate 1 Authoring UI

### Checkpoint: Core Engine
- [x] User can create a project
- [x] User can submit Gate 1 requirements and pass deterministic validation

### Phase 3: Technical Gates (Vertical Slice 3)
- [x] Task 8: Gate 2 Validation API (Data Dictionary)
- [x] Task 9: Frontend Gate 2 Authoring UI
- [x] Task 10: Gate 3 Validation API (User Stories)
- [x] Task 11: Frontend Gate 3 Authoring UI

### Phase 4: Traceability & Sign-off (Vertical Slice 4)
- [x] Task 12: Traceability Validation API (RTM Logic)
- [x] Task 13: Frontend Traceability View
- [x] Task 14: Cryptographic Sign-off API
- [x] Task 15: Frontend Sign-off UI

### Phase 5: Export Engine (Vertical Slice 5)
- [x] Task 16: Export Engine API (ZIP/Markdown Generator)
- [x] Task 17: Frontend Export Trigger UI

### Checkpoint: Complete MVP
- [x] End-to-end flow from Gate 1 to Baseline Export works locally.

### Phase 6: Project Team & Dynamic RBAC (Vertical Slice 6)
- [x] Task 18: Project Members Schema & API
- [x] Task 19: Backend Gate Authorization (Project-Level)
- [x] Task 20: Frontend Team Management UI
- [x] Task 21: Frontend Gate RBAC UI Adaptation
- [x] Task 22: Dynamic Multi-Signature Sign-off

### Checkpoint: Enterprise Project Teams
- [x] Users have strict, project-specific ownership boundaries.
- [x] Data is viewable by all, but editable only by assigned owners.
- [x] Multi-sig consensus dynamically adapts to the size of the project team.

### Phase 7: Upfront Gate Ownership & Descriptive Roles (Vertical Slice 7)
- [x] Task 23: Global Admin User Provisioning API & UI
- [x] Task 24: Descriptive Role Enums & Backend Upfront Ownership Assignment
- [x] Task 25: Frontend Create Project Dialog with Mandatory 4-Owner Selection
- [x] Task 26: Team Management Read-Only Immutability for Non-Admin Members
- [x] Task 27: Gate Permission Updates & End-to-End Verification

### Checkpoint: Full Upfront Ownership & Governance
- [x] Project creation mandates assigning Business Requirement, Data Dictionary, User Story, and Requirement Sign-off owners.
- [x] Non-admin project members cannot alter owners; Team Management is read-only for regular members.
- [x] Descriptive role nomenclature is active throughout API, schemas, and UI.

### Phase 8: Global User Administration & Deletion (Vertical Slice 8)
- [x] Task 28: User Deletion & Listing API (`DELETE /api/auth/users/{user_id}` and `GET /api/auth/users` for Admin)
- [x] Task 29: User Management UI Component & Dashboard Integration (`UserManagementDialog.tsx`)
- [x] Task 30: End-to-End Safety Guards, Automated Test Suite & Ratchet Verification

### Checkpoint: Global User Administration
- [x] Global Admins have a dedicated User Management feature to inspect, search, add, and delete users.
- [x] Admin self-deletion and deletion of users with baseline cryptographic sign-offs are blocked.
- [x] All test suites pass 100% and oxlint warnings remain ratcheted $\le 5$.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex JSON schema updates breaking old projects | High | Version the Pydantic schemas explicitly. Store schema version alongside the JSONB artifact in PostgreSQL. |
| React/FastAPI CORS issues in Docker | Low | Configure standard Docker networking and explicit CORS middleware in FastAPI from day one. |
| Deterministic validation is too rigid | Medium | Start with minimal required fields (e.g., just Title and Description) and slowly add strict validation for Gherkin and NFRs as the system matures. |
| Roles enum rigidity breaking clients | Medium | Use extensible strings for Roles at the API boundary; manage valid roles via DB or config file. |
