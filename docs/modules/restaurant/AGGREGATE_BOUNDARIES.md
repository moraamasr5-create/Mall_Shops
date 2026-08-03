# Restaurant Aggregate Boundaries

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — prerequisite before Prisma  
**Not:** SQL · table list · API routes  
**Parents:** [VISION.md](./VISION.md) · [CAPABILITY_MAP.md](./CAPABILITY_MAP.md) · [DOMAIN_LANGUAGE.md](./DOMAIN_LANGUAGE.md) · [LIFECYCLE_MAP.md](./LIFECYCLE_MAP.md)

---

## 0. Legend

| Term | Meaning |
|------|---------|
| **Aggregate Root** | Consistency boundary; external references use its id only |
| **Entity** | Has identity; lives inside a Root’s boundary (or is anchored by a Root’s use case) |
| **Value Object** | Measured by attributes; immutable replace; no independent identity |
| **Reference** | Id pointer across Aggregates — no direct mutation of the other Aggregate’s internals |
| **Assignment** | Module binding to Core Membership — not a duplicate workforce Aggregate |
| **MVP depth** | What v1 must implement — see [MVP_BOUNDARY.md](./MVP_BOUNDARY.md) |

**Correction vs provisional contracts:** Order is the **primary work unit**, not a “transactional cart that delegates everything away.”

---

## 1. Ownership map (who owns whom)

```
MenuItem (Root)  [+ Category]
   │
   │  (catalog reference + price snapshot at accept)
   ▼
Order (Root)  ◄──────── primary Operational Work Unit
   │
   ├── OrderLine (Entity)
   ├── Fulfillment (Entity)     ← mode | status | assignee | times
   ├── PaymentAcceptance (VO)   〔MVP〕
   ├── Guest (Entity)           ← not a Root; anchored by Order when ordering
   └── references → ShiftId, MenuItemId (snapshot metadata),
                    MembershipId / RestaurantEmployee assignment (who acted)

Order (Root)
   │
   │  (after Confirmed — hand-off)
   ▼
KitchenTicket (Root)  〔optional later — MVP collapses into Order status〕
   └── references → OrderId

Reservation (Root)  〔parallel〕
   ├── Guest (Entity)           ← anchored by Reservation when booking
   └── may create → OrderId (link)
   └── Order never owns Reservation

Shift (Root)  〔Module-local for MVP limits — NOT restaurant-specific concept〕
   └── referenced by Order

Core Membership ──────────────► RestaurantEmployee (assignment, not Aggregate Root)
```

### Answers to the boundary questions

| Question | Answer |
|----------|--------|
| Menu → Order? | Menu does **not** own Order. Order **snapshots** menu data into lines. |
| Order → Payment? | MVP: `PaymentAcceptance` **VO on Order**. Later Payment Root **references** `OrderId`. |
| Order → Fulfillment? | **`Fulfillment` Entity inside Order** (mode/status/assignee/times). Not separate Delivery/Pickup/DineIn Aggregates. |
| Order → Reservation? | **Order never owns Reservation.** Reservation **may create** (link) an Order. Parallel otherwise. |
| Order → KitchenTicket? | KitchenTicket **references** Order. MVP: omit Ticket Root; use Order `Preparing` / `Ready`. |
| Guest? | **Entity**, not Root — see §3. |
| Staff? | **No Staff Aggregate** — Core Membership + RestaurantEmployee assignment — see §4. |

---

## 2. Aggregate: Menu

| | |
|--|--|
| **Root** | `MenuItem` (Category as Entity under catalog ops) |
| **Entities** | `MenuItem`, `Category`, optional `ModifierGroup` / `Modifier` |
| **Value Objects** | `Money`, `Availability` (`available` \| `unavailable`) |
| **Invariants** | Unavailable item cannot be newly ordered; Tenant-scoped; price changes do not mutate historical OrderLines |
| **MVP** | Category + MenuItem + Availability; modifiers optional-thin |

---

## 3. Guest — Entity (not Aggregate Root)

| | |
|--|--|
| **Kind** | **Entity** |
| **Not** | Aggregate Root |
| **Why not Root** | Does not live independently; existence is tied to **Order** and/or **Reservation**; no independent lifecycle machine; no independent domain transactions |
| **Identity** | May have an id for reuse across Orders/Reservations |
| **Value Objects** | `Phone`, address fields when needed, display name |
| **Invariants** | Guest ≠ Core Identity; walk-in may be minimal; Guest create/update is always through Order or Reservation use cases (never a standalone “Guest Aggregate” API as system of record) |
| **MVP** | Yes — minimal fields embedded/anchored by Order or Reservation |

**Persistence note (non-normative for Prisma yet):** a shared `guest` row for reuse is an implementation choice; it does **not** promote Guest to Aggregate Root.

---

## 4. Staff — assignment, not Aggregate

| | |
|--|--|
| **Kind** | **RestaurantEmployee** (or “Assigned Staff”) — Module **assignment** |
| **Not** | `StaffMember` Aggregate Root |
| **Uses** | **Core Membership** (+ Identity) for who the person is |
| **Module adds** | Restaurant role tags / assignment (`cashier`, `kitchen`, `manager`, `pilot`, …) and permission grants (`restaurant:*`) |
| **Invariants** | Do not duplicate a full employee Aggregate inside Restaurant; Module must not replace Core RBAC shell |
| **MVP** | Yes — Membership + assignment sufficient for the loop |

Salon’s `SalonEmployee` is that Module’s choice. Restaurant **deliberately** avoids a parallel workforce Aggregate.

---

## 5. Aggregate: Order (primary)

