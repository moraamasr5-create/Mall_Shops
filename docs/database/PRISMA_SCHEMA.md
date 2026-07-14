# Prisma Schema

This document describes how business contracts are implemented in the current Prisma/PostgreSQL data model.

For authoritative business rules, see [Business Contracts](../contracts/INDEX.md). This schema may change if the ORM or database technology changes.

## Schema Location

```
prisma/
├── schema.prisma       # Model definitions
└── migrations/         # Migration history
```

> **Status (VS1):** Live schema is in `prisma/schema.prisma` and applied via
> `prisma/migrations/`. Prefer the live schema over illustrative snippets below
> when they diverge. Canonical ORM notes: [PRISMA.md](../implementation/PRISMA.md).

## Enums

```prisma
enum MembershipRole {
  OWNER
  ADMIN
  MANAGER
  STAFF
  CUSTOMER
}
```

## Core Platform Models

### Tenant

Implements [Tenant Contract](../contracts/TENANT.md).

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships  Membership[]
  modules      TenantModule[]

  @@map("tenant")
}
```

### Membership

Implements [Membership Contract](../contracts/MEMBERSHIP.md).

```prisma
model Membership {
  id        String         @id @default(cuid())
  identityId String
  tenantId  String
  role      MembershipRole
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([identityId, tenantId])
  @@map("membership")
}
```

**Notes:**

- `identityId` references the Identity Provider subject. No Prisma relation to auth schema — enforced at application level.
- The `@@unique([identityId, tenantId])` constraint enforces the one-membership-per-identity-per-tenant invariant.

### TenantModule (VS1 persistence choice)

Persists the [TenantModule](../contracts/TENANT_MODULE.md) activation relationship for VS1.
Architecture treats TenantModule as a relationship; persistence is intentionally not locked.

```prisma
model TenantModule {
  id        String   @id @default(cuid())
  tenantId  String
  moduleKey String
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, moduleKey])
  @@map("tenant_module")
}
```

**Notes:**

- `moduleKey` is a string identifier (e.g., `salon`, `restaurant`, `clinic`). Valid keys are validated at the application level.
- The `@@unique([tenantId, moduleKey])` constraint enforces one enablement per module per tenant.
- `onDelete: Cascade` ensures module enablements are removed when the tenant is deleted.

## Module Models (Salon — Reference Implementation)

Salon is the first module. Its models demonstrate the pattern for all future modules.

```prisma
model SalonEmployee {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@map("salon_employee")
}

model SalonService {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  durationMin Int
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId])
  @@map("salon_service")
}

model SalonCustomer {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  email     String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@map("salon_customer")
}

model SalonAppointment {
  id         String   @id @default(cuid())
  tenantId   String
  employeeId String
  serviceId  String
  customerId String
  startTime  DateTime
  endTime    DateTime
  status     String   @default("scheduled")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([tenantId])
  @@index([employeeId, startTime])
  @@map("salon_appointment")
}
```

### Module Model Conventions

All module models follow these conventions:

| Convention | Purpose |
|------------|---------|
| `tenantId` column on every table | Tenant data isolation |
| `@@index([tenantId])` | Query performance for tenant-scoped reads |
| `@@map("<module>_<table>")` | Consistent table naming in PostgreSQL |
| No cross-module foreign keys | Module independence |
| No Prisma relation to Tenant | Avoids coupling module models to core; tenant scope enforced via RLS |

## Entity Relationship Summary

```
Tenant 1──N Membership
Tenant 1──N TenantModule
Tenant 1──N SalonEmployee      (via tenantId, no FK)
Tenant 1──N SalonService       (via tenantId, no FK)
Tenant 1──N SalonCustomer      (via tenantId, no FK)
Tenant 1──N SalonAppointment   (via tenantId, no FK)
```

Module tables reference `tenantId` as a plain string column. Referential integrity for module data is enforced by RLS policies, not Prisma foreign keys. This keeps module schemas independent of core schema changes.

## Mapping: Contracts to Schema

| Contract Invariant | Schema Enforcement |
|--------------------|-------------------|
| One membership per identity per tenant | `@@unique([identityId, tenantId])` on Membership |
| One module enablement per module per tenant | `@@unique([tenantId, moduleKey])` on TenantModule |
| Tenant deletion cascades | `onDelete: Cascade` on Membership, TenantModule |
| Module data is tenant-scoped | `tenantId` column on all module tables |
| Role belongs to membership | `role` field on Membership, not on User |

## MVP Status

> **MVP Decision:** Only core platform models (Tenant, Membership, TenantModule) will be migrated first. Salon module models follow in a subsequent migration.

> **MVP Decision:** User model is not in Prisma schema. Identity is managed by the Identity Provider; `identityId` in Membership references the provider subject.

## Related Documents

- [Business Contracts](../contracts/INDEX.md)
- [Migration Plan](./MIGRATION_PLAN.md)
- [RLS Strategy](../security/RLS_STRATEGY.md)
- [Domain Model](../architecture/DOMAIN_MODEL.md)
