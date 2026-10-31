# ADR-004: In-Memory Action Items ZIP & Markdown Export Engine

## Status
Accepted

## Date
2026-10-31

## Context
SuperSpec functions as an upstream requirements engineering and validation layer that translates baselined specifications into downstream work management systems (Jira, GitHub Issues, Asana). Once all project members provide cryptographic sign-off in Gate 5, the system must export these requirements in an actionable format without introducing server-side file management overhead or persistent disk leakage.

## Decision
1. **In-Memory ZIP Streaming**: Implement export generation using Python's `io.BytesIO` and `zipfile.ZipFile`, streamed directly to the client via FastAPI's `StreamingResponse` (`media_type="application/x-zip-compressed"`). No intermediate export files are written to the container or host filesystem.
2. **Dual-Artifact Export Format**:
   - `action_items.md`: Slices Gate 3 User Stories into discrete, ticket-ready markdown blocks containing Title, Complexity (Story Points), Description, and BDD Acceptance Criteria (GIVEN / WHEN / THEN).
   - `<project_name>_raw.json`: Complete, formatted JSON dump of all gates (Business Requirements, Data Dictionary, User Stories) for machine-to-machine integrations.
3. **Dynamic Consensus Gate Enforcement**: The `/api/projects/{id}/export` endpoint dynamically validates that `signoff_count >= member_count` and `member_count > 0` before streaming. Adding a new project member automatically blocks export until that member signs off.

## Alternatives Considered

### Direct Webhook / API Push (Jira/GitHub OAuth Integration)
- Pros: Seamless 1-click push into Jira or GitHub issues.
- Cons: Introduces complex external credential management, rate-limiting, failure retry queues, and tool-specific schema differences into the MVP core engine.
- Rejected: Phase 1 focuses on a universal, tool-agnostic export format that works everywhere without third-party API dependencies. Direct integrations will be layered as separate plugins in later phases.

### File-System Staging (Writing ZIPs to Disk)
- Pros: Easier to inspect temporary files during debugging.
- Cons: Requires cleanup cron jobs, volume storage management, and creates race conditions or security risks if multi-tenant data sits in temporary directories.
- Rejected: In-memory streaming via `io.BytesIO` is stateless, thread-safe, and leaves no residual data on disk.

## Consequences
- Zero disk-cleanup overhead or storage leaks on backend containers.
- The exported markdown can be directly copy-pasted into Jira tickets or parsed by ingestion scripts.
- Memory usage scales with the size of project artifacts during ZIP creation; since requirement text payloads are small (< 5MB), in-memory buffering is optimal and fast.
