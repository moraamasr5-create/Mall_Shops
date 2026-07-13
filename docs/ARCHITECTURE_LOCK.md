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
| 5 | ADR style | ADRs explain *why*; implementation examples live under `docs/implementation/` |
| 6 | Contracts | Generic platform; Module names are examples; Salon is Reference Module only |
| 7 | Authorization | **Two mandatory layers** — Database Isolation (RLS) + Business Permissions (Application) |

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

Architecture does **not** decide how `Module` is stored (table, constants, config, registry service, etc.). That is an Implementation decision for Vertical Slice 1 when a real need appears.

No BusinessUnit. No User table. No `owner_id` on Tenant.

---

## Authorization (Locked)

Authorization has **two layers**. Neither may be relied on alone.

| Layer | Responsibility | Owner |
|-------|----------------|-------|
| **Layer 1 — Database Isolation** | Tenant boundary enforcement (RLS or equivalent) | Data / Infrastructure |
| **Layer 2 — Business Permissions** | Role → explicit Permission evaluation | Application |

- Layer 1 prevents cross-Tenant data access even if application code fails
- Layer 2 decides whether the Identity may perform the requested business operation
- Skipping either layer is an architecture violation

---

## Module Registry (Locked Concept / Unlocked Storage)

**Locked:**

- `Module` is a first-class platform concept
- Tenants activate Modules through `TenantModule`
- Core never depends on a specific business Module (e.g. Salon)

**Not locked (Implementation — decide in Vertical Slice 1):**

- Database table
- Constants
- Config files
- Registry service
- Any other storage form

Do not treat “Module Catalog table” as an Architecture decision.

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
