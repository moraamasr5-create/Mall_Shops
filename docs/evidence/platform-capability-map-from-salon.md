# Platform Capability Map — from Salon Reference Module

**Date:** 2026-07-19  
**Source of truth for extraction:** Current Mall_Shops **Salon Reference Module** (code + OP-005), plus Patterns in [ezz-business-workflow-reference.md](./ezz-business-workflow-reference.md) §7 — **not** Ezz code.  
**Authority:** Founder assignment — map before any new Module (e.g. Restaurant).  
**Status:** **ADOPTED** (Founder 2026-07-19).  
**Role:** Official **Decision Gate** for placement questions (Core / Module / Shared / Platform Policy / Tenant Configuration).

**Decision Gate (normative):**  
Any new proposal (human or AI) must be classified against this map **before** code.  
A Shared Capability may be built **only** after **Trigger for Build** + Platform Pattern Extraction + authorizing OP.  
**No** Core modification, **no** new Shared Capability, and **no** Module boundary change is allowed unless this map shows the change is justified (and the usual Hierarchy / OP path authorizes execution).

**Does not by itself start:** Restaurant Module, Shared builds, or Core redesign — those still need an explicit OP when due.

---

## How to read this map

| Class | Meaning |
|-------|---------|
| **Core** | Platform foundation independent of any vertical — Identity, Tenant, Membership, module activation, platform RBAC primitives |
| **Shared Platform Capability** | Cross-cutting product capability serving the *Pattern* across Modules — build only when **Trigger for Build** is met + Pattern Extraction + OP |
| **Module-only** | Vertical language, data, permissions, workflows — each Module owns its names (Salon Visit ≠ Restaurant Order tables) |
| **Platform Policy** | Cross-tenant operating rules (retention, timezone policy, currency policy, locale defaults) — **not** Core domain, **not** a Shared Feature product, **not** Tenant Configuration fields dumped in one bag |

**Related but distinct:** **Tenant Configuration** (see §4) — per-Tenant configuration root (General / Brand / Business Hours / Localization…), not a Shared Capability and not Platform Policy.

For every **Shared** row: Pattern (why) + **Trigger for Build** (when it may be built) + Minimal Form (smallest shape).

---

## Platform rule — Primary Operational Work Unit

> **Every Module owns exactly one primary Operational Work Unit.**

| Module | Primary Work Unit |
|--------|-------------------|
| Salon | **Visit** |
| Restaurant | **Order** |
| Clinic | **Encounter** |
| Gym | **Session** |

Everything else (delivery, kitchen ticket, reservation, invoice, queue ticket, …) is **secondary** — Aggregates or Shared Capabilities **around** the primary unit, not peer roots invented on day one of the Module.

This is why Restaurant is **rename + apply**, not rediscovery.

---

## 1. Already in Core (do not move; do not expand with vertical meaning)

| Capability | What exists today | Why Core | Why not Shared / Module / Policy |
|------------|-------------------|----------|----------------------------------|
| Identity binding (JWT → request) | Auth + `requireIdentity` / RLS path | Every app needs Identity | Not a business workflow |
| Tenant | `Tenant` create/list | Isolation boundary | Modules must not redefine tenancy |
| Membership + platform roles | Membership lifecycle, last-OWNER | Who may act in a Tenant | Module grants sit on top |
| Module activation | `TenantModule` | Which Modules a Tenant bought | One Module must not own others’ activation |
| Platform RBAC primitives | `requirePermission`, Core `tenant:*` / `member:*` / `module:*` | Uniform authz shell | Module strings stay in Module maps |
| HTTP envelope / requestId / identity DB | `handleApi`, `withIdentityRls` | Request plumbing | Not a Capability product |

**Core Mission check:** Core must not understand Visit, Order, menu, or “salon day.”

---

## 2. Module-only — Salon (Reference Implementation)

Same **pattern** will appear in other Modules under **different names**. Do not share Salon tables.

| Capability | What exists today | Why Module-only |
|------------|-------------------|-----------------|
| Service catalog | `SalonService` | Vertical catalog language |
| Workforce / performers | `SalonEmployee` | Who delivers salon work |
| Customers of the place | `SalonCustomer` | Salon clientele |
| **Primary Work Unit** | `SalonVisit` | Work performed — day loop |
| Work lines + price snapshot | `SalonVisitService` | Lines of that Visit |
| Salon permission grants | `salon:*` | Module vocabulary |
| Owner Portal salon screens | Setup + Visits UI | Salon Owner Experience |
| Salon close rule | Employee required on close | Module business rule |

**Sellability:** Salon runs Setup + Visit without any Shared Capability product.

**S1 freeze note (2026-07-20):** Salon Module-only rows above match shipped Visit-loop implementation. Shared candidates remain **Not built**. See [docs/modules/salon/](../modules/salon/README.md) and [salon-phase-s1-freeze.md](./salon-phase-s1-freeze.md).

---

## 3. Shared Platform Capability — candidates

Build **only** when Trigger is met (Evidence), not because the idea is attractive.

