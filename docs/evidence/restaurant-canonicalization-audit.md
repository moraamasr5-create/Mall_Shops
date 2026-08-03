# Restaurant Canonicalization Audit

**Date:** 2026-07-20  
**Kind:** Organizational audit only — **no** new Product knowledge · **no** Exit Criteria · **no** implementation  
**Trigger:** Stale restaurant contracts discovered during MVP Thesis Consistency Audit  
**Purpose:** One map so any AI/developer reads the right files — never silent legacy.

**Status:** **COMPLETE**  
**Permanent rule:** [Canonical Rule](../platform/GOVERNANCE_FRAMEWORK.md#1-canonical-rule-permanent--hierarchy-over-banners) in `docs/platform/GOVERNANCE_FRAMEWORK.md` — hierarchy beats banners.

---

## Canonical Rule (normative — permanent)

Authority is **hierarchical**. Banners are reminders only.

If any document conflicts with, in this order:

1. **MVP_THESIS** (ADOPTED Product Constitution)  
2. **Knowledge Index**  
3. **Canonical Contracts** (Thesis-aligned / Index-canonical)  
4. **Discovery**

…then that document is **Legacy automatically** — even without a `LEGACY` banner.

**Legacy must not be used** by any AI or developer to produce:

- Product Decisions  
- Exit Criteria  
- Contracts (as SoT)  
- Schema  
- APIs  
- UI Flows  

**Allowed:** historical / forensic reading only.

---

## Tree classification (this working tree)

| Class | May drive Exit Criteria / Product / S1 language? |
|-------|--------------------------------------------------|
| **Canonical** | **YES** — only these (when PRESENT) |
| **Legacy (Read-only)** | **NO** — including auto-Legacy via Canonical Rule |
| **Missing Canonical** | Restore before Exit Criteria writers rely on links |

---

## Canonical

| Doc | Path | On this working tree |
|-----|------|----------------------|
| **MVP Thesis (Product Constitution)** | `docs/modules/restaurant/MVP_THESIS.md` | **PRESENT — ADOPTED** |
| **Knowledge Index (entry point)** | `docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md` | **PRESENT** |
| **VISION** | `docs/modules/restaurant/VISION.md` | **PRESENT** |
| **MVP Boundary** | `docs/modules/restaurant/MVP_BOUNDARY.md` | **PRESENT** |
| **Discovery** | `docs/evidence/restaurant-discovery-and-mapping.md` | **PRESENT** |
| **Anti-Patterns** | `docs/evidence/restaurant-anti-patterns.md` | **PRESENT** |
| **Operational Workflow** | `docs/evidence/restaurant-operational-workflow.md` | **PRESENT** |
| **Pattern Library** | `docs/evidence/restaurant-pattern-library.md` | **PRESENT** |
| **Gap Analysis** | `docs/evidence/restaurant-gap-analysis-salon.md` | **PRESENT** |
| **Aggregate Map** | `docs/evidence/restaurant-aggregate-map.md` | **PRESENT** |
| **Capability Classification** | `docs/evidence/restaurant-capability-classification.md` | **PRESENT** |
| **Knowledge Inventory (CLOSED)** | `docs/evidence/abukhater-knowledge-inventory.md` | **PRESENT** |
| **Traceability Verification** | `docs/evidence/restaurant-knowledge-traceability-verification.md` | **PRESENT** |
| **Canonical Contracts (Index-canonical)** | ORDER (PWU) · MENU · FULFILLMENT · GUEST · RESTAURANT_EMPLOYEE · PAYMENT · SHIFT · RESERVATION · SETTINGS · REPORTING + INDEX | **PRESENT** |
| **Module Reference Design pack** | DOMAIN_LANGUAGE · AGGREGATE_BOUNDARIES · LIFECYCLE_MAP · CAPABILITY_MAP · PACKAGE_MANIFEST · README | **PRESENT** |
| **Salon pattern (rename+apply)** | `docs/evidence/salon-module-reference-pattern.md` | **PRESENT** |
| **Governance Framework** | `docs/platform/GOVERNANCE_FRAMEWORK.md` | **PRESENT** |

**Restore verification:** [restaurant-canonical-restore-verified.md](./restaurant-canonical-restore-verified.md) — **PASS**  
**Product SoT:** ADOPTED Thesis. **Legacy stubs:** `docs/contracts/modules/restaurant/_legacy_stubs/`.  
**Next:** write **Restaurant Exit Criteria** (translate Thesis only).

~~**Do not write Exit Criteria until Missing Canonical rows are restored**~~ — restored 2026-07-20.

---

## Legacy (Read-only)

### A — Pre–Reference-Design contract stubs (HIGH RISK — AI trap)

**Quarantined to:** `docs/contracts/modules/restaurant/_legacy_stubs/`  
Canonical PWU contracts now live in the parent folder (`ORDER.md` = Primary Work Unit, etc.).  
Do **not** use `_legacy_stubs` for Product, Exit Criteria, schema, or Portal.

### B — Code scaffold (validation-only — not Product Constitution)

| Path | Note |
|------|------|
| `src/modules/restaurant/**` | Permissions / categories scaffold — **not** authorization to expand Restaurant Product |
| `src/app/api/v1/restaurant/**` | API stubs — do not treat as Thesis Success Loop implementation |

### C — Platform mentions (OK to read; not Restaurant Product SoT)

| Path | Note |
|------|------|
| `AGENTS.md` | Restaurant gated / validation-only language — obey Gates; Thesis ADOPT does not by itself open build |
| `docs/architecture/DOMAIN_MODEL.md` | `restaurant` = validation-only in MVP row |
| Other architecture / MVP / ops docs mentioning restaurant | Context only |

### D — Diagrams

| Finding |
|---------|
| **No** restaurant-specific diagram assets found under `docs/` in this tree |

---

## Compact map (for agents)

```
Canonical
--------
MVP Thesis          → docs/modules/restaurant/MVP_THESIS.md     [ADOPTED · PRESENT]
Knowledge Index     → docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md [MISSING — restore]
Vision              → docs/modules/restaurant/VISION.md          [MISSING — restore]
MVP Boundary        → docs/modules/restaurant/MVP_BOUNDARY.md    [MISSING — restore]
Canonical Contracts → Index-canonical PWU pack                   [MISSING — restore]
Discovery (+ KB)    → docs/evidence/restaurant-* · inventory     [MISSING — restore]

Legacy (Read-only)
------------------
docs/contracts/modules/restaurant/*   (entire stub pack — see §A)
src/modules/restaurant/**             (scaffold)
src/app/api/v1/restaurant/**          (scaffold)
```

---

## Audit verdict

| Question | Answer |
|----------|--------|
| Is there a single entry for “what is Product?” | **Yes** — ADOPTED Thesis |
| Can an AI safely read `docs/contracts/modules/restaurant/ORDER.md` as SoT? | **No** — Legacy |
| Is the tree safe for Exit Criteria writers today? | **Not yet** — restore Missing Canonical (or Founder Thesis-only exception) |
| New Product decisions in this audit? | **None** |

**Next:** Restore Missing Canonical onto the working tree → then Founder command: write **Restaurant Exit Criteria** (gates only).  
**Do not** reopen AbuKhater archive unless a new operational question is uncovered that the Knowledge Base does not cover.  
**Later (after Restaurant Reference Lock only):** extract platform **Module Factory Pattern** — see [GOVERNANCE_FRAMEWORK.md §3](../platform/GOVERNANCE_FRAMEWORK.md#3-module-factory-pattern--deferred) (**DEFERRED**).
