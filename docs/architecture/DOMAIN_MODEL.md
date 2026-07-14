# Domain Model

This document describes the platform's core domain entities and their relationships. It is an architectural view — not a business contract and not a database schema.

For authoritative business rules, see [Business Contracts](../contracts/INDEX.md).
For locked entity decisions, see [Architecture Lock v1.0](../ARCHITECTURE_LOCK.md).

## Core Entities

### Identity

A platform identity representing a person who can authenticate and interact with the system.

- Provided by an external Identity Provider (Supabase Auth today)
- Exists independently of any Tenant
- May hold Memberships in multiple Tenants
- Does not carry Tenant-specific Roles directly
- There is **no** application `User` table as a source of truth

### Tenant

A business organization operating on the platform. See [Tenant Contract](../contracts/TENANT.md).

Ownership is expressed only as `Membership(role = OWNER)`. Tenants have **no** `owner_id`.

### Membership

The association between an Identity and a Tenant, including Role. See [Membership Contract](../contracts/MEMBERSHIP.md).

### TenantModule

The enablement of a business Module for a Tenant. See [TenantModule Contract](../contracts/TENANT_MODULE.md).

Persistence of TenantModule is an Implementation choice (unlocked by Architecture Lock).

### Module (logical)

A self-contained domain of business functionality. Module is a first-class platform **concept**; registry storage is not Architecture-locked.

Known module keys (examples / catalog — not all are product MVP):

| Module Key | Domain |
|------------|--------|
| `salon` | Appointment-based service businesses (reference implementation) |
| `restaurant` | Food service (architectural validation only in MVP) |
| `clinic` | Healthcare appointments and patient records |
| `gym` | Fitness memberships and class scheduling |
| `pharmacy` | Prescription and inventory management |
| `store` | Retail inventory and point of sale |

Additional modules may be added without changing Core platform contracts.

## Entity Relationship Diagram

```
┌────────────┐       ┌─────────────┐       ┌──────────┐
│  Identity  │──N:1──│ Membership  │──N:1──│  Tenant  │
└────────────┘       └─────────────┘       └────┬─────┘
                                                │
                                                │ 1:N
                                                ▼
                                          ┌──────────────┐
                                          │ TenantModule │
                                          └──────┬───────┘
                                                 │
                                                 │ activates
                                                 ▼
                                          ┌──────────────┐
                                          │    Module    │
                                          │   (logical)  │
                                          └──────┬───────┘
                                                 │
                                                 │ contains
                                                 ▼
                                          ┌──────────────┐
                                          │   Module     │
                                          │   Entities   │
                                          └──────────────┘
```

## Scoping Rules

| Entity | Scoped to |
|--------|-----------|
| Identity | Platform (global / Identity Provider) |
| Tenant | Platform (global) |
| Membership | Tenant |
| TenantModule | Tenant |
| Module entities | Tenant (via module enablement) |

Every business entity below the Tenant level carries Tenant scope. Cross-Tenant references are prohibited.

## Aggregate Boundaries

| Aggregate Root | Contains | Consistency Boundary |
|----------------|----------|---------------------|
| **Tenant** | Memberships, TenantModules | Tenant deletion cascades to all children |
| **Membership** | Role assignment | Role changes are atomic per membership |
| **TenantModule** | Enablement state | Enable/disable is atomic per module key |
| **Module entities** | Domain-specific data | Managed within each business module |

## Identity Context

When an Identity acts on the platform, the system must resolve:

1. **Who** — the authenticated Identity (`JWT.sub`)
2. **Where** — the active Tenant (`X-Tenant-Id` + Membership)
3. **What** — the enabled Modules for that Tenant
4. **How much** — the Identity's Role → Permissions within that Tenant

All four dimensions are required before business operations proceed.

## Module Entity Pattern

Each business module defines its own entities. All module entities follow a common pattern:

- Belong to exactly one Tenant
- Are accessible only through valid Membership in that Tenant
- Are independent of entities in other modules
- Do not reference entities from other modules directly

Example (conceptual, not implementation):

```
Tenant "Golden Group"
  └── TenantModule (salon: enabled)
        ├── Employee
        ├── Service
        ├── Customer
        └── Appointment
```

The same Tenant could later enable additional modules, each with its own entity set.

## MVP Scope

> **MVP Decision:** The Salon module is the first reference implementation. Its entities establish the pattern for future modules but do not define platform-level contracts.

> **Architecture Lock:** BusinessUnit is **removed** — permanently out of scope. All data is scoped to the Tenant level only.
