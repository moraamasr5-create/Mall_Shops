# Production Readiness (RG-003) — Definition & Plan

**What this is:** The canonical checklist and execution plan for **Release Gate RG-003**.  
**What this is not:** Architecture Lock, ADR, or authorization to ship `v1.0.0`.

**Plan status:** **APPROVED**  
**Gate status:** **COMPLETE** — PR-01…PR-07 PASS · **propose RG-003 = PASSED** (await owner flip)

**Index:** [RELEASE_GATES.md](./RELEASE_GATES.md) · Prerequisites: [OP-001 CLOSED](./DECISION_LOG.md#op-001), [OP-002 CLOSED](./DECISION_LOG.md#op-002)

---

## 1. Definition

**Production Readiness** means the platform can be operated with recoverability, safe config, and enough observability to diagnose Auth / RLS / Prisma / API failures — without new Modules or Core redesign.

```
Architecture Foundation …… COMPLETE
Operational Foundation …… COMPLETE
Production Readiness ……… RG-003
RC1 / Pilot / v1.0.0 ……… RG-004+
```

---

## 2. Scope rules

| In | Out |
|----|-----|
| Listed PR-xx items only | New Modules (Restaurant/Cafe/Gym/…), DDD expansion, folder reshuffles |
| Minimal code when an item requires it | Grafana / Prometheus / OpenTelemetry / Sentry (unless later assigned) |
| One PR at a time | Parallel RG-003 tracks |

**Doc debt (end of RG-003, not blocking PR-04):** resolve `docs/architecture/PLATFORM.md` vs `PLATFORM_ARCHITECTURE.md` (delete, redirect, or mark archived).

---

## 3. Mandatory checklist

| ID | Item | Status |
|----|------|--------|
| **PR-01** | Environment Validation | ✅ PASS — [`evidence/environment-validation-latest.md`](./evidence/environment-validation-latest.md) |
| **PR-02** | Backup Strategy | ✅ PASS — [`ops/BACKUP_STRATEGY.md`](./ops/BACKUP_STRATEGY.md) |
| **PR-03** | Restore Verification (procedure) | ✅ PASS — [`ops/RESTORE_VERIFICATION.md`](./ops/RESTORE_VERIFICATION.md) |
| **PR-04** | Application Observability (MVP) | ✅ PASS — [`ops/OBSERVABILITY.md`](./ops/OBSERVABILITY.md) |
| **PR-05** | Migration Safety / Rollback Procedure | ✅ PASS — [`ops/MIGRATION_SAFETY.md`](./ops/MIGRATION_SAFETY.md) |
| **PR-06** | Release Verification (CI) | ✅ PASS — [`ops/RELEASE_VERIFICATION.md`](./ops/RELEASE_VERIFICATION.md) · [`.github/workflows/verify.yml`](../.github/workflows/verify.yml) |
| **PR-07** | Production Sign-off | ✅ PASS — [`ops/PRODUCTION_SIGNOFF.md`](./ops/PRODUCTION_SIGNOFF.md) |

### Optional (not required to close RG-003)

| ID | Item | Status |
|----|------|--------|
| **PR-O1** | Rate Limiting | ⏳ |
| **PR-O2** | Secret Handling inventory / rotation drill | ⏳ |
| **PR-O3** | Uptime check | ⏳ |
| **PR-O4** | Incident triage runbook | ⏳ |
| **PR-O5** | Load smoke | ⏳ |
| **PR-O6** | Live Cross-Tenant re-PASS after observability (if runtime risk) | ⏳ |

---

## 4. PR-04 — Application Observability (MVP)

**Goal:** Diagnose “did the request arrive / fail / where?” without a full monitoring stack.

| Include | Exclude |
|---------|---------|
| Existing `/api/health` | Grafana, Prometheus, OTel, Sentry |
| One `requestId` per request (response + logs) | New SaaS vendors |
| `errorId` on error responses | Redesign of API contracts beyond meta fields |
| Structured JSON logs on the server | Per-module custom log frameworks |

Canonical note: [`ops/OBSERVABILITY.md`](./ops/OBSERVABILITY.md)

---

## 5. Execution order

```
PR-01 Environment Validation     ✅
PR-02 Backup Strategy            ✅
PR-03 Restore Verification       ✅
PR-04 Application Observability  ✅
PR-05 Migration Safety / Rollback ✅
PR-06 Release Verification (CI)  ✅
PR-07 Production Sign-off        ✅
→ RG-003 = PASSED (proposed — owner confirm)
→ Final Release Audit on clean tree (before RG-004)
→ RG-004 RC1 → RG-005 Pilot (one salon) → RG-006 v1.0.0
```

---

## 6. Exit criteria — RG-003 = PASS

1. PR-01 … PR-07 all **PASS** with evidence links.  
2. No Mandatory waiver without Decision Log exception.  
3. [RELEASE_GATES.md](./RELEASE_GATES.md) RG-003 → ✅.  
4. Optional doc-debt note addressed or deferred with owner.

Then: eligibility for **Final Release Audit**, then **RG-004 (RC1)** only after explicit assignment.

---

## 7. Final Release Audit (before RG-004)

**Not a new PR-xx.** One closing review after **RG-003 PASS** and **before** opening Release Candidate:

| Check | Required |
|-------|----------|
| Architecture Lock still intact | Yes |
| Operational Gates closed (OP-001, OP-002 as applicable) | Yes |
| Release Gates through **RG-003** satisfied | Yes |
| No conflicting canonical docs (or debt recorded) | Yes |
| `git status` clean for the release commit | Yes |
| Latest Cross-Tenant Evidence **Overall: PASS** | Yes |

Only after this audit may **RG-004** be assigned.

---

## 8. Related

Freeze: [`evidence/2026-07-15-operational-pass.md`](./evidence/2026-07-15-operational-pass.md) · tag `vs1-operational-pass`.
