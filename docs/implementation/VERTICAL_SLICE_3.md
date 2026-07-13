# Vertical Slice 3 — Salon Employee Management

## Status

**Implemented**

This slice adds module-owned behavior only. It does not modify Core.

## Slice Goal

Add the minimum staff management path inside the Salon Reference Module:

```
Identity → Tenant → TenantModule(salon) → Salon Employee management
```

## Endpoints

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/api/v1/salon/employees` | `salon:employee:read` |
| `POST` | `/api/v1/salon/employees` | `salon:employee:write` |
| `GET` | `/api/v1/salon/employees/:employeeId` | `salon:employee:read` |
| `PATCH` | `/api/v1/salon/employees/:employeeId` | `salon:employee:write` |
| `DELETE` | `/api/v1/salon/employees/:employeeId` | `salon:employee:delete` |

## Data Model

Adds module-owned table:

- `salon_employee`

The table owns its `tenantId` field and does not add inverse relations to Core Prisma models.

## Architecture Regression Guard

This slice must pass [Architecture Regression Checklist](../ARCHITECTURE_REGRESSION_CHECKLIST.md).

Specifically:

- no concrete module references added to `src/core`
- no module permissions added to Core RBAC
- no Core Prisma inverse relations to Salon models
- RLS remains tenant isolation only

## Implementation Notes

- `DELETE` performs soft deactivation (`active = false`)
- Employee permissions remain in `src/modules/salon/permissions.ts`
- API routes live under the Salon module API surface
