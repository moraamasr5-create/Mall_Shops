# ADR-002: Identity Model and JWT Claims

## Status

**APPROVED — Architecture Lock v1.0**

This decision is locked for MVP and matches the current Contracts.

---

## Context

Mall Shops is a multi-tenant platform where:

- Identity is external (Identity Provider)
- Access requires Membership in a Tenant
- One Identity may belong to many Tenants
- Roles and Permissions are Tenant-scoped
- Modules are activated per Tenant via TenantModule

The challenge: What belongs in the JWT, and what is resolved per request?

---

## Decision

### Identity Model

```
Identity Provider
       │
       ▼
   Identity ──► Membership ◄── Tenant ──► TenantModule ──► Module
                      │
                      ▼
                    Role → Permissions
```

There is **no BusinessUnit** layer. BusinessUnit is out of scope permanently.

There is **no User table** in the application. The Identity Provider is the source of truth for authentication. The application stores only an opaque Identity reference (`identity_id`) on Membership.

### JWT Strategy (MVP — Locked)

**JWT represents Identity only.**

JWT must **never** contain:

- `tenant_id`
- `active_tenant`
- `permissions`
- `roles`
- any Module context

**Active Tenant is selected by the application.**

Each request carries:

```
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant-id>
```

### Request Validation Chain (MVP)

For every protected request the backend validates, in order:

1. **Authenticated Identity** — JWT is valid; extract `sub` as `identity_id`
2. **Membership** — active Membership exists for `(identity_id, X-Tenant-Id)`
3. **Enabled Module** — if the operation is Module-scoped, TenantModule is enabled
4. **Permissions** — Role → explicit Permission grant allows the operation

### JWT Shape (MVP)

```json
{
  "sub": "identity-uuid",
  "email": "user@example.com",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

No custom Tenant, Role, or Permission claims in MVP.

---

## Rationale

### Why JWT = Identity only?

1. **Multi-Tenant correctness** — One Identity may switch Tenants without JWT refresh
2. **Immediate revocation** — Role/Permission changes take effect on the next request
3. **No JWT bloat** — Permission lists do not inflate tokens
4. **Simple mental model** — Token answers "who"; Membership answers "where and what"

### Why not put Tenant in JWT?

1. Switching Tenant would require re-issuing tokens
2. Stale Tenant context becomes a security risk
3. Header-based Tenant selection is explicit and auditable

### Why not put Roles/Permissions in JWT?

1. Permission revocation would lag until token expiry
2. Role sets differ per Tenant — embedding them couples token to Tenant
3. Explicit per-request load matches the Contract model

### Future optimization (not MVP)

Custom JWT claims or short-TTL permission caches may be introduced later for performance. They must not change Contract semantics. Any change requires a new ADR.

---

## Consequences

### Positive

- Correct multi-Tenant Identity support from day one
- Permission changes apply immediately
- Clear separation: Identity Provider vs application authorization
- Aligns with [IDENTITY](../contracts/IDENTITY.md), [MEMBERSHIP](../contracts/MEMBERSHIP.md), [RBAC](../contracts/RBAC.md)

### Negative

- Membership and Permission lookup on every request
- Client must send `X-Tenant-Id` on every Tenant-scoped call

### Accepted Mitigations (post-MVP if needed)

- Short-TTL Membership/Permission cache
- Optional future custom claims via a new ADR

---

## Explicit Non-Decisions (Removed)

The following concepts are **rejected** and must not reappear without a new Architecture Lock:

- BusinessUnit
- `business_unit_id`
- Business Unit JWT claims
- Tenant / Role / Permission claims in JWT for MVP

---

## Related Documents

- [IDENTITY Contract](../contracts/IDENTITY.md)
- [MEMBERSHIP Contract](../contracts/MEMBERSHIP.md)
- [RBAC Contract](../contracts/RBAC.md)
- [PERMISSION Contract](../contracts/PERMISSION.md)
- [SUPABASE.md](../implementation/SUPABASE.md) — current Identity Provider mapping
- [API.md](../implementation/API.md) — `X-Tenant-Id` request convention
- [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md)

## Related Decisions

- ADR-003: Domain-Driven Design Adoption
- Architecture Lock v1.0
