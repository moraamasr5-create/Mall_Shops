# Restaurant Capability Map

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — official Module shape  
**Not:** Evidence classification · Feature backlog · Database schema  
**Parents:** [VISION.md](./VISION.md) · [platform-capability-map-from-salon.md](../../evidence/platform-capability-map-from-salon.md)

---

## 1. How to read this map

This is the **Restaurant Module Capability Map** — what the Module *contains* as product surface areas.

Placement vs Platform Capability Map:

| If a capability is… | It lives… |
|---------------------|-----------|
| Vertical language / Order spine | **This map** (Restaurant Module) |
| Cross-Module Pattern with Trigger | Platform Shared candidate (not owned by Restaurant) |
| Identity / Tenant / Membership | **Core** (required, not listed as Restaurant child) |
| Timezone / currency / retention | **Platform Policy** |
| Printers / storage / sync adapters | **Infrastructure** |

**Depth** of each node is gated by [MVP_BOUNDARY.md](./MVP_BOUNDARY.md).  
Presence on this map ≠ “build in v1.”

---

## 2. Official Module tree

```
Restaurant
├── Menu
├── Ordering                 ← primary work unit home (Order)
├── Guest                    ← Entity language (not Aggregate Root)
├── Staff                    ← Core Membership + RestaurantEmployee assignment
├── Reservation
├── Fulfillment              ← Entity inside Order; modes below are values, not Aggregates
│   ├── mode: dine_in
│   ├── mode: pickup
│   └── mode: delivery
├── Kitchen
├── Payments                 ← acceptance / snapshot in Module; Settlement may be Shared later
├── Shift                    ← period container (Module-local for MVP limits — not restaurant-only)
├── Analytics                ← Later
├── Inventory                ← Later
└── Loyalty                  ← Later
```
---

## 3. Capability cards

### 3.1 Menu

| | |
|--|--|
| **Purpose** | Sellable catalog: categories, items, modifiers, availability |
| **Owns** | What can be ordered today |
| **Does not own** | Orders, stock ledgers, recipes/BOM |
| **Salon analogue** | Service catalog |
| **MVP** | Yes (thin) |

### 3.2 Ordering

| | |
|--|--|
| **Purpose** | Primary Operational Work Unit — create, confirm, progress, complete/cancel Orders + lines |
| **Owns** | Order Aggregate lifecycle (see Lifecycle Map) |
| **Does not own** | Printer hardware, payroll, inventory decrements |
| **Salon analogue** | Visit |
| **MVP** | Yes — **mandatory center** |

### 3.3 Guest

| | |
|--|--|
| **Purpose** | Party served / ordering party (contact, addresses as needed) |
| **Domain kind** | **Entity** — not Aggregate Root (see Aggregate Boundaries) |
| **Anchored by** | Order and/or Reservation use cases |
| **Does not own** | Platform Identity; independent lifecycle/transactions |
| **Salon analogue** | SalonCustomer (Salon may keep its own Aggregate choice) |
| **MVP** | Yes (minimal; walk-in allowed) |

### 3.4 Staff

| | |
|--|--|
| **Purpose** | Operators for the restaurant loop (cashier, kitchen, manager, pilot when needed) |
| **Domain kind** | **RestaurantEmployee assignment** on **Core Membership** — not a Staff Aggregate |
| **Owns** | Module role tags + `restaurant:*` grants |
| **Does not own** | A second employee Aggregate; Core Membership shell |
| **Salon analogue** | SalonEmployee exists in Salon — Restaurant deliberately does **not** copy that Aggregate shape |
| **MVP** | Yes |

### 3.5 Reservation

| | |
|--|--|
| **Purpose** | Parallel promise: hold capacity/time with optional deposit |
| **Owns** | Reservation Aggregate (not a child of Order) |
| **Invariant** | **Reservation may create Order; Order never owns Reservation** |
| **Does not own** | Replacing Order as primary unit; full CRM |
| **Salon analogue** | None in Salon MVP |
| **MVP** | Yes (thin) — see MVP Boundary |

### 3.6 Fulfillment

