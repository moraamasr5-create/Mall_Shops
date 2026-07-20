# Salon Module v1.0 — Reference Locked

**Date:** 2026-07-20  
**Decision:** [OP-007](../DECISION_LOG.md#op-007) **CLOSED**  
**Title:** Salon Module v1.0 Reference Locked

## Meaning

Salon is the **locked Reference Implementation** of a Mall Module for the Visit-loop MVP.

From this moment:

- Changes to Salon Module / its reference docs / Visit contracts are **Change Requests**, not ordinary feature development.
- Restaurant and other Modules follow: Discovery / Assignment gates — not ad-hoc copy of Salon tables.

## Evidence chain

| Gate | Evidence |
|------|----------|
| Exit Criteria | [salon-reference-track-exit-criteria.md](./salon-reference-track-exit-criteria.md) ADOPTED |
| Phase A | [salon-phase-a-evidence.md](./salon-phase-a-evidence.md) PASSED |
| Phase B | [salon-phase-b-evidence.md](./salon-phase-b-evidence.md) PASSED |
| Founder Review | [salon-founder-review.md](./salon-founder-review.md) PASS |
| Phase S1 | [salon-phase-s1-evidence.md](./salon-phase-s1-evidence.md) PASSED |
| Phase S2 | [salon-phase-s2-evidence.md](./salon-phase-s2-evidence.md) PASSED |
| Reference Design | [docs/modules/salon/](../modules/salon/README.md) |
| Contracts | [docs/contracts/modules/salon/](../contracts/modules/salon/INDEX.md) |
| Pattern | [salon-module-reference-pattern.md](./salon-module-reference-pattern.md) |

## Still deferred / separate gates

| Item | Status |
|------|--------|
| `docs/platform/GOVERNANCE_FRAMEWORK.md` | **Created** — [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) |
| Restaurant Discovery & Mapping | **Opened** — [restaurant-discovery-and-mapping.md](./restaurant-discovery-and-mapping.md) (docs only) |
| Restaurant Exit Criteria / Phase A | Not started — next Founder commands |
| RG-005 / platform RG-006 tag | Separate Release Gates |
| Shared Capability / Restaurant **build** | Trigger + OP |

**Product build (A/B) ≠ Reference freeze (S1/S2) ≠ Reference Lock (this) ≠ Next Module Discovery.**
