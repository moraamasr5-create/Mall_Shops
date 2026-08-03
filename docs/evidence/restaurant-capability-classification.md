# Restaurant Capability Classification

**Date:** 2026-07-19  
**Source:** AbuKhater operational reference + ADOPTED [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md).  
**Purpose:** Classify every extracted concept into **exactly one** of:

1. Core  
2. Restaurant Module  
3. Shared Platform Capability  
4. Platform Policy  
5. Infrastructure  
6. Ignore  

**No seventh class.** If a Capability Map idea named “Tenant Configuration” appears, it is placed under **Platform Policy** (rules of interpreting day/locale) plus **Restaurant Module** (concrete values) — never as a new extraction class.

**Authority:** Restaurant Reference Extraction (Analysis Only).  
**Does not authorize:** Shared builds, Restaurant Module implementation, Core changes.

---

## 1. Core

| Concept | Why Core | Why not elsewhere |
|---------|----------|-------------------|
| Identity binding (JWT / request identity) | Every app needs who is acting | Not Order/Visit workflow |
| Tenant isolation | Boundary of the place’s data | Module must not redefine tenancy |
| Membership + platform roles | Who may act in a Tenant | Module grants sit on top |
| Module activation | Which Modules a Tenant bought | Restaurant must not own Salon activation |
| Platform RBAC primitives | Uniform authz shell | `restaurant:*` strings stay Module |
| HTTP / request plumbing (Mall_Shops shape) | Request envelope | Not a business Capability |

**Core Mission check:** Core must not understand Order, menu, pilot, kitchen, or “restaurant day.”

AbuKhater’s browser PIN login is **not** Core evidence — see **Ignore**.

---

## 2. Restaurant Module

| Concept | Why Restaurant Module | Why not Shared / Core |
|---------|----------------------|------------------------|
| **Order** (primary Work Unit) | Vertical work performed | Same *pattern* as Visit; different Aggregate |
| **OrderLine** | Lines of that Order | Not shared tables with Salon |
| Menu / category / availability | Restaurant catalog language | Salon has Service catalog |
| Guest / customer of the place | Restaurant clientele | ≠ platform Identity |
| Cashier / admin operational roles | Vertical staffing of the loop | Platform role shell is Core |
| Pilot / driver resource | Delivery workforce for this vertical | Not a platform-wide “Driver” Core type |
| Per-order trip lifecycle | Restaurant delivery fulfillment | Salon has no trip Aggregate |
| Confirm → prepare intent | Restaurant commitment step | Module business rule |
| Channel normalization (web / call-center / aggregator / trip) | How this restaurant intakes work | Channels are Module; Pattern of multi-channel intake may later inform Shared — Trigger not met from one Module |
| Reservation (+ deposit) | Parallel restaurant promise | Not primary Work Unit; not Core |
| Feedback | Place-specific post-hoc | Not Identity |
| Geo / neighborhood / delivery fee tables | Accepting a delivery job | Vertical pricing |
| Payment snapshot on Order (method, paid_now, remaining, proof) | Fulfillment acceptance fields | Settlement *product* is Shared candidate; fields on Order stay Module |
| Orphan Order ↔ Shift window attribution | Sales honesty for this ops model | Module integrity rule |
| Overnight clock values (e.g. 06:00–04:00) | Place/Module operating hours | Timezone *interpretation* is Platform Policy |
| Pilot fee-share / attendance pay formulas | Local economics | Not Core; not Shared until multi-Module payroll Pattern proven |
| Kitchen availability toggles | Catalog sellability | Not a Shared “Inventory” product from this evidence alone |
| Aggregator-specific earnings rules | Channel economics | Module |

---

## 3. Shared Platform Capability

Build **only** when Capability Map **Trigger for Build** is met + Platform Pattern Extraction + authorizing OP. Status below = **candidate from evidence**, not authorization.

| Capability (map name) | Observed in AbuKhater (surface) | Operational Pattern (why) | Trigger status vs map |
|-----------------------|---------------------------------|---------------------------|------------------------|
| Day/period Container (Shift) | Restaurant Shift open/close; overnight logical date; close gate | Operations belong in a bounded period | Candidate strengthened (Salon Ezz also showed Shift; Salon MVP runs without it). Still **not built**; needs OP |
| Artifact delivery | Kitchen + cashier print on confirm | Workflow step produces durable hand-off Artifact | Candidate; print is a *channel* |
| Printing (channel) | Thermal/iframe print path | One channel for Artifact | Candidate only if ≥2 Modules need print specifically |
| Notifications | Realtime Inbox + polling fallback; historical Telegram alerts | Actors need awareness of new/changed work | Candidate |
| Traceability / Activity | Status history, assignments, payment screenshots, بون ids | Material changes must be auditable | Candidate |
| Capacity contention (Queue) | Pilot fair queue + hard load (not a waiting-room ticket board) | More demand than mobile capacity | Candidate — **shape differs** from Salon queue; do not copy Salon Queue tables; extract Pattern later |
| Settlement / Billing | End-of-Shift pilot dues + day cash picture; COD vs prepaid | Economic settlement separable from Work Unit | Candidate |
| Reporting aggregates | Pilot/shift reports, delay metrics, JSON export | Feedback on work in a period | Candidate |
| Offline / sync resilience | Offline queue + idempotent mutations | Operate when network fails | Candidate |

