# Restaurant Operational Workflow

**Date:** 2026-07-19  
**Source:** Founder-provided archive `Full_PROv1.zip` (AbuKhater — `A-Menu_users` + `B-Dashborad_res`)  
**Purpose:** Real business workflow of a restaurant workday — **not** code, UI, schema, or architecture to copy.  
**Authority:** Founder assignment — Restaurant Reference Extraction (analysis only).  
**Companion docs:** [Aggregate Map](./restaurant-reference-aggregate-map.md) · [Capability Classification](./restaurant-reference-capability-classification.md) · [Pattern Library](./restaurant-reference-pattern-library.md) · [Anti-Patterns](./restaurant-reference-anti-patterns.md) · [Gap Analysis](./restaurant-reference-gap-analysis.md)  
**Placement gate:** [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md) (**ADOPTED**).

**Scope of evidence:** AbuKhater is a **delivery / pickup–centric** restaurant MVP (customer web order + staff inbox + pilots). It is **not** a full-service dine-in / table-service reference. Do not invent dine-in workflows from this source.

**Core thesis (aligned with Constitution / Salon reference):**

> The day is about **work performed**.  
> For Restaurant, the primary Operational Work Unit is **Order**.  
> Shift, kitchen hand-off, delivery trip, reservation, and settlement attach **around** Order — they are not peer day-one roots.

---

## 1. Roles (workday actors)

| Role | What they do in the workday | Classification |
|------|----------------------------|----------------|
| Admin / Owner | Opens/closes restaurant shift (incl. force close); configures operating window; manages pilots; reviews day stats / feedback; full order authority | **Restaurant Module** (role pattern); platform Identity/RBAC shell stays **Core** |
| Cashier | Confirms/cancels orders; creates manual / aggregator orders; assigns pilots; starts/completes/fails delivery; confirms reservations | **Restaurant Module** |
| Pilot / driver | Opens/closes own duty shift; carries assigned orders; starts trip; completes or fails delivery | **Restaurant Module** (delivery performer) |
| Kitchen (implied) | Receives work via printed kitchen ticket after confirm; marks items sold-out — **no interactive cook-complete tracking in evidence** | **Restaurant Module** (station / prep) |
| Customer | Browses menu → cart → delivery or pickup → payment proof → submits Order; may book a table reservation | **Restaurant Module** party; end-customer ≠ platform Identity (**Core**) |

---

## 2. Primary Operational Work Unit

| Item | Value |
|------|--------|
| Primary Work Unit | **Order** |
| Lines | Order lines (menu item + qty + price snapshot) |
| Day container (secondary) | Restaurant **Shift** (open → operate → close) |
| Delivery performer container (secondary) | Pilot **duty shift** |
| Trip (secondary) | Per-order outbound delivery lifecycle |
| Parallel (not primary) | Table **Reservation** |

Everything else (print ticket, payment proof, fair-assign suggestion, day report) serves completing or bounding Orders inside the shift.

---

## 3. End-to-end workday scenarios

### S1 — Open the restaurant day

```
Staff login → (within operating window) Open restaurant Shift → inbox accepts Orders
Pilots open their own duty shifts → become available for assignment
```

| Element | Classification |
|---------|----------------|
| Bounded operational period | **Shared Platform Capability** candidate (Day/period Container — already on Capability Map) |
| Who may open/force-close | **Restaurant Module** + later platform RBAC (**Core** primitives) |
| Overnight logical date (e.g. 06:00→04:00) | **Platform Policy** (Timezone / “what is a day”) + place window config |

### S2 — Customer self-order (online)

```
Browse available menu → cart → choose delivery or pickup
→ identity + address/location (if delivery)
→ choose payment (cash on delivery vs prepaid + proof)
→ submit Order (pending)
```

| Element | Classification |
|---------|----------------|
| Catalog browse + cart + submit Order | **Restaurant Module** |
| Payment proof / remaining balance | Settlement pattern → **Shared Platform Capability** candidate (not day-one Aggregate bloat) |
| Delivery distance / fee bands | **Restaurant Module** (fulfillment rules) |

### S3 — Cashier-created order (manual / aggregator)

```
Cashier enters Order (manual or Talabat-like source) → pending
→ same confirm → assign → deliver loop as online
```

