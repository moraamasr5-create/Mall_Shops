# Module System

## Definition

The **Module System** is the architectural pattern that allows Mall Shops to support multiple independent business domains within a single platform.

Each Module is a **vertical slice** — complete business capability from authorization through data — that plugs into the Core platform.

---

## Design Goals

1. **Independence** — Modules never import from each other
2. **Consistency** — Every Module follows the same structural pattern
3. **Isolation** — Module data is Tenant-scoped and Module-namespaced
4. **Extensibility** — New Modules are added without modifying Core
5. **Replaceability** — A Module can be deprecated or retired without affecting others

---

## Module vs Core Boundary

| Concern | Owner |
|---------|-------|
| Who is the user? | Core (Identity) |
| Which Tenant? | Core (Tenant + Membership) |
| Is Module X enabled? | Core (TenantModule) |
| What Role does the user have? | Core (RBAC) |
| May this user perform action Y? | Core (Permissions) |
| What is an Appointment / Order / Treatment? | **Module** |
| Business rules for scheduling, ordering, etc. | **Module** |
| Module-specific data and configuration | **Module** |

---

## Module Structure (Logical)

Each Module is organized as an independent unit:

```
Module: {moduleKey}
├── Domain          Business entities, rules, and services
├── Application     Use cases and orchestration
├── Infrastructure  Data access and external adapters
└── Presentation    API handlers and validation
```

This follows Domain-Driven Design principles (see [ADR-003](../adr/ADR-003-Domain-Driven-Design-Adoption.md)).

Physical directory layout and code patterns are implementation concerns — see [DDD_MODULE_PATTERN.md](../implementation/DDD_MODULE_PATTERN.md).

---

## Module Registry

Architecture recognizes a **Module Registry concept**: the set of Modules the platform can offer.

| Example moduleKey | Status | Description |
|-------------------|--------|-------------|
| `salon` | Implemented — Reference Module | Personal services |
| `restaurant` | Implemented — second-module validation (VS5) | Hospitality |
| `clinic` | Planned | Healthcare |
| `gym` | Planned | Fitness |
| `pharmacy` | Planned | Retail health |
| `store` | Planned | General retail |

**Architecture Lock v1.0 FINAL:** Module is a first-class concept. Storage form is **not** locked.

Implementation may later use a database table, constants, config files, a registry service, or another mechanism. That choice belongs to Vertical Slice implementation — not Architecture.

Availability status is governed by [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md).

---

## Activation Flow

```
Tenant created
      │
      ▼
TenantModule record(s) created     ◄── Core responsibility
      │
      ▼
Module enabled for Tenant
      │
      ▼
Module initialization (if any)     ◄── Module responsibility
      │
      ▼
Module ready for operations
```

Activation is recorded in Core. Initialization logic lives in the Module.

---

## Data Isolation

Every Module follows these data rules:

1. **All tables include Tenant reference** — no Module data exists without Tenant scope
2. **Table naming uses Module prefix** — e.g., `{moduleKey}_entity_name`
3. **No cross-Module foreign keys** — Modules do not reference each other's tables
4. **RLS or equivalent enforces Tenant boundary** — see [RLS.md](../implementation/RLS.md)

```
Tenant A + salon Module
  └── salon_appointment (tenant_id = A)
  └── salon_employee   (tenant_id = A)

Tenant A + restaurant Module
  └── restaurant_order  (tenant_id = A)
  └── restaurant_table  (tenant_id = A)
```

---

## Permission Namespace

Each Module defines Permissions prefixed with its `moduleKey`:

```
{moduleKey}:{resource}:{action}[:{scope}]
```

Examples of the pattern (not specific to any current Module):

- `{moduleKey}:appointment:read`
- `{moduleKey}:appointment:write`
- `{moduleKey}:employee:manage`

Core evaluates these using the same Permission engine as platform Permissions.

---

## Adding a New Module (Checklist)

1. **Register** `moduleKey` in the platform Module catalog
2. **Define** Permission vocabulary for the Module
3. **Map** Permissions to Core Roles
4. **Implement** Module vertical slice (domain → application → infrastructure → presentation)
5. **Add** data schema with Tenant scoping
6. **Add** isolation policies
7. **Enable** via TenantModule activation
8. **Document** Module-specific contracts (future: `docs/contracts/modules/{moduleKey}/`)

Steps 1–3 are design. Steps 4–7 are implementation. Step 8 extends the contract layer.

**No changes to Core are required** beyond catalog registration.

---

## Module Independence Rules

| Rule | Rationale |
|------|-----------|
| Modules never import from other Modules | Prevents coupling and deployment dependencies |
| Modules only import from Core and Shared | Clear dependency direction |
| Modules do not modify Core entities | Core stability |
| Modules do not share database tables | Independent schema evolution |
| Cross-Module workflows use application orchestration | No direct Module-to-Module calls |

---

## Reference Module

The first Module implemented serves as the **reference pattern** for all future Modules.

The reference Module validates:

- Directory structure
- DDD layer separation
- Permission registration
- TenantModule activation flow
- Data isolation approach
- Testing strategy

Which Module serves as the reference is an MVP decision — see [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md).

---

## Deprecation and Retirement

| Stage | Behavior |
|-------|----------|
| **Deprecated** | No new activations; existing Tenants continue |
| **Disabled** | TenantModule set to `enabled = false`; data retained |
| **Retired** | Module removed from catalog; all activations cleared; data archived or migrated |

---

## Related Documents

- [PLATFORM.md](./PLATFORM.md) — Core platform design
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System overview
- [MODULE Contract](../contracts/MODULE.md) — Business definition
- [TENANT_MODULE Contract](../contracts/TENANT_MODULE.md) — Activation mechanism
- [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) — First Module scope
