# MVP Decisions

## Purpose

This document collects **temporary decisions** for the first product release (MVP).

MVP Decisions are:

- **Not permanent platform rules**
- **Not business invariants** — those live in [Contracts](../contracts/INDEX.md)
- **Subject to change** after the first vertical slice is validated

When an MVP Decision becomes a permanent rule, it must be promoted to the appropriate Contract and removed from this document.

---

## How to Read

Each decision is labeled **MVP Decision** and includes:

- **What** — the temporary choice
- **Why** — rationale for the first release
- **Expires when** — condition for revisiting

---

## Platform Scope

### MVP Decision: Single Reference Module

**What:** Only the `salon` Module is implemented in the first vertical slice. Other Module keys (`restaurant`, `clinic`, `gym`, `pharmacy`, `store`) exist in the platform catalog but are not activatable or implemented.

**Why:** Validate the Core + Module architecture pattern with one complete domain before expanding.

**Expires when:** Salon vertical slice is complete and a second Module is approved for development.

---

### MVP Decision: Auto-Enable Salon on Tenant Creation

**What:** When a new Tenant is created, the platform automatically creates a `TenantModule` record with `moduleKey = "salon"` and `enabled = true`.

**Why:** Simplifies onboarding for the first target audience (salon businesses). No Module selection UI needed in MVP.

**Expires when:** Multiple Modules are available and Tenant creation includes Module selection.

**Contract reference:** Documented as MVP Decision in [TENANT_MODULE.md](../contracts/TENANT_MODULE.md).

---

### MVP Decision: No Module Selection UI

**What:** Tenants cannot choose which Module to activate during registration. Salon is assigned automatically.

**Why:** Reduces MVP scope. Module activation UI is needed only when multiple Modules are available.

**Expires when:** Second Module reaches beta.

---

## Technology

### MVP Decision: Supabase as Identity Provider

**What:** Supabase Auth is the implementation of the Identity Provider.

**Why:** Managed auth with JWT, OAuth, and PostgreSQL integration. Zero DevOps for authentication.

**Expires when:** Never mandatory — this is an implementation choice. Contracts refer to "Identity Provider" abstractly.

---

### MVP Decision: Prisma as ORM

**What:** Prisma is the database access layer.

**Why:** Type-safe schema, managed migrations, strong TypeScript integration.

**Expires when:** Never mandatory — replaceable per [PRISMA.md](../implementation/PRISMA.md).

---

### MVP Decision: Next.js as Application Framework

**What:** Next.js (App Router) for API routes and future UI.

**Why:** Full-stack TypeScript, SSR capability, API routes co-located with frontend.

**Expires when:** Never mandatory — replaceable per [API.md](../implementation/API.md).

---

## Identity & Auth

### MVP Decision: JWT Represents Identity Only

**What:** JWT contains Identity claims only (`sub`, email, standard auth claims). JWT must never contain `tenant_id`, `active_tenant`, `roles`, or `permissions`.

**Why:** Correct multi-Tenant Identity support; immediate Role/Permission revocation; simple token model.

**Status:** **Approved — Architecture Lock v1.0** via [ADR-002](../adr/ADR-002-Identity-Model-and-JWT-Claims.md).

**Expires when:** A future ADR introduces optimized claims without changing Contract semantics.

---

### MVP Decision: Active Tenant via `X-Tenant-Id`

**What:** Active Tenant is selected by the application and sent on each request via `X-Tenant-Id`.

**Why:** One Identity can switch Tenants without JWT refresh; Tenant context stays explicit.

**Status:** **Approved — Architecture Lock v1.0**.

**Expires when:** A future ADR revisits request-context transport.

---

### MVP Decision: Permissions Loaded Per Request

**What:** Role and Permissions are loaded from Membership on each request, never from JWT.

**Why:** Permission changes take effect immediately. Avoids JWT bloat and stale authorization.

**Status:** **Approved — Architecture Lock v1.0**.

**Expires when:** Performance requirements justify a caching layer with TTL (new ADR required).

---

## Salon Module (Reference Implementation)

### MVP Decision: Salon Permission Vocabulary

**What:** The first Module defines these Permissions:

| Permission | Description |
|-----------|-------------|
| `salon:employee:read` | View employees |
| `salon:employee:write` | Create/update employees |
| `salon:employee:delete` | Remove employees |
| `salon:service:read` | View services |
| `salon:service:write` | Create/update services |
| `salon:appointment:read` | View appointments |
| `salon:appointment:write` | Create/update appointments |
| `salon:appointment:delete` | Cancel appointments |

**Why:** Minimum Permission set for salon operations.

**Expires when:** Salon Module requirements expand.

---

### MVP Decision: Salon Role Permission Extensions

**What:** Module Permissions are added to Core Role mappings:

| Permission | OWNER | ADMIN | MANAGER | STAFF | CUSTOMER |
|-----------|:-----:|:-----:|:-------:|:-----:|:--------:|
| `salon:employee:read` | ✓ | ✓ | ✓ | ✓ | — |
| `salon:employee:write` | ✓ | ✓ | ✓ | — | — |
| `salon:service:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `salon:service:write` | ✓ | ✓ | ✓ | — | — |
| `salon:appointment:read` | ✓ | ✓ | ✓ | ✓ | own |
| `salon:appointment:write` | ✓ | ✓ | ✓ | ✓ | own |
| `salon:appointment:delete` | ✓ | ✓ | ✓ | — | own |

**Why:** Role-appropriate access for salon staff hierarchy.

**Expires when:** Salon Module adds new entities or Roles.

---

### MVP Decision: Salon Entities (First Slice)

**What:** The salon Module implements these entities in the first vertical slice:

- Employee
- Service
- Customer
- Appointment

**Why:** Minimum viable salon management — staff, offerings, clients, scheduling.

**Expires when:** First vertical slice is validated and next entities are prioritized.

---

## Explicitly NOT MVP Decisions (Permanent Rules)

These are **permanent platform invariants** defined in Contracts — not temporary:

| Rule | Contract |
|------|----------|
| Multi-Tenant from day one | [TENANT](../contracts/TENANT.md) |
| One Identity → many Tenants | [MEMBERSHIP](../contracts/MEMBERSHIP.md) |
| One Tenant → many Modules | [TENANT_MODULE](../contracts/TENANT_MODULE.md) |
| No `owner_id` on Tenant | [TENANT](../contracts/TENANT.md) |
| No User table in application | [IDENTITY](../contracts/IDENTITY.md) |
| Core is module-agnostic | [MODULE](../contracts/MODULE.md) |
| TenantModule is generic | [TENANT_MODULE](../contracts/TENANT_MODULE.md) |

---

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2026-07 | Architecture Lock v1.0 FINAL | **FINAL LOCKED / FROZEN** |
| 2026-07 | BusinessUnit removed | **LOCKED** |
| 2026-07 | JWT = Identity only; Tenant via `X-Tenant-Id` | **LOCKED** |
| 2026-07 | Explicit RBAC mapping (no inheritance) | **LOCKED** |
| 2026-07 | Module = concept only; storage undecided | **LOCKED** |
| 2026-07 | TenantModule = relationship only; persistence undecided | **LOCKED** |
| 2026-07 | Authorization = Layer1 Isolation + Layer2 Business Auth | **LOCKED** |
| 2026-07 | Salon as Reference Module | **Active** |
| 2026-07 | Auto-enable salon on Tenant creation | **Active** |
