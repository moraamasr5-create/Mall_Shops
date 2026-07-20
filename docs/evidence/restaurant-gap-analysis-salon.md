# Gap Analysis — Salon Reference vs Restaurant Reference

**Date:** 2026-07-19  
**Purpose:** Compare **operational Patterns** only — not Feature wishlists, not implementation plans.  
**Sides:**

| Side | Source of truth |
|------|-----------------|
| **Salon Reference** | Mall_Shops Salon Module (OP-005 CLOSED) + [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md) Patterns |
| **Restaurant Reference** | This extraction set from AbuKhater (`restaurant-*.md`) |

**Authority:** Restaurant Reference Extraction (Analysis Only).  
**Non-goals:** No Features, no schema, no Shared builds, no Core/Salon changes.

**Classification reminder:** Core · Restaurant Module · Shared Platform Capability · Platform Policy · Infrastructure · Ignore

---

## 1. Shared operational spine (already aligned)

These are the **same Pattern** under different Module names — not gaps.

| Operational Pattern | Salon | Restaurant | Class |
|---------------------|-------|------------|-------|
| Day is work performed | **Visit** | **Order** | Module (each) |
| Catalog of sellables | Service | Menu item | Module |
| Party served | Customer | Guest | Module |
| Lines + price snapshot | VisitService | OrderLine | Module |
| Staff who run the loop | Employee / reception | Cashier / admin (+ pilot as Module workforce) | Module |
| Finish the Work Unit | Close / cancel Visit | Deliver / fail / cancel Order | Module |

**Implication:** Restaurant Module later is **rename + apply**, not rediscovery of the primary unit.

---

## 2. Gaps — Patterns present in Restaurant reference, thin or absent in Salon MVP loop

“Gap” = operational Pattern the restaurant workday **depends on** that the **Salon MVP operating loop** does not require to feel complete.  
Ezz may have shown the Pattern for Salon; OP-005 intentionally kept Visit thin.

| # | Missing / thin in Salon MVP loop | Evidenced in Restaurant day | Pattern (why) | Class | Notes |
|---|----------------------------------|-----------------------------|---------------|-------|-------|
| G1 | Formal **Shift** / period close gate | Overnight Shift; cannot close with active Orders; day snapshot | Day/period Container | **Shared** candidate | Salon MVP lists Visits by time without Shift Aggregate |
| G2 | **Artifact** at commitment | Kitchen/cashier print on confirm | Workflow → Artifact | **Shared** candidate | Salon close does not require receipt Artifact in MVP |
| G3 | **Multi-channel intake** into one Work Unit | Web + call-center + aggregator + trip → Order | Channel-normalized intake | **Restaurant Module** (principle) | Salon MVP is staff-driven Visit; Ezz had QR/queue channels as reference only |
| G4 | **Mobile capacity / dispatch** | Pilot load, fair assign, trip start/complete/fail | Capacity Contention (dispatch shape) | **Shared** candidate Pattern; Aggregates **Restaurant Module** | Salon Ezz queue is waiting-room shape; different Minimal Form question |
| G5 | **Settlement at period close** | Pilot dues + attendance pay + deposits in day picture | Settlement separable from Work Unit | **Shared** candidate | Salon MVP closes Visit without Billing Capability |
| G6 | **Offline mutating ops** with idempotency | Queue + mutation ids for assign/trip/complete | Operate despite network failure | **Shared** candidate | Not part of Salon MVP loop |
| G7 | **Realtime awareness** of inbound work | Inbox realtime + polling | Notifications / awareness | **Shared** candidate | Salon MVP does not require multi-channel Inbox |
| G8 | **Traceability** of material transitions | Status history, assignments, payment proofs | Traceable change | **Shared** candidate | Not required to complete Visit MVP |
| G9 | **Period reporting** as ops close ritual | Shift/pilot reports | Feedback on work in a period | **Shared** candidate | Salon MVP has no period report ritual |
| G10 | **Parallel reservation track** | Reservation + deposit beside Orders | Future capacity promise | **Restaurant Module** | No Salon MVP analogue; not a Shared gap |
| G11 | **Catalog availability mid-day** as kitchen signal | Sold-out toggles | Stop selling what cannot be fulfilled | **Restaurant Module** | Salon Service active/inactive exists; kitchen-driven mid-day stockout ritual is stronger in Restaurant evidence |
| G12 | **Timezone overnight business day** | Cairo overnight window governance | Timezone Policy + period Container | **Platform Policy** + **Shared** Shift | Salon MVP “day” is softer (openedAt listing) |

