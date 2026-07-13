# Vertical Slice 2 — Salon Service Management

## Status

**Implemented**

This slice adds module-owned behavior only. It does not modify Core.

## Slice Goal

Complete the minimum service-management path inside the Salon Reference Module:

```
Identity → Tenant → TenantModule(salon) → Salon Service read/update/deactivate
```

## Endpoints

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/api/v1/salon/services/:serviceId` | `salon:service:read` |
| `PATCH` | `/api/v1/salon/services/:serviceId` | `salon:service:write` |
| `DELETE` | `/api/v1/salon/services/:serviceId` | `salon:service:delete` |

## Architecture Regression Guard

This slice must pass [Architecture Regression Checklist](../ARCHITECTURE_REGRESSION_CHECKLIST.md).

Specifically:

- no concrete module references added to `src/core`
- no module permissions added to Core RBAC
- no Core Prisma inverse relations to Salon models
- RLS remains tenant isolation only

## Implementation Notes

- `DELETE` performs soft deactivation (`active = false`)
- Salon permissions remain in `src/modules/salon/permissions.ts`
- API route lives under the Salon module API surface
