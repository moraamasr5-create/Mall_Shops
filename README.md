# Mall Shops

Multi-tenant, multi-module Business Operating Platform (BOP).

---

## Status

**Architecture v1.0 FINAL LOCKED / VALIDATED**

Implementation: **VS1 Runnable** (Salon reference module + Restaurant validation)

See [Official Architecture Audit](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) for current implementation status.

---

## Architecture Governance

The project architecture is governed by the following documents:

- [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) — fixed architectural decisions
- [docs/OFFICIAL_ARCHITECTURE_AUDIT.md](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) — implementation alignment with the Lock
- [docs/ARCHITECTURE_REGRESSION_CHECKLIST.md](./docs/ARCHITECTURE_REGRESSION_CHECKLIST.md) — merge gate and regression prevention

Any architectural change must remain compatible with the Architecture Lock.

```
Contracts → Architecture Lock → Official Architecture Audit → Regression Checklist
```

---

## Documentation

| Layer | Location |
|-------|----------|
| Architecture Lock | [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) |
| Official Architecture Audit | [docs/OFFICIAL_ARCHITECTURE_AUDIT.md](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) |
| Regression Checklist | [docs/ARCHITECTURE_REGRESSION_CHECKLIST.md](./docs/ARCHITECTURE_REGRESSION_CHECKLIST.md) |
| Contracts | [docs/contracts/INDEX.md](./docs/contracts/INDEX.md) |
| Architecture | [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) |
| Implementation | [docs/implementation/](./docs/implementation/) |
| MVP | [docs/mvp/MVP_DECISIONS.md](./docs/mvp/MVP_DECISIONS.md) |

---

## Vertical Slice 1 — Quick Start

```bash
cp .env.example .env

# Local Identity Provider + Postgres (Docker required)
npx supabase start
# copy API URL + anon key from `supabase status` into .env

npm install
npx prisma migrate deploy
# RLS policies are included in Prisma migrations — do not apply a separate rls.sql

npm run dev
```

### Auth headers

```
Authorization: Bearer <supabase-access-token>
X-Tenant-Id: <tenant-id>
```

Obtain a token via:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`

### Minimum path

1. `POST /api/v1/auth/signup` → Identity + access token
2. `POST /api/v1/tenants` → Tenant + OWNER Membership + salon TenantModule (restricted bootstrap DB path)
3. `GET /api/v1/tenants/:id/modules` → activation relationship (RLS + RBAC)
4. `POST /api/v1/salon/services` → Salon Reference Module operation
5. `GET|POST /api/v1/salon/employees` → Salon employee management
6. `GET|POST /api/v1/salon/customers` → Salon customer management

Optional architectural validation only (not MVP expansion):

7. Enable `restaurant` via `POST /api/v1/tenants/:id/modules` then use restaurant category routes

### Authorization (mandatory)

- **Layer 1:** RLS tenant isolation (Prisma migrations) — user requests run as `authenticated` with JWT Identity claims
- **Layer 2:** Application Role → Permission checks (`requirePermission`)

### Smoke + Operational Evidence

```bash
npm run smoke:vs1
npm run evidence:cross-tenant
```

Cross-tenant PASS/FAIL report: [docs/evidence/CROSS_TENANT.md](./docs/evidence/CROSS_TENANT.md)

---

## Implementation notes (not Architecture)

| Concern | VS1 choice |
|---------|------------|
| Module registry | Constants in code |
| TenantModule persistence | `tenant_module` table |
| Salon minimum entity | `salon_service` (+ employees/customers in later slices) |
| User DB path | `withIdentityRls` → `SET LOCAL ROLE authenticated` + JWT `sub` |
| Tenant bootstrap | Privileged Prisma path for createTenant only |
