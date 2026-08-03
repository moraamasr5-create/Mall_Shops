# Restaurant Phase A — Founder Assignment

**Date:** 2026-07-20  
**Status:** **ADOPTED**  
**Kind:** Founder Assignment — authorizes Phase A Execution after Kickoff; **not** implementation itself · **not** Product redesign  

| Field | Value |
|-------|--------|
| **Adopted By** | Founder |
| **Date** | 2026-07-20 |
| **Execution Authority** | **Granted** |

**Bound by:**  
- [MVP_THESIS.md](../modules/restaurant/MVP_THESIS.md) (**ADOPTED**)  
- [restaurant-exit-criteria.md](./restaurant-exit-criteria.md) (**ADOPTED**) — Appendix A Phase A gates A1–A8  
- [RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md)  
- [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) Canonical Rule  

**Authority:** Phase A **execution** is open (Kickoff → implement → evidence → Founder Acceptance). Still forbidden: Architecture/Core redesign, Canonical Contract rewrite, Features outside A1–A8, Legacy stubs as SoT, Shared builds without Trigger+OP.

---

## 1. Mission

Make Thesis **Success Loop** ([Thesis §4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0)) **operable** for a Tenant with Core + Restaurant Module only — enough to satisfy Exit Criteria Phase A gates **A1–A8**.

Product meaning = Thesis. Gate IDs = Exit Criteria Appendix A. This file **assigns and authorizes** work; it does not redefine Product.

---

## 2. Scope (IN)

| Work package | Maps to gate | Bound to |
|--------------|--------------|----------|
| **WP-A1** Module activation | A1 | Thesis §3.1 Product |
| **WP-A2** Setup: Menu + RestaurantEmployee assignment | A2 | Thesis §4 Setup · §3.1 |
| **WP-A3** Order Success Loop end-to-end | A3 | Thesis §4 · §3.3 |
| **WP-A4** Delivery-as-mode path (no dispatch product) | A4 | Thesis §4 delivery bracket · §3.3 · §3.4 Dispatch OUT |
| **WP-A5** PaymentAcceptance on Complete | A5 | Thesis §4 · §3.5 |
| **WP-A6** Time-based Order listing (no Shift gate) | A6 | Thesis §3.2 · §4 Not in the loop |
| **WP-A7** Portal: day center = Orders; mobile-usable §4 screens; single Module surface | A7 | Thesis §3.7 |
| **WP-A8** Negative scope check (Explicit OUT / Never P0) | A8 | Thesis §3.4 · §3.6 · §4 failure clause |

Translate Canonical Contracts (ORDER, MENU, FULFILLMENT, GUEST, PAYMENT, RESTAURANT_EMPLOYEE, …) — never `_legacy_stubs/`.

**Permissions:** `restaurant:*` per Thesis §3.5.  
**RLS / Identity:** existing two-layer rules (`withIdentityRls` / `getDb()`); no new auth architecture.

---

## 3. Scope (OUT) — reject and defer

| Out | Why / defer to |
|-----|----------------|
| **Shift** Aggregate / Open–Close | Opens period Domain; Shared candidate — not P0 |
| **Reservation** | Independent lifecycle — Thesis OUT of P0 loop |
| **Shared** services (print, notify, offline, realtime, …) | Platform Trigger + OP — not Restaurant Feature |
| **Pilot** / dispatch / capacity product | Thesis Explicit OUT |
| Settlement / refunds / Payment Aggregate / GL | Later |
| Inventory / CRM / Loyalty / KitchenTicket Aggregate | Never P0 |
| **Phase B** (B1–B4) | Separate Phase B Assignment |
| S1/S2 / Reference Lock | After Founder Review |
| AbuKhater re-extract · Architecture · Product Philosophy | Forbidden |

**Rule:** If a PR or task cannot cite A1–A8 + Thesis §, it is **rejected** from Phase A.

---

## 4. Deliverables = Evidence (not files alone)

Phase A is Evidence/Gates-driven. Artifacts may include code, but **acceptance is evidence**, not “code exists.”

