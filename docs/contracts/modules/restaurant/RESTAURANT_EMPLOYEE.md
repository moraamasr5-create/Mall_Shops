# RestaurantEmployee Contract

**Module:** `restaurant`  
**Concept:** RestaurantEmployee  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [PACKAGE_MANIFEST](../../../modules/restaurant/PACKAGE_MANIFEST.md) · Core Membership / RBAC  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

RestaurantEmployee assigns who in the Tenant may act in the restaurant day (and in which role). Identity and Membership stay in Core; Restaurant only grants Module work.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **RestaurantEmployee** | Assignment of a Membership into restaurant roles |
| **Assigned Staff** | Who is acting or assigned on work |

**Forbidden:** StaffMember Aggregate · Driver Aggregate · replacing Core Membership

---

## 3. Responsibilities

**Responsible for:**

- Granting and revoking restaurant roles on a Membership  
- Defining who may intend Module Commands  
- Providing assignees for delivery Fulfillment  

**Not responsible for:**

- Creating Identities or Tenants  
- HR / payroll products  
- Duplicating SalonEmployee as a required Aggregate  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Aggregate Root | **None** |
| Assignment | On Core Membership |

**Consistency rule:** Role grant/revoke changes who may intend Commands; it does not create a workforce Aggregate.

---

## 5. State Machine

```
Active assignment ◄──► Revoked
```

---

## 6. Invariants

1. Assignment requires an existing Membership in the Tenant.  
2. Restaurant Module must be active for grants to apply.  
3. No second employee Aggregate.  
4. Platform RBAC primitives enforce permissions.  
5. Role `pilot` is for Fulfillment assignee actions when mode = delivery.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **AssignRestaurantRole** | owner, manager | Membership exists; Module active | Person may act in that role |
| **RevokeRestaurantRole** | owner, manager | Assignment exists | Person loses that role |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **RestaurantRoleAssigned** | AssignRestaurantRole | New capability to act |
| **RestaurantRoleRevoked** | RevokeRestaurantRole | Capability removed |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Core Membership | Target of assignment |
| Order / Fulfillment | Actors and assignees |
| All Module Contracts | Permissions gate Commands |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.staff.assign` | AssignRestaurantRole, RevokeRestaurantRole |

Operational permissions live on the Contracts whose Commands they gate.

---

## 11. Out of Scope

- Staff Aggregate  
- Attendance payroll formulas  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Shared workforce Capability | Only if cross-Module Pattern proven |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | Core Membership (outside Module pack) · SETTINGS (Module active) |
| **Uses** | — |
| **Referenced By** | ORDER · FULFILLMENT · MENU · SHIFT · RESERVATION · PAYMENT · SETTINGS |

---

## Acceptance

- [x] Assignment behavior · not Aggregate  
- [x] §13 filled  
