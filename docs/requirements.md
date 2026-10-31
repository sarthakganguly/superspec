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
- [x] **Centralized Web UI with RBAC:** Project-scoped roles (`PROJECT_ADMIN`, `GATE_1_OWNER`, `GATE_2_OWNER`, `GATE_3_OWNER`, `REVIEWER`) with `aria-readonly` view states for non-owners.
- [x] **Form-Based Authoring Interfaces:** Gate 1 (Business Requirements), Gate 2 (Data Dictionary), and Gate 3 (BDD User Stories).
- [x] **Deterministic Traceability Engine:** Bi-directional cross-referencing matrix that catches orphaned stories and unused entities without probabilistic AI models.
- [x] **Cryptographic Consensus Sign-off:** SHA-256 artifact baseline hashing requiring unanimous consensus from all active project members before export.
- [x] **Agnostic Export Layer:** In-memory streaming ZIP generation delivering `action_items.md` and machine-readable JSON payloads.

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
