# Platform Design

## Definition

The **Platform** is the module-agnostic foundation that every business Module builds upon.

It provides organizational context, identity resolution, access control, and module activation — but **no business logic** belonging to any specific domain.

---

## Core Components

The Core layer consists of exactly five concerns:

| Component | Contract | Responsibility |
|-----------|----------|---------------|
| **Tenant** | [TENANT.md](../contracts/TENANT.md) | Organizational isolation boundary |
| **Membership** | [MEMBERSHIP.md](../contracts/MEMBERSHIP.md) | Identity ↔ Tenant association with Role |
| **Module** | [MODULE.md](../contracts/MODULE.md) | Business capability catalog |
| **Identity** | [IDENTITY.md](../contracts/IDENTITY.md) | External identity reference |
| **Authorization** | [RBAC.md](../contracts/RBAC.md) + [PERMISSION.md](../contracts/PERMISSION.md) | Access control |

### What Core Knows

- That Tenants exist and must be isolated
- That Identities access Tenants through Membership
- That Modules can be activated per Tenant via TenantModule
- That Roles map to Permissions

### What Core Does NOT Know

- Salon appointments, restaurant menus, clinic patients, or any Module-specific entity
- Module-specific business rules or workflows
- Module-specific UI or API shapes

---

## TenantModule in Core

[TenantModule](../contracts/TENANT_MODULE.md) is a **Core entity**, not a Module entity.

It answers one question: *"Is Module X enabled for Tenant Y?"*

```
Core
├── Tenant
├── Membership
├── Module (catalog)
├── TenantModule (activation)    ◄── generic, not Salon-specific
├── Identity (reference)
└── Authorization
```

Module-specific tables, services, and rules live **below** this line, inside each Module.

---

## Multi-Tenancy Model

Multi-tenancy is a **data and authorization property**, not a separate architecture layer.

```
Platform
└── Tenant A
│     ├── Memberships
│     ├── TenantModules [salon ✓, restaurant ✓]
│     └── Data (isolated by Tenant A)
└── Tenant B
      ├── Memberships
      ├── TenantModules [gym ✓]
      └── Data (isolated by Tenant B)
```

### Isolation Guarantees

Authorization uses **two mandatory layers**:

| Layer | Responsibility |
|-------|----------------|
| **Layer 1 — Database Isolation** | Tenant boundary via RLS (or equivalent) |
| **Layer 2 — Business Permissions** | Role → explicit Permission evaluation in the application |

Rules:

1. **Business rule level** — Contracts forbid cross-Tenant access
2. **Application level** — Every operation requires explicit Tenant context and Permission grants
3. **Data level** — Implementation enforces row-level Tenant isolation (see [RLS.md](../implementation/RLS.md))

Neither Layer 1 nor Layer 2 may be relied on alone.

---

## Identity Integration

```
┌──────────────────┐         ┌──────────────────┐
│ Identity Provider │ ◄───── │   Application    │
│  (source of truth)│  auth  │  (references ID)  │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
                              Membership lookup
                                      │
                                      ▼
                              Tenant + Role + Permissions
```

- The application never creates or stores authentication credentials.
- The application stores only an opaque Identity reference for Membership linkage.
- Current implementation uses Supabase Auth — see [SUPABASE.md](../implementation/SUPABASE.md).

---

## Ownership Model

```
❌  Tenant.owner_id = "user-123"

✅  Membership(identityId = "user-123", tenantId = "tenant-abc", role = OWNER)
```

Rules:

- Ownership is a Membership attribute, not a Tenant attribute.
- A Tenant may have multiple OWNERs.
- Removing the last OWNER is forbidden.
- Ownership transfer = grant OWNER to new Identity, optionally revoke from old.

---

## Authorization in Core

Authorization is a two-tier system:

### Tier 1 — Core Permissions

Platform-wide operations: Tenant management, Membership management, Module activation.

### Tier 2 — Module Permissions

Domain-specific operations: namespaced under `moduleKey:`.

Modules **register** their Permission vocabulary. Core **evaluates** Permissions using the same engine.

---

## Shared Layer

Adjacent to Core, the Shared layer provides:

- Common type definitions
- Validation schemas
- Error types
- Utility functions
- Value objects (Email, Slug, etc.)

Shared has **no business logic** and **no Module-specific concepts**.

---

## Request Lifecycle (Platform Concerns)

```
1. Receive request
2. Validate Identity (Identity Provider session)
3. Resolve Tenant context (from request or session)
4. Load Membership(Identity, Tenant)
5. Authorize via Role → Permissions
6. If Module operation: verify TenantModule enabled
7. Delegate to Module handler
8. Return response
```

Steps 1–6 are Core. Step 7 is Module. Step 8 is Presentation.

---

## Extension Points

| Extension | How |
|-----------|-----|
| New Module | Register in catalog, implement Module boundary, define Permission vocabulary |
| New Core Permission | Add to Core catalog, update Role mappings |
| New Role | Define in RBAC, map to Permissions |
| New Identity Provider | Implement adapter in Infrastructure — Contracts unchanged |

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System overview
- [MODULE_SYSTEM.md](./MODULE_SYSTEM.md) — Module design
- [Contracts Index](../contracts/INDEX.md) — Business rules
- [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) — First release scope
