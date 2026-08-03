# Restaurant Pattern Library

**Date:** 2026-07-19  
**Source:** AbuKhater operational reference (surfaces) → operational Patterns (why).  
**Purpose:** Patterns that **may later** become Shared Platform Capabilities — **only if justified**.  
**Authority:** Restaurant Reference Extraction (Analysis Only).  
**Does not authorize:** Shared builds, Capability Extraction implementation, or opening RG-005.

**Rule:** A Feature says *what*. A Pattern says *why the business needed something*.  
Prefer Patterns in planning; promote to a named Capability only after Evidence shows the Pattern is real and repeated across Modules (Capability Map Triggers).

Cross-check: [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md) §3 · [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md) §7.

---

## Justification bar (what “later Shared” requires)

A Pattern from this library may become Shared **only if**:

1. **Why** is clear (this document).  
2. It **recurs** (or clearly will) across ≥2 Modules — Salon Ezz + Restaurant AbuKhater already cross-signal several Patterns.  
3. It is a **Capability**, not a one-Module business rule.  
4. Placement is **Shared** (not Core, not Module tables).  
5. **Minimal Form** is smaller than the AbuKhater Feature surface.  
6. Capability Map **Trigger for Build** + Founder **Platform Pattern Extraction** session + authorizing **OP**.

Until then: **document only**.

---

## Pattern catalog

### P1 — Day / period Container

| | |
|--|--|
| **Observed surface** | Restaurant Shift open/close; overnight logical date; close blocked by active work; day report snapshot |
| **Pattern (why)** | Operations and accountability belong inside a **bounded operating period**, especially when the calendar day ≠ the business day |
| **Also seen** | Ezz Salon Shift (OPEN/CLOSING/CLOSED) |
| **Map Capability** | Day/period Container (Shift) |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Open/close period + associate Work Units by id + close gate — **non-fiscal** |
| **Must not become** | Core “Shift domain”; fiscal cash drawer product on day one |
| **Justified for later Shared?** | **Yes (candidate)** — two vertical references; Salon MVP still runs without it |

---

### P2 — Workflow step produces an Artifact

| | |
|--|--|
| **Observed surface** | Kitchen ticket + cashier copy printed on confirm; reprint after assign |
| **Pattern (why)** | At a commitment step, the business needs a **durable hand-off** independent of the screen that created the Order |
| **Also seen** | Ezz receipt / thermal print after sale |
| **Map Capability** | Artifact delivery (+ Printing as channel) |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Artifact record / export port — not thermal-only “Printing” |
| **Must not become** | Order Aggregate bloated with printer drivers |
| **Justified for later Shared?** | **Yes (candidate)** — Artifact Pattern; print channel only if ≥2 Modules need print specifically |

---

### P3 — Capacity Contention (mobile / dispatch shape)

| | |
|--|--|
| **Observed surface** | Pilot fair queue (oldest return), hard load cap, assign while at restaurant, trip start leaves shop |
| **Pattern (why)** | **Demand for scarce capacity** exceeds what one resource can carry; fairness and ceilings prevent overload and favoritism |
| **Also seen** | Ezz waiting-room Queue (WAITING→SERVING) — **same Pattern family, different shape** |
| **Map Capability** | Capacity contention (Queue) |
| **Classification** | **Shared Platform Capability** candidate (Pattern); Pilot Aggregates stay **Restaurant Module** |
| **Minimal Form** | Abstract contention: resource, claim, release — **not** “copy Pilot tables into Shared” |
| **Must not become** | One Shared schema that freezes “stylist queue” or “driver load=7” |
| **Justified for later Shared?** | **Conditional** — Pattern yes; Shared product only after Pattern Extraction answers whether one Minimal Form covers Salon queue + Restaurant dispatch |

---

### P4 — Economic settlement separable from the Work Unit

| | |
|--|--|
| **Observed surface** | COD vs prepaid on Order; end-of-Shift pilot fee shares + attendance pay; reservation deposits in day totals |
| **Pattern (why)** | Money reconciliation and labor dues are an **economic close**, not the same thing as completing one Order |
| **Also seen** | Ezz invoice / payment panel trailing the sale |
| **Map Capability** | Settlement / Billing |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Settlement record linked by Work Unit / period id — not payroll formulas in Core |
| **Must not become** | Order Aggregate = invoice + payroll engine |
| **Justified for later Shared?** | **Yes (candidate)** — keep Module fee formulas out of Shared Minimal Form |

---

### P5 — Operate despite network failure

