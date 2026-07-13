# TenantModule Contract

## Definition

A **TenantModule** represents the **activation of a Module for a specific Tenant**.

It is the platform's generic mechanism for:

- Controlling which Modules are active in a Tenant
- Determining feature availability
- Scoping module-specific operations to an enabled context

TenantModule is a **Core platform concept**. It is not owned by or specific to any single Module.

---

## Responsibility

- Record which Modules are enabled for a given Tenant
- Gate access to module-specific business capabilities
- Support Tenants running multiple Modules simultaneously

---

## Invariants

1. **At most one TenantModule record per (Tenant, Module) pair**
   - The combination of Tenant and `moduleKey` is unique.
   - A Tenant cannot have duplicate activation records for the same Module.

2. **TenantModule always references a valid Tenant**
   - Every TenantModule belongs to exactly one Tenant.
   - Orphan TenantModule records are forbidden.

3. **TenantModule always references a valid Module**
   - `moduleKey` must match a Module in the platform catalog.
   - Unknown `moduleKey` values are rejected.

4. **Every Tenant must have at least one enabled TenantModule**
   - A Tenant with all Modules disabled cannot operate.
   - Disabling the last enabled Module is forbidden.

5. **Module enablement is explicit**
   - A Module is available to a Tenant only when its TenantModule record exists and is enabled.
   - Implicit or inferred activation is forbidden.

6. **TenantModule does not own business data**
   - TenantModule is an activation record, not a data container.
   - Module-specific entities are scoped by Tenant and governed by the activated Module's rules.

---

## Relationships

```
Tenant (1)
    │
    │ (1:N)
    ▼
TenantModule
    │
    │ references
    ▼
Module (platform catalog)
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
| Identifier | Stable, unique TenantModule identifier |
| Tenant reference | Target Tenant |
| `moduleKey` | Reference to platform Module |
| Enabled | Whether the Module is currently active for this Tenant |
| Activated at | Point in time Module was first enabled |
| Updated at | Point in time enablement status last changed |

---

## Lifecycle

### Creation — Initial Activation

When a Tenant is created, the platform enables one or more Modules by creating TenantModule records.

The specific Modules activated at creation time are governed by [MVP Decisions](../mvp/MVP_DECISIONS.md).

### Creation — Additional Module

1. An authorized Identity requests activation of a Module for a Tenant.
2. The platform validates the Module exists and is available.
3. A TenantModule record is created with `enabled = true`.
4. Module-specific setup (if any) runs within the Module boundary.

### Active Operation

- Enabled Modules are available for business operations within the Tenant.
- Disabled Modules are not accessible for new operations.
- Existing data from a disabled Module is retained unless a deactivation policy specifies otherwise.

### Disable

- Sets `enabled = false` on the TenantModule record.
- Forbidden if it would leave the Tenant with zero enabled Modules.
- Does not automatically delete module-specific data.

### Removal

- Explicit deletion of the TenantModule record.
- Forbidden if it would leave the Tenant with zero enabled Modules.
- Module-specific data cleanup follows Module deactivation policy.

### Tenant Deletion

- Deleting a Tenant removes all associated TenantModule records.
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

**MVP Decision:** Only the `salon` Module is implemented in the first vertical slice. Other Module keys exist in the catalog but are not yet activatable.

---

## Related Contracts

- [TENANT.md](./TENANT.md) — Organizational context
- [MODULE.md](./MODULE.md) — Platform Module concept
- [MEMBERSHIP.md](./MEMBERSHIP.md) — Access within Tenant
- [RBAC.md](./RBAC.md) — Who may enable or disable Modules
