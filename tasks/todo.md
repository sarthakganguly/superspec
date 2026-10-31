# Task List: Requirements-to-Action Platform

## Phase 1: Foundation & Auth (Vertical Slice 1)

### Task 1: Initialize Docker Compose Environment
**Description:** Set up the basic monorepo structure and a `docker-compose.yml` that orchestrates PostgreSQL, a FastAPI backend, and a Vite/React frontend.
**Acceptance criteria:**
- [x] `docker-compose up` starts Postgres, a Python container (FastAPI), and a Node container (Vite).
- [x] FastAPI serves a health check at `http://localhost:8002/health` (`http://localhost:8000/health` container-internal).
- [x] React app is accessible at `http://localhost:3002` (`http://localhost:3000` container-internal).
**Verification:**
- [x] Manual check: Run `docker-compose up` and hit both URLs in the browser.
**Dependencies:** None
**Files likely touched:**
- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
**Estimated scope:** Medium

### Task 2: Database Schema & API for Local Auth
**Description:** Configure SQLAlchemy/Alembic, create User models, and implement local JWT authentication endpoints.
**Acceptance criteria:**
- [x] Alembic migration creates a `users` table.
- [x] `POST /api/auth/login` accepts email/password and returns a JWT.
- [x] `GET /api/users/me` returns the current user profile, protected by a JWT middleware.
- [x] A seed script exists to create a default Admin user.
**Verification:**
- [x] Tests pass: Write Pytest for login success and failure.
- [x] Build succeeds: Run alembic upgrade head successfully.
**Dependencies:** Task 1
**Files likely touched:**
- `backend/models/user.py`
- `backend/api/auth.py`
- `backend/alembic/versions/...`
**Estimated scope:** Medium

### Task 3: Frontend Auth UI & Protected Routing
**Description:** Build the login page and setup protected routing in React using shadcn/ui.
**Acceptance criteria:**
- [x] Login screen with email/password fields (using shadcn/ui Forms).
- [x] Successful login stores JWT and redirects to `/dashboard`.
- [x] Unauthenticated access to `/dashboard` redirects back to `/login`.
**Verification:**
- [x] Manual check: Run frontend, attempt to access `/dashboard` without auth, login, and verify redirection.
**Dependencies:** Task 1, Task 2
**Files likely touched:**
- `frontend/src/pages/Login.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/App.tsx`
**Estimated scope:** Medium

## Checkpoint: Foundation
- [x] `docker-compose up` boots entire stack cleanly.
- [x] Database is seeded.
- [x] User can log in via the React UI and see a protected placeholder dashboard.

---

## Phase 2: Project Management & Gate 1 (Vertical Slice 2)

### Task 4: Database Schema & API for Project Management
**Description:** Create the database tables for Projects and CRUD API endpoints.
**Acceptance criteria:**
- [x] Alembic migration for `projects` table and `artifacts` table (JSONB).
- [x] `POST /api/projects` creates a new project.
- [x] `GET /api/projects` lists accessible projects.
- [x] `GET /api/projects/{id}` returns project details.
**Verification:**
- [x] Tests pass: Pytest for project creation and retrieval.
**Dependencies:** Task 2
**Files likely touched:**
- `backend/models/project.py`
- `backend/api/projects.py`
**Estimated scope:** Medium

