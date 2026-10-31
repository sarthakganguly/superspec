# Spec: Global Admin User Management & Lifecycle Administration

## Status: Proposed (Validated with Frontend UI Engineering)
**Author:** SuperSpec Team  
**Date:** 2026-10-31  
**Target:** Global User Administration (Listing, Provisioning, Deletion, and Governance)  

---

## 1. Objective
Provide platform **Global Administrators (`ADMIN`)** with a centralized, unified **User Management** interface and underlying APIs (`GET /api/auth/users`, `POST /api/auth/users`, `DELETE /api/auth/users/{user_id}`). 
Rather than an isolated "+ Add User" trigger, Global Admins can review all registered users, monitor their platform roles, search/filter accounts, provision new accounts, and delete inactive or obsolete users while enforcing strict safety rules (preventing admin self-deletion and safeguarding cryptographic sign-off audit trails).

---

## 2. Tech Stack & Design System
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.x, Pydantic v2, PostgreSQL, Passlib.
- **Frontend**: React 19, TypeScript ~6.0.2, Vite, Tailwind CSS, Lucide React icons, Axios.
- **Design Tokens & Aesthetic**:
  - Monochrome primary palette (`bg-black text-white hover:bg-gray-800`, `border-gray-200`, `bg-gray-50`).
  - Semantic role badges: `ADMIN` (purple), `USER` (blue), `VIEWER` (gray).
  - Strict absence of generic AI aesthetics (no purple gradient soup, no over-rounded bubbly shapes, standardized 0.25rem spacing scale).
  - WCAG 2.1 AA accessible with full keyboard navigation and ARIA semantics.

---

## 3. Commands
- **Backend Test Suite**: `docker compose exec backend python -m pytest tests/test_auth.py`
- **Full Backend Tests**: `docker compose exec backend python -m pytest`
- **Frontend Fast Checks**: `docker compose exec frontend npm run check:fast` (`tsc -b && oxlint`)
- **Frontend Production Build**: `docker compose exec frontend npm run build`

---

## 4. Frontend Component Architecture

Following the `frontend-ui-engineering` guideline to keep components focused, composable, and under 200 lines:

```
frontend/src/components/
├── UserManagement/
│   ├── UserManagementDialog.tsx  → Modal container: orchestrates user fetching, search query state, deletion state (< 160 lines)
│   ├── UserTable.tsx             → Presentation component: responsive desktop table and mobile cards (< 140 lines)
│   └── DeleteUserConfirmDialog.tsx → Accessible confirmation modal with focus trap & safety verification (< 80 lines)
├── CreateUserDialog.tsx          → Existing creation modal, integrated seamlessly as a sub-flow (< 100 lines)
```

### Component Responsibilities:
1. **`UserManagementDialog` (Container)**:
   - Manages data fetching from `GET /api/auth/users`.
   - Handles search query filter state.
   - Manages delete confirmation flow and inline error alerts.
   - Triggers `CreateUserDialog` and refreshes user list upon creation.
   - Implements `role="dialog"`, `aria-modal="true"`, Escape key dismissal, and backdrop click handler.
2. **`UserTable` (Presentation)**:
   - Receives filtered users, current user ID, and `onDeleteClick`.
   - Renders desktop table view (`hidden sm:block`) and mobile card view (`sm:hidden`).
   - Displays role badges, "You" indicator for current logged-in admin, and active status.
   - Disables/hides delete button for self with clear assistive tooltip/label.
3. **`DeleteUserConfirmDialog` (Modal)**:
   - Explicit confirmation before invoking `DELETE /api/auth/users/{id}`.
   - Shows user email and warns about irreversible removal of project memberships.
   - Handles loading state (`Deleting...`) and inline error messages (e.g., if user has cryptographic sign-offs).

---

## 5. API Contracts & Behavior

### 5.1 GET `/api/auth/users`
- **Auth**: Requires valid Bearer JWT.
- **Parameters**: `q: str = ""` (optional substring query), `limit: int = 100`.
- **Behavior**:
  - If `q` is non-empty ($\ge 3$ characters): returns users matching query (available to any authenticated user for auto-suggest).
  - If `q` is empty:
    - If `current_user.role == "ADMIN"`: returns all registered users ordered by `email asc` up to `limit`.
    - If `current_user.role != "ADMIN"`: returns empty list `[]` (preserves privacy/least-privilege).

