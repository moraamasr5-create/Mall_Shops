# Membership Contract

## Definition

A **Membership** links an **Identity** to a **Tenant** and assigns a **Role** within that Tenant.

It is the sole mechanism by which an Identity gains access to Tenant resources.

---

## Responsibility

- Establish which Identities belong to which Tenants
- Assign Role-based access within a Tenant
- Express Tenant ownership (via `role = OWNER`)
- Support multi-Tenant participation for a single Identity

---

## Invariants

1. **Membership is the only path to Tenant access**
   - No Identity may access Tenant data or Module operations without an active Membership.

2. **One Membership per (Identity, Tenant) pair**
   - An Identity cannot hold duplicate Memberships in the same Tenant.
   - Role changes update the existing Membership; they do not create a second record.

3. **Role is always Tenant-scoped**
   - A Role assigned in Tenant A has no effect in Tenant B.
   - Roles are never stored on Identity or Tenant directly.

4. **Every Tenant must have at least one OWNER Membership**
   - At Tenant creation, the creator receives OWNER Membership.
   - Removing the last OWNER Membership is forbidden.

5. **Membership status gates access**
   - Only active Memberships grant access.
   - Suspended or revoked Memberships deny access regardless of Role.

6. **Membership does not imply Module access by itself**
   - Module availability is determined by [TenantModule](./TENANT_MODULE.md).
   - Role and Permissions determine what operations are allowed within enabled Modules.

---

## Relationships

```
Identity ──────► Membership ◄────── Tenant
                      │
                      ▼
                    Role
                      │
                      ▼
               Permissions (via RBAC)
```

| Related Entity | Relationship | Contract |
|---------------|--------------|----------|
| Identity | The member | [IDENTITY.md](./IDENTITY.md) |
| Tenant | The organization | [TENANT.md](./TENANT.md) |
| Role | Access level within Tenant | [RBAC.md](./RBAC.md) |

---

## Attributes (Business)

| Attribute | Description |
|-----------|-------------|
| Identifier | Stable, unique Membership identifier |
| Identity reference | Opaque identifier from Identity Provider |
| Tenant reference | Target Tenant |
| Role | Assigned Role within this Tenant |
| Status | Active, suspended, or revoked |
| Invited by | Optional reference to inviting Identity |
| Joined at | Point in time Membership became active |

---

## Lifecycle

### Creation — Owner at Tenant Birth

When a Tenant is created, the initiating Identity automatically receives Membership with `role = OWNER`.

### Creation — Invitation

1. An authorized Identity (typically OWNER or ADMIN) invites a new member.
2. The invited Identity accepts the invitation.
3. Membership is created with the assigned Role.

### Role Change

- An authorized Identity updates the Membership Role.
- An Identity cannot elevate its own Role unless policy explicitly allows self-service elevation (default: **not allowed**).
- OWNER Role assignment requires existing OWNER authorization.

### Suspension

- Temporarily blocks access without deleting the Membership record.
- Suspended members retain their Role but cannot perform operations.

### Revocation

- Permanently removes access.
- Revoked Memberships are retained for audit or hard-deleted per retention policy.
- Revoking the last OWNER Membership is forbidden.

---

## Ownership

**Tenant ownership is defined exclusively through Membership.**

| Rule | Detail |
|------|--------|
| How is an Owner expressed? | `Membership.role = OWNER` |
| Where is ownership stored? | On Membership — never on Tenant |
| Minimum Owners | At least one active OWNER per Tenant at all times |
| Ownership transfer | Grant OWNER to target Identity; optionally revoke from source |

---

## Multi-Tenant Membership

- A single Identity may hold active Memberships in multiple Tenants simultaneously.
- Each Membership is evaluated independently.
- The platform must require explicit Tenant context selection before operations.

---

## Related Contracts

- [TENANT.md](./TENANT.md) — Organizational context
- [IDENTITY.md](./IDENTITY.md) — External identity
- [RBAC.md](./RBAC.md) — Role definitions and hierarchy
- [PERMISSION.md](./PERMISSION.md) — Fine-grained grants
