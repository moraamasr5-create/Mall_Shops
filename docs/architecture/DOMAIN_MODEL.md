# Domain Model

This document describes the platform's core domain entities and their relationships. It is an architectural view — not a business contract and not a database schema.

For authoritative business rules, see [Business Contracts](../contracts/INDEX.md).

## Core Entities

### User

A platform identity representing a person who can authenticate and interact with the system.

- Exists independently of any tenant
- May hold memberships in multiple tenants
- Does not carry tenant-specific roles directly

### Tenant

A business organization operating on the platform. See [Tenant Contract](../contracts/TENANT.md).

### Membership

The association between a user and a tenant, including role. See [Membership Contract](../contracts/MEMBERSHIP.md).

### TenantModule

The enablement of a business module for a tenant. See [TenantModule Contract](../contracts/TENANT_MODULE.md).

### Business Module (logical)

A self-contained domain of business functionality. Modules are not platform entities — they are logical capabilities activated through TenantModule.

Known module types:

| Module Key | Domain |
|------------|--------|
| `salon` | Appointment-based service businesses (reference implementation) |
| `restaurant` | Food service and table management |
| `clinic` | Healthcare appointments and patient records |
| `gym` | Fitness memberships and class scheduling |
| `pharmacy` | Prescription and inventory management |
| `store` | Retail inventory and point of sale |

Additional modules may be added without changing core platform contracts.

## Entity Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│   User   │──N:1──│ Membership  │──N:1──│  Tenant  │
└──────────┘       └─────────────┘       └────┬─────┘
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
                                        │   Business   │
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
| User | Platform (global) |
| Tenant | Platform (global) |
| Membership | Tenant |
| TenantModule | Tenant |
| Module entities | Tenant (via module enablement) |

Every business entity below the tenant level carries an implicit tenant scope. Cross-tenant references are prohibited.

## Aggregate Boundaries

| Aggregate Root | Contains | Consistency Boundary |
|----------------|----------|---------------------|
| **Tenant** | Memberships, TenantModules | Tenant deletion cascades to all children |
| **Membership** | Role assignment | Role changes are atomic per membership |
| **TenantModule** | Enablement state | Enable/disable is atomic per module type |
| **Module entities** | Domain-specific data | Managed within each business module |

## Identity Context

When a user acts on the platform, the system must resolve:

1. **Who** — the authenticated user
2. **Where** — the active tenant (from membership)
3. **What** — the enabled modules for that tenant
4. **How much** — the user's role within that tenant

All four dimensions are required before business operations proceed.

## Module Entity Pattern

Each business module defines its own entities. All module entities follow a common pattern:

- Belong to exactly one tenant
- Are accessible only through valid membership in that tenant
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

The same tenant could later enable additional modules, each with its own entity set.

## MVP Scope

> **MVP Decision:** The Salon module is the first reference implementation. Its entities establish the pattern for future modules but do not define platform-level contracts.

> **MVP Decision:** BusinessUnit (sub-division within a tenant) is deferred. All data is scoped to the tenant level only.