### 5.2 POST `/api/auth/users`
- **Auth**: Requires `current_user.role == "ADMIN"`.
- **Payload**: `{"email": "...", "password": "...", "role": "ADMIN" | "USER" | "VIEWER"}`.
- **Status Codes**:
  - `201 Created`: User successfully provisioned.
  - `400 Bad Request`: Email already registered, invalid role, or password $< 6$ characters.
  - `403 Forbidden`: Caller is not a Global Admin.

### 5.3 DELETE `/api/auth/users/{user_id}`
- **Auth**: Requires `current_user.role == "ADMIN"`.
- **Parameters**: `user_id: UUID` (path parameter).
- **Safety Guards**:
  1. **Self-Deletion Prevention**: If `current_user.id == user_id`, reject with `400 Bad Request` (`"Cannot delete your own administrator account"`).
  2. **System Default Users Protection**: If target user email is one of the default system accounts (`admin@superspec.com`, `product@superspec.com`, `data@superspec.com`, `qa@superspec.com`, `viewer@superspec.com`), reject with `400 Bad Request` (`"Cannot delete system default user account '{email}'"`).
  3. **Audit Trail Protection**: If the target user has recorded sign-offs in `signoffs` table, reject with `400 Bad Request` (`"Cannot delete user who has recorded cryptographic sign-offs in project baselines"`).
  4. **Existing Record Check**: If `user_id` does not exist, reject with `404 Not Found`.
- **Status Codes**:
  - `204 No Content`: User and their project memberships successfully deleted.
  - `400 Bad Request`: Self-deletion attempted, default system user targeted, or user has immutable sign-offs.
  - `403 Forbidden`: Caller is not a Global Admin.
  - `404 Not Found`: User does not exist.

---

## 6. Accessibility & UX Requirements (WCAG 2.1 AA)

1. **Keyboard Accessibility**:
   - Dialog traps focus when open; Escape key dismisses the dialog.
   - Interactive buttons have visible focus rings (`focus:ring-2 focus:ring-offset-2 focus:ring-black`).
2. **Screen Reader Semantics**:
   - Dialog elements use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
   - Icon-only buttons (close button, delete button) include unambiguous `aria-label`s (e.g., `aria-label="Delete user alice@example.com"`).
   - Loading states use `aria-busy="true"` and `aria-label="Loading registered users"`.
3. **Empty & Error States**:
   - Zero-matching search results display an empty state with a "Clear search" action.
   - Network or validation errors display an alert banner with role="alert".
4. **Responsive Layouts**:
   - Modal accommodates 320px, 768px, 1024px, and 1440px breakpoints.
   - Desktop uses a high-density table; mobile breaks down into accessible card items with stacked metadata.

---

## 7. Testing Strategy

### Backend (`backend/tests/test_auth.py`):
1. `test_admin_list_all_users`: Global Admin calling `GET /api/auth/users` without query gets full list of users.
2. `test_non_admin_cannot_list_all_users`: Non-admin calling `GET /api/auth/users` without query gets empty list.
3. `test_admin_delete_user_success`: Global Admin successfully deletes an existing user; user and project memberships are removed.
4. `test_admin_cannot_delete_self`: Global Admin attempting to delete their own account receives 400 Bad Request.
5. `test_admin_cannot_delete_user_with_signoffs`: Deleting user with existing sign-offs returns 400 Bad Request.
6. `test_admin_delete_user_not_found`: Deleting non-existent UUID returns 404 Not Found.
7. `test_non_admin_cannot_delete_user`: Non-admin calling `DELETE /api/auth/users/{user_id}` receives 403 Forbidden.

### Frontend:
- `docker compose exec frontend npm run check:fast` maintains 0 errors and $\le 5$ warnings.
- `docker compose exec frontend npm run build` compiles cleanly.

---

## 8. Boundaries

### Always:
- Validate `current_user.role == "ADMIN"` on the backend.
- Block self-deletion and deletion of users with recorded cryptographic signatures.
- Keep components focused and under 200 lines.
- Maintain ratcheted oxlint warnings ($\le 5$).

### Never:
- Never allow non-admins to delete users or browse the full user roster without query.
- Never delete cryptographic baseline signatures in `signoffs`.
- Never use unstyled raw inputs or unlabelled icon buttons.

---

## 9. Success Criteria
1. Global Admin can open "Manage Users" from the Dashboard toolbar.
2. Global Admin can browse all registered users, filter by email substring, and add new users.
3. Global Admin can delete eligible users with confirmation, with immediate UI state update.
4. Attempting to delete own account or a user with sign-offs displays a clear error alert.
5. All backend tests pass (100%), frontend typecheck and linting pass with 0 errors.
