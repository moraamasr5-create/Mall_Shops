# Restaurant Operational Workflow

**Date:** 2026-07-19  
**Source:** Founder-provided archive `Full_PROv1.zip` (AbuKhater — `A-Menu_users` + `B-Dashborad_res`; `C-Supabase_plan` empty)  
**Purpose:** Real restaurant **business workflow** only — not code, UI, schema, or architecture to copy into Mall_Shops.  
**Authority:** Founder assignment — Restaurant Reference Extraction (Analysis Only).  
**Companion map:** [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md) (ADOPTED).  
**Parallel Salon reference:** [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md).

**Classification legend** (exactly one class per concept)

| Class | Meaning |
|-------|---------|
| **Core** | Platform foundation independent of vertical (Identity, Tenant, Membership, module activation, platform RBAC shell) |
| **Restaurant Module** | Restaurant-domain language, work unit, catalogs, and vertical rules |
| **Shared Platform Capability** | Cross-Module Pattern candidate — build only after Trigger + Pattern Extraction + OP |
| **Platform Policy** | Cross-tenant operating rules (timezone “day”, currency, retention, locale) |
| **Infrastructure** | Adapters, hosting, printers, storage, sync plumbing — not domain |
| **Ignore** | Accidental / brand-specific / legacy / implementation residue — do not promote |

**Non-goals:** No Mall_Shops implementation, no Core/Salon change, no Shared builds, no Prisma/SQL/APIs.

### Core thesis (aligned with Constitution + Capability Map)

> **Day is about work performed.**  
> In Restaurant, the primary Operational Work Unit is **Order**.  
> Shift, kitchen ticket, delivery trip, reservation, and settlement attach **around** Order — they are not peer roots inventing a second primary unit.

**Source shape note:** AbuKhater evidence is a **delivery-heavy** restaurant workday (web/call-center/aggregator → confirm → kitchen print → pilot trip → close). True table-service dine-in seating is **not** evidenced as a first-class flow. Extraction stays within what the source shows.

---

## 1. Roles

| Role | What they do in the workday | Classification |
|------|----------------------------|----------------|
| Customer / guest | Browse menu; choose delivery or pickup; give location/phones; pay or leave deposit proof; optionally reserve; leave feedback | **Restaurant Module** (party served); platform Identity ≠ guest |
| Cashier / front operator | Open/close restaurant Shift (with credential); intake call-center / tablet / trip orders; confirm orders; assign pilots; print tickets; manage reservations | **Restaurant Module** (staff role pattern); platform RBAC primitives stay **Core** |
| Admin / supervisor | Same as cashier + reports, feedback review, force-close Shift, force-reopen pilot attendance, edit shift window | **Restaurant Module** privilege layer on top of **Core** Membership |
| Pilot / delivery driver | Open attendance; receive assignments while at restaurant; leave on trip; complete/fail delivery; close attendance | **Restaurant Module** (workforce/capacity resource for delivery) |
| Kitchen | Receives paper tickets on confirm; toggles item availability (“sold out”) | **Restaurant Module** (prep station) — not a separate logged-in identity in the source |
| Aggregator channel (e.g. Talabat tablet) | External order number entered by cashier into the same Order machine | **Restaurant Module** intake channel |

---

## 2. Primary operational work unit

| Question | Answer | Classification |
|----------|--------|----------------|
| Primary Work Unit | **Order** | **Restaurant Module** |
| Lines | Catalog (or free-text) lines under that Order | **Restaurant Module** |
| Day container | Restaurant **Shift** (overnight window) | **Shared Platform Capability** candidate (Day/period Container) — already on Capability Map |
| Secondary around Order | Kitchen print artifact, pilot assignment, per-order trip, payment snapshot | See Aggregate Map |

Everything that moves food **or** a fee-only delivery job becomes an Order bound to a restaurant Shift.

---

## 3. End-to-end workday scenarios

