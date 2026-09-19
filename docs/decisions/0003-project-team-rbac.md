# ADR-003: Project Team RBAC Architecture

## Status
Accepted

## Date
2026-09-19

## Context
SuperSpec requires granular permissions for project data entry. Different team members are responsible for different Gates (e.g., Product Owners for Gate 1, Data Architects for Gate 2). We need a system that prevents unauthorized edits while enabling dynamic team compositions for consensus-based sign-offs.

## Decision
1. **Dynamic Project Teams**: Access control is decoupled from global user roles. Instead, we use a `project_members` join table linking Users to Projects with a specific project-level role (`PROJECT_ADMIN`, `GATE_1_OWNER`, `GATE_2_OWNER`, `GATE_3_OWNER`, `REVIEWER`).
2. **Consensus Sign-Off**: The Export Engine (Gate 6) dynamically evaluates the size of the project team against the number of cryptographic signatures. Export is only permitted when `signatures >= team_size`.
3. **Database Enforcement**: A `UniqueConstraint(project_id, user_id, gate_name)` is enforced on the `signoffs` table to prevent duplicate signatures.

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