---

## 3. Gaps — Patterns present in Salon / Ezz reference, thin in AbuKhater restaurant

| # | Present in Salon/Ezz thinking | Thin / absent in AbuKhater | Pattern note | Class |
|---|-------------------------------|----------------------------|--------------|-------|
| G13 | In-place **performer** of the Work Unit (barber on Visit) | Prep is kitchen print; performer is often **pilot after confirm**, not a “chef identity” on the Order | Restaurant still has staff; “who performed the service line” is weaker than Salon Employee-on-Visit | **Restaurant Module** design choice — not a platform Feature ask |
| G14 | Waiting-room **Queue ticket** as customer-facing contention | No WAITING→SERVING guest queue board evidenced | Capacity Contention appears as **dispatch**, not lobby queue | **Shared** Pattern family; different shape |
| G15 | Care / after-service guidance on Artifact | Not evidenced on kitchen tickets | Salon-specific Artifact content | **Salon Module** (not a Restaurant gap to fill) |

---

## 4. Non-gaps (do not treat as missing Patterns)

| Temptation to call a “gap” | Why it is not an operational Pattern gap |
|----------------------------|------------------------------------------|
| Dine-in table map / course firing | **Not evidenced** in AbuKhater — inventing it is out of scope |
| Refunds | **Not evidenced** |
| Appointments | Salon freeze topic; not Restaurant primary day in this source |
| Loyalty / Smart Care | Ezz Salon-specific; irrelevant here |
| Printing Feature as MVP for Salon | Artifact Pattern may be Shared later; not a Salon MVP hole to “fix” from Restaurant |
| Shared Services built now | Freeze / Triggers — Evidence ≠ authorization |

---

## 5. What the gap list means for platform sequencing (knowledge only)

```
Same spine: Module primary Work Unit (Visit | Order) + lines + catalog + party
     ↓
Restaurant day additionally leans on: Shift, Artifact, Capacity(dispatch),
Settlement, Offline, Notify, Trace, Report
     ↓
Those are mostly Shared candidates already on the Capability Map
     ↓
Do not open them from this document — wait for Pilot close → Pattern Extraction → Triggers → OP
```

**Restaurant-only gaps (G10, G11, channel economics):** stay inside Restaurant Module when that Module is authorized — they are **not** reasons to change Salon or Core.

---

## 6. Compact matrix

| Pattern | Salon MVP loop needs it? | Restaurant day needs it? | Placement |
|---------|--------------------------|--------------------------|-----------|
| Primary Work Unit | Yes (Visit) | Yes (Order) | Module |
| Shift container | No | Yes | Shared candidate |
| Artifact at commitment | No | Yes | Shared candidate |
| Capacity contention | No (Ezz yes) | Yes (dispatch) | Shared candidate |
| Settlement at close | No | Yes | Shared candidate |
| Offline idempotent ops | No | Yes | Shared candidate |
| Notifications | No | Yes | Shared candidate |
| Traceability | No | Yes | Shared candidate |
| Period reporting | No | Yes | Shared candidate |
| Reservation parallel | No | Yes (this source) | Restaurant Module |
| Lobby Queue board | No | No (not evidenced) | — |

---

## 7. One-line summary

Salon MVP proves the **Work Unit spine**; Restaurant reference shows a workday that **additionally depends** on period container, Artifacts, dispatch-shaped capacity, settlement, and ops resilience — Patterns already listed as Shared candidates on the Capability Map, plus Restaurant-only tracks (reservation, delivery workforce) that must never become Core.
