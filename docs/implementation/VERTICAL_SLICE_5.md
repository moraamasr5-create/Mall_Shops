# Vertical Slice 5 — Restaurant Category Validation

## Status

**Implemented**

This slice validates that a second business module can be added without changing Core or the existing Salon module.

## Slice Goal

Add the smallest useful Restaurant capability:

```
Identity → Tenant → TenantModule(restaurant) → Restaurant Category management
```

## Endpoints

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/api/v1/restaurant/categories` | `restaurant:category:read` |
| `POST` | `/api/v1/restaurant/categories` | `restaurant:category:write` |
| `GET` | `/api/v1/restaurant/categories/:categoryId` | `restaurant:category:read` |
| `PATCH` | `/api/v1/restaurant/categories/:categoryId` | `restaurant:category:write` |
| `DELETE` | `/api/v1/restaurant/categories/:categoryId` | `restaurant:category:delete` |

## Data Model

Adds module-owned table:

- `restaurant_category`

The table owns its `tenantId` field and does not add inverse relations to Core Prisma models.

## Multi-Module Validation

This slice must prove:

- no `src/core` changes
- no `src/modules/salon` changes
- Restaurant is registered outside Core
- Restaurant permissions are module-owned
- RLS remains tenant isolation only
- dependency direction remains Module → Core only

## Implementation Notes

- `DELETE` performs soft deactivation (`active = false`)
- Restaurant must be enabled for a Tenant through `TenantModule` before these APIs are usable
- Module registry remains an implementation choice outside Core
