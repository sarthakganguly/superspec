# ADR-003: Project Team RBAC Architecture

## Status
Accepted

## Date
2026-09-19

## Context
SuperSpec requires granular permissions for project data entry. Different team members are responsible for different Gates (e.g., Product Owners for Gate 1, Data Architects for Gate 2). We need a system that prevents unauthorized edits while enabling dynamic team compositions for consensus-based sign-offs.

## Decision
1. **Dynamic Project Teams with Descriptive Roles**: Access control is decoupled from global user roles. Instead, we use a `project_members` join table linking Users to Projects with domain-specific project-level roles:
   - `PROJECT_ADMIN`: Full administrative control over the project and team roster.
   - `BUSINESS_REQUIREMENT_OWNER` (formerly `GATE_1_OWNER`): Exclusive edit rights over Gate 1 Business Requirements.
   - `DATA_DICTIONARY_OWNER` (formerly `GATE_2_OWNER`): Exclusive edit rights over Gate 2 Data Dictionary entities.
   - `USER_STORY_OWNER` (formerly `GATE_3_OWNER`): Exclusive edit rights over Gate 3 BDD User Stories.
   - `REQUIREMENT_SIGN_OFF_OWNER` (formerly `GATE_5_OWNER`): Primary ownership over Gate 5 baseline sign-off.
   - `REVIEWER`: Read-only stakeholder participating in reviews and sign-offs.
   *(Note: Gate 4 Traceability is calculated algorithmically by the deterministic engine; it requires no human edits and has no owner role).*
2. **Consensus Sign-Off**: The Export Engine (Gate 6) dynamically evaluates the size of the project team against the number of cryptographic signatures. Export is only permitted when `signatures >= team_size`.
3. **Database Enforcement**: A `UniqueConstraint(project_id, user_id, gate_name)` is enforced on the `signoffs` table to prevent duplicate signatures.
4. **Persistent Project Gates Context**: Because Team Management is strictly scoped at the project level rather than globally, the Gate Stepper remains permanently visible above both the "Project Gates" and "Team Management" tab views. This preserves spatial context of the requirement gates while allowing one-click direct navigation into any gate from Team Management.
5. **Auto-suggest Registered User Lookups**: Adding a member requires selecting an existing user. To eliminate invitation errors, the API provides `GET /api/auth/users?q={query}` (returning matching registered users for queries of 3+ characters). The Team Management UI features a live auto-suggest dropdown that filters registered users, flags users who are already project members, and validates against duplicate invitations client-side and server-side.
6. **Mandatory Upfront 4-Owner Configuration**: A project cannot be created without assigning all 4 active owners (`BUSINESS_REQUIREMENT_OWNER`, `DATA_DICTIONARY_OWNER`, `USER_STORY_OWNER`, `REQUIREMENT_SIGN_OFF_OWNER`) in the Create Project dialog. A single user may hold multiple ownership roles to accommodate solo developers and small teams.
7. **Administrative Immutability**: Only Global Admins (`ADMIN`) and Project Admins (`PROJECT_ADMIN`) may reassign gate owners or modify the project roster. Regular team members see a read-only team list and cannot alter ownership assignments.

## Alternatives Considered

### Global Roles
- Pros: Simpler schema (just an `is_admin` or `role` column on the User table).
- Cons: A user who is a Product Owner on Project A shouldn't necessarily have write access to Project B. 
- Rejected: Does not support multi-tenant or multi-project boundaries effectively.

### Fixed Sign-off Requirements
- Pros: Hardcoding required signatures (e.g., "Must have exactly 3 signatures").
- Cons: Teams vary in size.
- Rejected: Dynamic consensus based on active `project_members` allows maximum flexibility.

## Consequences
- The frontend must gracefully handle read-only states for users viewing gates they don't own, utilizing `aria-readonly` and visual banners.
- If a new member is added *after* the team has signed off, the consensus is mathematically broken, and the export function will automatically re-lock until the new member provides their signature. This is a desired security feature.

## Seeded Accounts & Persona Mappings
To test dynamic project teams and multi-signature consensus without manual registration, the database seeds the following default accounts via `backend/seed.py`:

| Email | Default Password | Global Role | Intended Project Role Persona |
| :--- | :--- | :--- | :--- |
| `admin@superspec.com` | `admin` | `ADMIN` | Platform Administrator / Global Access (`PROJECT_ADMIN`) |
| `product@superspec.com` | `password` | `USER` | Business Requirement Owner (`BUSINESS_REQUIREMENT_OWNER`) |
| `data@superspec.com` | `password` | `USER` | Data Dictionary Owner (`DATA_DICTIONARY_OWNER`) |
| `qa@superspec.com` | `password` | `USER` | User Story Owner (`USER_STORY_OWNER`) & Requirement Sign-off Owner (`REQUIREMENT_SIGN_OFF_OWNER`) |
| `viewer@superspec.com` | `password` | `VIEWER` | Auditor / Sign-off Reviewer (`REVIEWER`) |
