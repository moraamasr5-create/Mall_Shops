# Restaurant Phase A — Evidence Rollup

**Status:** **READY FOR FOUNDER ACCEPTANCE** (A1–A8 **PASS** · D1–D5 covered · **D6 awaiting Founder**)  
**Assignment:** [restaurant-phase-a-assignment.md](./restaurant-phase-a-assignment.md) (**ADOPTED**)  
**Kickoff:** [restaurant-phase-a-kickoff.md](./restaurant-phase-a-kickoff.md) (**OPEN**)  
**Rule:** Phase A closes on **D1–D6 + Founder Acceptance**, not merge alone.  
**Fail-closed:** Missing required D-section for a claimed PASS gate = treat as incomplete evidence.

---

## Evidence coverage (A1–A8) — fail-closed

| Gate | Required depth | Present? | Notes |
|------|----------------|----------|-------|
| **A1** | **D5** runtime | **YES** | Activation is Core `TenantModule` — no Restaurant Domain invention |
| **A2** | **D1–D5** | **YES** | Menu + RestaurantEmployee ownership |
| **A3** | **D1–D5** | **YES** | Order Success Loop (`dine_in`) |
| **A4** | **D5 + scope proof** | **YES** | Same loop + `delivery` mode; hard OUT list |
| **A5** | **D5 + money invariant** | **YES** | Requires acceptance (reject without); not Payment Domain |
| **A6** | **D5 + time-boundary query** | **YES** | `openedFrom`/`openedTo` on Order — no Shift / BusinessDay |
| **A7** | **D5 presentation boundary** | **YES** | `/restaurant/orders` in same Portal shell |
| **A8** | **Negative OUT / discipline** | **YES** | `smoke:restaurant-a8` absence proofs |

**D6 Founder Acceptance:** **AWAITING FOUNDER** (package ready — agents do not self-PASS).

---

## Gates A1–A8

| Gate | Status | Thesis | Evidence |
|------|--------|--------|----------|
| **A1** Module activation | **PASS** | §3.1 | `smoke:restaurant-a1` · § A1 below |
| **A2** Menu + RestaurantEmployee | **PASS** | §4 Setup · §3.1 | `smoke:restaurant-a2` · § A2 below |
| **A3** Order Success Loop | **PASS** | §4 · §3.3 | `smoke:restaurant-a3` · § A3 below |
| **A4** Delivery-as-mode | **PASS** | §4 bracket · §3.3 · §3.4 Dispatch OUT | `smoke:restaurant-a4` · § A4 below |
| **A5** Money rule on Complete | **PASS** | §4 Complete · §3.5 | `smoke:restaurant-a5` · § A5 below |
| **A6** Time-based Order listing | **PASS** | §3.2 · §4 Not in the loop | `smoke:restaurant-a6` · § A6 below |
| **A7** Portal / presentation | **PASS** | §3.7 | `smoke:restaurant-a7` · § A7 below |
| **A8** Negative OUT check | **PASS** | §3.4 · §3.6 · §4 failure | `smoke:restaurant-a8` · § A8 below |

---

## A1 — Module activation (D5)

**Claim:** A Tenant can activate `restaurant` via Core `TenantModule`; Module APIs reject before enable and accept after.

**Script:** `npm run smoke:restaurant-a1` · **PASS** 2026-07-20

| Step | Result |
|------|--------|
| GET `/api/v1/restaurant/categories` before enable | **403** `MODULE_NOT_ENABLED` |
| POST `/api/v1/tenants/:id/modules` `{ moduleKey: "restaurant" }` | **201** enabled |
| GET modules lists restaurant enabled | **PASS** |
| GET categories after enable | **200** |

**D1–D4 (A1):** N/A as Restaurant Domain — uses existing Core activation + Module gate. No new Aggregate for A1.

---

## A2 — Capability ownership (D1–D5)

**Claim:** Restaurant Module owns real Setup capability (Menu + RestaurantEmployee) required before the Success Loop — not Core, not Shared.

**Script:** `npm run smoke:restaurant-a2` · **PASS** 2026-07-20

### D1 Domain

| Claim | Status | Bound to |
|-------|--------|----------|
| Category + MenuItem Module-owned | **PASS** | MENU Contract · Thesis §3.1 / §4 Setup |
| RestaurantEmployee = assignment on Core Membership | **PASS** | RESTAURANT_EMPLOYEE · not Staff Aggregate |
| No Staff / Shift / Inventory Aggregate | **PASS** | Explicit OUT |

### D2 API Boundary