### Task 5: Frontend Project Dashboard
**Description:** Build the UI to list projects and a modal to create a new project.
**Acceptance criteria:**
- [x] Dashboard page lists projects in a dense data table.
- [x] "Create Project" button opens a dialog to name and describe a new project.
**Verification:**
- [x] Manual check: Create project via UI and see it appear in the list.
**Dependencies:** Task 3, Task 4
**Files likely touched:**
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/components/CreateProjectDialog.tsx`
**Estimated scope:** Medium

### Task 6: Gate 1 Schema Validation API (Business Requirements)
**Description:** Implement strict Pydantic schemas for Gate 1 and the PUT endpoint.
**Acceptance criteria:**
- [x] Pydantic model for Gate 1 (problem_statement, success_metrics, etc.).
- [x] `PUT /api/projects/{id}/artifacts/business-requirements` validates payload and saves to `artifacts` JSONB.
**Verification:**
- [x] Tests pass: Submit valid payload and missing fields payload.
**Dependencies:** Task 4
**Files likely touched:**
- `backend/schemas/artifacts.py`
- `backend/api/artifacts.py`
**Estimated scope:** Small

### Task 7: Frontend Gate 1 Authoring UI
**Description:** Build the detailed project view with the Gate Stepper and the Gate 1 authoring form.
**Acceptance criteria:**
- [x] Project detail view shows a horizontal Gate Stepper.
- [x] Gate 1 view has a structured form matching the Pydantic schema.
- [x] Form displays explicit validation errors if submission fails.
**Verification:**
- [x] Manual check: Navigate to project, fill out Gate 1 form, submit, verify UI updates.
**Dependencies:** Task 5, Task 6
**Files likely touched:**
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/components/GateStepper.tsx`
- `frontend/src/components/forms/Gate1Form.tsx`
**Estimated scope:** Large

## Checkpoint: Core Engine
- [x] End-to-end Project creation works.
- [x] Gate 1 deterministic validation rejects bad data and accepts good data.

---

## Phase 3: Technical Gates (Vertical Slice 3)

### Task 8: Gate 2 Validation API (Data Dictionary)
**Description:** Pydantic schemas and PUT endpoint for Data Dictionaries.
**Acceptance criteria:**
- [x] Gate 2 Pydantic model enforces structured entity definitions (name, type, nullable).
- [x] `PUT /api/projects/{id}/artifacts/data-dictionary` endpoint.
**Verification:**
- [x] Tests pass: Validation catches missing entity types.
**Dependencies:** Task 6
**Files likely touched:**
- `backend/schemas/artifacts.py`
- `backend/api/artifacts.py`
**Estimated scope:** Small

### Task 9: Frontend Gate 2 Authoring UI
**Description:** Dynamic form UI for Gate 2 Data Dictionary.
**Acceptance criteria:**
- [x] Dynamic repeater form allowing keyboard-friendly addition of Entities and Attributes.
**Verification:**
- [x] Manual check: Add 3 entities rapidly using only keyboard.
**Dependencies:** Task 7, Task 8
**Files likely touched:**
- `frontend/src/components/forms/Gate2Form.tsx`
**Estimated scope:** Medium

### Task 10: Gate 3 Validation API (User Stories)
**Description:** Pydantic schemas and PUT endpoint for User Stories with Gherkin.
**Acceptance criteria:**
- [x] Gate 3 Pydantic model enforces array of User Stories containing `given`, `when`, `then`.
- [x] `PUT /api/projects/{id}/artifacts/user-stories` endpoint.
**Verification:**
- [x] Tests pass: Validation catches invalid Gherkin structures.
**Dependencies:** Task 8
**Files likely touched:**
- `backend/schemas/artifacts.py`
- `backend/api/artifacts.py`
**Estimated scope:** Small

### Task 11: Frontend Gate 3 Authoring UI
**Description:** Dynamic form UI for Gate 3 User Stories.
**Acceptance criteria:**
- [x] Dynamic form for User Stories with nested given/when/then repeater fields.
**Verification:**
- [x] Manual check: Fill out multiple stories, save, and reload.
**Dependencies:** Task 9, Task 10
**Files likely touched:**
- `frontend/src/components/forms/Gate3Form.tsx`
**Estimated scope:** Medium

---

## Phase 4: Traceability & Sign-off (Vertical Slice 4)

### Task 12: Traceability Validation API (RTM Logic)
**Description:** The core engine rule that verifies bi-directional traceability.
**Acceptance criteria:**
- [x] `GET /api/projects/{id}/traceability` cross-references the JSONB from Gates 1, 2, and 3.
- [x] Returns structured errors for orphaned stories or entities.
**Verification:**
- [x] Tests pass: Unit tests with mock JSON data simulating orphaned requirements.
**Dependencies:** Task 10
**Files likely touched:**
- `backend/services/traceability.py`
- `backend/api/traceability.py`
**Estimated scope:** Medium

