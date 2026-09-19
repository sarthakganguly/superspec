# ADR-002: Traceability and Cryptographic Sign-offs

## Status
Accepted

## Date
2026-09-19

## Context
SuperSpec's core value proposition is ensuring that downstream deliverables strictly trace back to approved business requirements. Before a project can be exported for downstream systems, the team must guarantee that no requirements are orphaned, and all data entities are used. Furthermore, we must establish an immutable baseline of the requirements.

## Decision
1. **Traceability Engine**: We implement a validation matrix that parses User Stories (Gate 3) and checks if the entities defined in the Data Dictionary (Gate 2) are present in the stories. 
2. **Cryptographic Sign-off**: Once Traceability passes, members can "Sign Off" on the project. This action generates a deterministic SHA-256 hash of all requirements (Gate 1, 2, 3 artifacts).
3. **Immutability**: The hash and timestamp are stored in the `signoffs` table, creating an immutable cryptographic record of the project's state at the moment of approval.

## Alternatives Considered

### Status Flags (e.g., `status = 'APPROVED'`)
- Pros: Simple to implement.
- Cons: Provides no guarantee of *what* exactly was approved. If someone modifies the artifact post-approval, the status flag remains, hiding the tampering.
- Rejected: We require enterprise-grade auditability. Cryptographic hashing ensures that the baseline can be verified against the exact content that was approved.

## Consequences
- Artifact JSON must be serialized deterministically (sorted keys) before hashing to ensure consistent hashes across identical content.
- Traceability parsing relies on exact string matching for MVP; future iterations may require NLP for semantic matching.
