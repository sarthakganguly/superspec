# Gate Schemas and Data Contract Specification

This document defines the strict data contracts, validation rules, and schema models enforced by SuperSpec across all requirement authoring gates.

## Storage Architecture
All gate artifacts are stored in the PostgreSQL `artifacts` table using `JSONB` columns, keyed by `(project_id, artifact_type)`:
- `project_id`: UUID
- `artifact_type`: String identifier (e.g., `business-requirements`, `data-dictionary`, `user-stories`)
- `content`: JSONB payload strictly validated against Pydantic models upon submission

---

## Gate 1: Business Requirements
- **Artifact Type**: `business-requirements`
- **Authorized Roles**: `GATE_1_OWNER`, `PROJECT_ADMIN`
- **Endpoint**: `PUT /api/projects/{id}/artifacts/business-requirements`

### Validation Schema
| Field | Type | Rules | Description |
|---|---|---|---|
| `problem_statement` | `string` | Min length: 10 chars | Core problem this project addresses |
| `target_audience` | `string` | Min length: 5 chars | Target user segment or persona |
| `success_metrics` | `array[string]` | Min items: 1 | Key Performance Indicators (KPIs) |
| `in_scope` | `array[string]` | Min items: 1 | Functional boundaries in scope |
| `out_of_scope` | `array[string]` | Optional (default: `[]`) | Explicit exclusions |

### Example Payload
```json
{
  "problem_statement": "Users lack a deterministic method to track requirements into ticket tasks.",
  "target_audience": "Product Managers, Architects, and QA Leads",
  "success_metrics": [
    "Zero unanchored requirements reaching engineering",
    "100% consensus sign-off before export"
  ],
  "in_scope": [
    "Form authoring",
    "Requirements Traceability Matrix",
    "Consensus digital sign-offs",
    "ZIP markdown export"
  ],
  "out_of_scope": [
    "Sprint burn-down tracking",
    "Automated code generation"
  ]
}
```

---

## Gate 2: Data Dictionary
- **Artifact Type**: `data-dictionary`
- **Authorized Roles**: `GATE_2_OWNER`, `PROJECT_ADMIN`
- **Endpoint**: `PUT /api/projects/{id}/artifacts/data-dictionary`

### Validation Schema
| Field | Type | Rules | Description |
|---|---|---|---|
| `entities` | `array[Entity]` | Min items: 1 | Domain entities |
| `Entity.name` | `string` | Min length: 1 char | Entity name (used for Traceability RTM matching) |
| `Entity.attributes` | `array[Attribute]` | Min items: 1 | Entity attribute definitions |
| `Attribute.name` | `string` | Min length: 1 char | Attribute property name |
| `Attribute.type` | `string` | Standard primitive | One of: `String`, `Integer`, `Float`, `Boolean`, `Date`, `DateTime`, `UUID`, `JSON` |
| `Attribute.nullable`| `boolean` | Default: `false` | Nullability constraint |
| `Attribute.description` | `string` | Optional (default: `""`)| Field description |

### Example Payload
```json
{
  "entities": [
    {
      "name": "ProjectMember",
      "attributes": [
        { "name": "id", "type": "UUID", "nullable": false, "description": "Primary key" },
        { "name": "user_id", "type": "UUID", "nullable": false, "description": "Foreign key to User" },
        { "name": "role", "type": "String", "nullable": false, "description": "Assigned project role" }
      ]
    }
  ]
}
```

---

## Gate 3: User Stories (BDD / Gherkin)
- **Artifact Type**: `user-stories`
- **Authorized Roles**: `GATE_3_OWNER`, `PROJECT_ADMIN`
- **Endpoint**: `PUT /api/projects/{id}/artifacts/user-stories`

### Validation Schema
| Field | Type | Rules | Description |
|---|---|---|---|
| `stories` | `array[UserStory]` | Min items: 1 | List of BDD stories |
| `UserStory.title` | `string` | Min length: 5 chars | Concise story title |
| `UserStory.description`| `string` | Min length: 10 chars| Narrative format ("As a... I want... So that...") |
| `UserStory.given` | `string` | Min length: 1 char | BDD context precondition |
| `UserStory.when` | `string` | Min length: 1 char | Triggering user action |
| `UserStory.then` | `string` | Min length: 1 char | Expected observable outcome |
| `UserStory.complexity` | `integer` | 1 <= complexity <= 13 | Story points estimation |

### Example Payload
```json
{
  "stories": [
    {
      "title": "ProjectMember Access Control",
      "description": "As a project administrator, I want to assign roles so that gate editing is protected.",
      "given": "A user is assigned the GATE_1_OWNER role",
      "when": "They attempt to edit Gate 2 Data Dictionary",
      "then": "The system denies access with a 403 Forbidden response",
      "complexity": 5
    }
  ]
}
```

---

## Traceability Cross-Referencing Rules
1. The **Requirements Traceability Matrix (RTM)** scans Gate 3 text (`title`, `description`, `given`, `when`, `then`) for exact case-insensitive matches against each `Entity.name` defined in Gate 2.
2. Stories with no matching entity are flagged as **Unanchored Stories** (`orphaned_stories`).
3. Entities never matched in any story are flagged as **Unused Entities** (`orphaned_entities`).
4. Both conditions hard-block Gate 5 cryptographic sign-off.
