# Row-Level Security (RLS)

## Status

**Active — VS1 Runnable.** Layer 1 RLS policies live in Prisma migrations and are enforced on the user-facing Prisma path via `withIdentityRls`.

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
-- Active members are isolated to their own Tenants.
-- Business permissions (e.g. who may update/delete) are checked in the application.
CREATE POLICY "tenant_isolation_tenant"
  ON tenant FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
```

### `membership`

```sql
CREATE POLICY "tenant_isolation_membership"
  ON membership FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );
```

### `tenant_module`

```sql
CREATE POLICY "tenant_isolation_tenant_module"
  ON tenant_module FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
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

## Runtime enforcement (VS1)

User-facing API requests must not query as a BYPASSRLS role.

Implementation:

1. Authenticate JWT → Identity only (`sub`)
2. Open a Prisma transaction
3. `set_config('request.jwt.claims', …)` and `set_config('request.jwt.claim.sub', …)`
4. `SET LOCAL ROLE authenticated`
5. Run queries via request-scoped `getDb()`

Canonical helpers: `src/infrastructure/db.ts`, `withAuthenticatedDb` in `src/core/http/request-context.ts`.

Policies live in `prisma/migrations/**`. `FORCE ROW LEVEL SECURITY` is enabled on business tables.

### Tenant bootstrap exception

Creating a Tenant requires INSERT … RETURNING before an OWNER Membership exists.
RLS SELECT policies cannot yet authorize that row, so `createTenant` uses the
**privileged Prisma connection** for that transaction only.

Rules:

- Bootstrap path is limited to Tenant + OWNER Membership + initial TenantModule rows
- Identity must already be verified via JWT (application Layer 2 entry)
- All subsequent reads/writes use `withIdentityRls` / `getDb()`
- Never expose privileged credentials to the client

## Service Role / Privileged Bypass

Server-side privileged DB access bypasses RLS.

**Rules:**

- Use privileged / service-role access only in trusted server context
- Never expose service role key to client
- Prefer user-scoped JWT + `authenticated` role for all user-facing operations
- Privileged path reserved for: migrations, admin tasks, background jobs, **tenant bootstrap only**

When using a privileged path, **Layer 2 (Application Permissions / Identity verification) remains mandatory**.

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
