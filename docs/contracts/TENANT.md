# Tenant Contract

## Responsibility

A **Tenant** represents a business organization that operates on the platform.

A tenant is the primary isolation boundary for:

- Business data
- User access
- Module enablement
- Operational configuration

Every piece of business data belongs to exactly one tenant. Users interact with the platform through memberships in one or more tenants.

## Invariants

1. **Unique identity**
   - Every tenant has a globally unique identifier that never changes for the lifetime of the tenant.

2. **Human-readable name**
   - Every tenant has a display name that identifies the organization to its members and customers.

3. **At least one member with owner authority**
   - A tenant must always have at least one member holding the owner role.
   - A tenant cannot exist without an accountable owner.

4. **At least one enabled module**
   - A tenant must have at least one business module enabled to perform business operations.
   - A tenant with no enabled modules is in an invalid operational state.

5. **Data isolation**
   - All business data is scoped to a single tenant.
   - Data from one tenant must never be visible or modifiable by members of another tenant.

6. **Deletion is destructive**
   - Removing a tenant removes all associated memberships, module enablements, and business data belonging to that tenant.

## Relationships

```
User
  └── Membership (N per user, one per tenant)
        └── Tenant (1)
              ├── Membership (N)
              └── TenantModule (N)
                    └── Business Module (logical)
```

| Related concept | Relationship |
|-----------------|--------------|
| **Membership** | A tenant has many memberships. Each membership links exactly one user to the tenant. |
| **TenantModule** | A tenant has many module enablements. Each enablement activates one business module for the tenant. |
| **Business Module data** | All module-specific entities are scoped to the tenant through the module enablement. |

A user may belong to multiple tenants simultaneously through separate memberships. Each membership is independent.

## Lifecycle

### Creation

1. A user initiates tenant creation and becomes the initial owner through an automatically created membership.
2. The platform assigns a unique identity and records the tenant's display name.
3. At least one business module is enabled for the new tenant (see TenantModule contract).

### Active Operation

- Members perform business operations within the tenant according to their roles.
- The tenant's enabled modules determine which business capabilities are available.
- Configuration and data accumulate under the tenant's scope.

### Mutation

- The display name may be updated by authorized members.
- Module enablement may be changed according to the TenantModule contract.
- Memberships may be added, updated, or removed according to the Membership contract.

### Removal

- Only an owner may initiate tenant removal.
- Removal is irreversible and cascades to all memberships, module enablements, and tenant-scoped business data.

## Ownership

| Aspect | Owner |
|--------|-------|
| Tenant existence | Members with the **owner** role |
| Tenant configuration | Members with **owner** or **admin** roles (per Membership contract) |
| Business data within tenant | Governed by role-based permissions within the tenant |
| Platform-level tenant management | Platform operator |

The tenant itself does not own users. Users exist independently and gain access through memberships.

## Access Rules

- Users may access tenant data only for tenants they belong to.
- Users may perform actions only within the permissions granted by their membership role.
- Cross-tenant data access is never permitted.

## MVP Decisions

> **MVP Decision:** New tenants automatically enable the Salon business module as the first reference implementation. This is a product default, not a permanent platform rule. Future tenants may choose or be assigned a different initial module.

> **MVP Decision:** Only one business module may be active per tenant during the initial release. The data model supports multiple modules, but multi-module operation is deferred.