| # | Scenario | Business flow | Classification |
|---|----------|---------------|----------------|
| S1 | Open the operating day | Staff opens **restaurant Shift** inside configured window (source default Cairo overnight); resume if already open for logical date | Shift → **Shared** candidate; window values → **Restaurant Module** / place config; timezone interpretation → **Platform Policy** |
| S2 | Open driver attendance | Pilots open attendance → available for assignment | **Restaurant Module** |
| S3 | Online delivery order | Guest: menu → delivery details → payment (+ proof if digital) → Order created → Inbox | **Restaurant Module** |
| S4 | Pickup order | Guest chooses pickup; pay-now / deposit rules differ; still an Order | **Restaurant Module** |
| S5 | Call-center / restaurant counter order | Cashier enters receipt (بون) + customer + area/fee + payment → Order (`manual`) | **Restaurant Module** |
| S6 | Aggregator tablet order | Cashier enters external order id + fee → Order (`talabat`-class source) | **Restaurant Module** intake; fee-share rules stay Module |
| S7 | Extra trip (fee-only) | Cashier creates trip Order with no kitchen lines | **Restaurant Module** (secondary Order type — still Order root) |
| S8 | Confirm → cook hand-off | Staff confirms → kitchen + cashier **print** → Order awaits dispatch | Confirm/close step of work → **Restaurant Module**; Artifact/print → **Shared** candidate |
| S9 | Assign → trip → deliver/fail | Fair-queue suggestion → assign → start trip → complete or fail | Dispatch/trip → **Restaurant Module**; scarce-capacity Pattern → **Shared** candidate |
| S10 | Reservation (restaurant / cafe) | Book guests + time + deposit → staff confirm | **Restaurant Module** (parallel track — not Order) |
| S11 | Mid-day stockout | Kitchen marks item unavailable; front cannot sell it | **Restaurant Module** catalog availability |
| S12 | Close the operating day | Clear active Orders; close pilot attendance; close restaurant Shift; archive day stats; reset pilots | Close gate → **Shared** (Shift) + **Restaurant Module** settlement rules |

---

## 4. Workflows (sequences)

### W1 — Restaurant Shift lifecycle

```
CLOSED → OPEN → (orders + pilot attendance) → CLOSE → CLOSED
```

- Logical **business date** may cross midnight (overnight day).
- Close blocked while “active” Orders exist or pilot attendance still open (source invariant).
- Admin may force-close outside window.

| Element | Classification |
|---------|----------------|
| Shift as day/period container | **Shared Platform Capability** |
| Overnight window numbers, force-close politics | **Restaurant Module** (or place config consuming **Platform Policy** timezone) |
| PIN/localStorage auth for open/close | **Ignore** (implementation) |

### W2 — Order intake (channel-normalized)

```
Channel (web | call-center | aggregator | trip)
  → Create Order (+ lines when food)
  → Bind to open Shift
  → Appear for staff confirmation
```

| Element | Classification |
|---------|----------------|
| One Order machine for all channels | **Restaurant Module** |
| Channel labels / Talabat fee share | **Restaurant Module** |
| n8n / webhook migration residue | **Ignore** |

### W3 — Confirmation and kitchen hand-off

```
pending → confirm
  → print kitchen ticket + cashier copy
  → preparing / waiting for driver
```

| Element | Classification |
|---------|----------------|
| Confirm as commitment to fulfill | **Restaurant Module** |
| Paper ticket as prep Artifact | **Shared Platform Capability** (Artifact; print is a channel) |
| Digital kitchen ticket board (prep→ready) | **Not evidenced** — do not invent |

### W4 — Delivery dispatch and trip

```
waiting for driver
  → assign pilot (capacity + fairness)
  → start trip (leave restaurant)
  → delivered | failed
```

