# ADR-005: Deterministic Bi-Directional Traceability Matrix Engine

## Status
Accepted

## Date
2026-10-31

## Context
A primary risk in requirements engineering is orphaned work items—domain data entities defined without any user stories exercising them, or user stories referencing entities that have never been modeled. SuperSpec requires a verification mechanism (Gate 4: Requirements Traceability Matrix) that validates bi-directional linkage across Gate 2 (Data Dictionary) and Gate 3 (User Stories) before allowing cryptographic sign-off.

## Decision
1. **Deterministic Bi-Directional Cross-Referencing**: Implement `analyze_traceability` in `backend/services/traceability.py` using deterministic case-insensitive string parsing.
   - For every user story, concatenate `title`, `description`, `given`, `when`, and `then` text.
   - Match entity names defined in Gate 2 against this aggregated text block.
2. **Hard-Blocking Error Gates**:
   - Any story lacking an entity reference is classified as an **Unanchored Story** (`orphaned_stories`).
   - Any entity never referenced across all stories is classified as an **Unused Entity** (`orphaned_entities`).
   - If `orphaned_stories` or `orphaned_entities` exist, `is_valid` is set to `False`. The sign-off endpoint (`POST /api/projects/{id}/signoff`) strictly rejects approvals with HTTP 400 until all orphaned items are resolved.
3. **Traceability Visualization**: The frontend renders an interactive inspection matrix distinguishing valid connections from blocking orphaned items with clear corrective badges.

## Alternatives Considered

### LLM / Semantic Embedding Matching
- Pros: Can infer conceptual connections even if naming varies (e.g., matching "Customer Account" to entity "User").
- Cons: Non-deterministic and non-reproducible; introduces token latency, non-zero API costs, and fails strict audit compliance where verification must yield identical results across every run.
- Rejected: SuperSpec’s founding requirement is 100% deterministic, audit-compliant requirements engineering without AI hallucinations.

### Explicit ID Link Picker (Manual Tagging)
- Pros: Eliminates substring collision ambiguity.
- Cons: Introduces significant authoring friction for BAs and architects who would have to manually tag each entity ID in multiple story dropdowns.
- Rejected: String matching against natural story text and Gherkin blocks provides a lower barrier to entry for authoring while maintaining strict verification.

## Consequences
- Requires exact name alignment: Entity names chosen in Gate 2 must appear verbatim (case-insensitive) in Gate 3 stories or acceptance criteria.
- 100% deterministic and reproducible across all audit runs and environments.
- Protects downstream systems from ingesting orphaned specs or ungrounded tickets.
