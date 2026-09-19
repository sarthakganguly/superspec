# SuperSpec

SuperSpec is an enterprise-grade requirement management and traceability application. It translates high-level business requirements into strictly validated, engineering-ready artifacts (Data Dictionaries and BDD User Stories).

SuperSpec's core philosophy is **cryptographic consensus**: before requirements can be exported to downstream systems (Jira, GitHub), the entire assigned project team must review and cryptographically sign off on the baseline.

## Features
- **Phased Gates**: Requirements are structured into sequential gates (Business Needs -> Data Dictionary -> User Stories).
- **Traceability Engine**: Automatically validates that all defined data entities are properly utilized within the user stories, preventing orphaned requirements.
- **Project-Level RBAC**: Granular permissions allow assigning specific Gate ownership to different team members.
- **Dynamic Consensus Sign-Offs**: Cryptographic SHA-256 signatures are required from *all* active project members before the baseline can be exported.
- **Markdown Export**: Generates an actionable, Jira-ready `action_items.md` packaged in a ZIP file.

## Quick Start

### Prerequisites
- Docker and Docker Compose

### Running the Application
1. Clone the repository.
2. Build and start the services using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. The frontend will be available at `http://localhost:5173`.
4. The backend API will be available at `http://localhost:8000`.
5. API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Seed Data
The application will automatically run migrations and seed the database on startup.
You can log in with the following default credentials:
- **Email**: `admin@superspec.com`
- **Password**: `admin`

## Commands

| Command | Description |
|---------|-------------|
| `docker compose up` | Start the application stack |
| `docker compose exec backend pytest` | Run backend test suite |
| `docker compose exec backend alembic revision --autogenerate -m "..."` | Generate a new DB migration |
| `docker compose exec frontend npm run build` | Build the frontend (typechecks via tsc) |

## Architecture

SuperSpec is built on a modern, decoupled architecture:
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS

### Key Design Decisions
See our Architecture Decision Records (ADRs) for context on major technical choices:
- [ADR-001: Architecture Stack (FastAPI, React, PostgreSQL)](docs/decisions/0001-architecture-stack.md)
- [ADR-002: Traceability and Cryptographic Sign-offs](docs/decisions/0002-traceability-signoffs.md)
- [ADR-003: Project Team RBAC Architecture](docs/decisions/0003-project-team-rbac.md)

## Contributing
1. Ensure all new logic is covered by Pytest (backend) or validated in the frontend.
2. Adhere to strict typing (Pydantic models in Python, Interfaces in TypeScript).
3. If changing the database schema, always generate and commit the corresponding Alembic migration.
4. Run `npm run build` in the frontend to catch TypeScript compilation errors before committing.
