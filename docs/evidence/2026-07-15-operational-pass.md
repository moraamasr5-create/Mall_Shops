# Operational Pass Snapshot — 2026-07-15

**Purpose:** Historical freeze of the first live Operational PASS on Supabase Staging.  
**Not** Architecture Lock. **Not** a release tag for production (`v1.0.0`).  
**Git tag:** `vs1-operational-pass`

This is the moment the platform proved: empty Hosted project → migrations → first Tenant → Cross-Tenant isolation **PASS**.

---

## Snapshot fields

| Field | Value |
|-------|--------|
| **Commit Hash** | `7b89a54f30473313cf6955751228ff388f9d5906` |
| **Git tag** | `vs1-operational-pass` |
| **Ran at (evidence)** | `2026-07-15T01:24:42.330Z` |
| **Overall** | **PASS** (6/6 cases) |
| **Evidence report** | [`cross-tenant-latest.md`](./cross-tenant-latest.md) |
| **Supabase Project** | Mall_Full (official VS1 Staging) |
| **Project Ref** | `ovjbgxhhfjmgatdwqagb` |
| **Region** | West EU (Paris) / `eu-west-3` |
| **API URL** | `https://ovjbgxhhfjmgatdwqagb.supabase.co` |
| **Latest migration** | `20260715043000_fix_membership_rls_recursion` |
| **Migrations applied** | `20260714120000_vs1_init`, `20260715043000_fix_membership_rls_recursion` |
| **Public tables** | **8** (`_prisma_migrations`, `tenant`, `membership`, `tenant_module`, `salon_service`, `salon_employee`, `salon_customer`, `restaurant_category`) |
| **Public RLS policies** | **13** |
| **Postgres** | PostgreSQL 17.6 (Supabase Hosted) |
| **App package version** | `0.1.0` (`package.json`) |
| **Next.js** | `15.5.20` (installed) |
| **Prisma** | `6.19.3` (CLI + `@prisma/client`) |
| **Node.js** | `v24.12.0` (evidence host) |
| **OP-001** | **CLOSED** (VERIFIED via live PASS) |
| **RG-001** | **PASSED** |
| **OP-002** | Not started at this snapshot (AUTHORIZED only after this freeze) |

---

## Foundations at this moment

| Foundation | Status |
|------------|--------|
| Architecture Foundation | **COMPLETE** |
| Governance Foundation | **COMPLETE** |
| Operational Foundation | **COMPLETE** |
| Program phase after this snapshot | **Production Hardening** (starts with OP-002) |

---

## What this snapshot proves

1. Staging project was empty before first `prisma migrate deploy`.
2. Schema + RLS landed via Prisma migrations (including membership recursion hotfix).
3. First Identity + Tenant + Salon module + Salon Service worked on Hosted Supabase.
4. Live Cross-Tenant Operational Evidence: **Overall: PASS**.
5. OP-001 → VERIFIED → CLOSED; RG-001 passed.

---

## Explicitly not claimed

- VS1 Complete
- Production Readiness (RG-003)
- RC1 / Pilot / Tag `v1.0.0`
- OP-002 implemented or verified
- New production Module authorized

---

## Related

- [CROSS_TENANT.md](./CROSS_TENANT.md)
- [DECISION_LOG.md — OP-001](../DECISION_LOG.md#op-001)
- [RELEASE_GATES.md — RG-001](../RELEASE_GATES.md)
- [RUNBOOK_FIRST_DEPLOYMENT.md](../RUNBOOK_FIRST_DEPLOYMENT.md)
