# Ezz (BarberySmart) — Business Workflow Reference Extraction

**Date:** 2026-07-19  
**Source:** Founder-provided archive `Ezz-main.zip` (BarberySmart POS & Care)  
**Purpose:** Business knowledge only — **not** code, UI, or architecture to copy into Mall_Shops.  
**Authority:** Founder assignment — classify for reuse under Constitution / Module boundaries.  
**Non-goals:** No implementation, no schema changes, no Mall_Shops design changes from this document.

**Classification legend**

| Class | Meaning |
|-------|---------|
| **Core** | Generic to all businesses on the platform (identity, tenancy, membership) |
| **Shared Platform Capability** | Likely useful to multiple Modules later (extract only with Evidence + Capability Extraction session) |
| **Salon Module** | Salon-domain meaning / workflow owned by Salon |
| **Not Needed for MVP** | Defer past current Salon MVP Operational Loop (OP-005) / Internal Pilot |

**Mall_Shops mapping note (conceptual only):** Salon MVP today ≈ Setup + `SalonVisit` / `SalonVisitService`. Ezz’s richer POS/Queue/Invoice stack is a **workflow reference**, not a backlog.

### Core thesis (Founder-reinforced)

> **Day is about work performed.**  
> The system does not exist to manage rows of data; it exists to run a **workday**.  
> That is why **Visit** exists.

Capabilities (Printing, Queue, …) are optional clothing around that thesis — not replacements for it.

---

## 1. Roles

| Role (Ezz behavior) | What they do | Classification |
|---------------------|--------------|----------------|
| Reception / Cashier (POS operator) | Opens shift, builds cart, registers customer, closes sale, manages queue from tablet | **Salon Module** (role pattern); platform RBAC roles stay **Core** |
| Barber / Stylist | Performs service; appears on dashboard / commission view | **Salon Module** (≈ Employee) |
| Customer (self-service) | Check-in / join queue (QR screen) | **Salon Module** interaction; identity of end-customer ≠ platform Identity |
| Manager / Owner (dashboard) | Sees barber performance, sales aggregates | **Salon Module** reporting today; multi-module reports later → **Shared** candidate |
| Branch context | `branch_id` scopes events | **Core** / Tenant settings candidate (multi-location) — **Not Needed for MVP** as separate Branch product |

---

## 2. End-to-end scenarios (business day)

| # | Scenario | Flow (business) | Classification |
|---|----------|-----------------|----------------|
| S1 | Open the working day | Operator opens **Shift** → shop can sell / queue | **Shared Platform Capability** (Shift) · **Not Needed for MVP** (Salon Visit day works without formal Shift) |
| S2 | Customer arrives (no queue) | Name/phone → select services → assign barber → pay/complete | **Salon Module** operating loop (maps to Visit open → services → close); payment piece → **Not Needed for MVP** / later Billing |
| S3 | Customer arrives (with queue) | Check-in → ticket WAITING → call SERVING → service → COMPLETED/CANCELLED | **Shared Platform Capability** (Queue) · **Not Needed for MVP** |
| S4 | Multi-service sale | Cart of several services under one transaction | **Salon Module** (VisitService lines already cover multi-service work) |
| S5 | Walk-in / cash customer | Minimal customer identity on the ticket/invoice | **Salon Module** (Customer / walk-in) |
| S6 | Close sale + receipt | Invoice created → thermal receipt (+ care tips) | Invoice/Print → **Shared** candidates · Care tips → **Salon Module** · all **Not Needed for MVP** except “close the work unit” |
| S7 | Barber performance glance | Revenue / commission / counts per barber | **Salon Module** analytics · **Not Needed for MVP** |
| S8 | Close the working day | Shift CLOSING → CLOSED (cash expected / review) | **Shared** (Shift close) · **Not Needed for MVP** |
| S9 | Offline continue selling | Work without network; sync later | **Shared** (sync/offline) · **Not Needed for MVP** (ops concern, not Salon domain) |
| S10 | Live waiting-room display | Public board of queue tickets | **Shared** (Queue display) · **Not Needed for MVP** |

---

## 3. Workflows (sequences)

### W1 — Shift lifecycle

```
CLOSED → OPEN → (operations) → CLOSING → CLOSED
```

| Element | Classification |
|---------|----------------|
| Shift as “day container” | **Shared Platform Capability** · **Not Needed for MVP** |

### W2 — Queue ticket lifecycle

```
JOINED (WAITING) → SERVING → COMPLETED
                 ↘ CANCELLED
```

| Element | Classification |
|---------|----------------|
| Queue ticket + position | **Shared Platform Capability** · **Not Needed for MVP** |

### W3 — Sale / service delivery (POS cart → invoice)

```
(optional queue serving)
  → Select customer
  → Select barber
  → Add services (cart)
  → Apply discount (optional)
  → Create invoice / transaction
  → Print receipt + care tips
  → Complete queue ticket (if any)
```

