# Restaurant Aggregate Map

**Date:** 2026-07-19  
**Source:** AbuKhater operational evidence (`Full_PROv1.zip`) — business boundaries only.  
**Purpose:** Aggregate boundaries, responsibilities, invariants. **No SQL. No schema. No APIs.**  
**Companion:** [Operational Workflow](./restaurant-reference-operational-workflow.md) · [Capability Classification](./restaurant-reference-capability-classification.md)  
**Rule:** Exactly one primary Operational Work Unit per Module — here **Order** ([Capability Map](./platform-capability-map-from-salon.md) § Platform rule).

---

## 1. Aggregate landscape

```text
                    ┌─────────────────────────┐
                    │  Restaurant Shift       │  period container (secondary)
                    │  (operational day)      │
                    └───────────┬─────────────┘
                                │ contains work of
                                ▼
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│ Menu Catalog │────▶│  ORDER (primary)    │────▶│ Order Lines      │
│ + availability│     │  + fulfillment mode │     │ (snapshots)      │
└──────────────┘     └──────────┬──────────┘     └──────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
     ┌────────────────┐ ┌──────────────┐ ┌─────────────────┐
     │ Delivery Trip  │ │ Pilot Duty   │ │ Reservation     │
     │ (per Order)    │ │ (performer)  │ │ (parallel)      │
     └────────────────┘ └──────────────┘ └─────────────────┘
```

Secondary Aggregates attach **around** Order. They must not become peer roots that redefine the Module.

---

## 2. Primary Aggregate — Order

| Field | Definition |
|-------|------------|
| **Name** | Order |
| **Classification** | **Restaurant Module** |
| **Responsibility** | The unit of work the restaurant commits to fulfill: who ordered, what lines, fulfillment mode (delivery/pickup), money posture, lifecycle status, links to shift / pilot / trip outcomes |
| **Children** | Order Lines (required for a meaningful Order) |
| **Not inside Order** | Fiscal invoice product, notification engine, print device drivers, multi-stop route planner, platform Identity |

### Invariants (business)

1. An Order has a lifecycle from intake → terminal (delivered / failed / cancelled).  
2. Confirm is a commitment step: prep hand-off becomes valid after confirm.  
3. Delivery trip states apply only when fulfillment mode requires a rider.  
4. Price/name on lines are snapshots of what was sold (catalog may change later).  
5. An open restaurant Shift is the normal gate for accepting/operating Orders (period container).  
6. Active (non-terminal) Orders block closing the restaurant Shift.

### Lifecycle (conceptual)

| Phase | Meaning |
|-------|---------|
| Pending | Intake; not yet committed to kitchen/fulfillment |
| Confirmed / In prep | Committed; kitchen hand-off occurred |
| Rider assigned | Delivery capacity reserved for this Order |
| Out for delivery | Trip started |
| Delivered | Success terminal |
| Failed delivery | Failure terminal (with reason) |
| Cancelled | Cancelled terminal (with reason) |

**Anti-bloat (normative, mirrors OP-005 for Visit):**  
Do not expand Order into Billing product, Notifications product, Printing product, Queue product, or Loyalty. Those are separate Aggregates or Shared Capabilities when Triggers are met.

---

## 3. Order Line

| Field | Definition |
|-------|------------|
| **Name** | Order Line |
| **Classification** | **Restaurant Module** |
| **Responsibility** | One sellable unit on the Order: item identity/name, quantity, unit/total price snapshot |
| **Parent** | Order |

### Invariants

1. Belongs to exactly one Order.  
2. Quantity ≥ 1 for a valid sellable line.  
3. Snapshot fields survive later catalog edits.

---

## 4. Menu Catalog (Category + Item)

| Field | Definition |
|-------|------------|
| **Name** | Menu Catalog |
| **Classification** | **Restaurant Module** |
| **Responsibility** | What can be sold; categories; base availability |
| **Day overlay** | Sold-out / available toggles during service |

### Invariants

1. Only available items are orderable at intake.  
2. Sold-out is operational readiness, **not** kitchen cook-complete state.  
3. Catalog language is Restaurant’s — do not share Salon Service tables.

