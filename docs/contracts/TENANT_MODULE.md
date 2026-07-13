# TenantModule Contract

## Responsibility

A **TenantModule** represents the enablement of a business module for a specific tenant.

TenantModule is the mechanism for:

- Controlling which business modules are active for a tenant
- Determining which business capabilities and features are available
- Supporting tenants that operate with one or more business domains
- Isolating module-specific data within the tenant boundary

A business module is a self-contained domain of functionality (for example, appointment scheduling, order management, or inventory tracking). The platform supports multiple module types; each tenant enables the modules relevant to its business.

## Invariants

1. **One enablement record per module per tenant**
   - A tenant may have at most one enablement record for any given module type.
   - Duplicate enablements for the same module are not permitted.

2. **Module keys are predefined**
   - Module types are identified by stable keys determined at platform design time.
   - Valid module keys include: `salon`, `restaurant`, `clinic`, `gym`, `pharmacy`, `store`, and future additions.
   - Module keys are immutable once assigned to an enablement record.

3. **At least one enabled module per tenant**
   - A tenant must always have at least one module in the enabled state.
   - Disabling the last enabled module is not permitted.

4. **Enablement is persistent**
   - Once a module is enabled for a tenant, it remains enabled until explicitly disabled.
   - Disabling a module suspends its capabilities but does not immediately destroy its data.

5. **Valid tenant reference**
   - Every module enablement must belong to an existing tenant.
   - A module enablement cannot exist without a tenant.

6. **Module data is tenant-scoped**
   - All data created under a module enablement belongs to the tenant.
   - Module data is accessible only to members of the tenant, subject to their roles.

## Relationships

```
Tenant (1)
  └── TenantModule (N, one per module type)
        └── Business Module (logical)
              └── Module-specific entities (scoped to tenant)
```

| Related concept | Relationship |
|-----------------|--------------|
| **Tenant** | A tenant has many module enablements. Each enablement activates one module type. |
| **Membership** | Members access module data through their tenant membership and role. |
| **Business Module** | A module type may be enabled across many tenants. Each tenant's enablement is independent. |

A tenant may enable multiple module types. Each enabled module operates independently within the tenant boundary.

## Lifecycle

### Creation

1. **Initial module (tenant creation)**
   - When a tenant is created, the platform enables at least one business module.
   - The initial module makes the tenant immediately operational.

2. **Additional modules**
   - An authorized member may enable additional module types for the tenant.
   - Once enabled, the module's capabilities become available to tenant members.

### Active Operation

- Enabled modules provide their business capabilities within the tenant.
- Module-specific data is created and managed under the tenant's scope.
- Members interact with enabled modules according to their roles.

### Mutation

- **Enable:** An authorized member activates a module type that was previously disabled or not yet enabled.
- **Disable:** An authorized member deactivates a module, suspending its capabilities. The last enabled module cannot be disabled.

### Removal

- Removing a module enablement is a destructive operation that affects the module's data within the tenant.
- When a tenant is removed, all of its module enablements are removed as a consequence.

## Ownership

| Aspect | Owner |
|--------|-------|
| Module enablement and disablement | Members with **owner** role in the tenant |
| Module-specific business data | Governed by membership roles within the tenant |
| Module type definitions | Platform operator |

A TenantModule does not own business entities directly. It represents the availability of a module's capabilities for the tenant. Data ownership flows through membership and role-based access within the tenant.

## Access Rules

- Users may interact with module data only for tenants they belong to.
- Users may enable or disable modules only if they hold the owner role in the tenant.
- Disabled modules must not expose their capabilities to tenant members.

## MVP Decisions

> **MVP Decision:** New tenants automatically enable the Salon module as the initial reference implementation. This default applies only during the MVP phase and will be replaced with module selection when additional modules are available.

> **MVP Decision:** Only one module may be active per tenant during the initial release. The platform model supports multiple simultaneous modules, but multi-module operation is not yet exposed in the product.

> **MVP Decision:** Disabling a module does not archive or delete its data. Data retention policies for disabled modules are deferred to a future release.

## Related Contracts

- [Tenant](./TENANT.md) — organizational context
- [Membership](./MEMBERSHIP.md) — user access within a tenant
