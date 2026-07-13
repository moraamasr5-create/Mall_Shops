# Database Design

## Status

**Draft — implementation layer.** This document describes the current intended database design. It is subordinate to [Business Contracts](../contracts/INDEX.md).

If this document conflicts with a Contract, update this document.

---

## Technology

- **Engine:** PostgreSQL
- **Hosting:** Supabase (managed PostgreSQL)
- **Access:** Prisma ORM (see [PRISMA.md](./PRISMA.md))

These are replaceable implementation choices.

---

## Design Principles

1. **Tenant-scoped by default** — every business table includes `tenant_id`
2. **No User table** — Identity references the external Identity Provider UID
3. **No `owner_id` on Tenant** — ownership via `membership.role`
4. **Module-prefixed tables** — module-specific tables use `{moduleKey}_` prefix
5. **RLS enforced** — row-level security on all business tables (see [RLS.md](./RLS.md))

---

## Core Tables

### `tenant`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (CUID) | Primary key |
| `name` | TEXT | Business name |
| `slug` | TEXT | Unique, URL-safe |
| `status` | TEXT | `active`, `suspended`, `archived` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**No `owner_id` column.**

### `membership`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (CUID) | Primary key |
| `identity_id` | TEXT | Identity Provider UID — not a local FK |
| `tenant_id` | TEXT | FK → `tenant.id` ON DELETE CASCADE |
| `role` | TEXT | `OWNER`, `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER` |
| `status` | TEXT | `active`, `suspended`, `revoked` |
| `invited_by` | TEXT | Nullable — Identity Provider UID |
| `joined_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Unique constraint:** `(identity_id, tenant_id)`

### `module` (optional / undecided)

**Not Architecture-locked.**

`Module` is a platform concept. Whether it is persisted as a database table is an Implementation choice for Vertical Slice 1.

If a table is used, a provisional shape could be:

| Column | Type | Notes |
|--------|------|-------|
| `module_key` | TEXT | Primary key — e.g., `salon`, `restaurant` |
| `display_name` | TEXT | |
| `description` | TEXT | Nullable |
| `status` | TEXT | `available`, `deprecated`, `retired` |
| `created_at` | TIMESTAMPTZ | |

Alternatives equally valid until implementation decides:

- constants / code registry
- config files
- registry service
- database table

`tenant_module.module_key` must always reference a valid Module identity, regardless of storage form.

### `tenant_module`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (CUID) | Primary key |
| `tenant_id` | TEXT | FK → `tenant.id` ON DELETE CASCADE |
| `module_key` | TEXT | FK → `module.module_key` |
| `enabled` | BOOLEAN | Default `true` |
| `activated_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Unique constraint:** `(tenant_id, module_key)`

---

## Entity Relationship Diagram

```
tenant
  ├──< membership
  └──< tenant_module ──► moduleKey (Module concept; storage undecided)

(module-specific tables)
  └──< {moduleKey}_* (all include tenant_id)
```

---

## Module Tables (Pattern)

Each Module creates its own tables following this pattern:

```sql
CREATE TABLE {moduleKey}_{entity} (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  -- entity-specific columns
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_{moduleKey}_{entity}_tenant
  ON {moduleKey}_{entity}(tenant_id);
```

### MVP Reference Module Tables

See [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) for which Module tables are created in the first slice.

Planned `salon_*` tables (not yet implemented):

- `salon_employee`
- `salon_service`
- `salon_customer`
- `salon_appointment`

---

## Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `membership` | `(identity_id)` | Lookup all Tenants for an Identity |
| `membership` | `(tenant_id)` | List Members of a Tenant |
| `tenant` | `(slug)` UNIQUE | URL routing |
| `tenant_module` | `(tenant_id)` | List enabled Modules |
| `{moduleKey}_*` | `(tenant_id)` | Tenant-scoped queries |

---

## Migration Policy

- All schema changes via Prisma migrations
- Migrations are versioned and reversible where possible
- Destructive migrations require explicit review
- No manual SQL in production without migration file

---

## Related Documents

- [PRISMA.md](./PRISMA.md) — ORM schema
- [RLS.md](./RLS.md) — Row-level security policies
- [SUPABASE.md](./SUPABASE.md) — Hosting configuration
- [Contracts](../contracts/INDEX.md) — Business rules
