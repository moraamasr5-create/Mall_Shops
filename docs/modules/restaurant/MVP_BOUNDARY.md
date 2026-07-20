# Restaurant MVP Boundary

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — anti-bloat law for v1  
**Parents:** [VISION.md](./VISION.md) · [CAPABILITY_MAP.md](./CAPABILITY_MAP.md) · [AGGREGATE_BOUNDARIES.md](./AGGREGATE_BOUNDARIES.md) · [DOMAIN_LANGUAGE.md](./DOMAIN_LANGUAGE.md) · [LIFECYCLE_MAP.md](./LIFECYCLE_MAP.md)  
**Purpose:** Prevent repeating large-project inflation (AbuKhater residue, ERP creep, delivery-only skew).

---

## 1. Definition of Restaurant v1 success

Restaurant v1 is successful when a Tenant can complete this loop with Core + Restaurant Module only:

```
Activate Module
  → Setup Menu + RestaurantEmployee assignments (Membership)
  → Open Shift
  → Create Order (Fulfillment.mode = dine_in | pickup | delivery)
  → Confirm → Preparing → Ready
  → Complete (or Delivered→Complete if mode = delivery)
  → Close Shift
```

Optional thin Reservation may run **beside** that loop (and **may create** an Order; Order never owns Reservation).  
If the loop requires Inventory, Loyalty, Accounting, Staff Aggregate, Guest Aggregate Root, or a Shared print farm — **v1 scope failed.**

---

## 2. In / Out matrix

### Restaurant v1 — IN ✅

| Capability | v1 depth | Notes |
|------------|----------|-------|
| **Menu** | Category + Item + availability | Modifiers thin/optional |
| **Ordering** | Order + OrderLine + lifecycle | Primary Work Unit |
| **Guest** | Entity anchored by Order/Reservation | **Not** Aggregate Root |
| **Staff** | Core Membership + RestaurantEmployee assignment | **Not** StaffMember Aggregate |
| **Fulfillment** | Entity inside Order: mode/status/assignee/times | Modes: `dine_in`, `pickup`, `delivery` |
| **Kitchen** | Order states Preparing/Ready (+ availability) | **No** KitchenTicket Aggregate |
| **Payments** | PaymentAcceptance VO on Order | No refund engine; no GL |
| **Shift** | Module-local Open→Closing→Closed | MVP limit only — Pattern not restaurant-only |
| **Reservation** | Pending→Confirmed→Completed/Cancelled | May create Order; Order never owns it |
| **Permissions** | `restaurant:*` | Package Manifest vocabulary |

### Restaurant v1 — OUT ❌

| Capability / Feature | Why out |
|----------------------|---------|
| **Guest as Aggregate Root** | Entity only — no independent lifecycle/transactions |
| **StaffMember Aggregate** | Duplicates Core Membership |
| **Delivery / Pickup / DineIn Aggregates** | Modes of Fulfillment Entity |
| **Inventory / Recipes / Procurement / Multi-warehouse** | Supply-chain inflation |
| **CRM / Loyalty** | Not required for Order loop |
| **Accounting / GL / tax engine** | Not Module thesis |
| **Full Payment Aggregate + refunds** | Settlement Pattern / Later |
| **KitchenTicket multi-station board** | Collapse into Order states |
| **Floor / Table map Aggregate** | Optional label VO only if needed |
| **Aggregator connectors** | Extensions Later |
| **Offline / Printing / Notifications Shared products** | Optional clothing — not v1 mandate |
| **Advanced Analytics / BI** | Later |
| **AbuKhater payroll / PIN / n8n** | Ignore |

---

## 3. Capability tree with MVP tags

```
Restaurant
├── Menu                 ✅ v1
├── Ordering             ✅ v1 (center)
├── Guest                ✅ v1 Entity (not Root)
├── Staff                ✅ v1 assignment on Membership
├── Reservation          ✅ v1 thin (may → Order)
├── Fulfillment          ✅ v1 Entity on Order
│   ├── mode: dine_in    ✅
│   ├── mode: pickup     ✅
│   └── mode: delivery   ✅
├── Kitchen              ✅ v1 thin (Order states)
├── Payments             ✅ v1 snapshot only
├── Shift                ✅ v1 Module-local (Pattern ≠ restaurant-only)
├── Analytics            ❌ Later
├── Inventory            ❌ Later
└── Loyalty              ❌ Later
```

