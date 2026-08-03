# AbuKhater Knowledge Inventory — Final Pre–Exit Criteria Check

**Date:** 2026-07-20  
**Purpose:** Final census of everything already extracted from AbuKhater (`Full_PROv1.zip`) so Restaurant Exit Criteria / Product work do **not** rediscover “lost treasure.”  
**Not:** Re-opening AbuKhater as Source of Truth · Code port · Shared builds  

**Normative hierarchy:** [salon-reference-readiness-audit.md](./salon-reference-readiness-audit.md) § Role Map & Knowledge Hierarchy  
**SoT Architecture/Governance:** Salon Locked (OP-007)  
**AbuKhater role:** Operational Knowledge Base + Anti-Patterns (warnings)

---

## Verdict on extraction completeness

| Question | Answer |
|----------|--------|
| Is operational knowledge for **philosophy, day shape, patterns, gaps, anti-copy, aggregates, classification** documented? | **YES — complete enough for Exit Criteria** |
| Is every line of AbuKhater code/UI/SQL extracted? | **NO — intentionally** (would recreate the anti-pattern) |
| Risk of “unextracted operational treasure” blocking Restaurant Product? | **LOW** for spine/MVP decisions; residual items below are **Ignore** or **later Shared**, not missing SoT |

---

## 1. Master index — where each knowledge class lives

| Knowledge class | Primary document(s) | Status |
|-----------------|---------------------|--------|
| **Workflow** (roles, scenarios S1–S12, sequences W1–W6, channels, state machines) | [restaurant-operational-workflow.md](./restaurant-operational-workflow.md) | **Documented** |
| **Aggregates / boundaries** | [restaurant-aggregate-map.md](./restaurant-aggregate-map.md) | **Documented** |
| **Patterns (why → Shared candidates)** | [restaurant-pattern-library.md](./restaurant-pattern-library.md) P1–P10 | **Documented** |
| **Gaps vs Salon MVP** | [restaurant-gap-analysis-salon.md](./restaurant-gap-analysis-salon.md) G1–G15 | **Documented** |
| **Anti-Patterns (what never transfers)** | [restaurant-anti-patterns.md](./restaurant-anti-patterns.md) | **Documented** |
| **Capability classification** | [restaurant-capability-classification.md](./restaurant-capability-classification.md) | **Documented** |
| **Operational / management decisions** | Workflow §7 · Aggregate invariants · MVP_BOUNDARY | **Documented** |
| **Hidden decisions / forced ambiguities** | Classification §8 · Anti-Patterns §5–6 · Workflow source-shape note | **Documented** |
| **Business philosophy** | [VISION.md](../modules/restaurant/VISION.md) · [MVP_BOUNDARY.md](../modules/restaurant/MVP_BOUNDARY.md) · ORDER contract · Workflow core thesis | **Documented** |
| **Business Contracts (language)** | [docs/contracts/modules/restaurant/](../contracts/modules/restaurant/INDEX.md) + [contracts review](./restaurant-contracts-review-2026-07-19.md) | **Documented / LOCKED (business)** |
| **Reference Design pack** | [docs/modules/restaurant/](../modules/restaurant/README.md) | **Documented / Architecture Locked (design)** |
| **Filter onto Salon Locked** | [restaurant-discovery-and-mapping.md](./restaurant-discovery-and-mapping.md) | **COMPLETE** |
| **Cross-signal (Salon ops, not AbuKhater)** | [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md) | Adjacent — not AbuKhater |

---

## 2. Workflow — inventory checklist

From [restaurant-operational-workflow.md](./restaurant-operational-workflow.md):