| Element | Classification |
|---------|----------------|
| Pilot load, fair return-time rotation, per-order trip | **Restaurant Module** |
| Pattern: scarce mobile capacity / dispatch | **Shared Platform Capability** candidate (related to Capacity Contention — different shape than Salon queue) |
| Hardcoded max load / pay formulas | **Restaurant Module** rules today; numeric constants → treat as Module until multi-Module evidence |

### W5 — Settlement (end of period)

```
During day: paid_now vs remaining (COD / prepaid)
At close: pilot fee share + attendance pay + reservation deposits → day picture
```

| Element | Classification |
|---------|----------------|
| Economic settlement separable from Order Aggregate | **Shared Platform Capability** (Settlement / Billing) |
| Egyptian methods, fee-split formulas, attendance pay math | **Restaurant Module** / **Ignore** (brand economics) — do not put formulas in Core |
| Refunds | **Not evidenced** |

### W6 — Close day

```
Finish / cancel / fail remaining active Orders
  → close pilot attendance
  → close restaurant Shift
  → persist day report snapshot
  → reset pilot counters for next day
```

| Element | Classification |
|---------|----------------|
| Accountability gate at period close | **Shared Platform Capability** (Shift) |
| Orphan Order attribution inside window | **Restaurant Module** integrity rule (sales honesty) |

---

## 5. Business-meaningful state machines

| Machine | States (conceptual) | Classification |
|---------|---------------------|----------------|
| Restaurant Shift | closed ↔ open | **Shared** candidate |
| Order | pending → confirmed/preparing → assigned → out for delivery → delivered \| failed \| cancelled | **Restaurant Module** |
| Pilot attendance | off ↔ on duty | **Restaurant Module** |
| Pilot ops while on duty | available ↔ on delivery | **Restaurant Module** |
| Reservation | pending → confirmed | **Restaurant Module** |
| Menu item availability | available ↔ unavailable | **Restaurant Module** |

**Not evidenced as first-class:** kitchen prep queue states; table seat map; formal refund state.

---

## 6. Customer interaction channels

| Channel | Business meaning | Classification |
|---------|------------------|----------------|
| Web / PWA menu | Self-serve Order intake | **Restaurant Module** |
| Phone / call center | Staff-entered Order | **Restaurant Module** |
| Aggregator tablet | External Order normalized in | **Restaurant Module** |
| Walk-in / takeaway / hall (label on print) | Counter Order without digital table map | **Restaurant Module** |
| Map / neighborhood / GPS | Delivery eligibility & fee | **Restaurant Module** |
| Reservation modal | Parallel booking promise | **Restaurant Module** |
| Feedback form | Post-hoc complaint/suggestion | **Restaurant Module** |
| Capacitor shell, Telegram/n8n stubs, Drive image hacks | Packaging / legacy automation | **Ignore** / **Infrastructure** |

---

## 7. Management decisions the workday requires

| Decision | Why it exists | Classification |
|----------|---------------|----------------|
| Open / resume / close Shift | Bound work and money to a day | **Shared** (Shift) + Module rules |
| Confirm or cancel Order | Commit or abandon fulfillment | **Restaurant Module** |
| Assign / reassign pilot; start / complete / fail trip | Move Order through delivery | **Restaurant Module** |
| Toggle sold-out items | Stop selling what kitchen cannot make | **Restaurant Module** |
| Confirm reservation + deposit | Parallel cash promise | **Restaurant Module** |
| Force-close / force-reopen attendance | Exception path when reality breaks the happy path | **Restaurant Module** (governance privilege) |
| Read day report (by pilot / source / delays) | Feedback on work in the period | **Shared** candidate (Reporting) |
| Replay offline mutations safely | Continue ops when network fails | **Shared** candidate (Offline / sync) |

---

## 8. One-line summary

AbuKhater’s restaurant day is: **open Shift → intake Orders from several channels → confirm and print → dispatch pilots → complete/fail trips → close Shift with settlement**. The primary unit is **Order**; everything else is clothing around that unit.
