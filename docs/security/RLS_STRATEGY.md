# RLS Strategy

## Status

Implementation document. Business rules remain in [Contracts](../contracts/INDEX.md).

## Architecture Rule

Authorization has two mandatory layers:

| Layer | Responsibility | Must Not |
|-------|----------------|----------|
| Layer 1 — Database Isolation | Tenant data isolation only | Encode business permissions |
| Layer 2 — Business Authorization | Role and Permission evaluation in the application | Rely solely on the client |

RLS is **Layer 1** only.

## JWT Rule

Per [ADR-002](../adr/ADR-002-Identity-Model-and-JWT-Claims.md), MVP JWTs represent Identity only.

JWTs must not contain:

- tenant id
- active tenant
- roles
- permissions
- module context

RLS uses `auth.uid()` as Identity and checks active Membership rows.

## Core Policy Pattern

Core tables use tenant isolation predicates. Business permissions such as
OWNER-only or ADMIN-only behavior are enforced by the application.

```sql
CREATE POLICY "tenant_isolation_<table>"
  ON public.<table>
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <table>.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <table>.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

`tenant` is the special case where tenant id is the row id:

```sql
CREATE POLICY "tenant_isolation_tenant"
  ON public.tenant
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

## Module Table Pattern

Every module-owned table must include `tenant_id`.

```sql
CREATE POLICY "tenant_isolation_<module>_<table>"
  ON public.<module>_<table>
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = <module>_<table>.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

## Testing Requirements

1. Identity in Tenant A cannot read/write Tenant B data.
2. RLS policies do not grant business permissions by role.
3. Application tests cover Role → Permission authorization.
4. Module tables follow the same tenant isolation pattern.

## Related Documents

- [Implementation RLS](../implementation/RLS.md)
- [ADR-002](../adr/ADR-002-Identity-Model-and-JWT-Claims.md)
- [RBAC Contract](../contracts/RBAC.md)
- [Permission Contract](../contracts/PERMISSION.md)