### Task 13: Frontend Traceability View
**Description:** UI to visualize the Traceability validation results.
**Acceptance criteria:**
- [x] UI renders a clear list or bipartite map of connected vs. orphaned items.
- [x] Prominent red badges for blocking traceability errors.
**Verification:**
- [x] Manual check: View UI with known orphans, ensure they are flagged clearly.
**Dependencies:** Task 11, Task 12
**Files likely touched:**
- `frontend/src/components/TraceabilityReport.tsx`
**Estimated scope:** Medium

### Task 14: Cryptographic Sign-off API
**Description:** Backend logic for RACI role sign-offs on a baselined gate.
**Acceptance criteria:**
- [x] `POST /api/projects/{id}/signoff` records the user's ID, timestamp, and target Gate.
- [x] Generates a SHA-256 hash of the current artifacts.
**Verification:**
- [x] Tests pass: Sign-off endpoint correctly records state and prevents double sign-off.
**Dependencies:** Task 12
**Files likely touched:**
- `backend/models/signoff.py`
- `backend/api/signoff.py`
**Estimated scope:** Small

### Task 15: Frontend Sign-off UI
**Description:** The UI button and modal to approve a gate.
**Acceptance criteria:**
- [x] "Sign Off" button visible only to authorized roles.
- [x] Confirmation modal displaying the timestamp and user warning.
**Verification:**
- [x] Manual check: Click sign-off, verify status updates in UI.
**Dependencies:** Task 13, Task 14
**Files likely touched:**
- `frontend/src/components/SignoffButton.tsx`
**Estimated scope:** Small

---

## Phase 5: Export Engine (Vertical Slice 5)

### Task 16: Export Engine API (ZIP/Markdown Generator)
**Description:** Backend endpoint to stream a generated ZIP containing Jira-ready markdown files.
**Acceptance criteria:**
- [x] `GET /api/projects/{id}/export` generates a zip file containing `action_items.md`.
- [x] Formats Gate 3 stories into ticket-ready formats (Title, Desc, Acceptance Criteria).
**Verification:**
- [x] Tests pass: Generate export and assert file structure/contents.
**Dependencies:** Task 14
**Files likely touched:**
- `backend/services/export.py`
- `backend/api/export.py`
**Estimated scope:** Medium

### Task 17: Frontend Export Trigger UI
**Description:** The UI to download the final baselined export.
**Acceptance criteria:**
- [x] Once Gate 6 (or Traceability) is signed off, a "Download Jira Export" button becomes active.
**Verification:**
- [x] Manual check: Click download button, extract ZIP, inspect contents.
**Dependencies:** Task 15, Task 16
**Files likely touched:**
- `frontend/src/pages/ProjectDetail.tsx`
**Estimated scope:** Small

## Checkpoint: Complete MVP
- [x] Entire system builds locally with `docker-compose`.
- [x] A user can create a project, fill strict forms, pass traceability checks, sign off, and download a ticket export payload.

---

## Phase 6: Project Team & Dynamic RBAC (Vertical Slice 6)

### Task 18: Project Members Schema & API
**Description:** Create a join table linking Users to Projects with specific access roles, and build the API to manage them.
**Acceptance criteria:**
- [x] `ProjectMember` SQLAlchemy model exists mapping `project_id`, `user_id`, and `role` (e.g., `GATE_1_OWNER`, `GATE_2_OWNER`, `GATE_3_OWNER`, `REVIEWER`).
- [x] Database enforces a `UniqueConstraint(project_id, user_id)` to prevent duplicate team additions.
- [x] Alembic migration generated and applied.
- [x] `GET /api/projects/{id}/members` returns a list of members and their roles.
- [x] `POST /api/projects/{id}/members` allows adding a user (by email) to the project.
- [x] `DELETE /api/projects/{id}/members/{user_id}` allows removing a user from the project.
- [x] Project creators are automatically added as an owner/admin of the project upon creation.
**Verification:**
- [x] Tests pass: Pytest for adding a member and retrieving the member list.
**Dependencies:** None
**Files likely touched:**
- `backend/models/project.py` (or new `member.py`)
- `backend/schemas/project.py`
- `backend/api/projects.py`
**Estimated scope:** Medium

