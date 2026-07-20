# Restaurant Phase A — Founder Assignment

**Date:** 2026-07-20  
**Status:** **PROPOSED** — awaiting Founder ADOPT (execution forbidden until ADOPT)  
**Kind:** Founder Assignment only — **not** implementation · **not** Kickoff evidence · **not** Product redesign  
**Bound by:**  
- [MVP_THESIS.md](../modules/restaurant/MVP_THESIS.md) (**ADOPTED**)  
- [restaurant-exit-criteria.md](./restaurant-exit-criteria.md) (**ADOPTED**) — Appendix A Phase A gates A1–A8  
- [RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md)  
- [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) Canonical Rule  

**Authority:** This Assignment authorizes Phase A **work** only after status = **ADOPTED**. Until then: no schema, APIs, Portal, or Shared builds for Restaurant Success Loop.

---

## 1. Mission

Make Thesis **Success Loop** ([Thesis §4](../modules/restaurant/MVP_THESIS.md#4-compact-success-loop-normative-for-p0)) **operable** for a Tenant with Core + Restaurant Module only — enough to satisfy Exit Criteria Phase A gates **A1–A8**.

Product meaning = Thesis. Gate IDs = Exit Criteria Appendix A. This file only **assigns work**.

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

Implementation may use Canonical Contracts as **business language to translate** (ORDER, MENU, FULFILLMENT, GUEST, PAYMENT, RESTAURANT_EMPLOYEE, …) — not `_legacy_stubs/`.

**Permissions:** `restaurant:*` vocabulary per Thesis §3.5.

**RLS / Identity:** existing platform two-layer rules (`withIdentityRls` / `getDb()`); no new auth architecture.

---

## 3. Scope (OUT) — reject and defer

Anything not required for A1–A8 / Thesis §4 is **out**, including (non-exhaustive; Thesis §3.4–§3.6 win):

| Out | Defer to |
|-----|----------|
| Shift Aggregate / Open–Close Shift | Later / Shared candidate |
| Reservation | Later (Thesis OUT of P0 loop) |
| Reporting / analytics | Later |
| Settlement / refunds / Payment Aggregate / GL | Later |
| Printing / Artifact Shared · Offline · Notifications · Realtime Shared | Trigger + OP |
| Pilot / dispatch / capacity product | Later |
| Inventory / CRM / Loyalty / KitchenTicket Aggregate | Never P0 |
| Phase B clarity (B1–B4) | Phase B Assignment |
| S1/S2 freeze / Reference Lock | After Founder Review |
| Re-opening AbuKhater / Architecture / Product Philosophy | Forbidden |

**Rule:** If a PR or task cannot cite A1–A8 + Thesis §, it is **rejected** from Phase A.

---

## 4. Deliverables

| # | Deliverable | Notes |
|---|-------------|--------|
| D1 | Runnable Tenant path covering WP-A1…WP-A7 | Code + migrations as needed for Thesis loop only |
| D2 | Portal surfaces required for Thesis §4 + §3.7 | Day center = Orders; no dual-app-as-architecture |
| D3 | `restaurant-phase-a-kickoff.md` | Start note after Assignment ADOPT |
| D4 | `restaurant-phase-a-baseline.md` (optional but recommended) | Pre-change snapshot |
| D5 | `restaurant-phase-a-evidence.md` | Mandatory — A1–A8 done/not-done |
| D6 | Founder Check request | PASS / FAIL on evidence |

No separate “design thesis” or new contracts pack in Phase A unless a Canonical Contract gap **blocks** A1–A8 — then stop and escalate to Founder (do not invent Product).

---

## 5. Definition of Done

Phase A is **done** when **all** are true:

1. Exit Criteria **A1–A8** are evidenced as PASS in `restaurant-phase-a-evidence.md` by **reference to Thesis clauses** (not by restating Product).  
2. No deliverable depends on Thesis Explicit OUT / Never P0 / Legacy stubs.  
3. Founder Check = **PASS**.  

Phase A is **not** done if Success Loop completion requires Shift, Reservation, Shared products, Pilot dispatch, or any item in Thesis §4 “P0 has failed as a definition.”

---

## 6. Evidence required

| Artifact | Required content |
|----------|------------------|
| `restaurant-phase-a-evidence.md` | Table A1–A8: Status (PASS/FAIL) · pointer to demo/test/commit · Thesis § cited |
| Negative checklist (A8) | Explicit confirmation that OUT items were not built |
| Founder Check | Recorded PASS/FAIL + date |

Fail closed: missing row = FAIL.

---

## 7. Execution sequence (after this Assignment is ADOPTED)

```
Assignment ADOPT
  → Kickoff (D3)
  → Baseline optional (D4)
  → Implement WP-A1…WP-A7 (D1–D2)
  → Evidence A1–A8 (D5) including A8 negative check
  → Founder Check (D6)
  → if PASS: stop Phase A (await Phase B Assignment)
  → if FAIL: corrections inside A1–A8 only — no scope expansion
```

---

## 8. Constraints (hard)

| Constraint | Source |
|------------|--------|
| No new Feature / Product decision | Thesis ADOPTED · Exit Criteria |
| No Architecture redesign | Salon Locked · Architecture Lock |
| No Canonical Contract rewrite as “improvement” | Contracts = language to translate |
| No Legacy stubs as SoT | Canonical Rule · Exit Criteria Appendix B |
| No Shared Capability builds | Thesis §3.6 · Trigger + OP |
| UI may be modern/mobile-usable for §4 only | Thesis §3.7 — not a Domain expansion license |

---

## 9. Adoption

| State | Meaning |
|-------|---------|
| **PROPOSED** | Written; execution **forbidden** |
| **ADOPTED** | Phase A execution **authorized** |
| **SUPERSEDED** | Only by Founder Decision |

**Founder ADOPT checklist:**

| # | Question | Required |
|---|----------|----------|
| 1 | Assignment adds Product scope beyond Thesis / Exit Criteria A1–A8? | **لا** |
| 2 | Every WP maps to an Exit Criteria gate + Thesis §? | **نعم** |
| 3 | OUT list defers correctly (no silent exceptions)? | **نعم** |
| 4 | Evidence + DoD fail-closed? | **نعم** |

---

## 10. Closing

```
Exit Criteria = ADOPTED
Phase A Assignment = PROPOSED → (Founder) ADOPT
Then and only then = Product Execution for A1–A8
```

**Next after this file ADOPT:** Phase A Kickoff → implement → Evidence → Founder Check.  
**Not next:** Phase B · S1 · AbuKhater · Shared · Reservation · Shift.
