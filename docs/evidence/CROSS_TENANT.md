# Operational Evidence — Cross-Tenant Isolation

## Purpose

Prove on a **live** request path that Tenant A data is not readable by Identity B (and vice versa).

This is **Operational Evidence**, not an Architecture Lock change and not an Infrastructure change.

## Status legend (mandatory)

| Status | Meaning |
|--------|---------|
| **PASS** | Runtime ran. Isolation proven. |
| **FAIL** | Runtime ran. Tenant isolation is broken. |
| **NOT_EXECUTED** | Environment unavailable (app not running, unreachable, incomplete setup). **No conclusion.** |

`fetch failed` / application not running ⇒ **NOT_EXECUTED**, never **FAIL**.

## PASS criteria (only when runtime executes)

| Case | Expected |
|------|----------|
| Identity A + Tenant A lists own salon services | `200` and ≥ 1 row |
| Identity B + `X-Tenant-Id` = Tenant A | `403`, 0 business rows |
| Identity A + `X-Tenant-Id` = Tenant B | `403`, 0 business rows |
| Identity B + Tenant B lists services | `200` and **0** rows that belong to A (empty for fresh B) |
| Identity B GET Tenant A service id with Tenant A header | `403`, 0 business rows |

Overall **PASS** only if every case passes after a successful runtime.

## How to run

Prerequisites (existing VS1 runnable stack — do not change infra for this evidence):

1. Supabase Auth + DB migrated
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
  - `0` = **PASS**
  - `1` = **FAIL** (isolation broken)
  - `2` = **NOT_EXECUTED** (no conclusion)

## Unit tests (matrix / scoring)

```bash
npm test
```

These tests lock the expected isolation matrix, PASS/FAIL scoring, and NOT_EXECUTED classification. They do **not** replace the live run.

## Related

- [RLS.md — Testing RLS](../implementation/RLS.md)
- Architecture Lock: two-layer authorization (DB isolation + application RBAC)

## Next work after PASS

Do not start Last OWNER, DB Hardening, Production Readiness, or a new Module until a real runtime evidence report shows **PASS**.
