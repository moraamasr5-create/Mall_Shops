# Platform Architecture

This document describes the technical architecture of the Mall Shops platform. It reflects current implementation choices and may evolve as technology changes.

For permanent business rules, see [Business Contracts](../contracts/INDEX.md). Those contracts remain valid regardless of changes described here.

## Vision

Mall Shops is a **Business Operating Platform (BOP)** — a single codebase that powers multiple business domains through a modular, multi-tenant architecture.

The platform separates:

- **What the business guarantees** (contracts) — permanent, technology-independent
- **How the platform is built** (this document) — current implementation, subject to change

## Architectural Layers

```
┌─────────────────────────────────────────┐
│           Business Modules              │
│  (Salon, Restaurant, Clinic, Gym, ...)  │
├─────────────────────────────────────────┤
│              Platform Core              │
│  (Auth, Identity, Tenant, Membership)   │
├─────────────────────────────────────────┤
│              Shared Layer               │
│  (Types, Validation, Utils, Value Objs) │
├─────────────────────────────────────────┤
│           Infrastructure                │
│  (Database, Auth Provider, ORM)         │
└─────────────────────────────────────────┘
```

### Platform Core

Handles cross-cutting concerns for all modules:

- Authentication and session management
- User identity
- Tenant lifecycle
- Membership and role-based access control

**Rules:**

- Core knows nothing about any business module
- Core never imports from modules
- No business-domain logic in core

### Shared Layer

Reusable types, utilities, and abstractions used across the platform:

- Common type definitions
- Input validation schemas
- Error classes and utilities
- Value objects (email, slug, phone number)

**Rules:**

- No business logic
- No module-specific concepts

### Business Modules

Self-contained domains, each with its own entities, services, and data. See [Module System](./MODULE_SYSTEM.md).

**Rules:**

- Modules import from core and shared only
- Modules never import from other modules
- Each module owns its data tables and API routes

### Infrastructure

External services and persistence. Current choices:

| Concern | Current Implementation |
|---------|----------------------|
| Authentication | Supabase Auth |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Application framework | Next.js |

These choices are implementation details. See [PRISMA_SCHEMA.md](../database/PRISMA_SCHEMA.md) and [RLS_STRATEGY.md](../security/RLS_STRATEGY.md) for specifics.

## Multi-Tenancy

Multi-tenancy is a data isolation strategy, not an architectural layer. Tenants are domain entities scoped at the database level.

### Isolation Model

- Every business table includes a tenant identifier
- Row-level security enforces tenant boundaries at the database layer
- Application code assumes data is already tenant-scoped
- The database is the authoritative enforcement point

### Request Context

Every authenticated request resolves:

1. User identity (from auth provider)
2. Active tenant (from membership)
3. User role in that tenant (from membership)
4. Enabled modules for that tenant (from TenantModule)

## Security Architecture

### Authentication

Delegated to the auth provider (currently Supabase Auth). The platform does not implement custom authentication.

Supported methods (configurable via provider):

- Email and password
- OAuth providers
- SSO (future)

### Authorization

Role-based access control at the tenant level:

```
User → Membership → Tenant → Role → Permissions
```

Roles are stored in membership records, not on the user. Permission evaluation requires an active tenant context.

For database-level enforcement, see [RLS_STRATEGY.md](../security/RLS_STRATEGY.md).

## Dependency Rules

```
Application Code
    ↓
Modules (independent of each other)
    ↓
Core + Shared
    ↓
Infrastructure
    ↓
External Services
```

| Allowed | Forbidden |
|---------|-----------|
| Module → Core | Module → Module |
| Module → Shared | Core → Module |
| Core → Shared | Shared → Module |

## Development Phases

### Phase 0 (Current)

- Platform skeleton and documentation
- Business contracts defined
- Architecture and module structure established
- Salon module as reference implementation

### Phase 1: Authentication

- Auth provider integration
- Login and signup flows
- Session management
- Protected routes

### Phase 2: Tenant Creation

- Tenant registration flow
- Owner assignment
- Initial module enablement

### Phase 3: Membership

- User invitation
- Role assignment
- Role-based dashboard views

### Phase 4+: Module Implementation

- Salon module entities and workflows
- Additional modules following the same pattern

## Scalability Path

| Dimension | MVP | Future |
|-----------|-----|--------|
| Modules | Salon only | Restaurant, Clinic, Gym, Pharmacy, Store |
| Modules per tenant | One | Multiple simultaneous |
| Auth methods | Email, OAuth | SSO, additional providers |
| Database | Single PostgreSQL | Read replicas, domain separation |
| Caching | None | Redis or equivalent |
| Events | None | Real-time subscriptions |

## Technology Rationale

Current choices and their reasoning. These may change without affecting business contracts.

| Choice | Rationale |
|--------|-----------|
| Supabase | Managed auth, PostgreSQL, RLS, realtime, storage — reduces DevOps overhead |
| Prisma | Type-safe ORM, migration management, relationship handling |
| Next.js | Full-stack React framework with API routes and SSR |
| PostgreSQL | Relational data with strong RLS support |
| Modular architecture | Independent scaling, parallel team work, clear boundaries |

## Related Documents

- [Business Contracts](../contracts/INDEX.md)
- [Domain Model](./DOMAIN_MODEL.md)
- [Module System](./MODULE_SYSTEM.md)
- [RLS Strategy](../security/RLS_STRATEGY.md)
- [Prisma Schema](../database/PRISMA_SCHEMA.md)
- [Migration Plan](../database/MIGRATION_PLAN.md)
