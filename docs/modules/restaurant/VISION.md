# Restaurant Vision

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — vision unchanged; **not** build/implementation authorization  
**Upstream:** Phase 1 Evidence (AbuKhater extraction) + Platform Capability Map (ADOPTED)  
**Normative parents:** Engineering Operating Constitution · Platform Principles · Architecture Lock

---

## 1. One-sentence definition

**Restaurant Module** is the Mall platform vertical that runs a hospitality place’s **operating day** around one primary work unit — the **Order** — across dine-in, pickup, and delivery, without becoming a delivery-only app, a supply-chain system, or a redefinition of Core.

---

## 2. What Restaurant Module is (inside Mall)

| Aspect | Definition |
|--------|------------|
| **Product role** | A pluggable Module (`moduleKey: restaurant`) a Tenant activates via Core `TenantModule` |
| **Owner experience** | “I am running my restaurant day” — catalog ready, orders moving, kitchen/handoff clear, period closable |
| **Primary Operational Work Unit** | **Order** (Capability Map rule: every Module owns exactly one) |
| **Pattern relative to Salon** | Same spine, different language: Catalog → Party → **Work Unit** → Lines → Close |
| **Independence** | Does not import Salon; does not put Order/Menu into Core |
| **Sellability test** | A Tenant can run a useful restaurant day with Module + Core alone; Shared Capabilities are clothing, not prerequisites for existence |

---

## 3. Scope

In scope for the **Module as a product concept** (full Capability Map — not all in MVP):

- Menu / catalog and availability  
- Ordering (create, confirm, progress, cancel)  
- Fulfillment Entity on Order with modes: **dine_in**, **pickup**, **delivery**  
- Kitchen hand-off and prep visibility (as Module capability; depth gated by MVP)  
- Reservation (parallel; may create Order; Order never owns Reservation)  
- Staff via Core Membership + RestaurantEmployee assignment (not a Staff Aggregate)  
- Guest as Entity anchored by Order/Reservation (not a Guest Aggregate Root)  
- Operating period (Shift) — Module-local for MVP limits; Pattern is cross-Module  
- Payment acceptance snapshot needed to run the day (full Settlement may be Shared later)  
- Fulfillment assignee when `mode = delivery`  
- Module permissions (`restaurant:*`)  
- Owner-facing ops surfaces for the above  

---

## 4. Out of Scope (Module identity)

Restaurant Module is **not**:

| Out | Why |
|-----|-----|
| Core Identity / Tenant / Membership | Core owns these |
| A second platform | It is one Module among many |
| Delivery-company OS | Delivery is one **fulfillment mode**, not the Module thesis |
| Full ERP / accounting | Settlement Pattern may become Shared; accounting suite is not Restaurant |
| Inventory / recipes / procurement / multi-warehouse | Explicit later (see MVP Boundary) |
| CRM / loyalty / marketing automation | Later; not required to define the Module |
| Salon Visit tables or shared Visit schema | Modules do not share vertical Aggregates |
| AbuKhater code, PIN theater, brand geography, n8n | Evidence anti-patterns — Ignore |
| Shared Capability products (Printing, Notifications, Offline engine) as Module-owned platforms | Shared only via Triggers + Pattern Extraction + OP |

---

## 5. Goals

1. **Rename + apply** the Salon-proven spine: catalog, party, primary work unit, lines, close.  
2. Make **Order** the undeniable center of the restaurant day (not cart UI, not invoice product, not trip table).  
3. Support **multiple fulfillment modes** so the Module is a restaurant Module, not a courier Module.  
4. Keep secondary concepts (kitchen ticket, delivery assignment, reservation, shift) **around** Order — not peer primary roots.  
5. Stay **sellable with Core alone** for MVP; use Shared Capabilities only when map Triggers are met.  
6. Provide a **Package Manifest** suitable for future Marketplace packaging.  
7. Prevent AbuKhater-style inflation: no inventory/CRM/loyalty in the definition of v1 success.

---

## 6. Non-Goals

1. Implementing Restaurant in the current Internal Pilot (OP-006) without a later authorizing OP.  
2. Redesigning Core or Salon to “fit delivery.”  
3. Copying AbuKhater dual-app architecture or security model.  
4. Building Shared Shift / Artifact / Billing / Offline in this Phase 2 document set.  
5. Writing Prisma, SQL, APIs, or UI in Phase 2.  
6. Treating provisional `docs/contracts/modules/restaurant/*` as final (Phase 3 rewrites them).  
7. Inventing dine-in table maps, course firing, or refund suites without Evidence + MVP allowance.

---

## 7. Why it differs from Salon

| Dimension | Salon (Reference Implementation) | Restaurant |
|-----------|----------------------------------|------------|
| Primary Work Unit | **Visit** | **Order** |
| Catalog | Service | Menu item / category |
| Performer emphasis | Employee on the Visit | Station / kitchen hand-off; pilot only if delivery |
| Party | Customer | Guest |
| Typical contention | Stylist time (queue Pattern) | Kitchen throughput + optional delivery capacity |
| Period container | Not required for Salon MVP loop | Strongly motivated (overnight day, close gate) |
| Artifact moment | Optional receipt later | Confirm → kitchen hand-off is central |
| Fulfillment | In-place service | Dine-in **or** pickup **or** delivery |
| Parallel track | Weak in MVP | Reservation common |

Same Constitution thesis: **day is work performed.**  
Different Module language and secondary clothing.

---

## 8. Why it must not depend on Delivery only

AbuKhater Evidence is **delivery-heavy**. That is a **source bias**, not the Module definition.

| If Restaurant = Delivery only | Consequence |
|-------------------------------|-------------|
| Dine-in / pickup tenants excluded | Module fails Owner Experience for classic restaurants |
| Pilot/Trip become pseudo-primary | Violates “one primary Work Unit = Order” |
| Platform learns the wrong pattern | Next Modules copy a courier OS |
| Capability Map “rename + apply” breaks | Salon Visit ≠ Delivery Trip |

**Normative rule:**  
FulfillmentMode ∈ { `dine_in`, `pickup`, `delivery` }.  
Delivery Assignment / Pilot exist **only** when mode is `delivery`.  
A Tenant that never delivers must still have a coherent Restaurant Module.

---

## 9. Design posture toward Evidence

| Take from AbuKhater | Leave behind |
|---------------------|--------------|
| Order-centered day | Code, SQL, PIN auth |
| Confirm → hand-off Artifact | Brand fees / GPS / Talabat economics as platform law |
| Shift as period container (Pattern) | Delivery-only product identity |
| Channel-normalized intake (principle) | Dual EN/AR status residue |
| Capacity contention Pattern | Hardcoded load=7 / pay formulas |

---

## 10. Success criteria (for the Module vision — not a release claim)

The vision is satisfied when a Founder/Owner can say:

> “This Module runs my restaurant day around Orders — whether guests eat here, take away, or get delivery — without forcing ERP, loyalty, or a courier product on me.”

Implementation success is gated later by Contracts + OP + Release Gates.

---

## 11. One-line summary

**Restaurant Module = Mall’s hospitality vertical: Order-centric operating day, multi-mode fulfillment, Salon spine renamed — not AbuKhater-as-platform, not delivery-only, not Core.**
