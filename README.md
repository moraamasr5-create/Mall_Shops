# Mall Shops

Multi-tenant, multi-module Business Operating Platform (BOP).

---

## Status

**Architecture v1.0 FINAL LOCKED / FROZEN**

Active work: **Vertical Slice 1**

`Identity → Tenant → Membership → TenantModule → Salon (Reference Module)`

---

## Documentation

| Layer | Location |
|-------|----------|
| Architecture Lock | [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) |
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
