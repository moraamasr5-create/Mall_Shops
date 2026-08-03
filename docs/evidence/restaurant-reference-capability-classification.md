# Restaurant Capability Classification

**Date:** 2026-07-19  
**Source:** AbuKhater operational extraction  
**Gate:** [Platform Capability Map](./platform-capability-map-from-salon.md) (**ADOPTED**)  
**Rule:** Every concept → **exactly one** of:  
`Core` · `Restaurant Module` · `Shared Platform Capability` · `Platform Policy` · `Infrastructure` · `Ignore`  
If placement is ambiguous, the row explains why — **no seventh category**.

**Note on Tenant Configuration:** The Capability Map treats Tenant Configuration as related-but-distinct. In this extraction, place-level fields map into **Restaurant Module** (module/place ops config) or **Platform Policy** (cross-tenant rules). Brand-only constants map to **Ignore**.

---

## 1. Classification table

| Concept | Classification | Why this class | Why not the others |
|---------|----------------|----------------|--------------------|
| Platform Identity (login shell) | **Core** | Who may act in a Tenant | Not restaurant workflow |
| Tenant / Membership / module activation | **Core** | Isolation + who belongs | Modules must not redefine tenancy |
| Platform RBAC primitives | **Core** | Uniform authz shell | `restaurant:*` strings stay Module |
| **Order** (primary Work Unit) | **Restaurant Module** | Vertical day loop | Core must not understand Order; Shared would erase Module language |
| Order Lines + price snapshots | **Restaurant Module** | Lines of that Order | Same as VisitService pattern — Module-owned |
| Menu catalog / categories | **Restaurant Module** | Restaurant sellable language | Not Salon Service tables; not Core |
| Sold-out / availability overlay | **Restaurant Module** | Service readiness for the place | Not a Shared product by itself |
| Guest / customer of the place | **Restaurant Module** | Party served | ≠ platform Identity |
| Cashier / Admin ops roles (meaning) | **Restaurant Module** | Vertical role vocabulary | Binding to Membership uses **Core** primitives |
| Pilot / driver as performer | **Restaurant Module** | Delivery capacity actor | Not Core user model |
| Kitchen prep as station meaning | **Restaurant Module** | How food work is understood | Print channel may be Shared later |
| Delivery Trip (per Order) | **Restaurant Module** | Fulfillment mode of Order | Not a platform-wide Trip product from this evidence alone |
| Reservation (table booking) | **Restaurant Module** | Vertical parallel workflow | Must not replace Order as primary |
| Intake channel on Order (online / manual / aggregator) | **Restaurant Module** | How work enters the pipeline | Aggregator brand names → **Ignore** |
| Delivery fee / distance bands | **Restaurant Module** | Place fulfillment rules | Not Platform Policy (policy would constrain allowed currencies/zones, not fee math) |
| Confirm-before-fulfill rule | **Restaurant Module** | Restaurant business commitment | Not Core |
| Fail/cancel reasons on Order | **Restaurant Module** | Outcome vocabulary | Traceability of *who changed* may later be Shared |
| Day/period Container (Shift open/close) | **Shared Platform Capability** | Same Pattern as Ezz/Salon map candidate | Not Core; not owned only by Restaurant forever |
| Restaurant-specific shift close rules (no active Orders; pilots off) | **Restaurant Module** | Vertical close policy using the Shift Pattern | Pattern ≠ Module rules |
| Overnight logical operating day | **Platform Policy** | How “day” is interpreted across timezones | Tenant may select zone; policy defines allowed behavior |
| Timezone for ops (e.g. Africa/Cairo in source) | **Platform Policy** | Cross-cutting time interpretation | Concrete city default in AbuKhater → also see **Ignore** for brand default |
| Currency / rounding expectations | **Platform Policy** | Allowed money rules | Settlement Capability ≠ Policy |
| Artifact after confirm (kitchen/cashier ticket) | **Shared Platform Capability** | Workflow step produces hand-off Artifact | Printing is a channel, not the Pattern |
| Thermal printing as channel | **Shared Platform Capability** | One Artifact channel | Build only if Trigger (≥2 Modules need print) |
| Economic settlement (cash COD vs prepaid + proof, remaining) | **Shared Platform Capability** | Settlement separable from Order Aggregate | Do not bloat Order into Billing product |
| Notifications of new Order / state change | **Shared Platform Capability** | Awareness Pattern | Telegram/n8n specifics → **Ignore** |
| Traceability / status history | **Shared Platform Capability** | Material changes must be traceable | Not fields dumped only on Order forever |
| Reporting aggregates for the period | **Shared Platform Capability** | Feedback on work in a period | Pilot pay formulas → Module/**Ignore** |
| Offline continue + mutation replay | **Shared Platform Capability** | Operate when network fails | Implementation queue tables → **Infrastructure** |
| Fair assignment of scarce riders | **Shared Platform Capability** | Capacity contention / dispatch Pattern (cousin of Queue) | Pilot entity remains Module |
| Capacity contention (Queue) as waiting room | **Shared Platform Capability** | Map candidate — **weak in this source** (no salon-style waiting queue) | Do not invent from delivery assign alone without Pattern Extraction |
| HTTP / DB / Storage / Realtime adapters | **Infrastructure** | Plumbing | Not a Capability product |
| Idempotent mutation log / sync worker | **Infrastructure** | Engineering resilience mechanism | Pattern above may be Shared; mechanism is Infra |
| PIN in localStorage / hardcoded admin PIN | **Ignore** | Auth hack | Real auth is **Core** |
| Dual Arabic/English status vocab + client mapping | **Ignore** | Migration residue | Business states stay Module concepts |
| n8n / Google Sheets / Drive thumbnail path | **Ignore** | Legacy integration | Supabase path is still Infra for *this* project — not Mall_Shops design |
| Brand payment handles, restaurant GPS, neighborhood list | **Ignore** | AbuKhater brand constants | |
| Hardcoded partial kitchen menu parallel to catalog | **Ignore** | Incomplete dual model | |
| Client-side `#N` order sequence in localStorage | **Ignore** | Local UX numbering | |
| Pilot attendance pay formula (EGP/minutes) | **Ignore** | Local compensation policy | Reporting Pattern may still be Shared |
| Empty `C-Supabase_plan` pack | **Ignore** | Missing artifact in archive | |
| UI layout, RTL chrome, animations | **Ignore** | Presentation | |
| Talabat / InstaPay / Vodafone Cash product names | **Ignore** | Channel/brand labels | Payment *modes* (COD vs prepaid proof) classified under Settlement Shared candidate |

---

## 2. Ambiguous placements (resolved without a 7th class)

| Concept | Decision | Explanation |
|---------|----------|-------------|
| Place shift open/close clock times | **Restaurant Module** (config consumed by Shift Pattern) | Times are place ops settings; **Platform Policy** covers timezone/day interpretation, not the HH:MM values |
| “External trip” fee-only order | **Restaurant Module** for “Order used as dispatch vehicle”; brand meaning **Ignore** | Do not create a Core “Trip” type from a workaround |
| Kitchen without cook-complete states | **Restaurant Module** (prep implied by Order phase + Artifact) | Absence of KDS is evidence of simplicity — not a Shared “Kitchen OS” |
| Reservation deposit proof | Settlement **Shared** candidate for *proof of payment* Pattern; Reservation body stays **Restaurant Module** | Split: money posture vs booking Aggregate |

---

## 3. Map alignment check

| Capability Map row | AbuKhater evidence | Action now |
|--------------------|--------------------|------------|
| Primary Work Unit = Order | Confirmed | Rename + apply when Restaurant OP authorizes |
| Shift (Day/period Container) | Strong | Shared candidate — **do not build** until Trigger + Pattern Extraction + OP |
| Artifact / Printing | Strong (kitchen + cashier tickets) | Candidate only |
| Settlement / Billing | Present (COD vs prepaid) | Candidate only; keep out of Order Aggregate core |
| Queue | Weak / different shape (rider assign ≠ waiting-room Queue) | Do not force Queue from this source |
| Offline / sync | Present | Candidate / Infra split as above |
| Notifications | Present as need; channel accidental | Candidate only |
| Core expansion with Order/menu | — | **Forbidden** |

---

## 4. One-line summary

Classify by **Pattern ownership**: Order and restaurant language stay **Restaurant Module**; period container, Artifact, settlement, sync, and reports stay **Shared candidates**; time/money rules stay **Platform Policy**; plumbing stays **Infrastructure**; AbuKhater residue stays **Ignore**.
