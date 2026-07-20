# Restaurant Anti-Patterns

**Date:** 2026-07-19  
**Source:** AbuKhater (`Full_PROv1.zip`) as a **real-world MVP with history** — not a design reference.  
**Purpose:** Things that belong only to AbuKhater / must **never** be copied into Mall_Shops.  
**Authority:** Restaurant Reference Extraction (Analysis Only).

**Classification of each row:** almost always **Ignore**; where the *temptation* would pollute Core/Shared/Module boundaries, that risk is called out.

---

## 1. Never copy into Mall_Shops (implementation)

| Anti-pattern | Why it must stay out | Class |
|--------------|----------------------|-------|
| Copy React apps, Supabase SQL, RPCs, or n8n webhooks | Extraction is knowledge-only; Mall_Shops has locked Core + Salon reference architecture | **Ignore** |
| Dual-app split (customer SPA + ops dashboard) as *platform architecture* | Packaging choice of one business; platform Modules are not defined by repo count | **Ignore** |
| Browser PIN / localStorage “roles” as Identity | Bypasses real Identity + RLS + Membership | **Ignore** (conflicts with **Core** mission) |
| Open RLS / anon policies as tenancy model | Not Mall_Shops two-layer authz | **Ignore** |
| Event-sourcing / Dexie / Ezz stack imported “because restaurant” | Wrong source; wrong layer | **Ignore** |
| Capacitor app id / Vercel wiring as domain | Deploy packaging | **Infrastructure** / **Ignore** |
| Empty `C-Supabase_plan` as planning authority | Non-evidence | **Ignore** |

---

## 2. Never promote into Core

| Temptation | Why wrong | Correct class |
|------------|-----------|---------------|
| Put Order / Menu / Pilot / Kitchen into Core | Violates Core Mission — Core must not understand restaurant day | **Restaurant Module** |
| Put Shift open/close into Core | Capability Map: Shift is Shared candidate, not Core | **Shared Platform Capability** |
| Put Cairo timezone or EGP into Core types | Operating rules / policy, not Identity | **Platform Policy** |
| Put “delivery driver” as a platform Identity kind | Workforce of one vertical | **Restaurant Module** |

---

## 3. Never copy as Shared Capability product shape

| AbuKhater surface | Why not Shared *as-is* | What to keep (Pattern only) |
|-------------------|------------------------|-----------------------------|
| Pilot table + load=7 + fair return heuristic | Module Aggregate + local constants | Capacity Contention Pattern (P3) |
| Fee share half/full by source + attendance `floor(min/35)*15` | Local economics | Settlement Pattern (P4) without formulas |
| Thermal iframe printer service | One channel | Artifact Pattern (P2) |
| Telegram via n8n | One ops habit | Notifications Pattern (P6) |
| Talabat tablet form + earnings rules | Aggregator connector | Channel-normalized intake as Module rule |
| Overnight 06:00–04:00 defaults | Place hours | Shift Pattern + Timezone Policy |
| Idempotency table DDL | Infrastructure detail | Offline Pattern (P5) |

Building Shared by cloning AbuKhater features freezes accidents as platform law.

---

## 4. Restaurant-only forever (do not “share” by renaming)

These are legitimate **Restaurant Module** ideas — they should not leave Restaurant as Shared tables or Core:

| Concept | Why Restaurant-only |
|---------|---------------------|
| Pilot / trip lifecycle | Delivery vertical |
| Aggregator order number intake | Channel of this business |
| Neighborhood / GPS delivery fee matrices | Place pricing |
| Reservation+deposit as parallel track (until multi-Module evidence) | Single-vertical promise |
| Kitchen availability toggles as “نفذت الكمية” | Catalog ops language |
| Takeaway/hall print subtitle without table map | Local labeling, not a Shared dine-in product |
| Feedback form as built in AbuKhater | Place-specific; not a platform Feedback Core |

---

## 5. Accidental product illusions (do not treat as requirements)

| Illusion | Reality in source | Class |
|----------|-------------------|-------|
| “KitchenView = kitchen ticket board” | Availability toggles only; tickets are print Artifacts | **Ignore** naming |
| “Full dine-in POS / table service” | Not evidenced as Aggregate; delivery/pickup/trip dominate | Do not invent |
| “Refund workflow” | Not evidenced | Do not invent |
| “Driver role fully productized” | Login offers Admin/Casher; driver filters incomplete | **Ignore** |
| “Multi-branch Tenant product” | Brand locations in fees/GPS, not platform Tenant model | Do not invent from this archive |
| Hardcoded `MANAGERS` list | UI attribution, not RBAC | **Ignore** |
| Dual EN/AR status strings as domain model | Migration residue | **Ignore** |
| Cart deposit rules disagreeing across screens | Implementation drift | **Ignore** |
| `pending_timer` grace seconds as universal Order state | Local UX | **Ignore** |
| Duplicate بون cap (=2) as platform invariant | Local heuristic | **Ignore** |

---

## 6. Process anti-patterns (for Mall_Shops agents/humans)

| Anti-pattern | Why forbidden now |
|--------------|-------------------|
| Start Restaurant Module from this zip | Needs OP + Capability Map gate; OP-006 is Salon Internal Pilot |
| Extract Shared Services in the same session as this Evidence | Freeze: no Capability Extraction builds during OP-006 |
| Redesign Core “to fit delivery” | Architecture Locked |
| Expand Salon Visit to look like Order+Pilot+Shift | OP-005 anti-bloat; wrong Module |
| Treat AbuKhater as design reference because it is “production” | Historical decisions ≠ platform design |
| Invent dine-in Aggregates to “complete” the restaurant picture | Extraction must not invent |

---

## 7. What *is* allowed to influence Mall_Shops thinking

Only **operational Patterns** and **rename+apply** language from the Capability Map:

- Primary Work Unit = Order (Module)  
- Lines = OrderLine (Module)  
- Shift / Artifact / Settlement / Offline / Capacity / Notify / Trace / Report as **candidates** on the existing map  

Influence path: Evidence → (later) Platform Pattern Extraction → Trigger → OP — **not** direct code port.

---

## 8. One-line summary

**Copy nothing** from AbuKhater’s code, security model, formulas, brand geography, or dual-app shape; keep only operational Patterns already aligned with the Capability Map — and keep Pilot/Trip/Menu/Order language inside **Restaurant Module**.
