# Restaurant Module Track — Exit Criteria

**Date:** 2026-07-20  
**Status:** **ADOPTED**  
**Adopted:** 2026-07-20 (Founder: APPROVED WITH ONE MINOR REFACTOR — Appendix A made reference-based)  
**Kind:** Executive governance gates only — **not** Product Thesis · **not** Domain redesign · **not** Knowledge extraction · **not** UI/API design  
**Translates:** [MVP_THESIS.md](../modules/restaurant/MVP_THESIS.md) (**ADOPTED**)  
**Entry map:** [RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md)  
**Governance:** [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md)  
**Canonical restore:** [restaurant-canonical-restore-verified.md](./restaurant-canonical-restore-verified.md) (**PASS**)  
**Pattern precedent:** Salon Reference track (OP-007) — same gate cycle; different Product Constitution  

**Single question this document answers:**

> متى نعتبر Restaurant جاهزًا للانتقال من مرحلة إلى المرحلة التالية؟

**It does not answer:** what the product is · which Aggregates exist · whether Reservation/Shift are in P0 · how UI/APIs are built. Those are frozen in Thesis / Canonical / Architecture.

---

## 0. Pre-flight (already satisfied)

| Gate | Evidence | State |
|------|----------|--------|
| Architecture (Salon Locked) | OP-007 · Architecture Lock | **LOCKED** |
| Operational Knowledge | AbuKhater inventory CLOSED | **CLOSED** |
| Canonical documents on tree | Restore verified | **PASS** |
| Product Constitution | MVP Thesis | **ADOPTED** |
| Canonical Rules / Legacy isolation | Governance Framework · `_legacy_stubs/` | **LOCKED** |

If any row regresses, **stop** — do not open Phase Assignment.

---

## 1. Purpose of this track

Execute the ADOPTED Restaurant Product Constitution until:

1. A Tenant can complete the **Thesis Success Loop** ([Thesis §4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0)) with Core + Restaurant Module only.  
2. The Module is **frozen and pattern-validated** as a Mall Module (S1 → S2).  
3. Founder issues **Restaurant Module Reference Locked** (or equivalent Decision).  

End state of the track: **Restaurant Module v1.0 Reference Locked** (Founder Decision).  
After that lock, Restaurant changes are **Change Requests**, not ordinary development.

This track is **not** platform RG-006 (`v1.0.0`).  
This track is **not** a license to reopen AbuKhater, Architecture, or Product Philosophy.

---

## 2. Official stages (in order)

| Stage | What “done” means (gate) | Primary evidence artifact |
|-------|--------------------------|---------------------------|
| **Exit Criteria ADOPT** | This document | Status = **ADOPTED** |
| **Phase A Assignment** | Founder-authored Assignment citing this Exit Criteria + Thesis | `restaurant-phase-a-assignment.md` |
| **Phase A Execution** | Appendix A Phase A gates PASS | `restaurant-phase-a-evidence.md` + Founder Check |
| **Phase B Assignment** | Founder Assignment | `restaurant-phase-b-assignment.md` |
| **Phase B Execution** | Appendix A Phase B gates PASS | `restaurant-phase-b-evidence.md` + Founder Check |
| **Founder Review** | Business go / no-go before Freeze | `restaurant-founder-review.md` |
| **Conditional Corrections** | Only if Review requires fixes **inside** Thesis Success Loop — not new Features | Evidence addendum |
| **Phase S1** | Freeze “how Restaurant works” under Thesis | `restaurant-phase-s1-*` |
| **Phase S2** | Pattern extraction + rename+apply validation (language) | `restaurant-phase-s2-*` |
| **Founder Lock** | Explicit Decision: Restaurant Module Reference Locked | Decision Log + lock evidence |

