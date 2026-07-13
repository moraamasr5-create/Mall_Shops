# Tenant Contract

## Definition

A **Tenant** represents an independent business organization using the platform.

It is the primary **isolation boundary** for data, configuration, and operational context.

---

## Responsibility

- Provide organizational context for all business operations
- Scope Membership, module activation, and module-specific data
- Enforce data isolation between different businesses on the platform

---

## Invariants

1. **Every business entity belongs to exactly one Tenant**
   - Module-specific data, configuration, and operational records are always Tenant-scoped.
   - Cross-Tenant data access is forbidden at the business rule level.

2. **A Tenant has no `owner_id` field**
   - Ownership is never stored as a direct reference on Tenant.
   - Tenant ownership is expressed exclusively through [Membership](./MEMBERSHIP.md) with `role = OWNER`.

3. **A Tenant must have at least one OWNER Membership**
   - At creation time, the creating Identity must receive an OWNER Membership.
   - A Tenant cannot exist without at least one active OWNER at any point in its operational lifetime.

4. **A Tenant must have at least one enabled Module**
   - A Tenant with no enabled Modules cannot perform business operations.
   - Disabling the last enabled Module is forbidden.

5. **Tenant identity is independent of any Module**
   - Tenant name, slug, and organizational metadata are Core concerns.
   - Module-specific branding or configuration lives within the activated Module scope.

6. **Tenant deletion is a destructive, explicit operation**
   - Deleting a Tenant removes or archives all associated Memberships, TenantModules, and module-specific data.
   - Tenant deletion requires OWNER authorization.

---

## Relationships

```
Identity
    │
    │ (via Membership)
    ▼
 Tenant ──────► Membership (1:N)
    │
    │ (via TenantModule)
    ▼
  Module activation (1:N)
```

| Related Entity | Relationship | Contract |
|---------------|--------------|----------|
| Membership | Identity's association with Tenant | [MEMBERSHIP.md](./MEMBERSHIP.md) |
| TenantModule | Module enabled for this Tenant | [TENANT_MODULE.md](./TENANT_MODULE.md) |
| Module | Business capability catalog | [MODULE.md](./MODULE.md) |

---

## Attributes (Business)

| Attribute | Description |
|-----------|-------------|
| Identifier | Stable, unique platform identifier |
| Name | Human-readable business name |
| Slug | URL-safe unique identifier for routing and display |
| Status | Operational state (e.g., active, suspended, archived) |
| Created at | Point in time Tenant was provisioned |

Additional attributes may be added without changing isolation semantics.

---

## Lifecycle

### Creation

1. An authenticated Identity initiates Tenant creation.
2. The platform creates the Tenant record.
3. The initiating Identity receives an OWNER Membership.
4. Initial Module activation follows [TenantModule lifecycle](./TENANT_MODULE.md#creation).

### Active Operation

- Members operate within the Tenant through their Membership Roles.
- Enabled Modules determine available business capabilities.
- All operations are evaluated against Tenant scope.

### Suspension

- A suspended Tenant blocks new business operations.
- Existing data is retained.
- Only platform administrators or OWNERs (per policy) may suspend or restore.

### Deletion

- Requires OWNER authorization (and may require platform administrator confirmation).
- Cascades to Memberships, TenantModules, and module-specific data.
- Deletion is irreversible or subject to a defined retention policy.

---

## Ownership

| Question | Answer |
|----------|--------|
| Who owns a Tenant? | One or more Identities with `Membership.role = OWNER` |
| Is ownership stored on Tenant? | **No** |
| Can ownership transfer? | Yes — by granting OWNER to another Identity and optionally revoking the previous OWNER |
| Can a Tenant have multiple OWNERs? | Yes |

---

## Multi-Tenancy

- One Identity may hold Memberships in **multiple Tenants**.
- Each Membership is independent — Roles and Permissions do not carry across Tenants.
- The active Tenant context must be explicit for every operation.

---

## Related Contracts

- [MEMBERSHIP.md](./MEMBERSHIP.md) — User access and ownership
- [TENANT_MODULE.md](./TENANT_MODULE.md) — Module activation
- [MODULE.md](./MODULE.md) — Available business modules
- [IDENTITY.md](./IDENTITY.md) — External identity reference
