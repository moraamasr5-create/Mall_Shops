# Restaurant Aggregate Map

**Date:** 2026-07-19  
**Source:** AbuKhater operational reference (`Full_PROv1.zip`) — business boundaries only.  
**Purpose:** Aggregate boundaries, responsibilities, invariants. **No SQL. No schema design for Mall_Shops.**  
**Authority:** Restaurant Reference Extraction (Analysis Only).  
**Related:** [restaurant-operational-workflow.md](./restaurant-operational-workflow.md), [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md).

**Classification:** Core · Restaurant Module · Shared Platform Capability · Platform Policy · Infrastructure · Ignore

---

## 1. Primary Aggregate — Order

| Field | Content |
|-------|---------|
| **Name** | Order |
| **Classification** | **Restaurant Module** |
| **Role** | Primary Operational Work Unit for Restaurant (Capability Map § Platform rule) |
| **Responsibility** | Represent one customer fulfillment job: intake channel, party served, lines (or fee-only trip), payment snapshot, status through completion/cancel/fail, link to operating Shift and (when delivery) assigned pilot/trip |
| **Contains** | Order lines; payment snapshot fields; status; channel/source; delivery vs pickup intent; optional external receipt/aggregator id |
| **Does not own** | Shift open/close rules; pilot attendance payroll; kitchen printer drivers; platform Identity; Tenant Membership |

### Invariants (business)

1. An Order is the unit staff progress through the day — not “a cart UI” and not “a fiscal invoice product.”
2. Food Orders have lines; fee-only trip Orders may have **no** kitchen lines but remain Orders (same root).
3. Creating an Order for the live day requires an **open restaurant Shift** (source rule).
4. Closing the restaurant Shift is blocked while Orders remain in active (non-terminal) statuses.
5. Confirm is the commitment point: after confirm, kitchen hand-off (Artifact) is expected for food Orders.
6. Terminal outcomes: delivered/completed, failed delivery, or cancelled — one terminal fate per Order.
7. Price/fee amounts on the Order are snapshots of what was accepted at intake (do not silently mutate history for reporting honesty).

### Secondary attachments (not peer roots)

| Attachment | Relation to Order | Classification |
|------------|-------------------|----------------|
| Kitchen / cashier print | Artifact produced at confirm (and reprint on assign) | **Shared** (Artifact) + **Infrastructure** (print channel) |
| Pilot assignment | Capacity allocation against Order | **Restaurant Module** |
| Per-order trip | Lifecycle of leaving the shop with that Order | **Restaurant Module** |
| Payment proof image | Evidence for digital prepaid | **Restaurant Module** content; storage → **Infrastructure** |

---

## 2. OrderLine

| Field | Content |
|-------|---------|
| **Name** | OrderLine |
| **Classification** | **Restaurant Module** |
| **Role** | Line of work/sale under Order (rename+apply of Salon VisitService pattern) |
| **Responsibility** | Item identity (when known), display name, quantity, unit price snapshot, notes/modifiers as accepted |
| **Invariants** | Belongs to exactly one Order; unavailable catalog items must not be newly sold; free-text lines may exist for call-center reality but should prefer catalog link when possible |

---

## 3. Menu / Catalog (+ Category)

| Field | Content |
|-------|---------|
| **Name** | MenuItem / Category |
| **Classification** | **Restaurant Module** |
| **Role** | Sellable catalog (rename+apply of Salon Service catalog) |
| **Responsibility** | What can be ordered; grouping; availability for sale |
| **Invariants** | Unavailable ⇒ not sellable at front; catalog language is restaurant-specific (not Core) |

---

## 4. Guest / Customer

| Field | Content |
|-------|---------|
| **Name** | Guest (customer of the place) |
| **Classification** | **Restaurant Module** |
| **Role** | Party served / ordering party (parallel to SalonCustomer) |
| **Responsibility** | Contact and delivery location needed to fulfill; not platform login Identity |
| **Invariants** | Guest ≠ Core Identity user; walk-in/call may carry minimal identity |

---

## 5. Staff (Cashier / Admin)

| Field | Content |
|-------|---------|
| **Name** | Restaurant staff operator |
| **Classification** | **Restaurant Module** (role meaning); authz shell → **Core** |
| **Role** | Humans who run Shift, confirm Orders, dispatch |
| **Responsibility** | Operational decisions; Module permission vocabulary (`restaurant:*` later) sits on Core Membership |
| **Invariants** | Platform Membership/RBAC primitives stay Core; browser PIN theater in AbuKhater → **Ignore** |

---

## 6. Shift (restaurant operating period)

| Field | Content |
|-------|---------|
| **Name** | Shift (day/period container) |
| **Classification** | **Shared Platform Capability** candidate |
| **Role** | Bound operations and accountability to one operating period |
| **Responsibility** | Open/close; logical business date (may overnight); association of Orders to the period; close gate; day report snapshot hook |
| **Does not own** | Order line items; kitchen recipes; Module catalogs |
| **Invariants** | At most one open restaurant Shift for a logical date (source); close requires no blocking active work; timezone of “now” follows **Platform Policy**; concrete open/close clock times are place/Module config |

**Boundary note:** Shift ≠ Order. Order is work *inside* the period.

---

## 7. Pilot (delivery workforce) + Trip