| Route | Gate |
|-------|------|
| `POST/GET /api/v1/restaurant/categories` | module + `restaurant:category:*` |
| `POST/GET /api/v1/restaurant/menu-items` | module + `restaurant:menu:*` |
| `POST/GET /api/v1/restaurant/employees` | module + `restaurant:staff:*` |

### D3 Persistence

| Artifact | Status |
|----------|--------|
| Migration `20260720190000_phase_a_restaurant_menu_employee` | **Applied** |
| Tables: `restaurant_category`, `restaurant_menu_item`, `restaurant_employee_assignment` | **PASS** |
| RLS tenant isolation on those tables | **PASS** |

### D4 Permission / RLS

| Check | Status |
|-------|--------|
| Grants in `src/modules/restaurant/permissions.ts` | category / menu / staff |
| User paths via `withIdentityRls` / `getDb()` | **PASS** |
| Tenant B cannot list Tenant A menu items | **PASS** (smoke) |

### D5 Runtime

Enable → Category → MenuItem → assign RestaurantEmployee → read back + isolation **PASS**.

---

## A3 — Order Success Loop (D1–D5)

**Claim:** Primary Work Unit (Order) completes Thesis §4 path end-to-end for `dine_in`.

**Script:** `npm run smoke:restaurant-a3` · **PASS** 2026-07-20

### D1 Domain

| Claim | Status | Bound to |
|-------|--------|----------|
| Order = Primary Work Unit (Module-owned) | **PASS** | ORDER Contract · Thesis §4 |
| OrderLines + name/price snapshot at create | **PASS** | MENU does not rewrite history |
| `fulfillmentMode` on Order (Entity) | **PASS** | FULFILLMENT · §3.3 |
| PaymentAcceptance snapshot fields on Order | **PASS** | PAYMENT VO · §3.5 — not Payment Aggregate |
| Lifecycle: created → confirmed → preparing → ready → completed / cancelled | **PASS** | Thesis §4 |

### D2 API Boundary

| Route | Actions |
|-------|---------|
| `POST/GET /api/v1/restaurant/orders` | create / list · `restaurant:order:*` |
| `POST /api/v1/restaurant/orders/:id` | confirm · start_preparing · mark_ready · complete · cancel |

### D3 Persistence

| Artifact | Status |
|----------|--------|
| Migration `20260720200000_phase_a_restaurant_order` | **Applied** |
| Tables: `restaurant_order`, `restaurant_order_line` | **PASS** |
| RLS on both tables | **PASS** |

### D4 Permission / RLS

| Check | Status |
|-------|--------|
| `restaurant:order:read` / `restaurant:order:write` | In `permissions.ts` |
| Tenant-scoped via RLS + `tenantId` filters | **PASS** |

### D5 Runtime

| Step | Result |
|------|--------|
| CreateOrder `dine_in` + ≥1 OrderLine | **PASS** |
| Confirm → Preparing → Ready → Complete | **PASS** |
| PaymentAcceptance on Complete (`paymentAccepted`, method) | **PASS** |
| List includes completed | **PASS** |

**Explicitly not in A3:** Delivery System · Shift · Reservation · KitchenTicket · Payment Aggregate · Notifications · Pilot.

---

## A4 — Delivery-as-mode (D5 + scope proof)

**Claim:** The **same** Order Aggregate / lifecycle / permissions / isolation support `fulfillmentMode=delivery` — Delivery is a **mode**, not a new Domain or Delivery System.

**Script:** `npm run smoke:restaurant-a4` · **PASS** 2026-07-20

### Proven shape

```
Order
 ├── fulfillmentMode = dine_in  → Success Loop
 └── fulfillmentMode = delivery → same Success Loop
```

| Proof | Result |
|-------|--------|
| Create → Confirm → Preparing → Ready → Complete with `delivery` | **PASS** · `cmrtizq91000m93qgrgoublhj` |
| `fulfillmentMode=delivery` preserved through Complete | **PASS** |
| dine_in loop still completes (no regression) | **PASS** · `cmrtizusn000o93qgc44gati4` |
| Same Aggregate boundary (no new tables/routes) | **PASS** |
| Same lifecycle states | **PASS** |
| Same permission model (`restaurant:order:*`) | **PASS** |
| Tenant B cannot see Tenant A orders | **PASS** |

### Scope proof — hard OUT of A4

| OUT | Status |
|-----|--------|
| Delivery entity | **Not built** |
| Driver assignment | **Not built** |
| Dispatch queue | **Not built** |
| Delivery fees | **Not built** |
| GPS tracking | **Not built** |
| Notifications | **Not built** |
| Required `OutForDelivery` / `Delivered` product states | **Not built** (optional Thesis bracket; not required to prove mode) |