**Salon analogue:** Service catalog ↔ Menu; Employee ↔ Staff/Pilot/Station; Customer ↔ Guest.

---

## 5. Restaurant Shift (secondary)

| Field | Definition |
|-------|------------|
| **Name** | Restaurant Shift (Operational Period) |
| **Classification** | Pattern → **Shared Platform Capability** candidate; restaurant rules for open/close → **Restaurant Module** |
| **Responsibility** | Bound the workday: when Orders may flow; when the day may close; retain period summary |

### Invariants

1. At most one open restaurant Shift for a logical operating date (resume if already open).  
2. Close requires no active Orders (business close rule).  
3. Operating window is interpreted under a timezone policy (**Platform Policy**).  
4. Force close is an exceptional Admin override, not the normal path.

**Not the primary Work Unit.** Shift contains Orders; it does not replace them.

---

## 6. Pilot Duty (secondary — delivery performer)

| Field | Definition |
|-------|------------|
| **Name** | Pilot Duty / Delivery Performer session |
| **Classification** | **Restaurant Module** |
| **Responsibility** | Whether a rider is on duty and eligible for assignment; load while on duty |

### Invariants

1. Assignment requires an open pilot duty and an eligible state (available).  
2. Duty open/close is separate from restaurant Shift (both must align to close the day cleanly).  
3. Concurrent load has a business cap (evidenced as a max concurrent assigned/active set).

**Not Core workforce.** Platform Membership ≠ pilot row.

---

## 7. Delivery Trip (secondary — per Order)

| Field | Definition |
|-------|------------|
| **Name** | Delivery Trip |
| **Classification** | **Restaurant Module** |
| **Responsibility** | Outbound fulfillment of **one** Order: assign → start → complete/fail |

### Invariants

1. Trip is keyed to a single Order (no multi-stop trip Aggregate in evidence).  
2. Start trip moves Order into “out for delivery” and marks pilot on delivery.  
3. Complete/fail are terminal for that trip; pilot returns when no remaining assigned/active Orders.

**Do not elevate Trip to primary Work Unit.** Trip exists because Order fulfillment mode = delivery.

---

## 8. Reservation (parallel, secondary)

| Field | Definition |
|-------|------------|
| **Name** | Reservation |
| **Classification** | **Restaurant Module** |
| **Responsibility** | Table/cafe booking + deposit posture; staff confirm |

### Invariants

1. Parallel to Order loop — not a substitute primary unit.  
2. Has its own pending → confirmed (or discarded) outcomes.

If a future Restaurant Module ships without reservations, Order still stands (Capability Map: secondary concepts attach when needed).

---

## 9. Party / Customer (Restaurant)

| Field | Definition |
|-------|------------|
| **Name** | Guest / Customer (of the place) |
| **Classification** | **Restaurant Module** |
| **Responsibility** | Who is being served on an Order or Reservation (name, phones, address) |

### Invariants

1. Not platform Identity (**Core**).  
2. Walk-in / phone order may carry minimal identity on the Order itself.

---

## 10. Explicit non-Aggregates (do not invent roots)

| Concept | Why not an Aggregate root here |
|---------|--------------------------------|
| Kitchen ticket | Artifact / hand-off channel of Order confirm — not a peer root |
| Invoice / receipt print | Settlement / Artifact channel |
| Fair-assign suggestion | Policy/heuristic inside assignment, not its own Aggregate |
| Feedback / complaint | Adjacent intake; not Order |
| App config key/value bag | Configuration — not a Work Unit |
| Offline mutation log | **Infrastructure** |

---

## 11. Rename + apply from Salon (conceptual)

| Salon Aggregate | Restaurant Aggregate |
|-----------------|----------------------|
| Visit | **Order** |
| VisitService | **Order Line** |
| SalonService | Menu Item |
| SalonEmployee | Staff / Pilot / Station |
| SalonCustomer | Guest / Customer |

Same pattern: open work unit → add lines → progress → close/terminal.  
**Never share tables across Modules.**

---

## 12. One-line summary

**Order** is the only primary Aggregate; Shift, Pilot Duty, Trip, Reservation, and Catalog orbit it with clear invariants — kitchen print and payment proof are not Aggregate roots.
