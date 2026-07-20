# Restaurant Discovery & Mapping

**Date:** 2026-07-20  
**Status:** **COMPLETE** — Discovery & Mapping done (docs only). Next Founder command: write **Restaurant Exit Criteria** (then Phase A Assignment).  
**Governance:** [Platform Governance Framework](../platform/GOVERNANCE_FRAMEWORK.md)  
**Salon Lock:** [salon-v1-reference-locked.md](./salon-v1-reference-locked.md) · [OP-007](../DECISION_LOG.md#op-007)  
**Pattern source:** [salon-module-reference-pattern.md](./salon-module-reference-pattern.md)  
**Prior analysis (reuse, do not reinvent):** [restaurant-gap-analysis-salon.md](./restaurant-gap-analysis-salon.md) · [docs/modules/restaurant/](../modules/restaurant/README.md)

**Core question:**  
> كيف تتحول أنماط الصالون المقفولة إلى مطعم؟

**Not this phase (honored):** Order schema · Prisma migrations · APIs · Portal build · Shared Capability builds · Exit Criteria / Phase A execution.

---

## 1. Domain thesis (Restaurant)

| Aspect | Discovery statement |
|--------|---------------------|
| **Primary Work Unit** | **Order** |
| **Owner day** | Catalog ready · Orders moving · handoff/fulfillment clear · day closable |
| **Spine** | Catalog → Party → **Work Unit** → Lines → Close (same as Salon; different names) |
| **moduleKey** | `restaurant` (activation via Core `TenantModule` when later authorized) |
| **Independence** | Does not import Salon tables; does not put Order/Menu into Core |

Reference Design vision already exists as Architecture Locked **design** — Discovery maps it to the **locked Salon pattern**, it does not authorize implementation.

---

## 2. Mapping — Salon Reference → Restaurant language

| Pattern layer | Salon (Locked) | Restaurant | Reuse vs Module-specific |
|---------------|----------------|------------|---------------------------|
| Primary Work Unit | Visit | **Order** | **Reuse pattern** — new Aggregate name |
| Lifecycle | open → closed \| cancelled | Order statuses (Module-defined; confirm/progress/cancel/fail/deliver as design allows) | **Reuse pattern** — different state names |
| Lines | Visit service lines (snapshot) | Order lines / items (snapshot) | **Reuse pattern** |
| Catalog | Service | Menu / Menu item | **Reuse pattern** — Module catalog |
| Party | Customer | Guest (Entity; not Aggregate root of the day) | **Reuse pattern** — different language |
| Workforce | Employee (required on close) | Staff / assignee / pilot (rules Module-specific) | **Reuse pattern** — **rules differ** |
| Permissions | `salon:*` | `restaurant:*` | **Reuse Core RBAC shell** — new strings |
| Portal Flow | Day center = Visits | Day center = Orders | **Reuse UX pattern** — not Salon screens |
| Close rules | ≥1 line + employee | Fulfillment / payment / kitchen rules as Module decides in MVP | **Module-specific** |
| Fulfillment modes | N/A (in-place service) | dine_in · pickup · delivery | **Restaurant-specific** |
| Kitchen / handoff | N/A in Salon MVP | Prep visibility / Artifact channel candidates | **Restaurant-specific** (Artifact may become Shared later) |
| Reservation | Out of Salon MVP | Parallel track (may create Order; never owns Order) | **Restaurant-specific** |
| Shift / period | List by openedAt only | Period close ritual stronger in restaurant evidence | **Shared candidate** — not build now |
| Settlement | Out of Salon MVP | Payment snapshot vs full Settlement | **Shared candidate** for full Settlement |

**Verdict:** Restaurant is **rename + apply** of the locked spine, plus **Module-specific** fulfillment/reservation depth. It is **not** rediscovery of “what is a workday.”

---

## 3. What to reuse (platform / pattern)

| Reuse | Why |
|-------|-----|
| Governance Framework cycle | Exit Criteria → Assignment → Check → Review → S1 → S2 → Lock |
| Capability Map Decision Gate | Classify before code |
| Primary Work Unit rule | One root: Order |
| Core Identity / Tenant / Membership / module activation / RLS pattern | Unchanged |
| Contract + Reference Design template packs | Same shape as Salon freeze |
| Owner-day product phases (A/B style) | After Restaurant Exit Criteria — not now |

---

## 4. What is Restaurant-specific (Module-only later)

| Specific | Notes for later MVP boundary |
|----------|------------------------------|
| Order Aggregate + fulfillment modes | dine_in / pickup / delivery |
| Menu / availability mid-day rituals | Stronger than Salon active flag |
| Kitchen / prep handoff | May use Artifact Pattern later — Shared only with Trigger |
| Guest vs Customer language | Entity anchored by Order/Reservation |
| Reservation parallel track | Not part of first Product day unless Exit Criteria says so |
| Dispatch / pilot load | Capacity Pattern — Shared candidate; not auto-build |

---

## 5. Shared candidates (record only — do not build)

From gap analysis + Capability Map Triggers — **not authorized** by Discovery:

- Artifact delivery / Printing channel  
- Shift / day Container  
- Notifications / realtime inbox  
- Settlement / Billing  
- Traceability / Reporting / Offline  

Build only after Trigger + OP.

---

## 6. Explicit non-implementation

| Forbidden now | Why |
|---------------|-----|
| Prisma `Order` / migrations | Discovery ≠ build |
| `/api/v1/restaurant/**` | No Assignment |
| Portal Order screens | No Phase A |
| Copying SalonVisit tables | Wrong — rename+apply means new Module language |
| Opening Shared builds | Triggers unmet / no OP |

---

## 7. Next gates (not started)

Per Governance Framework:

```
Restaurant Discovery (this file)  ← COMPLETE
        ↓
Restaurant Exit Criteria          ← next Founder command (define end)
        ↓
Restaurant Phase A Assignment     ← Product P0 later
        ↓
… same cycle as Salon …
```

**Source of Truth precedence for Restaurant derivation:**

1. Salon Locked reference (`docs/modules/salon/`, contracts, `salon-module-reference-pattern.md`, OP-007)  
2. This Discovery mapping  
3. Prior `restaurant-*.md` / AbuKhater extracts = **input evidence only** (Patterns + anti-patterns) — **not** competing SoT for spine or Core  

**Do not** write Restaurant Phase A code until Exit Criteria is **ADOPTED** and Phase A is explicitly assigned and commanded.

---

## 8. Discovery DoD (this document)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Domain thesis named (Order as Primary Work Unit) | Done |
| 2 | Layer mapping to Salon Locked pattern | Done |
| 3 | Reuse vs Restaurant-specific listed | Done |
| 4 | Shared candidates deferred with Triggers | Done |
| 5 | No schema/API/UI/DB work | Honored |
| 6 | Next steps = Exit Criteria then Phase A Assignments | Stated |

**Next Founder command:** Restaurant Exit Criteria (after Discovery COMPLETE · AbuKhater KB CLOSED).  
**Knowledge index:** [docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md)
