# Membership Contract

## Responsibility

A **Membership** represents a user's association with a tenant, including the role that defines what the user may do within that tenant.

Membership is the mechanism for:

- Granting users access to a tenant's data and operations
- Assigning role-based authority within a tenant
- Supporting users who belong to multiple tenants with different roles in each

A user's platform identity is separate from their tenant memberships. Roles and permissions are always evaluated in the context of a specific tenant.

## Invariants

1. **One membership per user per tenant**
   - A user may have at most one membership in any given tenant.
   - Duplicate memberships for the same user and tenant are not permitted.

2. **Role is required**
   - Every membership must have exactly one role assigned.
   - A membership without a role is invalid.

3. **Role belongs to membership, not user**
   - A user's role is determined by their membership in a specific tenant.
   - A user may hold different roles in different tenants.

4. **Valid tenant reference**
   - Every membership must reference an existing tenant.
   - A membership cannot exist without a tenant.

5. **Valid user reference**
   - Every membership must reference an existing platform user.
   - A membership cannot exist without a user.

6. **At least one owner per tenant**
   - A tenant must always retain at least one member with the owner role.
   - The last owner of a tenant cannot be removed or demoted without transferring ownership first.

7. **Tenant-scoped authority**
   - A membership grants authority only within its tenant.
   - Membership in tenant A grants no access to tenant B.

## Roles

Membership roles define the level of authority within a tenant:

| Role | Authority |
|------|-----------|
| **Owner** | Full control over the tenant, including deletion, member management, and module configuration |
| **Admin** | Administrative access to tenant settings, members, and business data |
| **Manager** | Operational management of business activities within enabled modules |
| **Staff** | Limited access to assigned resources and day-to-day operations |
| **Customer** | Read-only or self-service access to public or personal data |

Roles are assigned at the tenant level. The same user may be an owner in one tenant and staff in another.

## Relationships

```
User (1)
  └── Membership (N, one per tenant)
        └── Tenant (1)
```

| Related concept | Relationship |
|-----------------|--------------|
| **User** | A user may have many memberships across different tenants. |
| **Tenant** | A tenant has many memberships. Each membership links exactly one user. |
| **TenantModule** | A member's access to module data is governed by their role and the tenant's enabled modules. |

## Lifecycle

### Creation

1. A membership is created when a user is invited to or joins a tenant, or when a user creates a new tenant (becoming the initial owner).
2. The membership is assigned a role at creation time.
3. The user gains access to the tenant immediately upon membership activation.

### Active Operation

- The member operates within the tenant according to their assigned role.
- Role changes take effect immediately and alter the member's permitted actions.
- A user may switch between tenants they belong to; each context uses the role from the corresponding membership.

### Mutation

- An authorized member (owner or admin) may change another member's role.
- Ownership may be transferred from one member to another.
- A member's role may be upgraded or downgraded, subject to the owner invariant.

### Removal

- An authorized member (owner or admin) may remove a membership, revoking the user's access to the tenant.
- A member may leave a tenant voluntarily, unless they are the sole owner.
- Removing a membership does not delete the user from the platform.
- Removing a membership does not affect the user's memberships in other tenants.

## Ownership

| Aspect | Owner |
|--------|-------|
| Membership creation | Owners and admins of the tenant |
| Role assignment | Owners and admins of the tenant |
| Membership removal | Owners and admins of the tenant; members may remove themselves |
| Ownership transfer | Current owner only |

A membership does not own business data. It grants the user permission to interact with tenant-scoped data according to their role.

## Access Rules

- Users may access data only for tenants where they hold an active membership.
- Users may perform actions only within the permissions of their role in the active tenant context.
- Permission evaluation always requires both a valid membership and a matching role.

## MVP Decisions

> **MVP Decision:** Permission granularity is role-based only. Fine-grained per-resource permissions are deferred to a future release.

> **MVP Decision:** User invitation flows are limited to email-based invitations. Additional invitation channels are deferred.