| Capability | Operational Pattern | Trigger for Build (Acceptance) | Minimal Form | Status |
|------------|---------------------|--------------------------------|--------------|--------|
| Artifact delivery | Workflow end produces an Artifact | ≥2 Modules need a post-completion Artifact (channel may differ: PDF, receipt, WhatsApp, …) | Artifact record / export port — **not** thermal-only “Printing” | Not built |
| Printing (channel) | One channel for Artifact | Same as Artifact **and** ≥2 Modules specifically need print channel | Print adapter behind Artifact | Not built |
| Notifications | Actors need awareness of state change | Proven need in **≥2 Modules** via Pilot / real use | Channel-agnostic notify port | Not built |
| Traceability / Activity | Material changes must be traceable | Proven cross-Module or multi-role “who changed X?” need | Append-only activity API — not fields on Visit | Not built |
| Day/period Container (Shift) | Operations belong in a bounded period | Real need for an **Operational Period** beyond “list by openedAt” | Shift open/close (non-fiscal) | Not built |
| Capacity contention (Queue) | More demand than capacity | Real **Capacity Contention** in live use (not speculative) | Ticket WAITING→SERVING | Not built |
| Settlement / Billing | Economic settlement separable from work | Financial process **independent of** the Work Unit Aggregate | Payment/settlement record linked by id | Not built |
| Reporting aggregates | Feedback on work in a period | Cross-Module or owner reporting need proven | Read models / exports | Not built |
| Offline / sync resilience | Operate when network fails | Ops requirement for ≥1 production Module path | Edge sync queue | Not built |

**Explicitly not Core:** do not put Artifact, Queue, Billing, Notifications, Reports, Shift into Core.

**Explicitly not expand primary Work Unit (Visit/Order/…):** OP-005 anti-bloat — Appointments, Queue, Billing, Notifications, Printing, Loyalty stay outside the primary Aggregate.

---

## 4. Tenant Configuration (not “Settings”)

**Name:** **Tenant Configuration** (avoid unbounded “Settings”).

Think **Configuration Root**, then sections that grow independently:

| Section (illustrative) | Holds | Does not hold |
|------------------------|-------|----------------|
| General | Legal/trade name pointers, default contacts | Visit/Order rows |
| Brand | Theme, logo references | Module catalogs |
| Business Hours | Opening hours | Queue tickets |
| Localization | Preferred language display defaults | Platform Policy defaults (see §5) |

| Attribute | Classification |
|-----------|----------------|
| Per-Tenant configuration root | **Tenant Configuration** |
| Status | Not built as a product surface beyond today’s `Tenant.name` / slug |
| Trigger to expand | Pilot / multi-Module need for place-level config without polluting Module data |
| Boundary | **No** operational Work Unit data; **no** dumping Platform Policy into one mega-form |

---

## 5. Platform Policy (new class)

Cross-cutting **rules of operation**, not Features and not Tenant form fields.

| Policy | Meaning | Why not Core | Why not Shared Capability | Why not Tenant Configuration alone |
|--------|---------|--------------|---------------------------|------------------------------------|
| Audit Retention | How long activity/artifacts are kept | Not Identity/Tenant/Membership domain | Not a user-facing “product Capability” to buy | May set *defaults*; Tenant might tighten within policy |
| Timezone Policy | How the platform interprets “day” / timestamps | Not a vertical workflow | Not Printing/Queue | Tenant may *select* zone; policy defines allowed behavior |
| Currency Policy | Allowed currencies / rounding rules | Not Core Mission | Not Settlement product itself | Tenant picks currency within policy |
| Locale | Default locale / RTL expectations | Not Membership | Not a Module Feature | Tenant Localization section consumes policy |

**Status:** Documented class only — no implementation from this map.

---

## 6. Adjacent utilities (not map classes)

| Item | Note |
|------|------|
| `src/shared/` errors, slug | Code utilities |
| `src/infrastructure/` | Adapters |
| `RestaurantCategory` | Validation stub — not Restaurant MVP |

---

## 7. Apply pattern — Restaurant (after map + OP)

| Pattern | Salon | Restaurant |
|---------|-------|------------|
| Catalog | Service | Menu item / category |
| Performer | Employee | Staff / station |
| Party served | Customer | Guest / party |
| **Primary Work Unit** | **Visit** | **Order** |
| Lines + snapshot | VisitService | OrderLine |
| Permissions | `salon:*` | `restaurant:*` |

Secondary concepts (kitchen ticket, reservation, invoice, delivery) attach **around** Order — they are not day-one peer roots.

---

## 8. Gates before Restaurant Module / Shared builds

| Gate | Required |
|------|----------|
| This map **ADOPTED** | Yes (this revision) |
| OP authorizing Restaurant Module | Yes |
| Any Shared build | Trigger for Build met + Platform Pattern Extraction (5 questions) + OP |
| Core redesign | **Forbidden** by default |

**Mandatory filter for new proposals (human or AI):**  
Classify against this map (**Core / Module / Shared / Platform Policy / Tenant Configuration**) before writing code.  
If the map does not justify a Core change, a new Shared Capability, or a Module boundary change — **do not proceed** until the map (and Hierarchy / OP) does.

---

## 9. One-line summary

**Core** = shell; **Module** = one primary Work Unit + its language; **Shared** = Pattern with a hard Trigger; **Platform Policy** = operating rules; **Tenant Configuration** = per-place config root — so the next Module is **rename + apply**, not rediscovery.
