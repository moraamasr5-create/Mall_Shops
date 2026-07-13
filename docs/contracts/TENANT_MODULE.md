# TenantModule Contract

## Definition

A **TenantModule** represents the **activation relationship** between a **Tenant** and a **Module**.

It is the platform's generic capability for:

- Controlling which Modules are active in a Tenant
- Determining feature availability
- Supporting Tenants with one or more enabled Modules

TenantModule is a **Core platform relationship**. It is not owned by or specific to any single Module.

**Architecture does not define persistence.** Whether activation is stored as a database table, configuration, feature flags, a registry service, or another mechanism is an Implementation decision.

---

## Responsibility

- Express which Modules are enabled for a given Tenant
- Gate access to module-specific business capabilities
- Support Tenants running multiple Modules simultaneously

---

## Invariants

1. **At most one activation per (Tenant, Module) pair**
   - A Tenant cannot have duplicate activations for the same Module.

2. **TenantModule always belongs to a valid Tenant**
   - Every activation is scoped to exactly one Tenant.
   - Orphan activations are forbidden.

3. **TenantModule always references a valid Module**
   - `moduleKey` must match a Module known to the platform.
   - Unknown `moduleKey` values are rejected.

4. **Every Tenant must have at least one enabled Module**
   - A Tenant with no enabled Modules cannot operate.
   - Disabling the last enabled Module is forbidden.

5. **Module enablement is explicit**
   - A Module is available to a Tenant only when activation exists and is enabled.
   - Implicit or inferred activation is forbidden.

6. **TenantModule does not own business data**
   - TenantModule is an activation relationship, not a data container.
   - Module-specific entities are scoped by Tenant and governed by the activated Module's rules.

7. **Persistence is not a business invariant**
   - Contracts require the activation relationship to exist conceptually.
   - Contracts do not require a specific storage or lifecycle technology.

---

## Relationships

```
Tenant (1)
    │
    │ (1:N) architectural relationship
    ▼
TenantModule
    │
    │ references
    ▼
Module (platform concept)
    │
    │ governs
    ▼
Module-Specific Data (Tenant-scoped)
```

| Related Entity | Relationship | Contract |
|---------------|--------------|----------|
| Tenant | Organization enabling the Module | [TENANT.md](./TENANT.md) |
| Module | Platform capability being activated | [MODULE.md](./MODULE.md) |
| Membership | Determines who may operate within the Module | [MEMBERSHIP.md](./MEMBERSHIP.md) |

---

## Attributes (Business)

| Attribute | Description |
|-----------|-------------|
| Tenant reference | Target Tenant |
| `moduleKey` | Reference to platform Module |
| Enabled | Whether the Module is currently active for this Tenant |
| Activated at | Point in time Module was first enabled |

Identifiers and storage fields are Implementation concerns.

---

## Lifecycle (Business)

### Creation — Initial Activation

When a Tenant is created, the platform enables one or more Modules by establishing TenantModule activations.

The specific Modules activated at creation time are governed by [MVP Decisions](../mvp/MVP_DECISIONS.md).

### Creation — Additional Module

1. An authorized Identity requests activation of a Module for a Tenant.
2. The platform validates the Module exists and is available.
3. Activation is established with `enabled = true`.
4. Module-specific setup (if any) runs within the Module boundary.

### Active Operation

- Enabled Modules are available for business operations within the Tenant.
- Disabled Modules are not accessible for new operations.
- Existing data from a disabled Module is retained unless a deactivation policy specifies otherwise.

### Disable

- Marks the Module inactive for the Tenant.
- Forbidden if it would leave the Tenant with zero enabled Modules.
- Does not automatically delete module-specific data.

### Removal

- Explicit removal of the activation relationship.
- Forbidden if it would leave the Tenant with zero enabled Modules.
- Module-specific data cleanup follows Module deactivation policy.

### Tenant Deletion

- Deleting a Tenant clears all associated Module activations.
- Module-specific data cleanup is cascaded per retention policy.

---

## Authorization

| Operation | Typical Authorization |
|-----------|----------------------|
| View enabled Modules | Any active Member of the Tenant |
| Enable a Module | OWNER or ADMIN |
| Disable a Module | OWNER |
| Remove a Module activation | OWNER |

Exact authorization is defined in [RBAC.md](./RBAC.md) and [PERMISSION.md](./PERMISSION.md).

---

## Multi-Module Tenants

A Tenant may have **multiple Modules enabled simultaneously**.

- Each Module operates within the same Tenant isolation boundary.
- Modules do not share internal entities.
- Cross-Module workflows (if ever needed) must be orchestrated at the application layer without violating Module independence.

---

## MVP Decision

> The following applies to the first product release only. It is **not** a permanent platform rule.
> See [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) for the authoritative list.

**MVP Decision:** New Tenants automatically receive activation of the `salon` Module as their initial enabled Module.

**MVP Decision:** Only the `salon` Module is implemented in the first vertical slice. Other Module keys exist as examples but are not yet activatable.

---

## Related Contracts

- [TENANT.md](./TENANT.md) — Organizational context
- [MODULE.md](./MODULE.md) — Platform Module concept
- [MEMBERSHIP.md](./MEMBERSHIP.md) — Access within Tenant
- [RBAC.md](./RBAC.md) — Who may enable or disable Modules
