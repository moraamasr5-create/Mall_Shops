# Vertical Slice 1 — Implementation Decisions

## Status

**Active — VS1 Runnable**

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
| Auth HTTP | `POST /api/v1/auth/signup`, `POST /api/v1/auth/login` | Thin wrappers over Supabase Auth |
| Module registry storage | **Constants / code registry** | No Module catalog table in VS1 |
| TenantModule storage | **Database table `tenant_module`** | Activation relationship persistence for VS1 |
| Tenant context | `X-Tenant-Id` header | Per ADR-002 |
| Authorization Layer 1 | RLS in Prisma migrations + `withIdentityRls` | Tenant isolation only; `SET LOCAL ROLE authenticated` |
| Authorization Layer 2 | Application Permission checks | Explicit Role → Permission maps |
| Tenant bootstrap | Privileged Prisma path in `createTenant` only | Required for INSERT…RETURNING before membership exists |
| Salon entities (minimum) | `salon_service` | Employees/customers added in later slices; still Salon-owned |

## Core Security Improvement (this slice)

Layer 1 enforcement on the primary Prisma path required changes under `src/core/http` and Core services.

Classification: **Security Improvement** (Architecture Regression Checklist).

Use `ARCH_ALLOW_CORE_CHANGES=true` for the architecture gate only while this reviewed Core change is in the working tree.

## Non-Goals for VS1

- Full Salon domain (appointments, billing UI)
- Multi-module activation UI
- Module marketplace / paid modules
- Permission caching
- Frontend UI polish
- Expanding Restaurant beyond architectural validation

## Alignment Rule

If an Implementation choice conflicts with Architecture Lock v1.0 FINAL, Architecture wins.
Change Implementation — do not change Architecture.
