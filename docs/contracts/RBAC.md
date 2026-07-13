# RBAC Contract

## Definition

**Role-Based Access Control (RBAC)** governs what an Identity may do within a **Tenant**, based on their assigned **Role** in [Membership](./MEMBERSHIP.md).

RBAC operates at the **Tenant scope**. It is independent of any specific Module's internal entities.

---

## Responsibility

- Define platform Roles and their semantic meaning
- Map Roles to Permission grants
- Enforce access decisions for Tenant-level and Module-level operations
- Remain module-agnostic in Core — Module-specific Permission extensions follow the same framework

---

## Invariants

1. **Roles are assigned through Membership only**
   - No Role is stored on Identity, Tenant, or TenantModule directly.
   - Role changes are Membership mutations.

2. **Roles are Tenant-scoped**
   - The same Identity may hold different Roles in different Tenants.
   - Role evaluation always requires an explicit Tenant context.

3. **RBAC never bypasses Tenant isolation**
   - A Role in Tenant A grants zero authority in Tenant B.
   - Platform administrator Roles (if any) are a separate concern outside Tenant RBAC.

4. **Core Roles are module-agnostic**
   - Core defines Roles that apply across all Modules (e.g., OWNER, ADMIN).
   - Module-specific Role extensions use the Permission namespace defined in [PERMISSION.md](./PERMISSION.md).

5. **Deny by default**
   - An Identity without a matching Permission grant is denied.
   - Absence of Membership is denial.

6. **OWNER is required for destructive Tenant operations**
   - Tenant deletion, ownership transfer, and Module removal require OWNER authorization unless platform policy overrides.

---

## Platform Roles (Core)

These Roles are defined at the platform level and apply within any Tenant regardless of enabled Modules.

| Role | Semantic Meaning |
|------|-----------------|
| `OWNER` | Full authority over the Tenant, including billing, deletion, ownership transfer, and Module activation |
| `ADMIN` | Administrative access — member management, configuration, Module enablement |
| `MANAGER` | Operational management within enabled Modules — limited administrative actions |
| `STAFF` | Day-to-day operations within assigned scope |
| `CUSTOMER` | External or limited participant — typically read-only or self-service access |

### Role Ranking (Organizational Semantics Only)

Roles have organizational meaning, not automatic Permission inheritance.

```
OWNER
ADMIN
MANAGER
STAFF
CUSTOMER
```

**Architecture Lock v1.0:** Permission mapping is **explicit only**.

- OWNER is not “ADMIN + more”
- No Role inherits Permissions from another Role
- Every Role owns only the Permissions listed for it
- Auditing must be possible by reading the mapping table alone

The exact Permission mapping per Role is maintained in [PERMISSION.md](./PERMISSION.md).

---

## Access Evaluation Model

Every protected operation follows this evaluation chain:

```
1. Authenticate Identity (Identity Provider)
         │
         ▼
2. Resolve Tenant context
         │
         ▼
3. Load active Membership(Identity, Tenant)
         │
         ▼
4. Resolve Role → Permission grants
         │
         ▼
5. Check required Permission for operation
         │
         ▼
6. Verify target Module is enabled (if Module-scoped)
         │
         ▼
7. Allow or Deny
```

---

## Module-Scoped Authorization

When an operation targets a specific Module:

1. TenantModule for that `moduleKey` must be enabled.
2. Identity must have Membership in the Tenant.
3. Identity's Role must grant the required Permission.

Module-specific Permissions use the namespace format defined in [PERMISSION.md](./PERMISSION.md).

---

## Role Assignment Rules

| Action | Who May Perform |
|--------|----------------|
| Assign OWNER | Existing OWNER |
| Assign ADMIN | OWNER or ADMIN |
| Assign MANAGER | OWNER or ADMIN |
| Assign STAFF | OWNER, ADMIN, or MANAGER |
| Assign CUSTOMER | OWNER, ADMIN, or MANAGER |
| Change own Role | **Denied** (default) |
| Remove last OWNER | **Denied** |

---

## Relationship to Permissions

- **Role** = named bundle of operational responsibility
- **Permission** = atomic grant for a specific action
- Roles map to one or more Permissions
- Fine-grained overrides (future) may grant or deny individual Permissions without changing Role

See [PERMISSION.md](./PERMISSION.md).

---

## Related Contracts

- [MEMBERSHIP.md](./MEMBERSHIP.md) — Role assignment
- [PERMISSION.md](./PERMISSION.md) — Atomic grants
- [TENANT.md](./TENANT.md) — Scope boundary
- [TENANT_MODULE.md](./TENANT_MODULE.md) — Module enablement gate
- [IDENTITY.md](./IDENTITY.md) — Authenticated actor
