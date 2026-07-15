# Operational Evidence — Cross-Tenant Isolation

## Purpose

Prove on a **live** request path that Tenant A data is not readable or writable by Identity B (and vice versa).

This is the project’s **Operational Gate: Cross-Tenant Validation** — a formal development gate, not an informal script check and not an Architecture Lock change.

## Formal gate (release criterion)

Formal release record: [Decision Log — OP-001](../DECISION_LOG.md#op-001). DB Hardening: [OP-002](../DECISION_LOG.md#op-002).

This gate is part of **project release criteria**, not a local developer convenience.

It is **PASSED** only when **all** of the following are true:

| # | Requirement |
|---|-------------|
| 1 | Live Supabase environment |
| 2 | Authenticated JWT (Identity only) |
| 3 | Real RLS policies applied |
| 4 | Cross-tenant **reads** return **403** or **0** business rows |
| 5 | Cross-tenant **writes** fail (denied) |
| 6 | Evidence report stored with **Overall: PASS** (`docs/evidence/cross-tenant-latest.md`) |

**Only after this gate is PASSED may DB Role Hardening begin.**

Do not start Production Readiness cutover, VS1 Complete, **Release Candidate (RC1)**, **Pilot Deployment** sign-off as “done,” Tag v1.0.0, or a new production Module until this gate has PASSED.

Recommended path after gate PASS:

```
Cross-Tenant PASS
  → DB Hardening
  → Production Readiness
  → VS1 Complete
  → RC1
  → Pilot Deployment (one trial client)
  → Tag v1.0.0
  → First Production Module
```

## Status legend (mandatory)

| Status | Meaning |
|--------|---------|
| **PASS** | Runtime ran. Isolation proven. **Gate PASSED.** |
| **FAIL** | Runtime ran. Tenant isolation is broken. **Gate FAILED.** |
| **NOT_EXECUTED** | Environment unavailable. **Gate not evaluated — no conclusion.** |

`fetch failed` / application not running ⇒ **NOT_EXECUTED**, never **FAIL**.

## PASS criteria (runtime matrix)

| Case | Expected |
|------|----------|
| Identity A + Tenant A lists own salon services | `200` and ≥ 1 row |
| Identity B + `X-Tenant-Id` = Tenant A | `403`, 0 business rows |
| Identity A + `X-Tenant-Id` = Tenant B | `403`, 0 business rows |
| Identity B + Tenant B lists services | `200` and **0** rows that belong to A (empty for fresh B) |
| Identity B GET Tenant A service id with Tenant A header | `403`, 0 business rows |
| Identity B POST salon service with `X-Tenant-Id` = Tenant A | denied (`403`); no write into Tenant A |

Overall **PASS** only if every case passes after a successful runtime (including write denial).

## How to run

Prerequisites (existing VS1 runnable stack — do not change infra for this evidence):

1. Supabase Auth + DB migrated (live **Local Docker** or **Hosted** Supabase — see [RUNBOOK_FIRST_DEPLOYMENT.md](../RUNBOOK_FIRST_DEPLOYMENT.md))
2. `npm run dev`
3. `.env` configured

```bash
npm run evidence:cross-tenant
```

Optional:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run evidence:cross-tenant
```

## Report

- Console + file: [`cross-tenant-latest.md`](./cross-tenant-latest.md) (overwritten each run)
- Exit codes:
  - `0` = **PASS** (gate PASSED)
  - `1` = **FAIL** (isolation broken; gate FAILED)
  - `2` = **NOT_EXECUTED** (no conclusion)

## Unit tests (matrix / scoring)

```bash
npm test
```

These tests lock the expected isolation matrix and PASS/FAIL/NOT_EXECUTED scoring. They do **not** replace the live gate.

## Related

- [RLS.md — Testing RLS](../implementation/RLS.md)
- [RLS.md — DB Role Hardening Decision Record](../implementation/RLS.md) (blocked on this gate)
- Architecture Lock: two-layer authorization (DB isolation + application RBAC)
