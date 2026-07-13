# Business Contracts

Business contracts are the **permanent source of truth** for the Mall Shops platform. They describe what the platform guarantees at the business level — independent of database, framework, or hosting choices.

## What Contracts Describe

Each contract documents:

- **Responsibility** — what the concept represents and why it exists
- **Invariants** — rules that must always hold true
- **Relationships** — how the concept connects to other concepts
- **Lifecycle** — creation, operation, mutation, and removal
- **Ownership** — who controls or is accountable for the concept

## What Contracts Do Not Contain

Contracts intentionally exclude implementation details. The following belong in separate documentation:

| Topic | Location |
|-------|----------|
| Database schema (Prisma) | [PRISMA_SCHEMA.md](../database/PRISMA_SCHEMA.md) |
| Migrations | [MIGRATION_PLAN.md](../database/MIGRATION_PLAN.md) |
| Row-level security policies | [RLS_STRATEGY.md](../security/RLS_STRATEGY.md) |
| Platform layers and module structure | [PLATFORM_ARCHITECTURE.md](../architecture/PLATFORM_ARCHITECTURE.md) |
| Domain entity relationships | [DOMAIN_MODEL.md](../architecture/DOMAIN_MODEL.md) |
| Module activation mechanics | [MODULE_SYSTEM.md](../architecture/MODULE_SYSTEM.md) |

## Contract Index

| Contract | Summary |
|----------|---------|
| [TENANT](./TENANT.md) | A business organization that operates on the platform |
| [MEMBERSHIP](./MEMBERSHIP.md) | A user's association with a tenant, including their role |
| [TENANT_MODULE](./TENANT_MODULE.md) | The enablement of a business module for a specific tenant |

## Design Principles

1. **Implementation-agnostic** — contracts remain valid if Supabase, Prisma, Next.js, or PostgreSQL are replaced.
2. **Module-neutral** — contracts describe the platform core; individual business modules (Salon, Restaurant, Clinic, etc.) are extensions, not platform assumptions.
3. **MVP decisions are explicit** — temporary product choices are labeled **MVP Decision** and are not treated as permanent invariants.

## Reading Order

For a new contributor:

1. [TENANT](./TENANT.md) — understand the organizational boundary
2. [MEMBERSHIP](./MEMBERSHIP.md) — understand who can act within a tenant
3. [TENANT_MODULE](./TENANT_MODULE.md) — understand which business capabilities a tenant has enabled

Then consult architecture and implementation documents as needed.
