# Restaurant Domain Language

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — all Phase 3 Contracts must use these terms  
**Parents:** [VISION.md](./VISION.md) · [AGGREGATE_BOUNDARIES.md](./AGGREGATE_BOUNDARIES.md)

Use this vocabulary consistently. Do not invent synonyms in Contracts (`Driver` vs `Pilot`, `Cart` vs `Order`, `Delivery` as a peer root, etc.).

---

## Glossary

| Term | Meaning |
|------|---------|
| **Order** | Primary Operational Work Unit — the work performed in the restaurant day |
| **OrderLine** | Line under an Order (item snapshot, qty, price) |
| **Menu** | Sellable catalog (categories, items, availability) |
| **Guest** | The party served / ordering party — **Entity**, not Aggregate Root; not Core Identity |
| **Reservation** | Parallel booking promise (time/party/deposit) — may create an Order; never owned by Order |
| **Fulfillment** | How an Order is executed: mode, status, assignee, times — **Entity inside Order** |
| **Fulfillment mode** | `dine_in` \| `pickup` \| `delivery` — values of Fulfillment, not separate Aggregates |
| **Kitchen** | Prep / hand-off stage of fulfilling an Order (visibility around Preparing → Ready) |
| **Shift** | Operating period container — Pattern is cross-Module; Module-local only for MVP limits |
| **Settlement** | Economic close of a period or work (fees, dues) — Pattern / later Shared; not Order itself |
| **PaymentAcceptance** | Thin money acceptance snapshot on Order in v1 (method, paid/remaining, proof) |
| **RestaurantEmployee** | Module assignment of a Core Membership into restaurant work (roles) — not a second employee Aggregate |
| **Assigned Staff** | Synonym in prose for who is acting / assigned on an Order or Fulfillment |
| **Channel** | Intake path of an Order (counter, web, phone, aggregator, …) — not a Work Unit |

---

## Forbidden synonyms (in Contracts)

| Avoid | Use instead |
|-------|-------------|
| Cart / Basket as domain root | **Order** |
| Delivery (as Aggregate / Module thesis) | **Fulfillment** with `mode = delivery` |
| Driver Aggregate | Fulfillment assignee + role `pilot` / Assigned Staff |
| StaffMember Aggregate | **RestaurantEmployee** (assignment) + Core Membership |
| Customer (platform Identity) | **Guest** (Module party) |
| Visit | Salon term only — Restaurant uses **Order** |
| Invoice as primary work | **Order** (+ Settlement later) |

---

## One-line summary

**Same words everywhere: Order is work; Fulfillment is how; Guest is who; Reservation is a parallel promise; Shift is the period; Settlement is money-close — not synonyms, not peer roots.**