| | |
|--|--|
| **Purpose** | How the Order is executed: mode, status, assignee, times |
| **Domain kind** | **Entity inside Order** (not Delivery/Pickup/DineIn Aggregates) |
| **Modes** | `dine_in` \| `pickup` \| `delivery` |
| **Does not own** | Redefining Order; courier-company product as Module thesis |
| **Salon analogue** | Implicit in-place service |
| **MVP** | Yes — all three modes; thin assignee path when `mode = delivery` |

### 3.7 Kitchen

| | |
|--|--|
| **Purpose** | Prep hand-off and visibility after Order is confirmed |
| **Owns** | Kitchen ticket / prep signal around Order; item availability ops |
| **Does not own** | Order as primary root; recipe costing; inventory |
| **Salon analogue** | Weak (service performed in chair) |
| **MVP** | Thin — see Aggregate Boundaries + MVP Boundary |

### 3.8 Payments

| | |
|--|--|
| **Purpose** | Money acceptance needed to run the day (method, paid/remaining, proof) |
| **Owns** | Payment acceptance snapshot in v1; richer Payment Aggregate later if Contracts require |
| **Does not own** | Platform Settlement/Billing Shared product; full accounting |
| **Salon analogue** | Deferred in Salon MVP (anti-bloat) |
| **MVP** | Snapshot on Order — not full billing suite |

### 3.9 Shift

| | |
|--|--|
| **Purpose** | Operating period container for the restaurant day |
| **Owns** | Open/close association of work to a period |
| **Does not own** | Fiscal cash drawer product; Core “day” semantics (Timezone Policy) |
| **Platform note** | Pattern = Shared candidate. **Module-local only for MVP limits — not because Shift is restaurant-specific.** Salon (and others) may use the same Pattern later. |
| **MVP** | Yes (Module-local implementation) |

### 3.10 Analytics (Later)

| | |
|--|--|
| **Purpose** | Feedback on work in a period |
| **MVP** | No |
| **Platform note** | Reporting Shared candidate |

### 3.11 Inventory (Later)

| | |
|--|--|
| **Purpose** | Stock, recipes, purchasing |
| **MVP** | No — explicit anti-bloat |

### 3.12 Loyalty (Later)

| | |
|--|--|
| **Purpose** | Points, memberships, promos |
| **MVP** | No |

---

## 4. Dependency sketch (capabilities, not tables)

```
Menu ──────────────► Ordering (lines snapshot from menu)
Guest (Entity) ────► Ordering / Reservation (anchored; not a Root)
Membership + RestaurantEmployee ─► Ordering / Kitchen / Fulfillment / Shift
Ordering ──────────► Fulfillment Entity (mode/status/assignee/times)
Ordering ──────────► Kitchen (hand-off after confirm)
Ordering ──────────► Payments (acceptance snapshot)
Ordering ──────────► Shift (period association)
Reservation ─ ─ ─ ► may create Order (Order never owns Reservation)
```

Dashed: optional link.  
Solid: design dependency for a coherent day.

---

## 5. Explicit non-children (do not add to this tree)

| Temptation | Correct home |
|------------|--------------|
| Identity / Tenant / Membership | Core |
| Thermal Printing engine | Shared Artifact channel / Infrastructure |
| Offline sync engine | Shared / Infrastructure |
| Notifications bus | Shared |
| Cross-module Queue product | Shared Capacity Contention |
| Accounting / GL | Out of Module (later product) |
| Multi-warehouse | Out |
| Procurement | Out |
| AbuKhater aggregator connectors as Core | Ignore / future Module integration adapters |

---

## 6. Rename + apply (Salon ↔ Restaurant)

| Platform pattern | Salon | Restaurant capability |
|------------------|-------|------------------------|
| Catalog | Services | **Menu** |
| Party | Customers | **Guest** |
| Workforce | Employees (Salon Aggregate) | **RestaurantEmployee assignment** on Membership |
| Primary Work Unit | Visits | **Ordering** (Order) |
| Lines | Visit services | Order lines |
| Period container | — (MVP) | **Shift** |
| Post-step Artifact | — (MVP) | **Kitchen** hand-off |
| Economic acceptance | — (MVP) | **Payments** (thin) |

---

## 7. One-line summary

**Restaurant = Menu + Ordering(Order) + Guest Entity + Membership assignment + Reservation + Fulfillment Entity (modes) + Kitchen + thin Payments + Shift (MVP-local Pattern); Analytics/Inventory/Loyalty later — `delivery` is a Fulfillment mode, never the Module root.**