---

## 4. Aggregate depth in v1

| Concept | v1 |
|---------|----|
| Order (Root) | ✅ primary — contains Fulfillment, OrderLine, Guest Entity |
| MenuItem (+ Category) | ✅ Root |
| Reservation (Root) | ✅ thin |
| Shift (Root) | ✅ Module-local for MVP limits |
| Guest | ✅ **Entity** — not Root |
| RestaurantEmployee | ✅ **assignment** — not Root |
| KitchenTicket | ❌ not required |
| Payment (Root) | ❌ use VO |
| Table/Floor | ❌ |
| Delivery Aggregate | ❌ — use Fulfillment.mode |

---

## 5. Lifecycle depth in v1

| Machine | v1 states |
|---------|-----------|
| Order | Created → Confirmed → Preparing → Ready → (OutForDelivery → Delivered) → Completed; Cancelled; Failed |
| Fulfillment (Entity) | mode + status/assignee/times aligned with Order path |
| Reservation | Pending → Confirmed → Completed \| Cancelled; **may create Order** |
| Shift | Closed ↔ Open → Closing → Closed |
| KitchenTicket | *omit* |
| Payment capture/refund | *omit* |

---

## 6. Hard anti-bloat rules

1. **No second primary Work Unit** — Fulfillment/Ticket/Reservation must not replace Order.  
2. **No delivery-only MVP** — `dine_in` and `pickup` are first-class **modes**.  
3. **No Guest Aggregate Root; no Staff Aggregate.**  
4. **No Shared build required** to claim Restaurant v1.  
5. **Shift Module-local ≠ Shift restaurant-only** — Pattern remains Shared candidate.  
6. **Reservation may create Order; Order never owns Reservation.**  
7. **No Core change** to ship Restaurant v1.  
8. **No Salon import / AbuKhater port.**  
9. **Payment snapshot ≠ Billing product.**  
10. **Phase 3 Contracts must cite DOMAIN_LANGUAGE + this file** before Phase 4 Prisma.

---

## 7. v1.1 / Later candidates (parking only)

| Candidate | Trigger to reconsider |
|-----------|------------------------|
| KitchenTicket Aggregate | Multi-station prep proven |
| Payment Aggregate + refunds | Settlement Shared Trigger or necessity |
| Floor/Table | Dine-in frequency rule |
| Shared Shift migration | Shared Shift authorized + built |
| Artifact/Printing Shared | ≥2 Modules need Artifact channel |
| Analytics / Inventory / Loyalty | Explicit OP |

---

## 8. Relation to Salon MVP (sanity)

| Salon MVP | Restaurant v1 |
|-----------|---------------|
| Setup + Visit loop | Setup + Order loop + Shift |
| SalonEmployee Aggregate | RestaurantEmployee **assignment** (deliberate difference) |
| No Shift required | Shift in — **Pattern** reusable later by Salon |
| No Billing | Payment snapshot only |

---

## 9. Gate — Phase 2 complete

Founder architectural notes incorporated:

- [x] Guest = Entity, not Root  
- [x] Staff = Membership + RestaurantEmployee assignment  
- [x] Shift Module-local for MVP limits (not restaurant-only)  
- [x] Fulfillment Entity (not Delivery Aggregate)  
- [x] Reservation may create Order; Order never owns Reservation  
- [x] DOMAIN_LANGUAGE.md  

**Restaurant Reference Design = Architecture Locked** for Phase 3 Contracts.  
Still **not** implementation authorization (needs OP when execution is due).

---

## 10. One-line summary

**Restaurant v1 = Menu + Order(+Fulfillment Entity) + Guest Entity + Membership assignment + thin Reservation + Module Shift — without Guest/Staff Aggregates, without Delivery-as-root, without Inventory/CRM/Loyalty/Accounting.**