There is **no** official Phase C. Shared Capabilities remain governed by [Thesis §3.6](../modules/restaurant/MVP_THESIS.md#36-never-product-p0) (Trigger + OP only).

---

## 3. Out of scope (hard)

| Excluded | Authority |
|----------|-----------|
| New Product decisions | Thesis = ADOPTED SoT |
| Re-interpreting Domain / Aggregates / Contracts | Canonical docs + Thesis Precedence |
| Expanding P0 beyond Thesis Explicit OUT | [Thesis §3.4](../modules/restaurant/MVP_THESIS.md#34-explicit-out-of-p0-success-loop) |
| Using `_legacy_stubs/` or auto-Legacy as SoT | [Canonical Rule](../platform/GOVERNANCE_FRAMEWORK.md#1-canonical-rule-permanent--hierarchy-over-banners) |
| Re-opening AbuKhater extraction | Knowledge CLOSED |
| Architecture redesign / Core changes | Salon Locked · Architecture Lock |
| Platform tag RG-006 | Separate Release Gates |
| Treating presentation packaging as Domain | [Thesis §3.7](../modules/restaurant/MVP_THESIS.md#37-presentation-ux--not-domain) |

**Violation handling:** Any deliverable that requires excluded scope **fails the stage gate** until scope is removed or Thesis is explicitly superseded by Founder Decision.

---

## 4. Track success condition (normative)

The track’s Product spine is **proven** when phase evidence shows a Tenant can complete **exactly** what [Thesis §4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) defines — including its “Not in the loop” and “P0 has failed as a definition” clauses — with Core + Restaurant Module only.

This section **references** Thesis §4. It does **not** restate the loop.

Supporting Product constraints for proof (also by reference only):

| Concern | Read |
|---------|------|
| Normal Owner Day | [Thesis §3.2](../modules/restaurant/MVP_THESIS.md#32-normal-owner-day--success-loop-product-p0) |
| Explicit OUT of P0 | [Thesis §3.4](../modules/restaurant/MVP_THESIS.md#34-explicit-out-of-p0-success-loop) |
| Presentation (not Domain) | [Thesis §3.7](../modules/restaurant/MVP_THESIS.md#37-presentation-ux--not-domain) |

---

## 5. Who closes what

| Gate | Closes |
|------|--------|
| Exit Criteria | **Founder** (this file = **ADOPTED**) |
| Phase A / B Check | Founder Check PASS on phase evidence |
| Founder Review | Founder PASS (or Corrections then re-Review) |
| S1 / S2 | Founder Check PASS on phase evidence |
| Reference Lock | Founder Decision (Decision Log) |

Agents/implementers **do not** self-ADOPT stages.

---

## 6. Evidence rules

| Rule | Requirement |
|------|-------------|
| Traceability | Every gate cites Thesis § (or Index / Canonical path) — not archive, not Legacy |
| One artifact per stage | Kickoff · Baseline (if used) · Evidence · Founder Check |
| Fail closed | Missing evidence = stage not PASS |
| No restatement | Evidence proves Thesis clauses; does not rewrite them |

---

## 7. What ADOPT unlocks

**Unlocked now:** Founder may issue **Phase A Assignment**.

**Still forbidden until Phase A Assignment exists:** schema · migrations · APIs · Portal build · Shared builds.

**Project phase:** **Product Execution** ([Governance Framework §0](../platform/GOVERNANCE_FRAMEWORK.md#0-restaurant--governance--product-constitution-closed)) — not Discovery / Architecture / Knowledge Extraction.

---

## 8. Adoption record

| State | Meaning |
|-------|---------|
| **ADOPTED** | Binding gates for all Restaurant Product phases |
| **SUPERSEDED** | Only by explicit Founder Decision |

**Founder review checklist (satisfied at ADOPT):**

| # | Question | Answer |
|---|----------|--------|
| 1 | أضافت الوثيقة أي قرار Product جديد؟ | **لا** |
| 2 | أعادت تفسير الـ Domain؟ | **لا** |
| 3 | كل بند يستند إلى Thesis أو Knowledge Index أو Canonical Docs؟ | **نعم** |
| 4 | كل بند Gate أو Evidence أو Deliverable أو Success Condition؟ | **نعم** |
| 5 | بعد ADOPT يستطيع التنفيذ البدء من Assignments دون إعادة فلسفة؟ | **نعم** |

---

## Appendix A — Phase A / B Definition of Done (reference-based)

**Rule:** Product meaning lives only in Thesis. This appendix names **gates** and **pointers**. Do not treat gate labels as a second Product Constitution.

### Phase A (P0 operable)

| ID | Gate (advance when evidence shows…) | Thesis reference |
|----|--------------------------------------|------------------|
| **A1** | Module activation path for `restaurant` via Core `TenantModule` works for a Tenant | [§3.1 Product](../modules/restaurant/MVP_THESIS.md#31-identity--center) |
| **A2** | Setup steps required before the Success Loop are completable | [§4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) (Setup line) · [§3.1 Catalog/Staff](../modules/restaurant/MVP_THESIS.md#31-identity--center) |
| **A3** | Primary Work Unit path through the Success Loop is completable end-to-end | [§4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) · [§3.3](../modules/restaurant/MVP_THESIS.md#33-fulfillment--modes) |
| **A4** | Delivery-as-mode path (if exercised) stays inside Order lifecycle — no dispatch product | [§4 delivery bracket](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) · [§3.3 Delivery](../modules/restaurant/MVP_THESIS.md#33-fulfillment--modes) · [§3.4 Dispatch OUT](../modules/restaurant/MVP_THESIS.md#34-explicit-out-of-p0-success-loop) |
| **A5** | Complete satisfies Thesis money rule on the Order | [§4 Complete line](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) · [§3.5](../modules/restaurant/MVP_THESIS.md#35-money--permissions-p0) |
| **A6** | Day listing works per Thesis (time-based; Shift not a gate) | [§3.2](../modules/restaurant/MVP_THESIS.md#32-normal-owner-day--success-loop-product-p0) · [§4 Not in the loop](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) |
| **A7** | Presentation constraints for the Success Loop screens are met | [§3.7](../modules/restaurant/MVP_THESIS.md#37-presentation-ux--not-domain) |
| **A8** | Phase deliverables introduce none of Thesis Explicit OUT / Never P0 | [§3.4](../modules/restaurant/MVP_THESIS.md#34-explicit-out-of-p0-success-loop) · [§3.6](../modules/restaurant/MVP_THESIS.md#36-never-product-p0) · [§4 failure clause](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) |

**Evidence:** `restaurant-phase-a-evidence.md` (done/not-done per A1–A8 against cited Thesis clauses).  
**Phase A PASS** = A1–A8 evidenced + Founder Check PASS.

### Phase B (day clarity inside Thesis loop)

| ID | Gate (advance when evidence shows…) | Thesis reference |
|----|--------------------------------------|------------------|
| **B1** | Order list clarity supports Normal Owner Day — no new Domain concepts | [§3.2](../modules/restaurant/MVP_THESIS.md#32-normal-owner-day--success-loop-product-p0) |
| **B2** | Time-window listing/filter works without Shift Aggregate | [§3.2](../modules/restaurant/MVP_THESIS.md#32-normal-owner-day--success-loop-product-p0) · [§4 Not in the loop](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) |
| **B3** | Empty/open-Order guidance keeps the owner inside the Success Loop | [§4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) · [§3.2](../modules/restaurant/MVP_THESIS.md#32-normal-owner-day--success-loop-product-p0) |
| **B4** | No scope beyond Thesis Success Loop / Explicit OUT | [§4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0) · [§3.4](../modules/restaurant/MVP_THESIS.md#34-explicit-out-of-p0-success-loop) |

**Evidence:** `restaurant-phase-b-evidence.md`.  
**Phase B PASS** = B1–B4 evidenced + Founder Check PASS.

### Founder Review / S1 / S2 / Lock

| Stage | Gate | Bound by |
|-------|------|----------|
| **Founder Review** | Founder PASS (Corrections only inside Thesis Success Loop UX) | Thesis §4 · this Exit Criteria |
| **S1** | Freeze evidence PASS — “how Restaurant works” under Thesis | Thesis + Canonical Contracts |
| **S2** | Pattern extraction + rename+apply language validation PASS | Salon pattern · Thesis derivation law §2 |
| **Lock** | Founder Decision: Restaurant Module Reference Locked | Decision Log |

Detailed S1/S2 Assignments are **separate Founder commands** after Review PASS; they must not invent Product scope.

---

## Appendix B — Forbidden citations

Do **not** cite as authority for gates or implementation:

- `docs/contracts/modules/restaurant/_legacy_stubs/**`  
- `Full_PROv1.zip` / AbuKhater code  
- Any document that conflicts with Thesis → Index → Canonical Contracts → Discovery (auto-Legacy)

---

## Closing

```
Foundation = FROZEN
Exit Criteria = ADOPTED
Phase A Assignment = ADOPTED (Execution Authority Granted)
Kickoff = OPEN → Phase A Execution (A1–A8 · D1–D6)
```
