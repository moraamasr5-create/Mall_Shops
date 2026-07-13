# Permission Contract

## Definition

A **Permission** is an atomic authorization grant that allows a specific action on a specific resource within a defined scope.

Permissions are the **lowest-level unit** of authorization. Roles are convenience groupings of Permissions.

---

## Responsibility

- Define a consistent, extensible vocabulary for authorization
- Support Core (platform-wide) and Module-scoped grants
- Enable fine-grained access control without coupling to implementation

---

## Invariants

1. **Permissions are evaluated in Tenant context**
   - Every Permission check requires Identity, Tenant, and (if applicable) Module context.

2. **Deny by default**
   - Operations without an explicit matching Permission grant are rejected.

3. **Permission grants are additive within a Role**
   - A Role grants the union of its mapped Permissions.
   - Explicit deny rules (future) override grants.

4. **Module Permissions are namespaced**
   - Module-specific Permissions are prefixed with `moduleKey` to prevent collisions.
   - Core Permissions have no Module prefix.

5. **Permissions describe capability, not implementation**
   - Permissions name business operations, not API endpoints or database tables.

6. **Wildcard grants must be explicit**
   - A wildcard Permission (e.g., `*`) is a deliberate, auditable grant — never implicit.

---

## Permission Format

```
[moduleKey:]resource:action[:scope]
```

| Segment | Required | Description |
|---------|----------|-------------|
| `moduleKey` | Module-scoped only | Identifies the Module namespace |
| `resource` | Yes | Business entity or concern (e.g., `member`, `module`, `settings`) |
| `action` | Yes | Operation (e.g., `read`, `write`, `delete`, `manage`) |
| `scope` | Optional | Further restriction (e.g., `own`, `assigned`, `limited`) |

### Examples (Illustrative)

| Permission | Meaning |
|-----------|---------|
| `tenant:read` | View Tenant profile and settings |
| `tenant:write` | Update Tenant profile and settings |
| `tenant:delete` | Delete the Tenant |
| `member:read` | View Membership list |
| `member:write` | Invite, update, or revoke Members |
| `module:read` | View enabled Modules |
| `module:manage` | Enable or disable Modules |
| `{moduleKey}:resource:read` | Read a resource within a specific Module |
| `{moduleKey}:resource:write:own` | Write own records within a specific Module |

Concrete Module Permission vocabularies are defined when each Module is implemented. The first reference Module's vocabulary is documented under [MVP Decisions](../mvp/MVP_DECISIONS.md).

---

## Core Permission Catalog

These Permissions exist at the platform level and are independent of any Module.

### Tenant Permissions

| Permission | Description |
|-----------|-------------|
| `tenant:read` | View Tenant information |
| `tenant:write` | Modify Tenant settings |
| `tenant:delete` | Permanently delete Tenant |

### Membership Permissions

| Permission | Description |
|-----------|-------------|
| `member:read` | View Members and their Roles |
| `member:write` | Manage Memberships (invite, update Role, revoke) |

### Module Activation Permissions

| Permission | Description |
|-----------|-------------|
| `module:read` | View which Modules are enabled |
| `module:manage` | Enable or disable Modules for the Tenant |

---

## Role → Permission Mapping (Core)

Default mappings. Custom overrides may be introduced in future releases.

| Permission | OWNER | ADMIN | MANAGER | STAFF | CUSTOMER |
|-----------|:-----:|:-----:|:-------:|:-----:|:--------:|
| `tenant:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `tenant:write` | ✓ | ✓ | — | — | — |
| `tenant:delete` | ✓ | — | — | — | — |
| `member:read` | ✓ | ✓ | ✓ | — | — |
| `member:write` | ✓ | ✓ | — | — | — |
| `module:read` | ✓ | ✓ | ✓ | ✓ | — |
| `module:manage` | ✓ | ✓ | — | — | — |

Module-specific Permissions are added to this table as each Module is released.

---

## Evaluation Rules

1. Resolve Identity from authenticated session.
2. Resolve active Membership for the target Tenant.
3. Resolve Role from Membership.
4. Collect all Permissions granted to the Role.
5. If the operation is Module-scoped, verify TenantModule is enabled.
6. Match required Permission against grants.
7. If no match → **Deny**.

---

## Module Permission Extension

When a new Module is added to the platform:

1. Define the Module's Permission vocabulary using the `moduleKey:` prefix.
2. Map Permissions to applicable Roles.
3. Document the vocabulary in the Module's own specification.
4. Core Permission catalog remains unchanged.

Modules **extend** the Permission vocabulary; they do not modify Core Permissions.

---

## Related Contracts

- [RBAC.md](./RBAC.md) — Role definitions
- [MEMBERSHIP.md](./MEMBERSHIP.md) — Role assignment
- [TENANT_MODULE.md](./TENANT_MODULE.md) — Module enablement gate
- [MODULE.md](./MODULE.md) — Module namespace
