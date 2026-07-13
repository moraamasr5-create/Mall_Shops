# Module Contract

## Definition

A **Module** represents a distinct business domain capability offered by the platform.

Examples of business domains the platform is designed to support:

- Personal services (e.g., salon, clinic, gym)
- Hospitality (e.g., restaurant)
- Retail (e.g., pharmacy, store)

Modules are **platform-level concepts**. They are not Tenant-specific.

---

## Responsibility

- Define a catalog of business capabilities the platform can offer
- Provide a stable identifier (`moduleKey`) for activation and routing
- Serve as the namespace boundary for module-specific business rules and data

---

## Invariants

1. **Module keys are predefined and immutable**
   - Each Module has a unique, permanent `moduleKey`.
   - Once published, a `moduleKey` is never renamed or recycled.

2. **Modules are platform-wide, not Tenant-scoped**
   - The Module catalog exists independently of any Tenant.
   - Tenants activate Modules through [TenantModule](./TENANT_MODULE.md).

3. **Modules are independent of each other**
   - No Module may depend on another Module's internal entities.
   - Shared platform concerns belong in Core, not in cross-module imports.

4. **Core does not contain Module-specific logic**
   - Core knows that Modules exist and how they are activated.
   - Core does not know business rules inside any Module.

5. **Module-specific data is always Tenant-scoped**
   - Even though Module definitions are platform-wide, all operational data belongs to a Tenant.

---

## Attributes (Business)

| Attribute | Description |
|-----------|-------------|
| `moduleKey` | Stable, unique identifier (lowercase, singular noun) |
| Display name | Human-readable name |
| Description | Summary of business capability |
| Status | Available, deprecated, or retired |

---

## Module Registry (Platform Concept)

The platform recognizes **Module** as a first-class architectural concept.

- Modules have a stable `moduleKey`
- Tenants activate Modules only through [TenantModule](./TENANT_MODULE.md)
- Core never hardcodes business logic for any specific Module

**Storage is not part of this Contract.**

How Modules are registered or persisted (database table, constants, config, registry service, etc.) is an **Implementation decision**. It must not be treated as a permanent Architecture Lock.

### Example Module Keys (Illustrative Only)

These names are **examples** of domains the platform may support. They are not Core dependencies.

| Example `moduleKey` | Example Domain |
|---------------------|----------------|
| `salon` | Personal services |
| `restaurant` | Hospitality |
| `clinic` | Healthcare |
| `gym` | Fitness |
| `pharmacy` | Retail health |
| `store` | General retail |

Which Modules are implemented or activatable in the first release is governed by [MVP Decisions](../mvp/MVP_DECISIONS.md).

The first implemented Module is a **Reference Module** only — the platform itself never depends on it.

---

## Relationships

```
Module (platform concept)
         │
         │ (activated via TenantModule)
         ▼
       Tenant
         │
         ▼
  Module-Specific Data (Tenant-scoped)
```

| Related Entity | Relationship | Contract |
|---------------|--------------|----------|
| TenantModule | Activation of this Module for a Tenant | [TENANT_MODULE.md](./TENANT_MODULE.md) |
| Tenant | Organization using the Module | [TENANT.md](./TENANT.md) |

---

## Lifecycle (Platform Level)

### Registration

- A new Module is registered in the platform catalog with a unique `moduleKey`.
- Registration includes business scope definition and initial Role/Permission contributions.

### Availability

- A Module may be marked available for Tenant activation.
- Unreleased Modules are not activatable by Tenants.

### Deprecation

- A deprecated Module cannot be newly activated.
- Existing activations continue until explicitly disabled and migrated.

### Retirement

- A retired Module is removed from the catalog.
- All Tenant activations must be cleared before retirement.

---

## Module Boundaries

Each Module owns:

- Its business entities and rules
- Its Role extensions (if any) within the RBAC framework
- Its Permission vocabulary within the Module namespace

Each Module does **not** own:

- Identity or authentication
- Tenant or Membership management
- Cross-Tenant isolation policy

---

## Related Contracts

- [TENANT_MODULE.md](./TENANT_MODULE.md) — Per-Tenant activation
- [TENANT.md](./TENANT.md) — Organizational context
- [RBAC.md](./RBAC.md) — Role framework
- [PERMISSION.md](./PERMISSION.md) — Permission vocabulary