### D1 / D2 / D3 / D4 (A4)

No Domain invention — reuses A3 Order model. Mode is a field on Order. **PASS by reuse + OUT list.**

---

## A5 — Money rule on Complete (D5 + invariant)

**Claim:** Completed Order **requires** PaymentAcceptance snapshot on Order — not merely stores it when present.

**Gap-check (before change):** A3/A4 completed with `paymentMethod` only while the service **auto-injected** `paymentAccepted: true`. That proved *store*, not *require*. **A5 was not closed by A3/A4.**

**Minimal close:** Complete accepts only when caller supplies `paymentAccepted: true`; otherwise **422** and Order stays `ready`.

**Script:** `npm run smoke:restaurant-a5` · **PASS** 2026-07-20 · order `cmrtj9qdi001793qgrzka21ic`

| Proof | Result |
|-------|--------|
| Ready → Complete **without** PaymentAcceptance | **422** `VALIDATION_ERROR` · status remains `ready` · `paymentAccepted=false` |
| Ready → Complete **with** `paymentAccepted: true` + method | **200** · `completed` |
| Snapshot preserved (`paymentAccepted`, `paymentMethod`, `paymentAcceptedAt`) | **PASS** |

### Scope proof — hard OUT of A5

| OUT | Status |
|-----|--------|
| Payment Aggregate | **Not built** |
| Invoice | **Not built** |
| Transaction ledger | **Not built** |
| Refunds | **Not built** |
| Settlement | **Not built** |
| Accounting / GL | **Not built** |

### D1 / D2 / D3 / D4 (A5)

| Layer | Status |
|-------|--------|
| D1 | PaymentAcceptance = VO fields on Order (PAYMENT Contract thin) — **PASS** |
| D2 | Same `POST .../orders/:id` `action=complete` + required `paymentAccepted` — **PASS** |
| D3 | No new tables — **PASS** |
| D4 | Same `restaurant:order:write` — **PASS** |

---

## Sequence (capability questions)

```
A1 ✅ Can the platform activate a module?
A2 ✅ Can the module own real business capability?
A3 ✅ Can the module complete a real business outcome?
A4 ✅ Can the same model support another fulfillment mode?
A5 ✅ Does completion enforce the money rule?
A6 ✅ Can the owner day be queried by time boundary (no Shift)?
A7 ✅ Does the Module have a presentation surface (Orders day center)?
A8 ✅ Did Phase A stay inside approved scope (nothing excluded was built)?
```

---

## A8 — Negative OUT Check (discipline)

**Claim:** Restaurant Phase A completed **without** introducing Thesis Explicit OUT / Never P0 domains, Shared builds without Trigger+OP, dual-app identity, or routes/migrations outside A1–A7.

**Not a Feature.** Evidence = **absence** proofs.

**Script:** `npm run smoke:restaurant-a8` · **PASS** 2026-07-20

### Absent Domains (not in Prisma)

| OUT | Status |
|-----|--------|
| Shift / RestaurantShift | **Absent** |
| Reservation | **Absent** |
| Dispatch / Driver / Pilot / Trip | **Absent** |
| KitchenTicket | **Absent** |
| Payment Aggregate / Invoice / Settlement | **Absent** |
| BusinessDay / DailyReport / Analytics | **Absent** |

**Note:** `restaurantRole` vocabulary may include string `"pilot"` on Employee assignment (Contract language) — **Pilot/dispatch product** remains OUT.

### Allowed Restaurant persistence only

`RestaurantCategory` · `RestaurantMenuItem` · `RestaurantEmployeeAssignment` · `RestaurantOrder` · `RestaurantOrderLine`

### Boundary map (no leakage)

```
Core
 └── Tenant / Membership / TenantModule / Auth / RBAC

Restaurant Module
 └── Menu (Category + Item)
 └── Employee Assignment (on Membership)
 └── Order + OrderLine
 └── Fulfillment Mode (field on Order)
 └── PaymentAcceptance (VO fields on Order)

Portal
 └── same shell → /restaurant/orders only
```

### No scope creep

| Check | Result |
|-------|--------|
| Restaurant API routes ⊆ categories · menu-items · employees · orders | **PASS** |
| Portal restaurant pages = `orders/page.tsx` only | **PASS** |
| `src/shared` = errors + slug only (no notify/print/offline Shared) | **PASS** |
| No separate Restaurant app package / deployment surface | **PASS** |

### Thesis failure clause

Completing §4 does **not** require Inventory, Loyalty, Accounting, Guest Root, Staff Aggregate, Shift, KitchenTicket, Payment Aggregate, or Shared Capability. **PASS.**

