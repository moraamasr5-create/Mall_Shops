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
| **RG-003** | Production Readiness Checklist = **PASS** | 🔒 Locked |
| **RG-004** | Release Candidate **RC1** successful | 🔒 Locked |
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
| Current Phase | **Production Hardening** |
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

Checklist to be maintained under implementation/ops docs when that phase opens. Not started until live Cross-Tenant evidence exists (OP-001 path).

### RG-004 — RC1

Release Candidate build + smoke + Operational Gate still PASS.

### RG-005 — Pilot

One trial client (salon/restaurant trial). Operational learnings (logs, monitoring, permissions, usability) absorbed before Tag.

### RG-006 — v1.0.0

Git tag / release only after RG-001…RG-005 satisfied (or explicitly waived in Decision Log).

---

## How to update

1. Flip 🔒 → ✅ only with linked evidence or Decision Log state change.
2. Do not add RG-007+ casually — prefer closing existing gates.
3. Keep this file as the single Release Gate index (no parallel “v2” lists).
