# The Deterministic Requirements-to-Action Platform

## Problem Statement
How might we enforce rigorous, deterministic requirements engineering across cross-functional teams so that raw business needs are systematically managed, validated, and precisely translated into traced action items for sub-teams across any work management tool (Jira, GitHub, Asana)?

## Recommended Direction
A standalone, deterministic web application that acts as a modern, lightweight alternative to IBM DOORS. Its core motto is to manage requirements and translate them into actionable tasks for sub-teams. 

It provides a centralized UI where BAs and Architects author structured requirements, map data dictionaries, and define process flows. The engine strictly enforces a multi-gate state machine—verifying schemas, ensuring bi-directional traceability, and detecting edge cases deterministically. Once the requirements are baselined and digitally signed off, the platform acts as a translation layer, dynamically slicing the specifications into atomic action items (Dev tasks, QA stubs, Architecture reviews) and pushing them to the organization's tool of choice (Jira, GitHub Issues, Asana, etc.).

## Key Assumptions Validated
- [x] **Structured Input Tolerance:** Validated. BAs and Architects use keyboard-friendly dynamic forms with Gherkin BDD blocks (`given`, `when`, `then`) and typed entity attribute tables.
- [x] **Gate Friction Tolerance:** Validated. Hard-blocking error gates prevent sign-off until orphaned entities and stories are resolved, ensuring zero unanchored work items reach engineering.
- [x] **Universal Translation Mapping:** Validated. The platform maps specifications into standardized action item units (`action_items.md`) containing story points, descriptions, and GIVEN/WHEN/THEN acceptance criteria, packaged alongside raw JSON.

## MVP Implementation Status
- [x] **Centralized Web UI with RBAC:** Project-scoped roles with `aria-readonly` view states for non-owners.
- [x] **Form-Based Authoring Interfaces:** Gate 1 (Business Requirements), Gate 2 (Data Dictionary), and Gate 3 (BDD User Stories).
- [x] **Deterministic Traceability Engine:** Bi-directional cross-referencing matrix that catches orphaned stories and unused entities without probabilistic AI models.
- [x] **Cryptographic Consensus Sign-off:** SHA-256 artifact baseline hashing requiring unanimous consensus from all active project members before export.
- [x] **Agnostic Export Layer:** In-memory streaming ZIP generation delivering `action_items.md` and machine-readable JSON payloads.

## Gate Ownership & Governance Requirements

### 1. Descriptive Gate Roles
Abstract gate numbers are mapped to explicit domain owner roles:
- **Business Requirement Owner** (Gate 1): Responsible for problem statements, KPIs, and scope boundaries.
- **Data Dictionary Owner** (Gate 2): Responsible for domain entities, attributes, types, and nullability constraints.
- **User Story Owner** (Gate 3): Responsible for BDD user stories, complexity estimation, and Gherkin scenarios.
- **Requirement Sign-off Owner** (Gate 5): Designated authority for baseline sign-off consensus.
- **Project Admin**: Has administrative management rights over project configuration and team roster.
- **Reviewer**: Read-only auditor participating in project review and consensus signing.
- *Note on Gate 4 (Traceability Matrix):* Gate 4 is computed algorithmically by the deterministic engine; it requires no human edits and therefore has no dedicated gate owner role.

### 2. Mandatory Upfront Ownership on Project Creation
- A project **cannot be created** without explicitly assigning all 4 active owners:
  1. Business Requirement Owner
  2. Data Dictionary Owner
  3. User Story Owner
  4. Requirement Sign-off Owner
- **Multi-Role Capability**: A single user may hold multiple ownership roles simultaneously (allowing 1–4 people to staff a project, supporting solo developers, small teams, and enterprise division of labor).
- **Existing User Validation**: All assigned owners must be existing registered users in the platform, selectable via auto-suggest.
- **Progression Gating**: No gate editing or sign-off progression is permitted without all 4 owners established.

### 3. Ownership Reassignment & Administrative Immutability
- **Authority**: Only **Global Administrators (`ADMIN`)** and the project's **Project Administrator (`PROJECT_ADMIN`)** can reassign gate owners or add/remove team members in the Team Management tab.
- **Immutability for Regular Members**: Team members who are not Project Admins (such as individual Gate Owners or Reviewers) cannot reassign owners or alter the project roster; their Team Management view is strictly read-only.

### 4. Global User Administration & Lifecycle
- **Centralized User Management**: Global Administrators (`ADMIN`) manage all platform user accounts via a dedicated User Management interface and administrative APIs.
- **User Provisioning & Listing**: Admins can inspect the complete registry of users and provision new accounts with assigned global roles (`ADMIN`, `USER`, `VIEWER`).
- **Account Deletion & Audit Trail Protection**:
  - Global Admins can delete user accounts that are obsolete or created in error.
  - Self-deletion of one's own administrator account is strictly prevented to safeguard platform access.
  - Default system accounts (`admin@superspec.com`, `product@superspec.com`, `data@superspec.com`, `qa@superspec.com`, `viewer@superspec.com`) are permanently protected from deletion.
  - Deletion of users with existing cryptographic signatures in project baselines is prohibited to preserve immutable audit records.

## Not Doing (and Why)
- **Not Replacing Task Management Tools:** This application does not track sprint velocity, burndown charts, or daily developer progress. It translates requirements into tasks and hands them off to Jira/Asana. We are the upstream source of truth, not the execution tracker.
- **No LLM Decision Making / No AI Magic:** The engine does not guess or generate requirements using AI. It is strictly deterministic to ensure audit compliance.
- **No CLI Interface:** A CLI workflow is entirely out of scope. We are building a centralized web application to ensure adoption by PMs and BOs.
- **No Code Generation:** Generating boilerplate application code from the TDD is out of scope. The boundary of this system ends at exporting actionable tickets.

## Open Questions & Resolutions
- **Visual Diagram Editor vs. Structured Schemas:**
  - *Resolution:* MVP adopts strictly structured JSON/form data entry. Read-only visualizations or graph views are layered downstream without introducing diagram editor state complexity.
- **Handling Change Requests (CRs) Post-Export:**
  - *Resolution:* Baselined state is cryptographically immutable once signed. In the current release, adding team members invalidates consensus and relocks export. Subsequent releases will introduce explicit versioned Change Request (CR) branches on top of signed baselines.