| Element | Classification |
|---------|----------------|
| Select customer + services + responsible stylist + finish work | **Salon Module** (aligns with Visit loop) |
| Cart as UI metaphor | Salon UX — not a Core concept |
| Discount / payment method / final_amount | **Shared** (Billing) · **Not Needed for MVP** |
| Invoice as fiscal document | **Shared** (Billing) · **Not Needed for MVP** |
| Care tips from services | **Salon Module** · **Not Needed for MVP** |

### W4 — Catalog setup (implicit)

```
Maintain barbers + services (+ categories, care text)
```

| Element | Classification |
|---------|----------------|
| Barber, Service catalog | **Salon Module** (Employee, Service) — **already in Mall MVP Setup** |
| Service category taxonomy (شعر/ذقن/…) | **Salon Module** · **Not Needed for MVP** as hard taxonomy |
| Commission rate on barber | **Salon Module** · **Not Needed for MVP** |

---

## 4. System states (business-meaningful)

| State machine | States | Classification |
|---------------|--------|----------------|
| Shift | `CLOSED`, `OPEN`, `CLOSING` | **Shared** · **Not Needed for MVP** |
| Queue ticket | `WAITING`, `SERVING`, `COMPLETED`, `CANCELLED` | **Shared** · **Not Needed for MVP** |
| Transaction / invoice | Created (sold); sync flags `is_synced` | Sale completion → **Salon** work unit; sync flag → **Shared**/ops · fiscal invoice → **Not Needed for MVP** |
| Network | Online / Offline | **Shared**/ops · **Not Needed for MVP** as product feature |
| Service | active / inactive | **Salon Module** (already) |

**Mall MVP already owns:** Visit `open` / `closed` / `cancelled` — keep; do **not** replace with Ezz’s Invoice/Queue states for MVP.

---

## 5. Interaction points (touchpoints)

| Touchpoint | Actor | Classification |
|------------|-------|----------------|
| POS / cashier screen | Reception | **Salon Module** UX |
| Service grid / cart / payment panel | Reception | **Salon Module** UX; payment panel → **Not Needed for MVP** |
| Customer + barber selector | Reception | **Salon Module** |
| Receipt printer / preview | Reception | **Shared** (Printing) · **Not Needed for MVP** |
| Barber dashboard | Barber / Manager | **Salon Module** · **Not Needed for MVP** |
| Live queue display | Waiting room | **Shared** (Queue) · **Not Needed for MVP** |
| Customer check-in (QR) | Customer | **Shared**/Salon channel · **Not Needed for MVP** |
| Tablet queue manager | Reception | **Shared** (Queue) · **Not Needed for MVP** |
| Sync indicator / realtime toast | Operator | **Shared** (Notifications / Sync) · **Not Needed for MVP** |

---

## 6. Business entities

| Ezz entity | Business meaning | Classification | Mall today (conceptual) |
|------------|------------------|----------------|-------------------------|
| Branch | Location of work | **Core** / Tenant Business Settings candidate | Tenant only (MVP) |
| Shift | Container for a work period | **Shared** · **Not Needed for MVP** | — |
| Barber | Person who delivers service | **Salon Module** | `SalonEmployee` |
| Service | Sellable / performable service | **Salon Module** | `SalonService` |
| Customer | Person served | **Salon Module** | `SalonCustomer` |
| Transaction | Paid sale header | **Shared** Billing if fiscal; else overlaps Visit | Prefer **Visit** for MVP work |
| Transaction item | Line: service + price snapshot | **Salon Module** work lines / **Shared** if invoice lines | `SalonVisitService` |
| Queue ticket | Waiting-room unit | **Shared** · **Not Needed for MVP** | — |
| Invoice (event) | Sale record for print/sync | **Shared** · **Not Needed for MVP** | — |
| Audit log | Who/what changed | **Shared** · **Not Needed for MVP** | — |
| Barber stats / commission | Performance aggregates | **Salon Module** · **Not Needed for MVP** | — |
| Expense / product sold (events) | Non-service cash movements | **Shared** or other Module · **Not Needed for MVP** | — |
| Care instruction | After-care text per service | **Salon Module** · **Not Needed for MVP** | — |

---

## 7. Operational Pattern Library (why it appeared — not the Feature name)

This layer is **more valuable than the Feature list**.  
A Feature says *what* (Printing). A Pattern says *why the business needed something*.

Do **not** implement these as Shared Services now. After Pilot, a Founder session **Platform Pattern Extraction** should deepen this library before naming Capabilities.

| Observed in Ezz (surface) | Operational Pattern (why) | Implication for platform thinking |
|---------------------------|---------------------------|-----------------------------------|
| Queue / ticket / live display | **Contention for scarce capacity** — more than one customer waiting for limited stylists | Later Shared *maybe*; MVP: Visit without formal queue is OK |
| Receipt / thermal print | **Workflow end produces an Artifact** — proof/hand-off of completed work | Printing is one Artifact channel, not the pattern itself |
| Shift open/close | **Day/period Container** — operations belong inside a bounded work period | Container ≠ Visit; Visit is unit of work *inside* the day |
| Audit log | **Material changes must be traceable** | Traceability pattern → later Activity capability |
| Invoice / payment panel | **Work completion may trigger economic settlement** | Settlement can trail Visit; do not force Invoice into Visit Aggregate (OP-005 anti-bloat) |
| Offline + sync queue | **Operations must continue when the network fails** | Ops resilience pattern — not Salon domain |
| Care tips on receipt | **Completed work may carry after-care guidance** | Salon-specific content on an Artifact |
| Barber dashboard / commission | **Performers need feedback on work done in the period** | Module analytics / later Reports |
| Customer check-in QR | **Arrival can be self-declared before staff serves** | Channel pattern for intake — not MVP |

