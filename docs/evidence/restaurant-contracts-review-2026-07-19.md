# Restaurant Business Contracts — Final Review

**Date:** 2026-07-19  
**Scope:** Ten Phase 3 Contracts under `docs/contracts/modules/restaurant/`  
**Checklist authority:** Founder review list (language · Commands · Events · Invariants · Relationships · Future Evolution · Prisma Test · 3-question test)  
**Result:** **PASS**  
**Phase 3 status:** **LOCKED** (Business Authority)  
**Does not authorize:** Prisma / SQL / API / UI implementation (still needs OP when execution opens)

---

## Canonical set reviewed

| # | Contract | Result |
|---|----------|--------|
| 1 | ORDER | PASS |
| 2 | MENU | PASS |
| 3 | FULFILLMENT | PASS |
| 4 | SHIFT | PASS |
| 5 | RESERVATION | PASS |
| 6 | PAYMENT | PASS |
| 7 | GUEST | PASS |
| 8 | RESTAURANT_EMPLOYEE | PASS |
| 9 | SETTINGS | PASS |
| 10 | REPORTING | PASS (Later boundary explicit) |

Obsolete provisional files (Customer, Driver, Kitchen, Table, Status, Events, Employee) were removed again so they cannot compete as authority.

---

## 1. Language

| Check | Result |
|-------|--------|
| Answers “what does this do in the business?” | PASS |
| No FK / UUID / JSONB / Index / Column as Contract content | PASS |
| Mentions of Prisma/HTTP only as **bans** or meta authority notes | Acceptable (INDEX / ORDER preamble) |

Minor wording cleanups applied during review (`DispatchOrder`, avoid “persisted/API/table” as domain language).

---

## 2. Commands

| Check | Result |
|-------|--------|
| Intent-based business actions | PASS |
| No Insert/Update Status/Save | PASS |
| ORDER spine: CreateOrder → ConfirmOrder → StartPreparation → MarkReady → DispatchOrder → CompleteOrder / CancelOrder / FailOrder | PASS |

---

## 3. Domain Events

| Check | Result |
|-------|--------|
| Past-tense business facts | PASS |
| No SendWebhook / NotifyKitchen / CallAPI | PASS |
| Explicitly not transport | PASS (ORDER §8 note) |

---

## 4. Invariants

| Contract | Invariants strong enough to derive constraints? |
|----------|--------------------------------------------------|
| ORDER | Yes (≥1 line, Tenant, mode freeze after Confirm, no Completed→Preparing, …) |
| MENU | Yes (unavailable not newly ordered; no rewrite of history) |
| FULFILLMENT | Yes (one per Order; dispatch only delivery+assignee) |
| SHIFT | Yes (one Open; close blocked by active Orders) |
| RESERVATION | Yes (may create Order; Order never owns; both independence cases) |
| PAYMENT | Yes (thin; no refund; does not replace Work Unit) |
| GUEST | Yes (not Root; via parents only) |
| RESTAURANT_EMPLOYEE | Yes (Membership required; no Staff Aggregate) |
| SETTINGS | Yes (no Work Units; ≥1 mode; policy wins) |
| REPORTING | Yes (not SoR; not required for v1 loop) |

---

## 5. Relationships / §13 References

| Check | Result |
|-------|--------|
| Business Depends On / Uses / Referenced By | PASS on all ten |
| No One-To-Many / Cascade / FK as authority | PASS |

---

## 6. Future Evolution

| Check | Result |
|-------|--------|
| Trigger-gated (“ONLY IF …”) not wishlist | PASS |
| KitchenTicket / Payment Aggregate / Shared Shift examples are conditional | PASS |
| No AI / Blockchain / Inventory drive-by | PASS |

---

## 7. Prisma Test (pre-Phase 4)

| Question | Answer |
|----------|--------|
| Must we invent a new business rule to start Prisma? | **No** — translate only |
| Must we invent Aggregates (Kitchen/Driver/Table) to model v1? | **No** — explicitly out |

---

## 8. Three-question test (per Contract)

For each of the ten:

1. Can it be implemented without knowing the database engine? → **Yes**  
2. Can it be explained to a restaurant manager without tech jargon? → **Yes**  
3. Can a schema be derived without adding business rules? → **Yes**

---

## Fixes applied in this review

1. Renamed Command **Dispatch** → **DispatchOrder** (ORDER + FULFILLMENT alignment).  
2. Added permission `restaurant.order.fail` for FailOrder.  
3. Softened residual tech-adjacent phrasing (Guest “API”, Shift “table”, cart “persisted”).  
4. Re-deleted obsolete competing contract files.

---

## Lock declaration

**Phase 3 Business Contracts = LOCKED** as Restaurant Business Authority.

Next allowed step after Founder acknowledgment: Phase 4 Prisma as **mechanical translation** of these Contracts — not a redesign forum.

If any business decision appears during Prisma, stop and amend Contracts first (re-open Phase 3 with an explicit delta).
