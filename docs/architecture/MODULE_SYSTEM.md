# Module System

This document describes how business modules integrate with the platform. It is an architectural guide — not a business contract.

For module enablement rules, see [TenantModule Contract](../contracts/TENANT_MODULE.md).

## Purpose

Mall Shops is a **multi-tenant, multi-module SaaS platform**. Business modules provide domain-specific capabilities (scheduling, ordering, inventory, etc.) while the platform core handles cross-cutting concerns (identity, tenancy, access control).

The platform is designed so that:

- New modules can be added without changing core contracts
- Modules never depend on each other
- Each tenant enables only the modules it needs
- The first module (Salon) serves as a reference implementation, not a platform assumption

## Module Types

| Module | Status | Domain |
|--------|--------|--------|
| Salon | Reference implementation (MVP) | Appointment-based service businesses |
| Restaurant | Planned | Food service |
| Clinic | Planned | Healthcare |
| Gym | Planned | Fitness |
| Pharmacy | Planned | Pharmaceutical retail |
| Store | Planned | General retail |

## Platform vs. Module Responsibilities

### Platform Core (not a module)

Handles concerns shared by all tenants and all modules:

- User authentication and identity
- Tenant management
- Membership and role-based access
- Module enablement (TenantModule)
- Cross-cutting validation and error handling

The platform core has no knowledge of any specific business module.

### Business Modules

Each module is a self-contained domain:

- Defines its own entities, rules, and workflows
- Manages its own data within the tenant boundary
- Exposes its own capabilities to authorized tenant members
- Follows platform contracts for tenancy and access but owns its business logic

## Module Independence Rules

1. **No cross-module imports** — a module must not reference types, services, or data from another module.
2. **No core-to-module imports** — the platform core must not import from any business module.
3. **Shared abstractions only** — common concepts (time slots, addresses, money) live in a shared layer, not in any module.
4. **Tenant-scoped data** — all module data belongs to a tenant and is isolated accordingly.
5. **Independent lifecycle** — enabling, disabling, or removing a module does not affect other modules.

## Module Activation

Module activation is governed by the TenantModule contract:

```
Tenant created
  → Initial module enabled (MVP: Salon)
  → Module capabilities become available
  → Module entities can be created and managed

Future: additional modules
  → Owner enables module via TenantModule
  → New capabilities appear alongside existing modules
```

### Activation States

| State | Meaning |
|-------|---------|
| **Enabled** | Module capabilities are active; members can use module features |
| **Disabled** | Module capabilities are suspended; data is retained but inaccessible |

## Module Structure (Recommended)

Each module should follow a consistent internal structure to support maintainability and team parallelism:

```
modules/<module-key>/
├── domain/           # Business logic (framework-independent)
├── application/      # Use cases and orchestration
├── infrastructure/   # Persistence and external service adapters
└── presentation/     # API and request handling
```

Detailed layering guidance is in [ADR-003: Domain-Driven Design Adoption](../adr/ADR-003-Domain-Driven-Design-Adoption.md).

## Adding a New Module

1. Define the module's domain entities and business rules.
2. Register the module key in the platform's approved module list.
3. Implement the module following the standard structure.
4. Ensure all module data is tenant-scoped.
5. Wire module routes into the application router.
6. No changes to platform core contracts are required.

## Reference Implementation: Salon

Salon is the first module and serves as the pattern for all future modules. It demonstrates:

- Tenant-scoped entities (employees, services, appointments)
- Role-based access within the module
- Standard module structure and layering
- Integration with platform core (tenant, membership, module enablement)

Salon-specific details belong in module documentation, not in platform contracts or architecture documents.

## MVP Decisions

> **MVP Decision:** Salon is the only implemented module. All other module types are registered as valid keys but not yet built.

> **MVP Decision:** Only one module may be active per tenant. Multi-module tenants are supported by the model but not yet in the product.

> **MVP Decision:** No plugin or dynamic loading system. Modules are compiled into the application as static dependencies.

## Related Documents

- [TenantModule Contract](../contracts/TENANT_MODULE.md)
- [Domain Model](./DOMAIN_MODEL.md)
- [Platform Architecture](./PLATFORM_ARCHITECTURE.md)
- [ADR-003: Domain-Driven Design Adoption](../adr/ADR-003-Domain-Driven-Design-Adoption.md)
