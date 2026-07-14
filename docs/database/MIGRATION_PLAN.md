# Migration Plan

This document describes the database migration strategy for implementing business contracts in PostgreSQL via Prisma.

For business rules, see [Business Contracts](../contracts/INDEX.md). For schema definitions, see [PRISMA_SCHEMA.md](./PRISMA_SCHEMA.md).

## Strategy

Migrations are applied incrementally, aligned with development phases. Each migration is:

- **Reversible** where possible (down migrations for development)
- **Idempotent** in production (applied once via Prisma migrate)
- **Contract-aligned** — every table maps to a business contract or module entity

## Current VS1 Migration

VS1 ships a single reproducible migration:

| Migration | Contents |
|-----------|----------|
| `20260714120000_vs1_init` | Core tables + Salon/Restaurant validation tables + RLS (`FORCE`) + grants |

Apply with `npx prisma migrate deploy`. Do not maintain a parallel standalone `rls.sql`.

## Migration Phases (historical plan → VS1 mapping)

### Phase 0: Core Platform Tables

**Goal:** Establish tenant, membership, and module enablement.

| Planned name | Tables | Contract | VS1 reality |
|--------------|--------|----------|-------------|
| `001_create_tenant` | `tenant` | [Tenant](../contracts/TENANT.md) | Included in `vs1_init` |
| `002_create_membership` | `membership` | [Membership](../contracts/MEMBERSHIP.md) | Included in `vs1_init` |
| `003_create_tenant_module` | `tenant_module` | [TenantModule](../contracts/TENANT_MODULE.md) | Included in `vs1_init` |

**Steps (contract-aligned):**

1. Create `tenant` table with `id`, `name`, `slug`, `status`, timestamps. **No `owner_id`.**
2. Create `membership` table with `identity_id`, `tenant_id`, `role`, unique constraint on `(identity_id, tenant_id)`.
3. Create `tenant_module` table with `tenant_id`, `module_key`, `enabled`, unique constraint on `(tenant_id, module_key)`.
4. Add foreign keys: `membership.tenant_id → tenant.id`, `tenant_module.tenant_id → tenant.id` (both `ON DELETE CASCADE`).
5. Enable + FORCE RLS on all business tables in the same migration.
6. Apply tenant-isolation policies from [RLS_STRATEGY.md](../security/RLS_STRATEGY.md) / [RLS.md](../implementation/RLS.md).

**Seed data (development only):**

- No seed data in this phase. Tenants are created through the application.

### Phase 1: RLS Hardening

**Goal:** Verify tenant isolation before any business data exists.

| Migration | Action |
|-----------|--------|
| `004_enable_rls_core` | Enable RLS + policies on tenant, membership, tenant_module |

**Verification:**

- Create two test tenants with different users.
- Confirm user A cannot query tenant B's data.
- Confirm role restrictions (staff cannot delete, non-owner cannot manage modules).

### Phase 2: Salon Module Tables (Reference Implementation)

**Goal:** First business module schema.

| Migration | Tables |
|-----------|--------|
| `005_create_salon_employee` | `salon_employee` |
| `006_create_salon_service` | `salon_service` |
| `007_create_salon_customer` | `salon_customer` |
| `008_create_salon_appointment` | `salon_appointment` |

**Steps:**

1. Create each table with `tenantId` column and index.
2. Enable RLS on each table.
3. Apply module policy pattern from [RLS_STRATEGY.md](../security/RLS_STRATEGY.md).

### Phase 3+: Additional Modules

Each new module follows the same pattern:

1. Create module tables with `tenantId`.
2. Enable RLS with standard module policies.
3. No changes to core tables.

| Module | Planned Migrations |
|--------|-------------------|
| Restaurant | `009+` — menu items, tables, orders, reservations |
| Clinic | TBD — doctors, patients, treatments, appointments |
| Gym | TBD — members, classes, equipment |
| Pharmacy | TBD — prescriptions, inventory |
| Store | TBD — products, inventory, sales |

## Migration Workflow

### Development

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <descriptive_name>

# Reset database (development only)
npx prisma migrate reset
```

### Production

```bash
# Apply pending migrations
npx prisma migrate deploy
```

### Rules

1. Never edit a migration that has been applied to production.
2. Always create a new migration for schema changes.
3. Test migrations against a copy of production data before deploying.
4. RLS policies are applied in the same Prisma migration as table creation (no parallel standalone `rls.sql`).
5. Module migrations are independent — adding a module never alters core tables.

## Rollback Strategy

| Environment | Rollback Method |
|-------------|----------------|
| Development | `prisma migrate reset` (destroys all data) |
| Staging | Manual down migration or database restore from snapshot |
| Production | Forward-only; create compensating migration if rollback needed |

Production migrations are forward-only. If a migration introduces a problem, a new migration corrects it rather than rolling back.

## Contract Compliance Checklist

Before merging any migration, verify:

- [ ] Every table maps to a contract entity or module entity
- [ ] `tenantId` is present on all business tables
- [ ] Unique constraints enforce contract invariants
- [ ] Foreign keys use `ON DELETE CASCADE` where contracts specify cascading deletion
- [ ] RLS is enabled and policies are applied
- [ ] No module table has a foreign key to another module's table
- [ ] Migration name is descriptive and ordered

## MVP Status

> **MVP Decision:** Phase 0 and Phase 1 are the immediate priority. Salon module tables (Phase 2) follow once tenant creation and membership flows are functional.

> **MVP Decision:** Seed scripts are development-only. Production tenants are created exclusively through the application.

## Related Documents

- [Prisma Schema](./PRISMA_SCHEMA.md)
- [RLS Strategy](../security/RLS_STRATEGY.md)
- [Business Contracts](../contracts/INDEX.md)
- [Platform Architecture](../architecture/PLATFORM_ARCHITECTURE.md)