**Explicitly not Core:** Shift, Artifact, Queue/dispatch, Billing, Notifications, Reports, Offline.

**Explicitly not bloating Order:** do not fold Shift payroll, print drivers, or notification buses into the Order Aggregate (OP-005 anti-bloat applied by analogy).

---

## 4. Platform Policy

| Policy | AbuKhater signal | Why Platform Policy |
|--------|------------------|---------------------|
| Timezone Policy | All shift governance in `Africa/Cairo`; overnight day | How platform interprets “now” / business day — not a Module Feature |
| Currency Policy | EGP amounts, rounding assumptions | Allowed currencies / rounding — Tenant picks within policy |
| Locale | RTL Arabic-first ops | Default locale / RTL expectations |
| Audit Retention | History/screenshots kept for dispute | How long artifacts/activity kept — not a buyable Capability |

Place-specific clock times and fee tables are **not** Policy; they are Module/place values under Policy.

---

## 5. Infrastructure

| Item | Why Infrastructure |
|------|--------------------|
| Supabase (or any DB) as persistence adapter | Storage plumbing |
| Realtime subscription + polling fallback | Transport |
| Object storage for payment/reservation screenshots | File adapter |
| Offline mutation queue implementation | Sync plumbing for Shared Offline Pattern |
| Applied-mutation idempotency table | Correctness of replay — not domain |
| Thermal printer / browser print iframe | Print channel adapter |
| Capacitor packaging of customer menu | Mobile shell |
| Hosting (Vercel, etc.) | Deploy |

Infrastructure must not redefine Order/Visit meaning.

---

## 6. Ignore

| Item | Why Ignore |
|------|------------|
| Brand أبو خاطر, Mataria GPS pin, hardcoded neighborhoods | Single-business residue |
| Hardcoded manager name list | Not a permission model |
| PIN passwords in localStorage (`8080`, etc.) | Accidental security theater |
| Dual EN/AR status vocabularies | Migration residue |
| n8n webhooks + Drive thumbnail hacks | Legacy automation path |
| Empty `C-Supabase_plan` folder | Non-evidence |
| Telegram edge “hello” stub | Non-product |
| Duplicate PaymentPage / cart vs multi-step deposit inconsistency | Implementation drift |
| `KitchenView` named kitchen but only availability | Naming accident |
| Incomplete `driver` login role in Inbox filters | Incomplete UI |
| Google Drive menu image quirks | Content pipeline accident |
| Owner phones / comments in source headers | Personal residue |
| Cap of 2 duplicate بون numbers, grace `pending_timer` ~5s | Local UX heuristics — do not elevate to platform law without multi-site evidence |

---

## 7. Classification decision table (quick lookup)

| Concept | Class |
|---------|-------|
| Order | Restaurant Module |
| Visit (Salon) | *(Salon Module — out of Restaurant scope; listed for contrast only)* |
| Shift | Shared Platform Capability |
| Kitchen ticket Artifact | Shared Platform Capability |
| Print adapter | Infrastructure |
| Pilot + Trip | Restaurant Module |
| Fair dispatch / load cap Pattern | Shared Platform Capability (candidate) |
| Menu / Guest / Staff | Restaurant Module |
| Reservation | Restaurant Module |
| Settlement at close | Shared Platform Capability |
| Fee-share formulas | Restaurant Module / Ignore (economics) |
| Timezone of day | Platform Policy |
| Identity / Tenant / Membership | Core |
| Offline idempotent replay | Infrastructure (+ Shared Offline Pattern) |
| Brand GPS / PIN theater / n8n | Ignore |

---

## 8. Ambiguities (still forced into one class)

| Topic | Chosen class | Why this class | Residual doubt |
|-------|--------------|----------------|----------------|
| Multi-channel intake | **Restaurant Module** | Only one vertical proven | If Clinic/Gym later need same “normalize channels into Work Unit,” Pattern Extraction may promote a Shared *intake* Pattern — Trigger not met now |
| Pilot dispatch vs Salon queue | **Shared** Pattern candidate; **Restaurant Module** Aggregates | Pattern is Capacity Contention; data stays Module | Founder must not merge Pilot with Salon Queue tables |
| Reservation | **Restaurant Module** | Parallel track in one vertical | Not Shared Booking without ≥2 Modules |
| Payment fields on Order | **Restaurant Module** | Acceptance snapshot | Settlement Capability remains Shared and separate |
| Tenant Configuration (map §4) | Split: **Platform Policy** + Module values | User forbids 7th class | Map still uses Tenant Configuration as placement vocabulary in Mall_Shops — this extraction maps it into Policy + Module |

---

## 9. One-line summary

**Core** = shell; **Restaurant Module** = Order + restaurant language + delivery workforce; **Shared** = Shift / Artifact / Settlement / Offline / Capacity / Notify / Trace / Report *candidates*; **Platform Policy** = timezone/currency/locale/retention; **Infrastructure** = adapters; **Ignore** = AbuKhater accidents.
