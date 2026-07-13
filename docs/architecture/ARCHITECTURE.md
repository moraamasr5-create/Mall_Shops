# Architecture Overview

## What Is Mall Shops?

Mall Shops is a **multi-tenant, multi-module Business Operating Platform (BOP)**.

A single platform codebase supports multiple business domains — salons, restaurants, clinics, gyms, pharmacies, stores, and more — through independent, pluggable Modules.

---

## Documentation Layers

This project separates concerns into four documentation layers:

| Layer | Location | Purpose |
|-------|----------|---------|
| **Contracts** | [docs/contracts/](../contracts/INDEX.md) | Business rules — permanent source of truth |
| **Architecture** | [docs/architecture/](./) | System design — how components relate |
| **Implementation** | [docs/implementation/](../implementation/) | Technology choices — how it is built today |
| **MVP** | [docs/mvp/](../mvp/MVP_DECISIONS.md) | Temporary first-release decisions |

**Rule:** If implementation conflicts with a Contract, the Contract wins.

---

## Architectural Principles

### 0. Architecture Lock v1.0 FINAL

The documentation layer is **FINAL LOCKED**. See [ARCHITECTURE_LOCK.md](../ARCHITECTURE_LOCK.md).

No architectural redesign unless a critical implementation flaw is discovered.

Work proceeds by Vertical Slices only:

```
Business Contract → Architecture → Implementation Docs → Vertical Slice → Code → Review → Next Slice
```

### 1. Contracts Are Sovereign

Business rules live exclusively in [docs/contracts/](../contracts/INDEX.md). They survive any technology change.

### 2. Core Is Module-Agnostic

The Core layer handles platform-wide concerns only:

- Tenant
- Membership
- Module (catalog and activation)
- Identity (external reference)
- Authorization (RBAC + Permissions)

Core **never** imports or references Module-specific logic.

### 3. Modules Are Independent Vertical Domains

Each Module is a self-contained business domain. Modules never depend on each other.

### 4. Multi-Tenant From Day One

- One Identity → many Tenants (via Membership)
- One Tenant → many Modules (via TenantModule)
- All data isolated per Tenant

### 5. Identity Is External

Authentication is delegated to an Identity Provider. The application has no User table as a source of truth.

### 6. Ownership Through Membership

Tenants have no `owner_id`. Ownership is `Membership(role = OWNER)`.

### 7. Implementation Is Replaceable

Database, ORM, auth provider, and framework are implementation choices documented separately. They are not embedded in Contracts.

---

## System Layers

```
┌─────────────────────────────────────────────────┐
│                  Presentation                    │
│            (HTTP / UI — future)                  │
├─────────────────────────────────────────────────┤
│                   Modules                      │
│   salon │ restaurant │ clinic │ gym │ ...      │
│         (independent business domains)          │
├─────────────────────────────────────────────────┤
│                     Core                       │
│  Tenant │ Membership │ Module │ Identity │     │
│              Authorization                     │
├─────────────────────────────────────────────────┤
│                    Shared                      │
│        Types │ Validation │ Utilities            │
├─────────────────────────────────────────────────┤
│               Infrastructure                   │
│     Database │ Identity Provider │ Storage     │
│         (implementation — swappable)           │
└─────────────────────────────────────────────────┘
```

---

## Dependency Rules

| From | May Import | Must Not Import |
|------|-----------|-----------------|
| Presentation (`src/app`) | Core, Modules, Shared | Infrastructure vendor SDKs directly |
| Modules | Core, Shared, Infrastructure adapters | Other Modules; vendor SDKs (`@prisma/client`, `@supabase/*`) |
| Core | Shared, Infrastructure adapters | Modules; vendor SDKs directly |
| Shared | Built-ins only | Core, Modules, Infrastructure |
| Infrastructure | Shared; optionally Core interfaces | Module internals |

Rules:

- Dependencies point inward/downward only: Presentation → Modules/Core → Infrastructure → Shared.
- Core never imports Modules (directly or indirectly).
- Modules never import other Modules. The modules registry is the composition root and may list Module definitions.
- Vendor SDKs live only under `src/infrastructure`. Core and Modules use thin adapters from that layer.
- This matrix is proven by implementation — see [ARCHITECTURE_AUDIT_V1.md](./ARCHITECTURE_AUDIT_V1.md).

---

## Data Flow (Conceptual)

```
Identity Provider
       │
       ▼ authenticate
   Application
       │
       ├──► Resolve Identity
       ├──► Select Tenant context
       ├──► Load Membership → Role
       ├──► Check Permissions
       ├──► Verify TenantModule enabled
       └──► Execute Module operation (Tenant-scoped)
```

---

## Entity Model (Architecture View)

```
Identity ──► Membership ◄── Tenant ──► TenantModule ──► Module
                │                         │
                ▼                         ▼
              Role                  Module Data
                │                   (Tenant-scoped)
                ▼
          Permissions
```

Full business definitions: [Contracts Index](../contracts/INDEX.md).

---

## Security Architecture

Authorization has **two mandatory layers**. Neither may be used alone.

| Layer | Responsibility | Contract / Docs |
|-------|----------------|-----------------|
| **Layer 1 — Database Isolation** | Tenant boundary (RLS or equivalent) | [TENANT](../contracts/TENANT.md), [RLS](../implementation/RLS.md) |
| **Layer 2 — Business Permissions** | Role → explicit Permission evaluation | [RBAC](../contracts/RBAC.md), [PERMISSION](../contracts/PERMISSION.md) |

| Concern | Layer | Contract |
|---------|-------|----------|
| Authentication | Identity Provider | [IDENTITY](../contracts/IDENTITY.md) |
| Tenant access | Membership | [MEMBERSHIP](../contracts/MEMBERSHIP.md) |
| Role assignment | Application Permissions | [RBAC](../contracts/RBAC.md) |
| Operation authorization | Application Permissions | [PERMISSION](../contracts/PERMISSION.md) |
| Data isolation | Database Isolation | [TENANT](../contracts/TENANT.md) |
| Module gating | TenantModule + Permissions | [TENANT_MODULE](../contracts/TENANT_MODULE.md) |

Defense in depth: Layer 1 isolates Tenants at the data store; Layer 2 authorizes business operations in the application. Skipping either layer is forbidden.

---

## Scalability Path

| Stage | Capability |
|-------|-----------|
| **Now (MVP)** | Single reference Module, Core platform skeleton |
| **Next** | Additional Modules following the same pattern |
| **Future** | Multi-Module Tenants in production, read replicas, caching, event streaming |

Architecture supports all stages without redesign. MVP scope is defined in [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md).

---

## Related Documents

- [PLATFORM.md](./PLATFORM.md) — Core platform design
- [MODULE_SYSTEM.md](./MODULE_SYSTEM.md) — Module architecture
- [Contracts Index](../contracts/INDEX.md) — Business rules
- [MVP Decisions](../mvp/MVP_DECISIONS.md) — First release scope