| Item | Extracted? | Notes |
|------|------------|-------|
| Core thesis: day = work performed; PWU = **Order** | Yes | Aligns Salon spine |
| Source bias: delivery-heavy; dine-in seating not first-class | Yes | Critical for Exit Criteria |
| Roles: guest, cashier, admin, pilot, kitchen, aggregator | Yes | |
| Scenarios S1–S12 (open day → close day) | Yes | |
| W1 Shift lifecycle | Yes | Shared candidate |
| W2 Channel-normalized intake | Yes | Module principle (P9) |
| W3 Confirm + kitchen/cashier print | Yes | Artifact Pattern |
| W4 Dispatch / trip | Yes | Module Aggregates + Capacity Pattern |
| W5 Settlement end of period | Yes | Shared candidate |
| W6 Close day | Yes | |
| State machines (Shift, Order, Pilot, Reservation, Menu availability) | Yes | |
| Channels (web, phone, aggregator, counter, map, reservation, feedback) | Yes | |
| Management decisions (confirm, assign, sold-out, force-close, report, offline replay) | Yes | = operational rules / decisions |

**Not extracted (by design):** screen wireframes, React trees, exact SQL DDL as authority, n8n graphs.

---

## 3. Patterns — inventory checklist

From [restaurant-pattern-library.md](./restaurant-pattern-library.md):

| ID | Pattern | Documented? | MVP implication |
|----|---------|-------------|-----------------|
| P1 | Day/period Container (Shift) | Yes | Shared candidate — not auto-P0 |
| P2 | Artifact at commitment | Yes | Shared candidate |
| P3 | Capacity Contention (dispatch shape) | Yes | Pattern Shared; Pilot tables Module |
| P4 | Settlement separable from Work Unit | Yes | Shared candidate |
| P5 | Offline / idempotent ops | Yes | Shared candidate |
| P6 | Awareness / notifications | Yes | Shared candidate |
| P7 | Traceability | Yes | Shared candidate |
| P8 | Period reporting | Yes | Shared candidate |
| P9 | Channel-normalized intake | Yes | Module principle today |
| P10 | Parallel reservation track | Yes | Restaurant Module |

Rejected-as-Shared surfaces (Pilot-as-platform, Talabat economics, pay formulas, kitchen board invention): **Documented** in same file.

---

## 4. Gaps — inventory checklist

From [restaurant-gap-analysis-salon.md](./restaurant-gap-analysis-salon.md):

| IDs | Content | Documented? |
|-----|---------|-------------|
| G1–G12 | Restaurant day needs beyond Salon Visit MVP (Shift, Artifact, dispatch, Settlement, Offline, Notify, Trace, Report, Reservation, stockout, overnight TZ) | Yes |
| G13–G15 | Salon/Ezz stronger than AbuKhater (performer-on-unit, lobby queue, care Artifact) | Yes |
| Non-gaps | Do not invent dine-in POS / refunds / etc. | Yes |
| Sequencing | Shared candidates wait Pilot → Pattern Extraction → Trigger → OP | Yes |

---

## 5. Anti-Patterns — inventory checklist

From [restaurant-anti-patterns.md](./restaurant-anti-patterns.md):

| Section | Documented? |
|---------|-------------|
| Never copy implementation (SPA split, PIN, open RLS, Dexie/Ezz stack, empty plan) | Yes |
| Never promote Order/Menu/Pilot/Shift into Core | Yes |
| Never copy Shared *as-is* (load=7, fee formulas, thermal, Telegram, overnight clocks, idempotency DDL) | Yes |
| Restaurant-only forever (pilot/trip, aggregator, GPS fees, reservation until multi-Module) | Yes |
| Accidental product illusions (kitchen board, full dine-in, refunds, multi-branch, EN/AR status) | Yes |
| Process anti-patterns (treat production zip as design SoT) | Yes |
| What *may* influence Mall (Patterns + rename+apply only) | Yes |

---

## 6. Operational rules & hidden decisions — where they live