---

## D6 — Founder Acceptance package

| Item | State |
|------|-------|
| A1–A8 | **PASS** (evidenced) |
| D1–D5 | **Covered** across A1–A8 |
| A8 negative checklist | **PASS** (persistence footprint + absence of OUT Domains) |
| **D6 Founder Check** | **AWAITING FOUNDER** |

**D6 is not a technical test.** It answers:

1. Does the Founder agree the claims are proven?  
2. Does executed scope match the Assignment / Thesis intent?  
3. Is transition to a next stage authorized?

**Agents do not self-ADOPT D6** and do **not** open Phase B / Pilot / other tracks before D6 PASS.

### Normative sequence

```
A1–A8 PASS
  → Evidence Rollup Complete
  → Founder Review
  → D6 Acceptance (Founder only)
  → Phase A CLOSED
  → (only then) next Assignment may open
```

### Suggested Founder Check questions

1. Does evidence show Thesis §4 operable with Core + Restaurant only?  
2. Is Delivery a mode (A4), not a Delivery System?  
3. Is money a Complete invariant (A5), not Payment Domain?  
4. Is the day a time query (A6), not Shift?  
5. Is presentation a Module surface in Portal (A7), not a second app?  
6. Does A8 prove the Module footprint stayed Category · MenuItem · EmployeeAssignment · Order · OrderLine — with OUT Domains absent?

When Founder records **PASS** on this rollup, Phase A is **CLOSED** per Assignment Definition of Done.

---

## A7 — Presentation boundary (D5)

**Claim:** Single Module portal surface; day center = Orders; sufficient to operate Thesis §4 — not a second app / Dashboard.

**Script:** `npm run smoke:restaurant-a7` · **PASS** 2026-07-20  
**Surface:** `src/app/(portal)/restaurant/orders/page.tsx` · nav in `AppShell` · same `PortalProvider` / `RouteGuard`

| Proof | Result |
|-------|--------|
| `GET /restaurant/orders` served in Mall portal shell | **PASS** (200 · marker) |
| Day center = Orders (time-window list + Create / advance / Complete w/ PaymentAcceptance) | **PASS** (page wiring) |
| Same portal shell as Salon (not dual-app) | **PASS** |
| §4 APIs still complete under same Tenant (surface uses those APIs) | **PASS** · order `cmrtjq82g001x93qgocmt44so` |
| Mobile-usable constraint | **PASS** — `viewport` device-width · existing portal fluid layout (`min(920px,100%)`, wrap nav) |

### Scope proof — hard OUT of A7

| OUT | Status |
|-----|--------|
| Dashboard / Reports / Analytics | **Not built** |
| Admin Suite | **Not built** |
| Dual App / PWA / native | **Not built** |
| Shift / Reservation / Dispatch UI | **Not built** |
| Kitchen POS design system | **Not built** |

### D1–D4 (A7)

Presentation only — no Domain / schema / permission invention. **PASS by constraint.**

## A6 — Time-based Order listing (D5 + query proof)

**Claim:** Order retrieval for Normal Owner Day respects a business time boundary on `openedAt` — without Shift Aggregate / Open–Close / BusinessDay entity.

**Script:** `npm run smoke:restaurant-a6` · **PASS** 2026-07-20  
**Orders:** A `cmrtjitz2001j93qgal1aqivx` (in W) · B `cmrtjiuxa001l93qglen59b8n` (out W)

### API

`GET /api/v1/restaurant/orders?openedFrom=&openedTo=`  
Same surface: module enabled · `restaurant:order:read` · RLS · tenant scope.  
Filter = query on `restaurant_order.opened_at` (Salon Visits rename+apply). **No new table.**

| Proof | Result |
|-------|--------|
| Order A `openedAt` inside W → listed | **PASS** |
| Order B `openedAt` outside W → excluded | **PASS** |
| Unfiltered list still returns A and B | **PASS** (filter ≠ delete) |
| No Open Shift / Close Shift / Shift table | **PASS** |

### Scope proof — hard OUT of A6

| OUT | Status |
|-----|--------|
| Shift Aggregate / Open–Close | **Not built** |
| BusinessDay Aggregate | **Not built** |
| daily_reports / sales summary | **Not built** |
| owner dashboard / analytics | **Not built** |
| end-of-day closing | **Not built** |

### D1–D4 (A6)

| Layer | Status |
|-------|--------|
| D1 | No new Domain — query on Order.`openedAt` · **PASS** |
| D2 | Query params on existing list route · **PASS** |
| D3 | No migration · **PASS** |
| D4 | Same `restaurant:order:read` · **PASS** |
