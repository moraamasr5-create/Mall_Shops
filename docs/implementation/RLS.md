# Row-Level Security (RLS)

## Status

**Draft — implementation layer.** RLS policies enforce Tenant isolation at the database level as **Authorization Layer 1**.

Authorization semantics for business operations are defined in [RBAC](../contracts/RBAC.md) and [PERMISSION](../contracts/PERMISSION.md) as **Authorization Layer 2**.

---

## Two-Layer Authorization Rule (Architecture Lock v1.0 FINAL)

| Layer | Responsibility | Where |
|-------|----------------|-------|
| **Layer 1 — Database Isolation** | Prevent cross-Tenant data access | RLS (this document) |
| **Layer 2 — Business Permissions** | Allow/deny business operations by Role → Permissions | Application |

**Neither layer may be relied on alone.**

- RLS does **not** replace Permission checks
- Permission checks do **not** replace Tenant isolation at the database
- Skipping either layer is an architecture violation

---

## Principle

> Even if application code has a bug, the database must prevent cross-Tenant data access.

RLS is the last line of defense for Tenant isolation. Application-level authorization is the first line for business operations.

---

## Policy Strategy

| Layer | Enforces |
|-------|----------|
| Application (Layer 2) | Full RBAC — Role, Permission, Module enablement |
| RLS (Layer 1) | Tenant isolation — `tenant_id` membership check |

RLS enforces **Tenant boundary** — not full Permission evaluation.

---

## Core Table Policies

### `tenant`

```sql
-- Members can read their own Tenants
CREATE POLICY "members_read_own_tenants"
  ON tenant FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

-- Only OWNERs can update Tenant
CREATE POLICY "owners_update_tenant"
  ON tenant FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.role = 'OWNER'
        AND membership.status = 'active'
    )
  );
```

### `membership`

```sql
-- Members can see other Members in their Tenants
CREATE POLICY "members_read_tenant_memberships"
  ON membership FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

-- OWNER and ADMIN can manage Memberships
CREATE POLICY "admins_manage_memberships"
  ON membership FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.role IN ('OWNER', 'ADMIN')
        AND m.status = 'active'
    )
  );
```

### `tenant_module`

```sql
-- Members can read enabled Modules for their Tenants
CREATE POLICY "members_read_tenant_modules"
  ON tenant_module FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

-- OWNER and ADMIN can manage Module activation
CREATE POLICY "admins_manage_tenant_modules"
  ON tenant_module FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.role IN ('OWNER', 'ADMIN')
        AND membership.status = 'active'
    )
  );
```

### `module` (only if Module is stored as a table)

Module storage is **not Architecture-locked**. If a `module` table is used:

```sql
-- Module registry is readable by all authenticated users
CREATE POLICY "authenticated_read_modules"
  ON module FOR SELECT
  USING (auth.role() = 'authenticated');
```

If Module is stored as constants/config, this policy does not apply.

---

## Module Table Policy (Pattern)

All module-specific tables follow this template:

```sql
-- Template: replace {table} with actual table name
CREATE POLICY "tenant_isolation_{table}"
  ON {table} FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = {table}.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

### Example (MVP Reference Module)

```sql
CREATE POLICY "tenant_isolation_salon_employee"
  ON salon_employee FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_employee.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

---

## RLS Enablement

RLS must be explicitly enabled on every business table:

```sql
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_module ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE module ENABLE ROW LEVEL SECURITY; -- only if Module table exists
-- repeat for all module tables
```

---

## Service Role Bypass

Server-side operations using the Supabase service role key bypass RLS.

**Rules:**

- Use service role only in trusted server context
- Never expose service role key to client
- Prefer user-scoped JWT for all user-facing operations
- Service role reserved for: migrations, admin tasks, background jobs

When using service role, **Layer 2 (Application Permissions) remains mandatory**.

---

## Testing RLS

Before production:

1. Create test Identities in separate Tenants
2. Verify Identity A cannot read Tenant B data
3. Verify Role restrictions at application layer
4. Verify RLS blocks even when application check is removed (penetration test)

---

## Related Documents

- [DATABASE.md](./DATABASE.md) — Table design
- [SUPABASE.md](./SUPABASE.md) — Auth integration
- [TENANT Contract](../contracts/TENANT.md) — Isolation rules
- [MEMBERSHIP Contract](../contracts/MEMBERSHIP.md) — Access path
- [ARCHITECTURE_LOCK.md](../ARCHITECTURE_LOCK.md) — Two-layer authorization rule