| Rule / decision | Documented in |
|-----------------|---------------|
| Order is sole primary root; Shift/Artifact/Trip are clothing | Workflow thesis · Aggregate Map · VISION |
| Close Shift blocked by active work | Aggregate Map · Workflow W1/W6 · P1 |
| Confirm commits kitchen Artifact | Workflow W3 · P2 · Anti-Patterns (print shape ≠ Shared product) |
| Multi-channel → one Order machine | Workflow W2 · P9 · VISION |
| Delivery fee/share formulas stay local | Anti-Patterns · Classification Ignore/Module |
| PIN / anon RLS never Identity | Anti-Patterns · Classification |
| Payment snapshot on Order ≠ Settlement Capability | Aggregate Map §10 · P4 |
| Reservation parallel; never owns Order | Aggregate Map · P10 · Contracts |
| Kitchen ticket not second PWU / no prep-state Aggregate evidenced | Aggregate Map §8 · Anti-Patterns illusions |
| Overnight window = place config + Timezone Policy | Workflow · P1 · Classification Policy |
| Force-close / force-reopen attendance = exception governance | Workflow §7 |
| Ambiguity: intake port Shared only if ≥2 Modules later | Classification §8 |
| Ambiguity: Pilot vs Salon Queue = same Pattern family, different shape | Classification §8 · P3 · Gap G14 |

These are the “hidden decisions” of the source — **already written down**, not only in the zip.

---

## 7. Business philosophy — documented locations

| Claim | Where |
|-------|--------|
| Day is about work performed | Workflow · Constitution alignment · Salon pattern |
| Hospitality Module ≠ delivery-company OS | VISION · Discovery · Readiness Critical Challenges |
| Multi-mode fulfillment (dine_in / pickup / delivery) | VISION · MVP_BOUNDARY · FULFILLMENT contract |
| Sellability: Core + Module alone | VISION · MVP_BOUNDARY · Capability Map |
| Prevent AbuKhater inflation / ERP creep | MVP_BOUNDARY · Anti-Patterns · VISION § Take/Leave |
| Rename+apply Visit→Order | Salon pattern · Discovery · Aggregate Map §15 |

---

## 8. Coverage matrix (treasure hunt)

| Treasure type | Fully in docs? | Residual risk |
|---------------|----------------|---------------|
| Day narrative & scenarios | Yes | Low |
| Why Shared candidates exist | Yes (P1–P8) | Temptation to pull into P0 — Exit Criteria must resist |
| What never to copy | Yes | Low if Anti-Patterns stay binding |
| Aggregate language | Yes | Contracts may be richer than thin MVP — Exit Criteria scopes |
| Exact AbuKhater UX copy / brand / GPS / payroll numbers | **Intentionally not** as requirements | Correct — Ignore |
| Digital kitchen board / table map / refunds | **Not evidenced** — documented as non-gaps | Do not invent later as “missing treasure” |
| Full zip file tree as living SoT | No | Zip is raw archive; Evidence packs replace it for decisions |

---

## 9. Intentionally unextracted (not missing treasure)

Do **not** treat these as gaps to fill before Exit Criteria:

- React/Capacitor source trees  
- Supabase SQL / RPC dumps as Contracts  
- Thermal HTML/iframe layouts  
- n8n Telegram recipes  
- Neighborhood fee matrices & GPS pins  
- Attendance pay formulas  
- Dual-app repo packaging  

They are **Anti-Pattern territory** or Infrastructure — extracting them “for completeness” would recreate AbuKhater-as-platform.

---

## 10. Knowledge Confidence Matrix

Legend:

| Level | Meaning |
|-------|---------|
| **Verified from archive** | Observed directly in AbuKhater operational surfaces (`Full_PROv1` extraction) and written as evidence |
| **Synthesized from multiple evidence documents** | Combined/cross-checked across ≥2 evidence packs (and often Salon/Ezz/Capability Map) |
| **Architectural inference** | Mall platform design judgment (Constitution, Lock, rename+apply, Module templates) — **not** a literal AbuKhater screen |

