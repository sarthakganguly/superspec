# ADR-001: Architecture Stack (FastAPI, React, PostgreSQL)

## Status
Accepted

## Date
2026-09-19

## Context
We need a robust, scalable architecture for SuperSpec, a requirement management and traceability application. Key requirements:
- A responsive, modern frontend that allows complex data entry (nested user stories, dynamic data dictionaries).
- A robust API layer to handle cryptographic hashing, ZIP export generation, and complex traceability validations.
- A reliable database capable of handling UUIDs, relational schemas (Project -> Members -> Roles), and JSON fields for artifact content.
- Deployment via Docker for isolated execution environments.

## Decision
- **Backend**: FastAPI (Python) with SQLAlchemy ORM.
- **Frontend**: React with Vite and Tailwind CSS.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker Compose.

## Alternatives Considered

### Node.js / Express (Backend)
- Pros: Single language (TypeScript) across the stack.
- Cons: Python provides better native libraries and ecosystem support for data processing, cryptographic hashing, and potential future AI integrations.
- Rejected: FastAPI offers better out-of-the-box OpenAPI documentation and type safety via Pydantic which is highly beneficial for strict API contracts.

### MongoDB (Database)
- Pros: Schema-less design makes storing dynamic artifacts easy.
- Cons: We rely heavily on strict RBAC relationships (Project members, roles) and unique constraints for multi-signature sign-offs.
- Rejected: PostgreSQL provides robust relational integrity and ACID compliance, while still allowing `JSONB` columns for flexible artifact storage.

## Consequences
- The team needs to maintain context across both Python and TypeScript.
- PostgreSQL `JSONB` columns allow us to store Gate 1, 2, and 3 artifacts flexibly while maintaining strict relational schemas for user roles and sign-offs.
- Docker Compose setup must orchestrate three containers (frontend, backend, postgres).
