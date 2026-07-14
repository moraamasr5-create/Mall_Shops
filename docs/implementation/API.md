# API Design

## Status

**Draft — implementation layer.** Describes the API structure implemented for VS1.

API shapes implement Contract semantics — they do not define business rules.

---

## Technology (Current Choice)

| Component | Choice |
|-----------|--------|
| Framework | Next.js (App Router) |
| API style | REST JSON |
| Validation | Zod schemas |
| Auth | Supabase JWT in Authorization header or session cookie |

Replaceable without Contract changes.

---

## URL Structure

```
/api/v1/
├── auth/                    # Auth callbacks (Supabase)
├── tenants/                 # Tenant CRUD
│   └── {tenantId}/
│       ├── members/         # Membership management
│       └── modules/         # TenantModule management
└── {moduleKey}/             # Module-scoped routes
    └── ...                  # Module-specific endpoints
```

### Versioning

- All routes prefixed with `/api/v1/`
- Breaking changes require `/api/v2/`

---

## Auth Endpoints (VS1)

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/api/v1/auth/signup` | public | Create Identity via Supabase Auth |
| `POST` | `/api/v1/auth/login` | public | Sign in; returns access token |

JWT remains Identity-only. No tenant/role/permission claims.

## Core Endpoints

### Tenants

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `POST` | `/api/v1/tenants` | authenticated | Create Tenant (+ OWNER Membership) |
| `GET` | `/api/v1/tenants` | authenticated | List Tenants for current Identity |
| `GET` | `/api/v1/tenants/{id}` | `tenant:read` | Get Tenant details |
| `PATCH` | `/api/v1/tenants/{id}` | `tenant:write` | Update Tenant |
| `DELETE` | `/api/v1/tenants/{id}` | `tenant:delete` | Delete Tenant |

### Memberships

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/api/v1/tenants/{id}/members` | `member:read` | List Members |
| `POST` | `/api/v1/tenants/{id}/members` | `member:write` | Invite Member |
| `PATCH` | `/api/v1/tenants/{id}/members/{mid}` | `member:write` | Update Role |
| `DELETE` | `/api/v1/tenants/{id}/members/{mid}` | `member:write` | Revoke Membership |

### Module Activation

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| `GET` | `/api/v1/tenants/{id}/modules` | `module:read` | List enabled Modules |
| `POST` | `/api/v1/tenants/{id}/modules` | `module:manage` | Enable Module |
| `PATCH` | `/api/v1/tenants/{id}/modules/{key}` | `module:manage` | Enable/disable Module |

### Module Routes

Module endpoints live under `/api/v1/{moduleKey}/` and are defined per Module.

See [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) for first Module endpoints.

---

## Request Context

Every authenticated request carries:

| Context | Source |
|---------|--------|
| `identityId` | JWT `sub` claim |
| `tenantId` | Header `X-Tenant-Id` (required on tenant-scoped routes) |
| `role` | Loaded from Membership |
| `permissions` | Resolved from Role |

### Tenant Context Resolution

```
1. Client sends X-Tenant-Id header (or session stores active Tenant)
2. Server validates Membership(`identityId`, `tenantId`) exists and is active
3. Server loads Role and Permissions
4. Server proceeds or returns 403

> VS1: Tenant context is header-only (`X-Tenant-Id`). Session-stored active Tenant is not implemented.```

---

## Response Format

### Success

```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid"
  }
}
```

### Error

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Human-readable description",
    "details": {}
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `UNAUTHENTICATED` | 401 | Missing or invalid session |
| `PERMISSION_DENIED` | 403 | Identity lacks Permission |
| `NOT_FOUND` | 404 | Resource not found or not accessible |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `CONFLICT` | 409 | Business rule violation (e.g., duplicate Membership) |
| `MODULE_NOT_ENABLED` | 403 | TenantModule not enabled for requested Module |

---

## Middleware Chain (Planned)

```
Request
  → Auth middleware (validate JWT, extract identityId)
  → Tenant context middleware (resolve tenantId, load Membership)
  → Permission middleware (check required Permission)
  → Module gate middleware (verify TenantModule enabled, if Module route)
  → Handler
  → Response
```

---

## Module API Pattern

Each Module follows the same pattern:

```
/api/v1/{moduleKey}/{resource}
/api/v1/{moduleKey}/{resource}/{id}
```

Module routes:

- Require authenticated Identity
- Require valid Tenant context
- Require Module enabled via TenantModule
- Check Module-scoped Permissions

---

## Related Documents

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — System design
- [MODULE_SYSTEM.md](../architecture/MODULE_SYSTEM.md) — Module structure
- [SUPABASE.md](./SUPABASE.md) — Auth integration
- [PERMISSION Contract](../contracts/PERMISSION.md) — Authorization vocabulary
- [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md) — First endpoints