### Task 19: Backend Gate Authorization (Project-Level)
**Description:** Add FastAPI dependencies to restrict artifact `PUT` endpoints based on the active user's role in that specific project.
**Acceptance criteria:**
- [x] Gate 1 PUT endpoint is restricted to `GATE_1_OWNER` (or project admin).
- [x] Gate 2 PUT endpoint is restricted to `GATE_2_OWNER` (or admin).
- [x] Gate 3 PUT endpoint is restricted to `GATE_3_OWNER` (or admin).
- [x] Unassigned users or `REVIEWER` roles get a `403 Forbidden` if they try to save.
**Verification:**
- [x] Tests pass: Write Pytest ensuring 403 Forbidden is returned when a `REVIEWER` tries to save Gate 1.
**Dependencies:** Task 18
**Files likely touched:**
- `backend/api/artifacts.py`
**Estimated scope:** Medium

### Task 20: Frontend Team Management UI
**Description:** Build a "Team" tab in the Project Detail view to invite users and assign roles.
**Acceptance criteria:**
- [x] New "Team" view added to the Gate Stepper or Project Header.
- [x] Displays a table/list of current project members and their roles.
- [x] Layout is responsive: data table on desktop, card list on mobile.
- [x] Meaningful empty/default state rendered if the team only contains the creator.
- [x] Form to add a new member by email address and select their role from a dropdown.
- [x] Uses inline loading states for form submission (no full-page spinners).
**Verification:**
- [x] Manual check: Add a user via the UI and see them appear in the member list.
**Dependencies:** Task 18
**Files likely touched:**
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/components/TeamManagement.tsx`
**Estimated scope:** Medium

### Task 21: Frontend Gate RBAC UI Adaptation
**Description:** Update the Gate 1, 2, and 3 forms to visually respect the read-only state for users lacking ownership.
**Acceptance criteria:**
- [x] Forms fetch the current user's role from the project members list.
- [x] If the user lacks ownership (and is not an admin), inputs are disabled and explicitly set `aria-readonly="true"`.
- [x] A visually distinct, dismissible banner explains that they are viewing the requirements in read-only mode and lists the required role.
- [x] "Save" buttons and add/remove array items buttons are hidden entirely.
**Verification:**
- [x] Manual check: Log in as a user with `REVIEWER` role, navigate to Gate 1, and ensure the form is uneditable but legible.
**Dependencies:** Task 19, Task 20
**Files likely touched:**
- `frontend/src/components/forms/Gate1Form.tsx`
- `frontend/src/components/forms/Gate2Form.tsx`
- `frontend/src/components/forms/Gate3Form.tsx`
**Estimated scope:** Medium

### Task 22: Dynamic Multi-Signature Sign-off
**Description:** Upgrade Gate 5 and Gate 6 to require consensus signatures from all assigned project members before allowing export.
**Acceptance criteria:**
- [x] Database enforces a `UniqueConstraint(project_id, user_id, gate_name)` on the `signoffs` table to handle concurrent clicks.
- [x] Sign-off API evaluates if signatures exist from ALL users in `project_members`.
- [x] Export API dynamically evaluates team size vs signatures on every request (relocking if a new member is added).
- [x] Gate 5 UI displays a dynamic checklist using strict visual hierarchy (green checks for signed, gray circles for pending).
- [x] Gate 5 places the "Sign Off" button directly inline with the active user's pending row.
- [x] Gate 6 Export button remains locked until every assigned member has cryptographically signed off.
**Verification:**
- [x] Tests pass: Pytest confirms Export API returns 403 until all members have signed off.
- [x] Manual check: Add 2 members to a project, sign off with the first, verify Gate 6 is still locked. Log in as the second, sign off, verify Gate 6 unlocks.
**Dependencies:** Task 18, Task 20
**Files likely touched:**
- `backend/api/signoff.py`
- `backend/api/export.py`
- `frontend/src/components/Gate5Signoff.tsx`
- `frontend/src/components/Gate6Export.tsx`
**Estimated scope:** Large

### Checkpoint: Enterprise Project Teams
- [x] Users have strict, project-specific ownership boundaries.
- [x] Multi-sig consensus dynamically adapts to the size of the project team.
