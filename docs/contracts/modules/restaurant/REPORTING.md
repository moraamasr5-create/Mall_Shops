# Reporting Contract

**Module:** `restaurant`  
**Concept:** Reporting  
**Status:** Accepted (Phase 3) — behavior boundary (Later for v1)  
**Parents:** [MVP_BOUNDARY](../../../modules/restaurant/MVP_BOUNDARY.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

Reporting answers questions about work in a period. In v1 it must **not** be required to complete the Order loop. This Contract reserves the behavior so implementation does not invent write-side “report Aggregates.”

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Reporting** | Read-side feedback on work performed |
| **Settlement** | Related economic close Pattern — separate |

---

## 3. Responsibilities

**Responsible for (when built):**

- Defining read questions (what happened in the period)  
- Exporting summaries without becoming system of record  

**Not responsible for (v1):**

- Shipping dashboards as MVP success  
- Mutating Orders/Shifts  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Aggregate Root | **None** |
| Nature | Read models over Order / Shift / Reservation |

---

## 5. State Machine

**None.**

---

## 6. Invariants

1. Reporting is never the system of record for Order or Shift.  
2. Restaurant v1 success does not require Reporting Commands.  
3. Cross-Module analytics belong to Shared Reporting when Triggers are met.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| *(none in v1)* | — | — | — |

**Future:** **ExportPeriodSummary** — read/export only; no Write Aggregate.

---

## 8. Domain Events

**None emitted.** Reporting observes other concepts’ Domain Events / state.

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order, Shift, Reservation | Read only |
| Shared Reporting | Later candidate |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.analytics.read` | Future observe/export |

---

## 11. Out of Scope (v1)

- Dashboards, BI, payroll formula exports as requirements  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| ExportPeriodSummary | Owner need + OP |
| Shared Reporting | Platform Trigger |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | ORDER · SHIFT · RESERVATION · PAYMENT (read) |
| **Uses** | — |
| **Referenced By** | — |

---

## Acceptance

- [x] Explicitly Later · does not block Order loop  
- [x] §13 filled  
