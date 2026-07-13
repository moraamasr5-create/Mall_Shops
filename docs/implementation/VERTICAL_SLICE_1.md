# Vertical Slice 1 — Implementation Decisions

## Status

**Active — Vertical Slice 1**

These are Implementation choices for the first end-to-end path.
They are **not** Architecture Locks and may change without rewriting Contracts.

## Slice Goal

Validate Architecture end-to-end with the minimum functional path:

```
Identity → Tenant → Membership → TenantModule → Salon Reference Module
```

## Implementation Choices (VS1)

| Concern | Choice | Notes |
|---------|--------|-------|
| App framework | Next.js App Router | API routes for Core + Salon |
| Language | TypeScript | |
| ORM | Prisma | |
| Database | PostgreSQL via Supabase | |
| Identity Provider | Supabase Auth | JWT = Identity only |
| Module registry storage | **Constants / code registry** | No Module catalog table in VS1 |
| TenantModule storage | **Database table `tenant_module`** | Activation relationship persistence for VS1 |
| Tenant context | `X-Tenant-Id` header | Per ADR-002 |
| Authorization Layer 1 | Supabase RLS on business tables | Tenant isolation only |
| Authorization Layer 2 | Application Permission checks | Explicit Role → Permission maps |
| Salon entities (minimum) | `salon_service` only | Enough to prove Module path |

## Non-Goals for VS1

- Full Salon domain (employees, appointments, customers)
- Multi-module activation UI
- Module marketplace / paid modules
- Permission caching
- Frontend UI polish

## Alignment Rule

If an Implementation choice conflicts with Architecture Lock v1.0 FINAL, Architecture wins.
Change Implementation — do not change Architecture.
