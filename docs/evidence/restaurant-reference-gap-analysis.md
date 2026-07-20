# Gap Analysis — Salon Reference vs Restaurant Reference

**Date:** 2026-07-19  
**Compare:** Mall_Shops **Salon Reference Module** (OP-005 CLOSED) vs AbuKhater **Restaurant operational reference** (this extraction)  
**Purpose:** Missing **operational Patterns** only — not Feature wishlists, not implementation tasks.  
**Authority:** Restaurant Reference Extraction (analysis only). Does **not** authorize Restaurant Module, Shared builds, or Core change.

**References:**  
- Salon loop: [DECISION_LOG OP-005](../DECISION_LOG.md) · [Capability Map](./platform-capability-map-from-salon.md)  
- Salon Patterns: [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md)  
- Restaurant: [Operational Workflow](./restaurant-reference-operational-workflow.md) · [Pattern Library](./restaurant-reference-pattern-library.md)

---

## 1. Shared operational skeleton (already aligned)

Both references reinforce the same Constitution shape:

| Pattern | Salon | Restaurant |
|---------|-------|------------|
| Primary Work Unit | Visit | Order |
| Catalog | Services | Menu items |
| Performer | Employee / stylist | Staff / pilot / station |
| Party | Customer | Guest |
| Lines + snapshots | VisitService | Order Line |
| Open → perform → terminal | Visit open/closed/cancelled | Order pending→…→delivered/failed/cancelled |

**Gap here:** none for the skeleton. Restaurant is **rename + apply**, not rediscovery.

---

## 2. Patterns present in Restaurant reference, thin or absent in Salon MVP loop

These are **operational Pattern gaps** relative to what Salon MVP currently *runs* (Setup + Visit).  
Ezz may already hint at some; Salon MVP does not require them to complete a Visit day.

| # | Operational Pattern | Restaurant evidence | Salon MVP today | Gap type |
|---|---------------------|---------------------|-----------------|----------|
| G1 | **Day/period Container** — work gated by open/close period | Restaurant Shift mandatory for inbox | Visit day works by listing/open Visits; no formal Shift | Pattern gap (Shared candidate already on map) |
| G2 | **Multi-step fulfillment after commit** — confirm ≠ complete | pending → confirm/prep → assign → trip → delivered | Visit is largely open → add lines → close | Pattern gap: Restaurant Work Unit has **fulfillment phases** beyond open/close |
| G3 | **Hand-off Artifact mid-workflow** (not only at end) | Kitchen ticket on confirm (and on assign) | End Artifact (receipt) is Ezz Pattern; not in Salon MVP loop | Pattern gap: mid-flow Artifact |
| G4 | **Fulfillment mode** — same Work Unit, different completion path | Delivery vs pickup | Visit has one in-place service mode | Pattern gap: polymorphic completion of one primary unit |
| G5 | **External capacity performer** — work leaves the premises | Pilot duty + per-order trip | Work completes on-site with Employee | Pattern gap: off-site capacity |
| G6 | **Scarce capacity dispatch** (assign next available unit under load caps) | Fair pilot suggestion + concurrency cap | Queue Pattern in Ezz; not in Salon MVP | Pattern family gap (dispatch vs waiting-room) |
| G7 | **Settlement posture during active work** (COD remaining vs prepaid proof) | Explicit on Order intake | Payment deferred / out of MVP Visit | Pattern gap vs MVP (Settlement Shared candidate) |
| G8 | **Parallel secondary workflow** beside primary unit | Reservation track | Appointments explicitly out of Visit (anti-bloat) | Pattern gap: how Modules host a parallel Aggregate without demoting the primary unit |
| G9 | **Channel-tagged intake** into one pipeline | online / manual / aggregator → one Order inbox | Reception-driven Visit intake only | Pattern gap: multi-channel intake onto one Work Unit |
| G10 | **Operational readiness overlay** on catalog during the day | Sold-out toggles | Service active/inactive (setup-ish), not day-of 86’ing as a first-class loop | Mild Pattern gap: day-of availability control |
| G11 | **Failure terminal distinct from cancel** | failed delivery vs cancelled | Visit cancelled (no failed-delivery analogue) | Pattern gap: failure-of-fulfillment vs void |
| G12 | **Close period requires performers off + work terminal** | Pilots must close; active Orders block | No Shift close ceremony in MVP | Tied to G1 |

**Not listed as gaps:** UI screens, thermal vendors, Talabat branding, PIN auth, SQL RPCs — those are **Ignore** / anti-patterns.

---

## 3. Patterns present in Salon / Ezz reference, thin or absent in Restaurant (AbuKhater)

| # | Operational Pattern | Salon / Ezz | AbuKhater Restaurant | Gap type |
|---|---------------------|-------------|----------------------|----------|
| R1 | **On-site service completion** as the normal happy path | Visit closes when service done in chair | Happy path assumes outbound delivery | Scope gap: dine-in / on-premise service **not evidenced** |
| R2 | **Waiting-room Queue** (WAITING→SERVING board) | Ezz strong | Not present | Do not import into Restaurant from Salon by force |
| R3 | **Performer-centric day feedback** (who did how much work) | Barber dashboard / commission glance | Pilot load/pay glance (different performer economics) | Same Reporting Pattern; different Module metrics |
| R4 | **After-care content on Artifact** | Care tips on receipt | Not evidenced | Salon-specific content on Artifact Pattern |

---

## 4. What is *not* a gap (anti-creep)

| Apparent “missing Feature” | Why it is not an operational Pattern gap |
|----------------------------|------------------------------------------|
| Full KDS with per-item cook states | AbuKhater prep is Order-phase + print — absence ≠ Mall_Shops requirement |
| Multi-stop routing | Not evidenced |
| Loyalty / CRM | Not evidenced as workday Pattern |
| Inventory / recipes / food cost | Not evidenced |
| Table map / seat management | Reservation only; no floor ops |
| Platform Shared Services built now | Extraction ≠ Trigger met |

---

## 5. Implications for later Restaurant Module (knowledge only)

When a future OP authorizes Restaurant:

1. Start from **Order + Order Line + Catalog + Party + Module permissions** (Salon mirror).  
2. Decide explicitly whether the first sellable loop is **delivery-shaped** (AbuKhater) or a narrower **on-premise Order** loop — **do not silently assume dine-in**.  
3. Treat G1–G7 as **Patterns to classify again** at Module design time — most are Shared candidates or Module rules, not Core.  
4. Keep OP-005 anti-bloat: do not stuff G3/G7 into the Order Aggregate as product surfaces.

**No implementation from this document.**

---

## 6. One-line summary

Salon and Restaurant share the **Work Unit skeleton**; Restaurant adds **period container, multi-phase fulfillment, mid-flow Artifact, off-site capacity, settlement posture, and multi-channel intake** as Pattern gaps — while **not** providing a dine-in / waiting-room reference.
