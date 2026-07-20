# Shift Contract

**Module:** `restaurant`  
**Concept:** Shift  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [DOMAIN_LANGUAGE](../../../modules/restaurant/DOMAIN_LANGUAGE.md) · [LIFECYCLE_MAP](../../../modules/restaurant/LIFECYCLE_MAP.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

> Period container behavior — not a timesheet product. Module-local for MVP limits, **not** because Shift is restaurant-only.

---

## 1. Purpose

Shift opens and closes the operating period so the restaurant knows when work may be accepted and when the day is accountable to close.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Shift** | Bounded operating period |
| **Logical business date** | The period’s business day (may overnight) |

**Forbidden:** Shift as Core · “Shift is Restaurant-only forever”

---

## 3. Responsibilities

**Responsible for:**

- Opening the period when the business may operate  
- Refusing close while active Orders remain  
- Closing the period when the day is clear  
- Exception force-close when governance allows  

**Not responsible for:**

- Order line contents  
- Fiscal accounting / Z-reports as a product  
- Shared Shift platform implementation (until migration)  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| **Shift** (Root) | Period consistency |
| May reference | Who opened/closed (Membership) |
| Does not contain | Orders as owned children (Orders reference the period) |

**Consistency rule:** Open and Close are period decisions; Close must see whether any Order still blocks the day.

---

## 5. State Machine

```
Closed → Open → Closing → Closed
```

| From | To | Business guard |
|------|----|----------------|
| Closed | Open | Within configured hours (or force) |
| Open | Closing | Close intended |
| Closing | Closed | No blocking non-terminal Orders |
| Closing | Open | Close aborted — work still active |

---

## 6. Invariants

1. At most one Open Shift for the place’s logical date (v1).  
2. New Orders require Open Shift when Shift is in use.  
3. A Shift cannot reach Closed while blocking Orders remain.  
4. Shift does not own Order Aggregates.  
5. Module-local placement is an MVP limit — the Pattern is cross-Module.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **OpenShift** | cashier, manager, owner | Hours allow (or authorized force) | Period open; Orders may be created |
| **CloseShift** | cashier, manager, owner | No blocking Orders | Period closed; day accountable |
| **ForceCloseShift** | manager, owner | Governance allows | Period closed despite normal hour rules |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **ShiftOpened** | OpenShift | Day/period started |
| **ShiftCloseAttempted** | Close intended | Entering Closing |
| **ShiftClosed** | CloseShift / ForceCloseShift | Period ended |
| **ShiftCloseRejected** | Close aborted | Work still blocks close |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | Orders associate to Open Shift; block Close |
| Settings | Hours window |
| Platform Timezone Policy | Interprets “now” / overnight day |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.shift.open` | OpenShift |
| `restaurant.shift.close` | CloseShift |
| `restaurant.shift.force_close` | ForceCloseShift |

---

## 11. Out of Scope

- Shared Shift product build  
- Cash drawer Settlement suite  
- Pilot payroll  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Migrate to Shared Shift | Shared Capability + OP |
| Multi-place periods | Tenant model expansion |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | SETTINGS · RESTAURANT_EMPLOYEE |
| **Uses** | ORDER (read for close validation) |
| **Referenced By** | ORDER · REPORTING |

---

## Acceptance

- [x] Behavior-first · MVP-local ≠ restaurant-only  
- [x] §13 filled  
