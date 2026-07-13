# Mall Shops

Multi-tenant, multi-module Business Operating Platform (BOP).

---

## Status

**Architecture v1.0 FINAL LOCKED / Proven by Implementation**

Completed slices: **VS1–VS5** (Identity → Tenant → Membership → TenantModule → Salon → Restaurant validation).

Active focus: platform features and production readiness via Vertical Slices — not architectural redesign.

Audit: [docs/architecture/ARCHITECTURE_AUDIT_V1.md](./docs/architecture/ARCHITECTURE_AUDIT_V1.md)

---

## Documentation

| Layer | Location |
|-------|----------|
| Architecture Lock | [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) |
| Architecture Audit | [docs/architecture/ARCHITECTURE_AUDIT_V1.md](./docs/architecture/ARCHITECTURE_AUDIT_V1.md) |
| Contracts | [docs/contracts/INDEX.md](./docs/contracts/INDEX.md) |
| Architecture | [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) |
| Implementation (VS1) | [docs/implementation/VERTICAL_SLICE_1.md](./docs/implementation/VERTICAL_SLICE_1.md) |
| MVP | [docs/mvp/MVP_DECISIONS.md](./docs/mvp/MVP_DECISIONS.md) |

---

## Vertical Slice 1 — Quick Start

```bash
cp .env.example .env
# fill Supabase + DATABASE_URL

npm install
npx prisma migrate dev --name vs1_init
# apply supabase/rls.sql in Supabase SQL editor

npm run dev
```

### Auth headers

```
Authorization: Bearer <supabase-access-token>
X-Tenant-Id: <tenant-id>
```

### Minimum path

1. Authenticate via Supabase Auth (Identity)
2. `POST /api/v1/tenants` → Tenant + OWNER Membership + salon TenantModule
3. `GET /api/v1/tenants/:id/modules` → activation relationship
4. `POST /api/v1/salon/services` → Salon Reference Module operation
5. `GET|POST /api/v1/salon/employees` → Salon employee management
6. `GET|POST /api/v1/salon/customers` → Salon customer management
7. `GET|POST /api/v1/restaurant/categories` → Restaurant module validation

### Authorization (mandatory)

- **Layer 1:** RLS tenant isolation (`supabase/rls.sql`)
- **Layer 2:** Application Role → Permission checks

---

## Implementation notes (not Architecture)

| Concern | VS1 choice |
|---------|------------|
| Module registry | Constants in code |
| TenantModule persistence | `tenant_module` table |
| Salon minimum entity | `salon_service` |
