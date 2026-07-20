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
| **Knowledge Index (entry point)** | `docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md` | **MISSING** |
| **VISION** | `docs/modules/restaurant/VISION.md` | **MISSING** |
| **MVP Boundary** | `docs/modules/restaurant/MVP_BOUNDARY.md` | **MISSING** |
| **Discovery** | `docs/evidence/restaurant-discovery-and-mapping.md` | **MISSING** |
| **Anti-Patterns** | `docs/evidence/restaurant-anti-patterns.md` | **MISSING** |
| **Operational Workflow** | `docs/evidence/restaurant-operational-workflow.md` | **MISSING** |
| **Pattern Library** | `docs/evidence/restaurant-pattern-library.md` | **MISSING** |
| **Gap Analysis** | `docs/evidence/restaurant-gap-analysis-salon.md` | **MISSING** |
| **Aggregate Map** | `docs/evidence/restaurant-aggregate-map.md` | **MISSING** |
| **Capability Classification** | `docs/evidence/restaurant-capability-classification.md` | **MISSING** |
| **Knowledge Inventory (CLOSED)** | `docs/evidence/abukhater-knowledge-inventory.md` | **MISSING** |
| **Traceability Verification** | `docs/evidence/restaurant-knowledge-traceability-verification.md` | **MISSING** |
| **Canonical Contracts (Index-canonical)** | Expected: `ORDER` (PWU) · `MENU` · `FULFILLMENT` (Entity) · `GUEST` · `RESTAURANT_EMPLOYEE` · `PAYMENT` (Acceptance VO) · `SHIFT` · `RESERVATION` · `SETTINGS` · `REPORTING` + Contracts INDEX aligned with Thesis | **MISSING** (not present as PWU pack) |
| **Module Reference Design pack** | Expected: `DOMAIN_LANGUAGE` · `AGGREGATE_BOUNDARIES` · `LIFECYCLE_MAP` · `CAPABILITY_MAP` · `PACKAGE_MANIFEST` · `README` | **MISSING** |
| **Salon pattern (rename+apply)** | `docs/evidence/salon-module-reference-pattern.md` | check tree separately — Restaurant reads via Index when restored |
| **Governance Framework** | `docs/platform/GOVERNANCE_FRAMEWORK.md` | check tree separately |

**Product SoT today on this tree:** `MVP_THESIS.md` only.  
**Do not write Exit Criteria until Missing Canonical rows are restored** (or Founder explicitly scopes Exit Criteria to Thesis-only with deferred citations).

---

## Legacy (Read-only)

### A — Pre–Reference-Design contract stubs (HIGH RISK — AI trap)

Banner applied on folder INDEX. **Do not use for Product, Exit Criteria, schema, or Portal.**

| File | Why Legacy |
|------|------------|
| `docs/contracts/modules/restaurant/INDEX.md` | Peer Aggregates: Payment, Fulfillment, KitchenTicket, Driver, Table, Customer — contradicts ADOPTED Thesis |
| `docs/contracts/modules/restaurant/ORDER.md` | Cart / transactional basket; decoupled Payment & Fulfillment Aggregates — not PWU Order |
| `docs/contracts/modules/restaurant/PAYMENT.md` | Payment Aggregate + refunds — Thesis: snapshot VO only; Settlement OUT |
| `docs/contracts/modules/restaurant/FULFILLMENT.md` | Fulfillment as independent Aggregate — Thesis: Entity inside Order |
| `docs/contracts/modules/restaurant/KITCHEN.md` | **KitchenTicket** Aggregate / station routing — Thesis: Order states only; ticket OUT |
| `docs/contracts/modules/restaurant/DRIVER.md` | Driver / DeliveryAssignment Aggregate — Thesis: delivery = mode; Pilot/dispatch OUT of P0 |
| `docs/contracts/modules/restaurant/TABLE.md` | Floor / Table / Reservation Aggregate — Thesis: no table map; Reservation out of P0 loop |
| `docs/contracts/modules/restaurant/CUSTOMER.md` | Customer profile Aggregate — Thesis: Guest Entity, not CRM Customer Root |
| `docs/contracts/modules/restaurant/EMPLOYEE.md` | Employee Aggregate shape — Thesis: Membership + RestaurantEmployee assignment |
| `docs/contracts/modules/restaurant/SHIFT.md` | Shift as first-class with TimeEntry — Thesis: Shift Aggregate خارج P0 |
| `docs/contracts/modules/restaurant/MENU.md` | Stub-era menu — treat as Legacy until replaced by Index-canonical MENU |
| `docs/contracts/modules/restaurant/STATUS.md` | Tied to stub state machines (Payment/Kitchen aggregates) |
| `docs/contracts/modules/restaurant/EVENTS.md` | Tied to stub event model |

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
