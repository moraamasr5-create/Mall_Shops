# RLS Strategy

This document describes the row-level security (RLS) approach for enforcing multi-tenant data isolation at the database layer.

For business access rules, see [Business Contracts](../contracts/INDEX.md). This document covers **how** those rules are enforced in the current PostgreSQL/Supabase implementation.

## Principles

1. **Database is the enforcement point** — tenant isolation must not rely solely on application code.
2. **Membership-based access** — users access data only for tenants they belong to.
3. **Role-based mutation** — write operations respect membership roles.
4. **Defense in depth** — application checks supplement but do not replace database policies.

## Business Rules (from Contracts)

These rules are implemented via RLS policies below:

- Users may access data only for tenants they belong to.
- Users may enable or disable modules only if they hold the owner role.
- Module-specific data is scoped to the tenant and accessible only to tenant members.
- Cross-tenant data access is never permitted.

## Policy Coverage

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `tenant` | Members | Authenticated (creation flow) | Owner/Admin | Owner |
| `membership` | Members of same tenant | Owner/Admin | Owner/Admin | Owner/Admin |
| `tenant_module` | Members | Owner | Owner | Owner |
| Module tables (`<module>_*`) | Members | Role-dependent | Role-dependent | Role-dependent |

## Core Platform Policies

### Tenant Table

```sql
-- Members can view their own tenants
CREATE POLICY "members_see_own_tenants"
  ON public.tenant
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant.id
        AND membership.user_id = auth.uid()
    )
  );

-- Only owners can update tenant settings
CREATE POLICY "owners_update_tenant"
  ON public.tenant
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant.id
        AND membership.user_id = auth.uid()
        AND membership.role = 'OWNER'
    )
  );

-- Only owners can delete tenants
CREATE POLICY "owners_delete_tenant"
  ON public.tenant
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant.id
        AND membership.user_id = auth.uid()
        AND membership.role = 'OWNER'
    )
  );
```

### Membership Table

```sql
-- Members can see other members in their tenants
CREATE POLICY "members_see_tenant_memberships"
  ON public.membership
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.user_id = auth.uid()
    )
  );

-- Owners and admins can manage memberships
CREATE POLICY "admins_manage_memberships"
  ON public.membership
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "admins_update_memberships"
  ON public.membership
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "admins_delete_memberships"
  ON public.membership
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );
```

### TenantModule Table

```sql
-- Members can see enabled modules for their tenants
CREATE POLICY "members_see_tenant_modules"
  ON public.tenant_module
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.user_id = auth.uid()
    )
  );

-- Only owners can enable or disable modules
CREATE POLICY "owners_manage_modules"
  ON public.tenant_module
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role = 'OWNER'
    )
  );

CREATE POLICY "owners_create_modules"
  ON public.tenant_module
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role = 'OWNER'
    )
  );
```

## Module Table Policy Pattern

All module-specific tables follow a common RLS pattern. Replace `<module>` and `<table>` with the actual module key and table name.

### Table Structure Requirement

Every module table must include a `tenant_id` column referencing the tenant:

```sql
CREATE TABLE <module>_<table> (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
  -- module-specific columns
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Standard Module Policies

```sql
-- Members can read module data in their tenants
CREATE POLICY "members_read_<module>_<table>"
  ON public.<module>_<table>
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.user_id = auth.uid()
    )
  );

-- Managers and above can create module data
CREATE POLICY "managers_write_<module>_<table>"
  ON public.<module>_<table>
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role IN ('OWNER', 'ADMIN', 'MANAGER')
    )
  );

-- Managers and above can update module data
CREATE POLICY "managers_update_<module>_<table>"
  ON public.<module>_<table>
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role IN ('OWNER', 'ADMIN', 'MANAGER')
    )
  );

-- Owners and admins can delete module data
CREATE POLICY "admins_delete_<module>_<table>"
  ON public.<module>_<table>
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role IN ('OWNER', 'ADMIN')
    )
  );
```

### Reference: Salon Module Tables

The following Salon tables use the standard module policy pattern:

- `salon_employee`
- `salon_service`
- `salon_customer`
- `salon_appointment`

## JWT Claims Integration

RLS policies currently use `auth.uid()` for user identification and join against the `membership` table for tenant context.

An alternative approach using JWT claims is under evaluation. See [ADR-002: Identity Model and JWT Claims](../adr/ADR-002-Identity-Model-and-JWT-Claims.md).

**Current approach:** membership table lookup per policy evaluation.

**Proposed approach:** inject `tenant_id` and `role` into JWT claims for performance, with membership table as fallback.

## Testing Requirements

Before deploying RLS policies to production:

1. Verify a user in tenant A cannot read, write, or delete data in tenant B.
2. Verify role restrictions (staff cannot delete, customer cannot write).
3. Verify owner-only operations (module enablement, tenant deletion).
4. Verify policies apply to all module tables, not just core tables.
5. Test with service-role bypass disabled for application queries.

## MVP Status

> **MVP Decision:** RLS policies for core tables (tenant, membership, tenant_module) are defined but not yet deployed. Module table policies will be added when Salon schema is implemented.

> **MVP Decision:** JWT claim-based policies are deferred pending ADR-002 finalization. Current policies use membership table joins.

## Related Documents

- [Business Contracts](../contracts/INDEX.md)
- [Prisma Schema](../database/PRISMA_SCHEMA.md)
- [ADR-002: Identity Model and JWT Claims](../adr/ADR-002-Identity-Model-and-JWT-Claims.md)