| | |
|--|--|
| **Observed surface** | Offline action queue; idempotent `client_mutation_id` replay for assign/trip/complete |
| **Pattern (why)** | The workday must continue when the network drops; retries must not double-apply |
| **Also seen** | Ezz offline + sync |
| **Map Capability** | Offline / sync resilience |
| **Classification** | **Shared Platform Capability** candidate; queue implementation → **Infrastructure** |
| **Minimal Form** | Edge sync queue + idempotency for mutating ops |
| **Justified for later Shared?** | **Yes (candidate)** if a production Module path requires it |

---

### P6 — Awareness of state change

| | |
|--|--|
| **Observed surface** | Realtime Inbox updates; polling fallback; historical Telegram alerts |
| **Pattern (why)** | Multiple intake channels; staff must learn about new work without babysitting refresh |
| **Also seen** | Ezz realtime toasts / sync indicator |
| **Map Capability** | Notifications |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Channel-agnostic notify port |
| **Justified for later Shared?** | **Yes (candidate)** — Telegram/n8n specifics → **Ignore** |

---

### P7 — Material changes must be traceable

| | |
|--|--|
| **Observed surface** | Status history, assignment rows, payment screenshots, external بون / aggregator ids |
| **Pattern (why)** | Disputes after the fact require **who/what/when** for material transitions |
| **Also seen** | Ezz audit log |
| **Map Capability** | Traceability / Activity |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Append-only activity API — not random fields piled on Order |
| **Justified for later Shared?** | **Yes (candidate)** |

---

### P8 — Feedback on work in a period

| | |
|--|--|
| **Observed surface** | Pilot performance, fees by source, delay metrics, printable/JSON day report |
| **Pattern (why)** | Owners need a **period picture** of work done and money/labor outcomes |
| **Also seen** | Ezz barber dashboard / commission glance |
| **Map Capability** | Reporting aggregates |
| **Classification** | **Shared Platform Capability** candidate |
| **Minimal Form** | Read models / exports over Module Work Units — not Core analytics domain |
| **Justified for later Shared?** | **Yes (candidate)** after multi-Module or real owner need |

---

### P9 — Channel-normalized Work Unit intake

| | |
|--|--|
| **Observed surface** | Web, call-center, aggregator tablet, fee-only trip → one Order machine |
| **Pattern (why)** | Parallel intake processes create operational chaos; **one fulfillment machine** reduces error |
| **Also seen** | Partial analogue: Salon walk-in vs (Ezz) queue check-in → one Visit |
| **Map Capability** | *(not a separate named row today)* — reinforces Module ownership of Work Unit |
| **Classification** | Today: **Restaurant Module** design rule; Shared only if Pattern Extraction proves a cross-Module *intake port* |
| **Minimal Form** | If ever Shared: intake adapter → create Module Work Unit by id — **not** a universal Order table |
| **Justified for later Shared?** | **Not yet** — keep as Module principle until ≥2 Modules need a shared intake port |

---

### P10 — Parallel promise track (reservation)

| | |
|--|--|
| **Observed surface** | Reservation pending→confirmed with deposit alongside Orders |
| **Pattern (why)** | Some businesses hold **future capacity** with a deposit independent of today’s Work Unit |
| **Also seen** | Not in Salon MVP; not strong in Ezz extraction |
| **Map Capability** | None yet |
| **Classification** | **Restaurant Module** |
| **Justified for later Shared?** | **No** from current evidence — single vertical, not Trigger-ready |

---

## Patterns explicitly rejected as Shared (from this source)

| Surface temptation | Why not Shared from this extraction |
|--------------------|-------------------------------------|
| Pilot as platform entity | Vertical workforce Aggregate |
| Talabat / aggregator connectors | Channel economics + Integration — Module/Ignore until multi-Tenant product need |
| Attendance pay `floor(min/35)*15` | Local labor rule |
| Neighborhood fee matrices | Place pricing |
| Overnight 06:00–04:00 defaults | Place hours under Timezone Policy |
| Kitchen digital ticket board | **Not evidenced** — do not invent Pattern |

---

## Fixed questions (for later Platform Pattern Extraction — after Pilot)

When OP-006 is CLOSED and Founder opens **Platform Pattern Extraction**, each Pattern above that is still a Shared candidate must answer **all five**:

1. لماذا ظهر هذا النمط؟  
2. هل يتكرر في أكثر من Module؟  
3. هل هو Business Rule أم Capability؟  
4. هل مكانه Core أم Shared أم Module؟  
5. ما أقل صورة (Minimal Form) يمكن بناؤها؟

**Especially for P3:** do not freeze Minimal Form as “Salon Queue” or “Pilot load=7” — own the Pattern first.

---

## One-line summary

AbuKhater strengthens Shared **candidates** already on the Capability Map (Shift, Artifact, Settlement, Offline, Notify, Trace, Report, Capacity) and adds a Module principle (channel-normalized Order). Nothing here is a build order.
