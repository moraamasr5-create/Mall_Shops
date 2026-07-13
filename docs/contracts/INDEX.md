# Business Contracts — Index

## Purpose

This directory is the **single source of truth** for Mall Shops business rules.

Contracts describe **what the platform must guarantee** — not how it is built.

They are:

- Technology-independent (no database, ORM, framework, or cloud provider)
- Permanent (valid across implementation changes)
- The authority for all architecture and implementation decisions

If implementation conflicts with a contract, **implementation is wrong**.

---

## Reading Order

Read contracts in this order to build a complete mental model:

| Order | Contract | Summary |
|-------|----------|---------|
| 1 | [IDENTITY.md](./IDENTITY.md) | Who acts on the platform (external Identity Provider) |
| 2 | [TENANT.md](./TENANT.md) | Organizational context for a business |
| 3 | [MEMBERSHIP.md](./MEMBERSHIP.md) | Links Identity to Tenant with a Role |
| 4 | [MODULE.md](./MODULE.md) | Platform-level business module catalog |
| 5 | [TENANT_MODULE.md](./TENANT_MODULE.md) | Module activation per Tenant |
| 6 | [RBAC.md](./RBAC.md) | Role-based access within a Tenant |
| 7 | [PERMISSION.md](./PERMISSION.md) | Fine-grained authorization grants |

---

## Entity Relationship Overview

```
Identity Provider
       │
       ▼
   Identity ─────────────────────────────────────┐
       │                                        │
       │ (via Membership)                       │
       ▼                                        │
    Tenant ◄───────────────────────────────────┘
       │
       ├── Membership (1:N) ──► Role
       │
       └── TenantModule (1:N) ──► Module
                                        │
                                        ▼
                              Module-Specific Data
                              (scoped by Tenant)
```

---

## Core Invariants (Platform-Wide)

These rules span multiple contracts and must never be violated:

1. **No User entity in the application domain** — Identity is external.
2. **No `owner_id` on Tenant** — Ownership is expressed only via `Membership(role = OWNER)`.
3. **Core is module-agnostic** — Core knows Tenant, Membership, Module, Identity, and Authorization only.
4. **Multi-tenant from day one** — One Identity may belong to many Tenants; one Tenant may enable many Modules.
5. **TenantModule is generic** — It is the platform mechanism for module activation, not a module-specific concept.
6. **Data isolation is per Tenant** — All business data is scoped to a Tenant.
7. **Authorization has two layers** — Database Isolation (RLS or equivalent) **and** Business Permissions (Application). Neither alone is sufficient.
8. **Module storage is not a Contract concern** — Module is a platform concept; persistence form is Implementation.

---

## What Does NOT Belong Here

| Belongs in Contracts | Belongs Elsewhere |
|---------------------|-------------------|
| Business rules and invariants | Database schema → [implementation/DATABASE.md](../implementation/DATABASE.md) |
| Entity definitions and relationships | ORM models → [implementation/PRISMA.md](../implementation/PRISMA.md) |
| Lifecycle and ownership rules | Auth provider setup → [implementation/SUPABASE.md](../implementation/SUPABASE.md) |
| Authorization semantics | RLS policies → [implementation/RLS.md](../implementation/RLS.md) |
| | API design → [implementation/API.md](../implementation/API.md) |
| | Temporary MVP choices → [mvp/MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) |

---

## Related Documentation

- [Architecture Overview](../architecture/ARCHITECTURE.md)
- [Platform Design](../architecture/PLATFORM.md)
- [Module System](../architecture/MODULE_SYSTEM.md)
- [MVP Decisions](../mvp/MVP_DECISIONS.md)
