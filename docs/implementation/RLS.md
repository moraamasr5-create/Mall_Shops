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

## DB Role Hardening — Decision Record (Analysis Only)

| Field | Value |
|-------|--------|
| Decision | Approve the minimal DB Role Hardening proposal (non-`BYPASSRLS` app login + `SET ROLE authenticated`; privileged URL only for migrations/`createTenant`). |
| Implementation | **Deferred** — **not** Ready for Implementation until the Cross-Tenant **release** Operational Gate is **PASSED**. |
| Gate before execute | **Operational Gate: Cross-Tenant Validation** must be **PASSED** (live Supabase + evidence report). Unit tests alone or **NOT_EXECUTED** do not unlock Hardening. |

### Decision

Approve the minimal DB Role Hardening proposal (non-`BYPASSRLS` app login + `SET ROLE authenticated`; privileged URL only for migrations/`createTenant`).

**Do not implement until** `npm run evidence:cross-tenant` produces overall **PASS** against a live app + Supabase.

Roadmap after that PASS:

```
Cross-Tenant PASS (release Operational Gate)
  → DB Hardening (Approved → Ready for Implementation)
  → Production Readiness
  → VS1 Complete
  → Release Candidate (RC1)
  → Pilot Deployment (one trial client)
  → Tag v1.0.0
  → First Production Module
```

### Pre-implementation questions (must be answered before any future execute)

#### 1) Does Supabase Hosted allow this role model?

**Yes, with SQL in the project database — no Architecture change required.**

- Supabase Hosted is managed Postgres; custom `LOGIN` roles can be created via SQL Editor / migrations (same as local).
- Official Prisma guide creates a custom DB user for Prisma ([Prisma + Supabase](https://supabase.com/docs/guides/database/prisma)); that example often uses `BYPASSRLS` for migrations convenience — **our hardening goal is the opposite for the app runtime role**: no `BYPASSRLS`, and `GRANT authenticated TO app_runtime` so `SET LOCAL ROLE authenticated` works.
- Built-in roles `authenticated` / `anon` already exist on Hosted; they must not be replaced. The new role is an additional LOGIN wrapper only.
- Constraints to verify at execute time (ops checklist, not blockers to the analysis):
  - Role must be creatable with `LOGIN` + password (or secret via Vault/env).
  - Membership: `GRANT authenticated TO app_runtime` (and revoke dangerous privileges).
  - Pooler (Supavisor/PgBouncer): prefer **session** mode or direct connection for transactions that use `SET LOCAL ROLE` (transaction pooling can break session/`SET LOCAL` semantics — validate on Hosted before cutting over).

#### 2) Will Prisma keep working if `DATABASE_URL` becomes `app_runtime`?

**Yes for the VS1 pattern, if grants and pooling are correct.**

Current path already assumes:

```
PrismaClient(DATABASE_URL)
  → $transaction
  → set_config(JWT claims)
  → SET LOCAL ROLE authenticated
  → queries under RLS
```

Changing only the login role in `DATABASE_URL` from `postgres` to `app_runtime` does **not** change that application code path, provided:

| Requirement | Why |
|-------------|-----|
| `app_runtime` can `SET ROLE authenticated` | Otherwise `withIdentityRls` fails |
| `authenticated` retains table DML grants (already in VS1 migration) | Queries after `SET ROLE` still work |
| Privileged client uses a **separate** URL (`DIRECT_URL` / privileged env) as `postgres` (or migration user) | `createTenant` + `prisma migrate` still need a strong role |
| Connection pool compatible with `SET LOCAL` | Session mode / direct URL for interactive transactions |

**Side effects to expect (not architecture breaks):** migrate/deploy must keep using the privileged URL; misconfiguring a single URL for both runtime and migrate would either break migrate or reintroduce bypass. Validate with a smoke + cross-tenant evidence re-run after cutover.

### Out of scope until execute is approved

- Creating `app_runtime`
- Changing `.env` / hosted connection strings
- New migrations for roles
- Any Production Readiness checklist items beyond this decision record

---

## Testing RLS

### Operational Evidence (required before production claims)

Live cross-tenant isolation is proven by:

```bash
npm run evidence:cross-tenant
```

See [Operational Evidence — Cross-Tenant](../evidence/CROSS_TENANT.md).

PASS means:

1. The live harness actually executed (not NOT_EXECUTED)
2. Identity A and Identity B each own a separate Tenant
3. Identity B cannot read Tenant A salon data (`403` / 0 rows)
4. Identity A cannot read Tenant B salon data (`403` / 0 rows)
5. Tenant B’s own list does not expose Tenant A services

Status legend: **PASS** | **FAIL** (isolation broken) | **NOT_EXECUTED** (environment unavailable — no conclusion).

Unit tests cover the evidence matrix and PASS/FAIL/NOT_EXECUTED scoring (`npm test`). They do not replace the live run.

### Manual checklist

Before production:

1. Run `npm run evidence:cross-tenant` → overall **PASS**
2. Review `docs/evidence/cross-tenant-latest.md`
3. Verify Role restrictions at application layer (Layer 2)
4. Optionally re-run after temporarily weakening app filters to confirm Layer 1 still blocks (penetration follow-up)

---

## Related Documents

- [DATABASE.md](./DATABASE.md) — Table design
- [SUPABASE.md](./SUPABASE.md) — Auth integration
- [TENANT Contract](../contracts/TENANT.md) — Isolation rules
- [MEMBERSHIP Contract](../contracts/MEMBERSHIP.md) — Access path
- [ARCHITECTURE_LOCK.md](../ARCHITECTURE_LOCK.md) — Two-layer authorization rule