| Field | Content |
|-------|---------|
| **Name** | Pilot; Trip (per Order) |
| **Classification** | **Restaurant Module** |
| **Role** | Mobile capacity resource + leaving-the-shop lifecycle for an assigned Order |
| **Responsibility** | Attendance open/close; available vs on-delivery; assignment load; start/complete/fail trip |
| **Invariants** | Assign only when on duty and available; capacity ceiling while holding active assigned work; return to available only when no remaining assigned/active Orders for that pilot; trip start only from assigned state |

**Pattern hint (not Aggregate promotion):** scarce mobile capacity / fair dispatch → may later inform a **Shared** Capacity Contention shape — but Pilot tables stay Module-owned.

---

## 8. Kitchen ticket (Artifact, not Aggregate root)

| Field | Content |
|-------|---------|
| **Name** | Kitchen / cashier ticket |
| **Classification** | **Shared Platform Capability** (Artifact pattern); print path → **Infrastructure** |
| **Role** | Durable hand-off of confirmed Order content to cooks/cashier |
| **Responsibility** | Represent what to prepare; reprintable |
| **Invariants** | Produced at confirm for food Orders; **not** a second primary work unit; AbuKhater does not evidence a persisted kitchen-ticket Aggregate with prep states |

---

## 9. Reservation

| Field | Content |
|-------|---------|
| **Name** | Reservation |
| **Classification** | **Restaurant Module** |
| **Role** | Parallel promise (table/cafe booking + deposit) — **not** the primary Work Unit |
| **Responsibility** | Hold time, party size, deposit proof, confirm with reference |
| **Invariants** | Separate state machine from Order; deposits may appear in day cash picture; must not replace Order as primary root |

**Ambiguity (documented, not a 7th class):** If a future Restaurant Module drops delivery and is dine-in-only, Reservation might grow — still Module, still not Core. Do not invent Shared “Booking” without multi-Module Trigger.

---

## 10. Payment snapshot (on Order) vs Settlement

| Concept | Classification | Boundary |
|---------|----------------|----------|
| Payment method / paid_now / remaining / proof on Order | **Restaurant Module** fields supporting fulfillment | Belongs with Order acceptance — not a Core concept |
| Period settlement (pilot shares, attendance pay, day totals) | **Shared Platform Capability** candidate (Settlement / Billing) | Separable from Order Aggregate; do not bloat Order into payroll engine |
| Concrete EGP / InstaPay / Vodafone rules | **Restaurant Module** or **Ignore** (market-specific) | Not Core |

---

## 11. Feedback

| Field | Content |
|-------|---------|
| **Name** | Feedback |
| **Classification** | **Restaurant Module** |
| **Role** | Post-hoc guest complaint/suggestion |
| **Invariants** | Outside Order happy-path; admin review only |

---

## 12. Applied mutation / offline replay record

| Field | Content |
|-------|---------|
| **Name** | Idempotent mutation record |
| **Classification** | **Infrastructure** (supports **Shared** Offline/sync Pattern) |
| **Role** | Prevent double assign/trip/complete on replay |
| **Invariants** | Same client mutation id ⇒ same prior result; not a business Aggregate |

---

## 13. App / place operating window config

| Field | Content |
|-------|---------|
| **Name** | Shift open/close clock settings |
| **Classification** | Place config consuming **Platform Policy** (Timezone Policy); values → **Restaurant Module** / Tenant Configuration *concept* (map §4 — not a 7th extraction class; classified here as **Platform Policy** + Module values) |
| **Responsibility** | Define when open/close is allowed |
| **Invariants** | Policy defines how “day”/timezone is interpreted; Tenant/Module supplies clock times |

---

## 14. Explicitly not Aggregates (in this reference)

| Surface | Why not an Aggregate root | Classification |
|---------|---------------------------|----------------|
| Cart UI | Checkout metaphor | **Ignore** (UX) |
| Inbox list | View of Orders | **Ignore** (UX) |
| SIMPLE_MENU hardcoded modifiers | Implementation shortcut | **Ignore** |
| n8n / Telegram stubs | Legacy automation | **Ignore** / **Infrastructure** |
| Dual EN/AR status strings | Migration residue | **Ignore** (normalize in any future Module design — out of scope here) |
| Branch as multi-tenant product | Not evidenced as platform Tenant model | Do not invent; multi-location → later **Core**/Tenant concern, not from this extraction |

---

## 15. Aggregate map (rename + apply vs Salon)

| Pattern | Salon (reference) | Restaurant (this extraction) | Classification |
|---------|-------------------|------------------------------|----------------|
| Catalog | Service | Menu item / category | Module |
| Performer | Employee | Staff / station / pilot | Module |
| Party served | Customer | Guest | Module |
| **Primary Work Unit** | **Visit** | **Order** | Module |
| Lines + snapshot | VisitService | OrderLine | Module |
| Period container | (not in Salon MVP) | Shift | **Shared** candidate |
| Post-completion Artifact | (not in Salon MVP) | Kitchen/cashier ticket | **Shared** candidate |
| Capacity contention | (Ezz queue; not Salon MVP) | Pilot dispatch load | **Shared** candidate (different shape) |

---

## 16. One-line summary

**Order** is the only primary Aggregate; **OrderLine / Menu / Guest / Staff / Pilot+Trip / Reservation** are Restaurant Module neighbors; **Shift**, **Artifact**, **Settlement**, and **Offline idempotency** are Shared/Infrastructure candidates around that root — never Core vertical meaning.