| | |
|--|--|
| **Root** | `Order` |
| **Entities** | `OrderLine`; **`Fulfillment`**; **`Guest`** (anchored) |
| **Value Objects** | `Money` snapshots; `PaymentAcceptance`; `Channel`; `OrderStatus` |
| **References** | `ShiftId`; acting `MembershipId` / RestaurantEmployee assignment; MenuItem ids inside line snapshots |
| **Does not own** | Reservation; Shift rules; KitchenTicket internals; Core Identity; printer adapters |

### Fulfillment Entity (inside Order)

| Field idea | Meaning |
|------------|---------|
| `mode` | `dine_in` \| `pickup` \| `delivery` |
| `status` | Fulfillment progress overlay (aligns with Order path after Ready) |
| `assignee` | Assigned Staff / pilot Membership when mode needs it |
| `times` | e.g. readyAt, departedAt, deliveredAt |

**Do not** name separate Aggregates `Delivery`, `Pickup`, `DineIn`. Those are **modes** of Fulfillment.

### Invariants (normative)

1. Order is the unit of work for the restaurant day.  
2. After **Confirmed**, lines and price snapshots are immutable except via explicit adjustment (out of MVP unless needed).  
3. Exactly one `Fulfillment` Entity per Order.  
4. Assignee / en-route fields apply when `mode = delivery` (and only as needed for other modes).  
5. Terminal state is singular: Completed / Cancelled / Failed (see Lifecycle).  
6. When Shift is in use: new Orders associate to an **Open** Shift; Shift close blocked by non-terminal Orders.  
7. **Order never owns Reservation.**

---

## 6. Aggregate: KitchenTicket (secondary / optional)

| | |
|--|--|
| **Root** | `KitchenTicket` |
| **References** | **Required:** `OrderId` |
| **MVP** | **Collapsed:** Order status `Preparing` / `Ready` only |
| **Artifact Pattern** | Print/export = Shared Artifact channel later — not this Aggregate’s printers |

---

## 7. Aggregate: Reservation (parallel)

| | |
|--|--|
| **Root** | `Reservation` |
| **Entities** | `Reservation`; **`Guest`** (Entity, anchored) |
| **Value Objects** | party size, scheduled window, deposit snapshot, `ReservationStatus` |

### Invariants (normative) — required

1. **Reservation may create Order** (optional link `OrderId` when the booking turns into work).  
2. **Order never owns Reservation** — no Reservation collection inside Order; no Order→Reservation ownership arrow.  
3. Reservation without Order is valid.  
4. Order without Reservation is valid.  
5. Confirming a Reservation does **not** require auto-creating an Order in MVP.

**Table / Floor:** Not an Aggregate in v1. Optional `tableLabel` on Reservation or on Order.Fulfillment when `mode = dine_in`.

---

## 8. Aggregate: Shift (period container)

| | |
|--|--|
| **Root** | `Shift` |
| **Entities** | `Shift` |
| **Value Objects** | open/close timestamps, logical business date, `ShiftStatus` |
| **References** | openedBy Membership id |
| **MVP** | Yes — **Module-local implementation** |

### Critical placement note (normative)

> **Shift is Module-local because of MVP / Shared Capability boundaries — not because Shift is a restaurant-only concept.**

- The **operational Pattern** (day/period container) is cross-Module and already a **Shared Platform Capability candidate** on the Platform Capability Map.  
- Salon may adopt the same Pattern later without “importing Restaurant Shift.”  
- When Shared Shift is authorized and built, Restaurant should **migrate** to it rather than claiming Shift as vertical IP.  
- Do **not** argue in a year: “Shift lives in Restaurant, so it cannot serve Salon.”

Orders **reference** Shift; Shift does not embed Order collections as writable internals.

---

## 9. Payment Aggregate (deferred)

| | |
|--|--|
| **Root** | `Payment` — **not** MVP |
| **MVP substitute** | `PaymentAcceptance` VO on Order |
| **Shared note** | Settlement / Billing remains Platform Shared candidate |

---

## 10. What is never an Aggregate Root here

| Surface | Classification |
|---------|----------------|
| Guest | **Entity** (see §3) |
| RestaurantEmployee / Assigned Staff | **Assignment** (see §4) |
| Fulfillment | **Entity inside Order** |
| Cart / Inbox UI | Presentation |
| Print job | Infrastructure / Shared Artifact |
| Offline mutation id | Infrastructure |
| Loyalty / Inventory ledgers | Later — out |
| Platform User | Core Identity |

---

## 11. Consistency boundaries (transaction rules)

| Operation | Boundary |
|-----------|----------|
| Add/change lines before Confirm | Order only |
| Confirm Order | Order (+ optional KitchenTicket later) |
| Mark Preparing / Ready | Order (MVP) |
| Update Fulfillment (assign / en route / deliver) | Order (Fulfillment Entity) |
| Open/close Shift | Shift; close validates Orders by query/spec |
| Confirm Reservation | Reservation only |
| Reservation creates Order | Application orchestration: Reservation links `OrderId`; Order still does not own Reservation |

---

## 12. Supersession note

Provisional contracts under `docs/contracts/modules/restaurant/` that treat Order as a hollow cart, Guest/Staff as day-one Roots, or Delivery as a peer Aggregate, are **not** authoritative until rewritten in Phase 3 against **this** document and [DOMAIN_LANGUAGE.md](./DOMAIN_LANGUAGE.md).

---

## 13. One-line summary

**Roots: Order (primary), MenuItem, Reservation, Shift (MVP-local Pattern). Entities: OrderLine, Fulfillment, Guest. Assignments: RestaurantEmployee via Core Membership. Order never owns Reservation; Reservation may create Order.**