| Knowledge source / claim class | Canonical home | Confidence | Notes |
|--------------------------------|----------------|------------|-------|
| Day narrative, roles, S1–S12, W1–W6, channels, state machines | `restaurant-operational-workflow.md` | **Verified from archive** | Delivery-heavy bias also verified |
| Order as primary unit; Shift/Artifact/Trip as clothing | Workflow thesis · Aggregate Map | **Verified from archive** + light **Synthesized** with Capability Map language | |
| Aggregate boundaries (Order, Line, Menu, Guest, Shift, Pilot/Trip, Reservation, …) | `restaurant-aggregate-map.md` | **Verified from archive** | Business boundaries, not Prisma |
| Patterns P1–P10 (why / Minimal Form / must-not-become) | `restaurant-pattern-library.md` | **Synthesized** | Surfaces verified; “why + Shared candidate” synthesized with Capability Map + Ezz cross-signal |
| Gaps G1–G15 vs Salon MVP | `restaurant-gap-analysis-salon.md` | **Synthesized** | Restaurant side from AbuKhater evidence; Salon side from OP-005/Locked Visit |
| Anti-Patterns (never copy / never Core / never Shared-as-is) | `restaurant-anti-patterns.md` | **Verified from archive** (surfaces) + **Architectural inference** (placement bans) | Formulas/PIN/RLS observed; “Ignore forever” is platform judgment |
| Capability classification tables | `restaurant-capability-classification.md` | **Synthesized** | Forced one-class rows; ambiguities documented |
| Management decisions / operational rules (§7 workflow) | Workflow §7 | **Verified from archive** | |
| Hidden decisions / ambiguities (intake Shared?, Pilot vs Queue shape) | Classification §8 · P3 · Gaps | **Synthesized** / **Architectural inference** | Explicit residual doubt |
| Non-evidenced items (kitchen board, table map, refunds) | Gaps §4 · Anti-Patterns illusions | **Verified from archive** as *absent* | Do not invent |
| Business philosophy (Order-centric, multi-mode, not delivery-OS, anti-inflation) | `VISION.md` · `MVP_BOUNDARY.md` | **Architectural inference** grounded in verified day shape | Take/Leave table synthesizes Evidence + Mall principles |
| Restaurant Contracts (ORDER…REPORTING) | `docs/contracts/modules/restaurant/` | **Architectural inference** (Phase 3 language) from verified aggregates/workflows | LOCKED business authority ≠ verified SQL |
| Reference Design pack (lifecycle, domain language, package) | `docs/modules/restaurant/` | **Architectural inference** | Architecture Locked design, not zip port |
| Discovery Visit→Order mapping / reuse vs specific | `restaurant-discovery-and-mapping.md` | **Synthesized** | Salon Locked pattern + Restaurant evidence |
| Governance / Architecture SoT = Salon OP-007 | Lock + Governance Framework | **Architectural inference** (platform) | Outside AbuKhater KB |
| Exact fee matrices, thermal HTML, n8n, PIN UI trees | — | **Not knowledge for Product** | Anti-Pattern / Ignore — confidence N/A |

**Decision after matrix:** No extraction decision changes. Confidence labeling does **not** reopen the zip as SoT.

---

## 11. Formal closure — AbuKhater Knowledge Base

| Field | Value |
|-------|-------|
| **Status** | **CLOSED** (2026-07-20) |
| **Meaning** | Operational Knowledge Base is complete, indexed, and confidence-labeled for Exit Criteria work |
| **Does not authorize** | Restaurant implementation · Shared builds · treating AbuKhater as design SoT |
| **Unified index** | [docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md) |
| **Next command only** | **Restaurant Exit Criteria** |

---

## 12. Final statement

**Extraction for operational decision-making is complete and indexable.**  

All classes (Workflow, Patterns, Gaps, Anti-Patterns, Operational Rules, Hidden Decisions, Business Philosophy) have a canonical markdown home, a confidence level, and an index entry.

What remains for Restaurant Exit Criteria is **scope choice** (what enters v1), not **re-mining the zip**.

AbuKhater remains an **Operational Knowledge Base** — knowledge, operations, and warnings — **not** a design constitution or platform Source of Truth.
