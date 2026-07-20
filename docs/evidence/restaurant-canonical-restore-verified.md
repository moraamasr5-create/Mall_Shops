# Restaurant — Verify Canonical Restore

**Date:** 2026-07-20  
**Kind:** Verification only — **no** new knowledge · **no** Exit Criteria · **no** Product decisions  
**Method:** Replay of prior agent-transcript `Write` + `StrReplace` onto working tree (restore, not re-author)  
**Authority:** [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) §0 · [Canonicalization Audit](./restaurant-canonicalization-audit.md)

---

## Verdict

# Canonical Restore = PASS

Working tree now holds the Canonical documents required by Thesis + Knowledge Index. Writers/AI must read from disk, not session memory.

---

## Present (Canonical)

| Doc | Path | Check |
|-----|------|-------|
| MVP Thesis | `docs/modules/restaurant/MVP_THESIS.md` | **ADOPTED** (pre-existing) |
| Governance Framework | `docs/platform/GOVERNANCE_FRAMEWORK.md` | **ADOPTED** (pre-existing) |
| Knowledge Index | `docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md` | **OK** |
| VISION | `docs/modules/restaurant/VISION.md` | **OK** |
| MVP Boundary | `docs/modules/restaurant/MVP_BOUNDARY.md` | **OK** |
| Module pack | README · DOMAIN_LANGUAGE · AGGREGATE_BOUNDARIES · LIFECYCLE_MAP · CAPABILITY_MAP · PACKAGE_MANIFEST | **OK** |
| Discovery | `docs/evidence/restaurant-discovery-and-mapping.md` | **OK** |
| Anti-Patterns | `docs/evidence/restaurant-anti-patterns.md` | **OK** |
| Workflow · Patterns · Gaps · Aggregate Map · Capability Classification | `docs/evidence/restaurant-*.md` | **OK** |
| Knowledge Inventory CLOSED | `docs/evidence/abukhater-knowledge-inventory.md` | **OK** |
| Traceability Verification | `docs/evidence/restaurant-knowledge-traceability-verification.md` | **OK** |
| Contracts review | `docs/evidence/restaurant-contracts-review-2026-07-19.md` | **OK** |
| Canonical Contracts INDEX | `docs/contracts/modules/restaurant/INDEX.md` | **OK** (PWU pack — not stub) |
| ORDER (PWU) · MENU · FULFILLMENT · GUEST · PAYMENT · SHIFT · RESERVATION · RESTAURANT_EMPLOYEE · SETTINGS · REPORTING | same folder | **OK** |
| Salon pattern · Readiness · Capability Map · Salon Lock evidence | `docs/evidence/salon-*` / `platform-capability-map-*` | **OK** |

**Spot-check:** `ORDER.md` = Primary Operational Work Unit (not transactional cart).

---

## Legacy (quarantined)

| Location | Contents |
|----------|----------|
| `docs/contracts/modules/restaurant/_legacy_stubs/` | Pre–Reference-Design stubs (cart ORDER, KitchenTicket, Driver, Table, Customer, LEGACY INDEX banner version, …) |

Per Canonical Rule: Legacy is read-only; must not drive Product / Exit Criteria / Schema / APIs / UI.

---

## Also restored (supporting)

| Path | Note |
|------|------|
| `docs/evidence/restaurant-reference-*.md` | Earlier reference extraction siblings — supporting, not Product SoT |
| `docs/evidence/ezz-business-workflow-reference.md` | Salon operational adjacent |

---

## Not done (correctly deferred)

| Item | Status |
|------|--------|
| Restaurant Exit Criteria | **Not written** — next Founder command after this PASS |
| Product Execution / Phase A | Blocked until Exit Criteria ADOPT |
| AbuKhater re-extraction | **Forbidden** |

---

## Next sequence

```
✅ Verify Canonical Restore   ← this document
⏳ Restaurant Exit Criteria (translate Thesis only)
⏳ Founder ADOPT Exit Criteria
⏳ Phase A Assignment
⏳ Product Execution
```

**Question for any new document from here:**  
“Am I translating the Product Constitution into execution?” — **not** “What is the product?”
