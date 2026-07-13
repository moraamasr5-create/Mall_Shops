# Identity Contract

## Definition

An **Identity** represents a person or service account that can act on the platform.

Identity is **not owned by the application**. It is established and maintained by an external **Identity Provider**.

---

## Responsibility

- Represent who is performing an action
- Serve as the anchor for Membership and authorization
- Remain stable across Tenant boundaries

The application **references** Identity; it does not duplicate identity lifecycle management.

---

## Invariants

1. **No User table in the application domain**
   - The application does not persist a parallel user profile as a source of truth for authentication.
   - Profile attributes needed for business operations may be cached or denormalized for display, but the Identity Provider remains authoritative for authentication state.

2. **Every acting party has an external identity reference**
   - Each Identity is identified by an opaque, stable identifier issued by the Identity Provider.
   - The application never generates or replaces this identifier.

3. **Identity exists independently of Tenant**
   - Creating or deleting a Tenant does not create or delete an Identity.
   - An Identity may have zero, one, or many Memberships across different Tenants.

4. **Identity is not a Tenant-scoped concept**
   - Roles, permissions, and module access are never stored on Identity directly.
   - Tenant context is always resolved through Membership.

5. **Service accounts are first-class Identities**
   - Automated integrations may act through Identity credentials issued by the Identity Provider.
   - Service Identities follow the same Membership and authorization rules as human Identities.

---

## Relationships

```
Identity Provider
       │
       │ issues
       ▼
   Identity
       │
       │ (1:N via Membership)
       ▼
    Tenant
```

| Related Entity | Relationship | Contract |
|---------------|--------------|----------|
| Identity Provider | Issues and validates Identity | — (infrastructure concern) |
| Membership | Links Identity to Tenant | [MEMBERSHIP.md](./MEMBERSHIP.md) |
| Tenant | Accessed through Membership | [TENANT.md](./TENANT.md) |

---

## Lifecycle

### Registration

- Identity is created in the Identity Provider through its standard registration or provisioning flow.
- The application learns of a new Identity on first successful authentication or explicit provisioning event.

### Authentication

- The application delegates authentication entirely to the Identity Provider.
- A successful authentication yields a verifiable identity reference and session proof.
- The application must validate session proof on every protected operation.

### Profile Attributes

- Display name, email, phone, and avatar may be read from the Identity Provider.
- Business-specific attributes (e.g., preferred language within a Tenant) belong to Membership or module-specific entities — not to Identity.

### Deactivation

- Identity deactivation is performed in the Identity Provider.
- Upon deactivation, all active sessions for that Identity must be rejected.
- Existing Membership records may be retained for audit; active access is denied.

---

## Ownership

Identity is owned by the **Identity Provider**, not by any Tenant or Module.

No Tenant may claim exclusive ownership of an Identity.

---

## Authorization Boundary

Identity alone grants **no access** to any Tenant or Module.

All access requires:

1. Valid Identity (authenticated session)
2. Active Membership in the target Tenant
3. Sufficient Role and Permissions for the requested operation

See [RBAC.md](./RBAC.md) and [PERMISSION.md](./PERMISSION.md).

---

## Related Contracts

- [MEMBERSHIP.md](./MEMBERSHIP.md) — Links Identity to Tenant
- [RBAC.md](./RBAC.md) — Role assignment within Tenant
- [TENANT.md](./TENANT.md) — Organizational context
