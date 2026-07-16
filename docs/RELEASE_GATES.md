# Release Gates

**Purpose:** Define *objective* conditions for claiming VS1 Complete and cutting a release.  
Not Architecture Lock. Not ADRs. Complements [DECISION_LOG.md](./DECISION_LOG.md) (OP-\*).

**Rule:** From this point forward, new work should **close an existing gate**, not invent a new one without an explicit OP/RG entry.

---

## Gate table

| Gate | Condition | Status |
|------|-----------|--------|
| **RG-001** | [OP-001](./DECISION_LOG.md#op-001) = **CLOSED** | ✅ Passed (2026-07-15) |
| **RG-002** | [OP-002](./DECISION_LOG.md#op-002) = **VERIFIED** | ✅ Passed (2026-07-15; OP-002 CLOSED) |
| **RG-003** | Production Readiness Checklist = **PASS** | ✅ **PASSED** (2026-07-15) — [sign-off](./ops/PRODUCTION_SIGNOFF.md) · [Final Release Audit](./evidence/final-release-audit-rg003.md) |
| **RG-004** | Release Candidate **RC1** successful | ✅ **PASSED** (2026-07-16) — BAS-001 PASS · READY FOR PILOT · [business-acceptance-summary-bas-001.md](./evidence/business-acceptance-summary-bas-001.md) |
| **RG-005** | Pilot Deployment successful | 🔒 Locked |
| **RG-006** | Tag / release **v1.0.0** | 🔒 Locked |

Status legend: 🔒 = not yet passed · ✅ = passed (update this table when evidence warrants).

---

## Formal definition: VS1 Complete

```
VS1 Complete
  = All mandatory Operational Decisions CLOSED
    (at minimum OP-001 CLOSED; OP-002 CLOSED when hardening is in scope for the release)
  + Release Gates PASSED
    (RG-001 … RG-006 as required for that release train)
```

Until then, do **not** claim VS1 Complete, open a new production Module, or treat the platform as release-qualified.

**Current evaluation (governance view):**

| Dimension | Assessment |
|-----------|------------|
| Architecture Foundation | **COMPLETE** |
| Operational Foundation | **COMPLETE** ([snapshot](./evidence/2026-07-15-operational-pass.md)) |
| Governance Foundation | **COMPLETE** (Lock + ADR + Decision Log + Operational Gates + Release Gates) |
| Current Phase | **Pilot Learning (RG-005 eligible)** — Feature Freeze until Exit Criteria below |
| Architectural evolution | Remains Lock-governed; new Modules still gated by RG-006 |

---

## Release train (order)

```
OP-001 VERIFIED → CLOSED          (RG-001)
  → OP-002 AUTHORIZED → … → VERIFIED (RG-002)
  → Production Readiness Checklist PASS (RG-003)
  → VS1 Complete (per definition above)
  → RC1 success (RG-004)
  → Pilot Deployment success (RG-005)
  → Tag v1.0.0 (RG-006)
  → First Production Module
```

---

## RG notes

### RG-001 — Cross-Tenant gate closed

Evidence: `docs/evidence/cross-tenant-latest.md` **Overall: PASS**, then OP-001 advanced to **CLOSED**.

### RG-002 — DB Role Hardening verified

Only after OP-002 is implemented and proven (see Decision Log lifecycle).  
May be marked N/A for an interim internal milestone **only** with an explicit written exception in the Decision Log — default is **required** before v1.0.0.

### RG-003 — Production Readiness Checklist

Canonical plan: **[PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)** — **APPROVED**.  
**In progress.** Execute **one PR-xx at a time** (Execution Rule).  
**Done:** PR-01 … PR-07.  
**RG-003:** ✅ **PASSED** (Final Release Audit on clean `main`).  
**Current phase:** **Pilot Learning (RG-005 eligible)** — Feature Freeze rules under § RG-005; await explicit assignment.  
**Doc debt (before v1.0.0):** `PLATFORM.md` vs `PLATFORM_ARCHITECTURE.md`.

### RG-004 — RC1

Release Candidate = **BAS-001** Business Acceptance (Public APIs only) + smoke + cross-tenant + verify + CI green.

**2026-07-16:** ✅ **PASSED** — BAS-001 runId `1784223356496-122787b4` PASS; smoke PASS; cross-tenant PASS; READY FOR PILOT. See [business-acceptance-summary-bas-001.md](./evidence/business-acceptance-summary-bas-001.md). **STOP** — do not open RG-005 until explicit assignment.

### RG-005 — Pilot (Pilot Learning Phase)

One trial client (first salon owner). Goal: **learn from real use**, not ship Features.  
Start only on **explicit assignment**. Until then: 🔒 Locked.

#### Feature Freeze (executive rule during RG-005)

While RG-005 is active (Pilot in progress), work is **frozen** except as allowed below.

**Allowed**

| Kind | Meaning |
|------|---------|
| 🔴 Bug / Pilot Blocker | Fix that prevents the client from completing their work |
| 🟡 UX | Only if it blocks or clearly confuses normal use |
| ⚙️ Operational | Environment / Deployment / Monitoring fixes |

**Forbidden**

- 🔵 Any new Business Feature
- Domain Model changes
- Database Schema changes except to fix a proven Bug
- Architecture changes
- New Module or Platform Shared Service (including Printing)

#### Pilot note decision rule

| Note type | Decision |
|-----------|----------|
| 🔴 Blocker | Fix immediately |
| 🟡 UX | Implement only if it clearly improves real use |
| 🔵 Feature Request | **Do not** implement during Pilot — record in Backlog; prioritize later by frequency × value |

Do **not** treat “first client asked for X” as authorization to build X during the Freeze.

#### Pilot note template (four fields only)

1. What was the client trying to do?
2. Where did they stop?
3. How did they complete (or not)?
4. Classification: 🔴 Blocker / 🟡 UX / 🔵 Feature Request

#### Exit Criteria — when Feature Freeze ends

Feature Freeze ends **only when all** of the following are true:

1. RG-005 (Pilot) completed
2. Pilot Review issued
3. Backlog prioritized from real client notes
4. VS1.1 plan approved

Only then may the first new Feature start. Until then: Product Validation, not Feature delivery.

### RG-006 — v1.0.0

Git tag / release only after RG-001…RG-005 satisfied (or explicitly waived in Decision Log).

---

## How to update

1. Flip 🔒 → ✅ only with linked evidence or Decision Log state change.
2. Do not add RG-007+ casually — prefer closing existing gates.
3. Keep this file as the single Release Gate index (no parallel “v2” lists).
