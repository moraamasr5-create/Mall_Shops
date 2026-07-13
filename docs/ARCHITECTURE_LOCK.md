# Architecture Lock v1.0 — FINAL

## Status

**FINAL LOCKED**

Date: 2026-07-13

The documentation layer is stable.

From this point forward:

- ❌ No further architectural redesign
- ❌ No new ADRs unless a real implementation flaw forces one
- ✅ Code proceeds via Vertical Slices only
- ✅ Return to documentation only if an actual architectural problem appears during implementation

---

## Locked Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | BusinessUnit | **Removed** — permanently out of scope |
| 2 | JWT Strategy | JWT = Identity only; Tenant via `X-Tenant-Id`; Roles/Permissions loaded per request |
| 3 | RBAC | Explicit Permission mapping only — no implicit inheritance |
| 4 | Module Registry | **Architectural concept only** — storage mechanism is **not** locked |
| 5 | TenantModule | **Architectural relationship only** — persistence/lifecycle mechanism is **not** locked |
| 6 | ADR style | ADRs explain *why*; implementation examples live under `docs/implementation/` |
| 7 | Contracts | Generic platform; Module names are examples; Salon is Reference Module only |
| 8 | Authorization | **Two mandatory layers** — Database Isolation (RLS) + Business Authorization (Application) |

---

## Locked Entity Model

```
Identity
  → Membership
    → Tenant
      → TenantModule
        → Module
```

Architecture knows these concepts and their relationships.

Architecture does **not** decide how `Module` or `TenantModule` are persisted
(table, constants, config, feature flags, registry service, etc.).
Those are Implementation decisions made during Vertical Slices when a real need appears.

No BusinessUnit. No User table. No `owner_id` on Tenant.

---

## Authorization (Locked)

Authorization has **two layers**. Both are permanent architectural invariants. Neither may be relied on alone.

| Layer | Responsibility | Owner | Must Not |
|-------|----------------|-------|----------|
| **Layer 1 — Database Isolation** | Tenant data isolation only | Data / Infrastructure (RLS or equivalent) | Encode business permissions |
| **Layer 2 — Business Authorization** | Roles and Permissions evaluation | Application | Rely solely on the client |

Rules:

- Layer 1 prevents cross-Tenant data access even if application code fails
- Layer 2 decides whether the Identity may perform the requested business operation
- Layer 1 must never become a substitute for Roles/Permissions
- Layer 2 must never trust the client as the sole authority
- Skipping either layer is an architecture violation

---

## Module & TenantModule (Locked Concepts / Unlocked Persistence)

**Locked:**

- `Module` is a first-class platform concept
- `TenantModule` is the architectural relationship: Tenant ↔ Module activation
- A Tenant can enable one or more Modules
- A Module can be enabled for many Tenants
- Module activation is part of the platform capability model
- Core never depends on a specific business Module (e.g. Salon)

**Not locked (Implementation — decide in Vertical Slices):**

How Module registry or TenantModule activation is realized:

- Database table
- Constants / code registry
- Config files
- Feature flags
- Registry service
- Any other mechanism

Do not treat “Module Catalog table” or “TenantModule table” as Architecture decisions.

---

## Locked Documentation Layers

| Layer | Path | Authority |
|-------|------|-----------|
| Contracts | `docs/contracts/` | Source of truth for business rules |
| Architecture | `docs/architecture/` | System design |
| Implementation | `docs/implementation/` | Current technology mapping (may evolve) |
| MVP | `docs/mvp/` | Temporary first-release decisions |
| ADRs | `docs/adr/` | Why decisions were made |

---

## Delivery Process (Locked)

```
Business Contract
  → Architecture
  → Implementation Docs
  → Vertical Slice
  → Code
  → Review
  → Next Slice
```

**No skipping layers.**

---

## Next Work

**Vertical Slice 1**

`Identity → Tenant → Membership → TenantModule → Salon (Reference Module)`

No further documentation expansion unless a critical implementation flaw is discovered.

---

## Related Documents

- [Contracts Index](./contracts/INDEX.md)
- [Architecture Overview](./architecture/ARCHITECTURE.md)
- [MVP Decisions](./mvp/MVP_DECISIONS.md)
- [ADR-002](./adr/ADR-002-Identity-Model-and-JWT-Claims.md)
- [ADR-003](./adr/ADR-003-Domain-Driven-Design-Adoption.md)
