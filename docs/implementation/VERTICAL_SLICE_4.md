# Vertical Slice 4 — Salon Customer Management

## Status

**Implemented**

This slice adds module-owned behavior only. It does not modify Core.

## Slice Goal

Add the minimum customer management path inside the Salon Reference Module:

```
Identity → Tenant → TenantModule(salon) → Salon Customer management
```

## Endpoints

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/api/v1/salon/customers` | `salon:customer:read` |
| `POST` | `/api/v1/salon/customers` | `salon:customer:write` |
| `GET` | `/api/v1/salon/customers/:customerId` | `salon:customer:read` |
| `PATCH` | `/api/v1/salon/customers/:customerId` | `salon:customer:write` |
| `DELETE` | `/api/v1/salon/customers/:customerId` | `salon:customer:delete` |

## Data Model

Adds module-owned table:

- `salon_customer`

The table owns its `tenantId` field and does not add inverse relations to Core Prisma models.

## Architecture Regression Guard

This slice must pass [Architecture Regression Checklist](../ARCHITECTURE_REGRESSION_CHECKLIST.md).

Specifically:

- no concrete module references added to `src/core`
- no module permissions added to Core RBAC
- no Core Prisma inverse relations to Salon models
- dependency direction remains Module → Core only
- RLS remains tenant isolation only

## Implementation Notes

- `DELETE` performs soft deactivation (`active = false`)
- Customer permissions remain in `src/modules/salon/permissions.ts`
- API routes live under the Salon module API surface