| ID | Evidence kind | Proves | Typical artifact(s) |
|----|---------------|--------|---------------------|
| **D1** | **Domain Contract Evidence** | Implementation translates Canonical Contracts for A1–A8; no Domain invention; no Legacy stubs | Mapping note A1–A8 → Contract clauses · gap list (empty or escalated) |
| **D2** | **API Boundary Evidence** | Module APIs/commands stay inside Thesis Success Loop; no Shared/Core leakage | Endpoint/command list tagged A1–A8 · out-of-scope rejected |
| **D3** | **Persistence Evidence** | Schema/migrations (if any) justified by Contracts + Thesis loop only; RLS-capable | Migration refs · table/aggregate map to ORDER/MENU/… · no OUT tables |
| **D4** | **Permission / RLS Evidence** | `restaurant:*` + Layer-1 RLS + Layer-2 RBAC on user paths; `withIdentityRls` / `getDb()` | Permission matrix · RLS check notes · no PIN/open-RLS patterns |
| **D5** | **Runtime Evidence** | Tenant can run Thesis §4 (gates A1–A7) at runtime | Demo script / smoke / screenshots · A1–A7 PASS rows |
| **D6** | **Founder Acceptance** | Founder Check PASS on D1–D5 + A8 negative checklist | `restaurant-phase-a-evidence.md` Founder section |

**Process artifacts (supporting, not substitutes for D1–D6):**

| File | Role |
|------|------|
| [restaurant-phase-a-kickoff.md](./restaurant-phase-a-kickoff.md) | Opens execution window |
| `restaurant-phase-a-baseline.md` | Optional pre-change snapshot |
| `restaurant-phase-a-evidence.md` | Rolls up A1–A8 + D1–D6 for Founder Acceptance |

---

## 5. Definition of Done

Phase A is **done** when **all** are true:

1. Exit Criteria **A1–A8** PASS by reference to Thesis (in evidence rollup).  
2. **D1–D5** evidence present and fail-closed (missing = FAIL).  
3. **D6 Founder Acceptance** = **PASS**.  
4. No deliverable depends on Thesis Explicit OUT / Never P0 / Legacy stubs.

Phase A is **not** done if Success Loop completion requires Shift, Reservation, Shared products, Pilot dispatch, or any item in Thesis §4 “P0 has failed as a definition.”

---

## 6. Evidence rollup rules

| Rule | Requirement |
|------|-------------|
| Traceability | Every A-gate and D-evidence cites Thesis § / Contract — not archive |
| Fail closed | Missing D1–D6 section = FAIL |
| A8 negative | Explicit “not built” for OUT list |
| No philosophy | Evidence = done/not-done |

---

## 7. Execution sequence (now authorized)

```
Assignment ADOPTED + Execution Authority Granted
  → Kickoff (opens Phase A Execution)
  → Baseline optional
  → Implement WP-A1…WP-A7 producing D1–D5
  → Evidence rollup A1–A8 + D1–D5
  → D6 Founder Acceptance
  → if PASS: stop Phase A (await Phase B Assignment)
  → if FAIL: corrections inside A1–A8 only
```

---

## 8. Constraints (hard) during Phase A Execution

| Forbidden | Allowed |
|-----------|---------|
| Modify Architecture Lock / Core redesign | Translate Thesis §4 into Module code |
| Re-design Canonical Contracts | Cite Contracts; escalate true gaps to Founder |
| Features outside A1–A8 | WP-A1…WP-A8 only |
| Shared Capability builds | — |
| Legacy stubs as SoT | Canonical Contracts only |

---

## 9. Adoption record

| State | Meaning |
|-------|---------|
| **ADOPTED** | Binding; Execution Authority Granted |
| **SUPERSEDED** | Only by Founder Decision |

**ADOPT checklist (satisfied):**

| # | Question | Answer |
|---|----------|--------|
| 1 | Scope beyond Thesis / Exit Criteria A1–A8? | **لا** |
| 2 | Every WP maps to gate + Thesis §? | **نعم** |
| 3 | OUT defers Shift/Reservation/Shared/Pilot/Phase B? | **نعم** |
| 4 | Deliverables = Evidence D1–D6 fail-closed? | **نعم** |

---

## 10. Closing

```
Architecture / Knowledge / Thesis / Exit Criteria = FROZEN
Phase A Assignment = ADOPTED (Execution Authority Granted)
Next = Kickoff → Phase A Execution (A1–A8 only)
```