| Element | Classification |
|---------|----------------|
| Multi-channel intake into one Order pipeline | **Restaurant Module** |
| Aggregator brand names / fee-only “external trip” | **Ignore** as product design; pattern of “intake channel on Order” stays Module |

### S4 — Confirm → kitchen hand-off → await rider

```
pending → confirm
→ Order enters prep / waiting-for-driver
→ kitchen ticket (+ cashier ticket) produced
→ staff assigns an available pilot
```

| Element | Classification |
|---------|----------------|
| Confirm as commitment to fulfill | **Restaurant Module** (Order lifecycle) |
| Kitchen ticket as hand-off Artifact | **Shared Platform Capability** candidate (Artifact after workflow step) |
| Assign scarce delivery capacity | Pattern → **Shared** candidate; language (pilot) → **Restaurant Module** |

### S5 — Out for delivery → complete or fail

```
assigned → start trip (out for delivery)
→ complete (delivered) | fail (with reason) | cancel (with reason)
```

| Element | Classification |
|---------|----------------|
| Per-order trip lifecycle | **Restaurant Module** (secondary Aggregate around Order) |
| Fail/cancel with reason | **Restaurant Module** business outcomes |

### S6 — Pickup path

Same Order confirm/prep; no pilot trip (or trip skipped). Customer collects.  
*(Evidence emphasizes delivery; pickup is an Order fulfillment mode, not a separate primary unit.)*

Classification: **Restaurant Module**.

### S7 — Reservation (parallel track)

```
Customer books table + deposit proof → staff confirms
```

Not part of the Order prep loop. Secondary workflow.

Classification: **Restaurant Module** (must not become a peer root that replaces Order).

### S8 — Close the restaurant day

```
Active Orders cleared → pilots off duty
→ Close restaurant Shift (or Admin force close after rules)
→ day stats retained for review
```

| Element | Classification |
|---------|----------------|
| Close only when work period is finished | **Shared Platform Capability** candidate (Shift) |
| Force close / orphan attachment rules | Mix of **Restaurant Module** policy and ops governance — not Core |

### S9 — Management glance during / after day

Revenue/source mixes, pilot load, attendance-style pay inputs, feedback review.

| Element | Classification |
|---------|----------------|
| Feedback on work in a period | **Shared Platform Capability** candidate (Reporting) |
| Pilot compensation formulas | **Restaurant Module** / **Ignore** if brand-specific arithmetic |

---

## 4. Workflow sequences (business)

### W1 — Restaurant Shift

```
closed → open → (orders flow) → closed
```

### W2 — Order (fulfillment-shaped)

```
created (pending)
  → confirmed / in prep
  → rider assigned
  → out for delivery
  → delivered
  ↘ failed delivery
  ↘ cancelled
```

### W3 — Pilot duty + trip

```
Pilot: off → available → (on delivery while trip active) → available → off
Trip (per Order): assign → start → complete | fail
```

### W4 — Catalog readiness

```
Maintain categories + items → mark available / sold-out during the day
```

---

## 5. Interaction points (touchpoints only — not UI design)

| Touchpoint | Actor | Classification |
|------------|-------|----------------|
| Customer menu + checkout | Customer | **Restaurant Module** |
| Staff order inbox / pipeline | Cashier / Admin | **Restaurant Module** |
| Kitchen ticket print | Kitchen / Cashier | Artifact channel → **Shared** candidate; content → **Restaurant Module** |
| Sold-out toggles | Kitchen / ops | **Restaurant Module** |
| Pilot duty + assignment | Cashier + Pilot | **Restaurant Module** |
| Day open/close control | Admin / Cashier | Shift pattern → **Shared** candidate |
| Reservation confirm | Cashier | **Restaurant Module** |
| Day reports / feedback | Admin | Reports / feedback → **Shared** candidate / Module |

---

## 6. What this workflow is *not*

- Not a redesign of Mall_Shops Core or Salon.
- Not authorization to build Restaurant Module or Shared Capabilities (needs OP + map Triggers).
- Not a claim that every restaurant (dine-in, buffet, cloud kitchen) works this way — only what AbuKhater evidences.

---

## 7. One-line summary

AbuKhater’s workday is: **open Shift → intake Orders → confirm (kitchen hand-off) → assign capacity → fulfill (deliver/pickup) → close Shift**, with Order as the primary unit of work.
