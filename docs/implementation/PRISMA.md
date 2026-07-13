# Prisma ORM

## Status

**Draft — implementation layer.** Describes the intended Prisma schema. Not yet implemented in code.

---

## Why Prisma (Current Choice)

| Benefit | Detail |
|---------|--------|
| Type safety | Generated TypeScript types from schema |
| Migrations | Versioned, repeatable schema changes |
| Relations | Declarative relationship modeling |
| DX | Auto-completion, query builder |

**Replaceable with:** Drizzle, Kysely, raw SQL, or any ORM. Contracts remain unchanged.

---

## Schema Location (Planned)

```
prisma/
├── schema.prisma       # Core + Module models
└── migrations/         # Versioned migrations
```

---

## Core Models (Planned)

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  memberships  Membership[]
  tenantModules TenantModule[]

  @@map("tenant")
}

model Membership {
  id         String   @id @default(cuid())
  identityId String   @map("identity_id")
  tenantId   String   @map("tenant_id")
  role       String
  status     String   @default("active")
  invitedBy  String?  @map("invited_by")
  joinedAt   DateTime @default(now()) @map("joined_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([identityId, tenantId])
  @@index([identityId])
  @@index([tenantId])
  @@map("membership")
}

model Module {
  // OPTIONAL — Module storage is not Architecture-locked.
  // Vertical Slice 1 may keep Module as constants/config instead of this table.
  moduleKey   String   @id @map("module_key")
  displayName String   @map("display_name")
  description String?
  status      String   @default("available")
  createdAt   DateTime @default(now()) @map("created_at")

  tenantModules TenantModule[]

  @@map("module")
}

model TenantModule {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  moduleKey   String   @map("module_key")
  enabled     Boolean  @default(true)
  activatedAt DateTime @default(now()) @map("activated_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  // If Module table is not used, drop the Module relation and keep moduleKey as a validated string.

  @@unique([tenantId, moduleKey])
  @@index([tenantId])
  @@map("tenant_module")
}
```

---

## Module Model Pattern (Planned)

```prisma
// Example pattern — not yet implemented
model SalonEmployee {
  id        String   @id @default(cuid())
  tenantId  String   @map("tenant_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([tenantId])
  @@map("salon_employee")
}
```

Module models are added when each Module is implemented. Module models keep
`tenantId` as module-owned tenant scope and do not add inverse relations to
Core Prisma models.

---

## Conventions

| Convention | Rule |
|-----------|------|
| Table names | snake_case, plural or descriptive |
| Column names | snake_case in DB, camelCase in Prisma |
| Primary keys | CUID strings |
| Timestamps | `created_at`, `updated_at` on all tables |
| Tenant scope | `tenant_id` on all business tables |
| Module prefix | `{moduleKey}_` on module table names |
| No User model | Identity referenced by `identity_id` string |
| Module registry | Architectural concept — storage undecided (table / constants / config / service) |

---

## Mapping to Contracts

| Contract Entity | Prisma Model | Notes |
|----------------|-------------|-------|
| Tenant | `Tenant` | No `ownerId` field |
| Membership | `Membership` | `identityId` is opaque string |
| Module | optional `Module` table or non-DB registry | Storage undecided |
| TenantModule | `TenantModule` | Activation record; `moduleKey` validated against Module concept |
| Identity | — | Not persisted; external reference only |

---

## Migration Workflow (Planned)

```bash
# Create migration after schema change
npx prisma migrate dev --name describe_change

# Apply in CI/production
npx prisma migrate deploy

# Regenerate client
npx prisma generate
```

---

## Related Documents

- [DATABASE.md](./DATABASE.md) — Table design
- [SUPABASE.md](./SUPABASE.md) — Database hosting
- [Contracts](../contracts/INDEX.md) — Business rules