**Rule:** Prefer discussing Patterns in planning; promote to a named Capability only after Pilot Evidence shows the Pattern is real and repeated.

### Fixed questions for each Pattern (Platform Pattern Extraction — after Pilot only)

When OP-006 is CLOSED and the Founder opens **Platform Pattern Extraction**, every Pattern must answer **all five**:

1. **لماذا ظهر هذا النمط؟** (Why did this pattern appear?)  
2. **هل يتكرر في أكثر من Module؟** (Does it recur across Modules?)  
3. **هل هو Business Rule أم Capability؟** (Business rule vs Capability?)  
4. **هل مكانه Core أم Shared أم Module؟** (Core / Shared / Module?)  
5. **ما أقل صورة (Minimal Form) يمكن بناؤها؟** (Smallest buildable form?)

**Why #5 matters:** do not jump to a concrete channel.  
Example: the Pattern is **“Artifact after workflow completion”** — Minimal Form might be a stored record or simple export; Printing, PDF, WhatsApp are *channels*, not the Pattern. Building “Printing” first freezes the design; owning the Pattern first keeps flexibility.

---

## 8. Cross-cutting capabilities observed (candidates only)

Do **not** build in OP-006.  
Order of later sessions (Founder): **Platform Pattern Extraction** (why) → then Capability naming/build decisions — not Feature wishlist first.

| Capability (name) | Pattern it serves (from §7) | Classification |
|-------------------|----------------------------|----------------|
| Printing | Workflow → Artifact | **Shared** candidate · **Not Needed for MVP** |
| Notifications | Awareness of state change | **Shared** · **Not Needed for MVP** |
| Activity / audit log | Traceable material change | **Shared** · **Not Needed for MVP** |
| Queue / waiting-room | Contention for capacity | **Shared** · **Not Needed for MVP** |
| Shift / day open-close | Day/period Container | **Shared** · **Not Needed for MVP** |
| Offline-first + sync | Operate despite network failure | **Shared**/ops · **Not Needed for MVP** |
| Reports | Feedback on work in a period | **Shared** later · **Not Needed for MVP** |
| Billing / payment / discount | Economic settlement | **Shared** · **Not Needed for MVP** |
| Tenant/branch business profile | Business identity of the place | Deferred Tenant Business Settings · **Not Needed for MVP** |

---

## 9. What to reuse for Mall_Shops (knowledge only)

### Keep reinforcing (OP-005 / Constitution)

- **Day is about work performed** — person + services + responsible stylist + finish.  
- Multi-service lines with **price snapshots**.  
- Reception-driven loop; Arabic owner/reception mental model.  
- Visit remains focused; do not expand Visit into invoice/queue/print (OP-005 anti-bloat).

### Explicitly do **not** import into MVP from Ezz

- Queue, Shift machines, Invoice/POS cart as fiscal core, Printing, Smart Care, Commissions, Offline sync engine, Event-sourcing as platform mandate, QR check-in, Live display.

### Domain language by Module (same pattern, different words)

| Module | Unit of work (root) | Lines / items |
|--------|---------------------|---------------|
| **Salon** | Visit | VisitService |
| **Restaurant** (later) | Order | OrderLine |
| **Clinic** (later) | Encounter | EncounterService (or equivalent lines) |
| **Gym** (later) | Session | SessionItem |

Change **language** per Module; keep the **operational pattern**: open work unit → add performed items → close.  
Do not share Visit tables across Modules; do not put this pattern into Core.

### Restaurant acceleration (pattern, not copy)

| Salon / Ezz idea | Restaurant analogue (later) |
|------------------|----------------------------|
| Visit | Order |
| VisitService | OrderLine |
| Employee (barber) | Staff / station |
| Queue ticket | Kitchen/pass queue (later, if Pattern proven) |
| Shift | Shift (Shared candidate) |
| Receipt Artifact | Print ticket (Shared candidate) |

Same Constitution rule: Module owns domain language; Shared only after Evidence + **Platform Pattern Extraction**.

---

## 10. Guardrails

- This file is **Evidence / business reference**, not authorization to open Features or change Domain during OP-006.  
- Frequency rule still applies: Pilot asks become VS1.1 candidates; this extraction alone does **not** prioritize Printing/Queue.  
- Ezz implementation (Dexie, event sourcing, localStorage, Supabase policies) is **out of scope** for Mall_Shops copy.  
- After OP-006 CLOSED: prefer a session named **Platform Pattern Extraction** before building Shared Capabilities.

---

## 11. One-line summary

Ezz turned from “an old project” into an **operational knowledge reference**: the day is **work performed** (Visit); surrounding Features are Patterns-to-be-named later — without binding Mall_Shops to Ezz’s code or architecture.
