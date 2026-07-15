# Mall Shops

Multi-tenant, multi-module Business Operating Platform (BOP).

---

## Status

**Architecture v1.0 FINAL LOCKED / VALIDATED**

| Foundation | Status |
|------------|--------|
| Architecture Foundation | **COMPLETE** |
| Operational Foundation | **COMPLETE** (live Cross-Tenant **PASS** on Mall_Full Staging — [snapshot](./docs/evidence/2026-07-15-operational-pass.md)) |

**Current program phase:** **Production Hardening** (starts with [OP-002](./docs/DECISION_LOG.md#op-002) DB Role Hardening).  
Snapshot / tag: `vs1-operational-pass`.

Do not start a new Module or large Feature until Release Gates for that milestone allow it.

See [Official Architecture Audit](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) for roadmap and gate criteria.

---

## Architecture Governance

The project architecture is governed by the following documents:

- [docs/PLATFORM_PRINCIPLES.md](./docs/PLATFORM_PRINCIPLES.md) — Platform constitution (enduring principles)
- [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) — fixed architectural decisions
- [docs/OFFICIAL_ARCHITECTURE_AUDIT.md](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) — implementation alignment with the Lock + **Operational Gate**
- [docs/ARCHITECTURE_REGRESSION_CHECKLIST.md](./docs/ARCHITECTURE_REGRESSION_CHECKLIST.md) — merge gate and regression prevention
- [docs/evidence/CROSS_TENANT.md](./docs/evidence/CROSS_TENANT.md) — Cross-Tenant Operational Gate procedure
- [docs/DECISION_LOG.md](./docs/DECISION_LOG.md) — Operational / executive decision log (OP-001, OP-002, …)
- [docs/RELEASE_GATES.md](./docs/RELEASE_GATES.md) — Release Gates (RG-001 … RG-006) + formal **VS1 Complete** definition

Any architectural change must remain compatible with the Architecture Lock.

```
Contracts → Architecture Lock → Official Architecture Audit → Regression Checklist
                              → Operational Gate (Cross-Tenant PASS)
```

### Delivery roadmap

```
Architecture Lock v1.0 ............... ✅ Locked
VS1 Runnable ......................... ✅ Completed
Operational Gate (Cross-Tenant) ...... ✅ OP-001 CLOSED (RG-001)
DB Role Hardening .................... ✅ OP-002 CLOSED (RG-002)
Production Readiness ................. ⏳ (RG-003)
VS1 Complete ......................... ⏳ OP-* CLOSED + RGs PASSED
RC1 → Pilot → Tag v1.0.0 ............. ⏳ (RG-004 … RG-006)
Salon = Reference Module ............. ✅ Frozen
First Production Module .............. After RG-006
```

### Release criteria (mandatory)

| Gate | Blocks |
|------|--------|
| Architecture Regression (`npm run verify`) | Merges / slices |
| **OP-001 / RG-001** Cross-Tenant **CLOSED** | DB Hardening, Production Readiness, VS1 Complete, RC1, Tag, new Modules |
| **Release Gates RG-002…RG-006** | Shipping train (see [RELEASE_GATES.md](./docs/RELEASE_GATES.md)) |

**VS1 Complete** = mandatory Operational Decisions **CLOSED** + Release Gates **PASSED** — [definition](./docs/RELEASE_GATES.md).

Details: [Official Architecture Audit](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) · [Decision Log](./docs/DECISION_LOG.md) · [Cross-Tenant Gate](./docs/evidence/CROSS_TENANT.md)

---

## Documentation

| Layer | Location |
|-------|----------|
| Platform Principles | [docs/PLATFORM_PRINCIPLES.md](./docs/PLATFORM_PRINCIPLES.md) |
| Architecture Lock | [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) |
| Official Architecture Audit | [docs/OFFICIAL_ARCHITECTURE_AUDIT.md](./docs/OFFICIAL_ARCHITECTURE_AUDIT.md) |
| Regression Checklist | [docs/ARCHITECTURE_REGRESSION_CHECKLIST.md](./docs/ARCHITECTURE_REGRESSION_CHECKLIST.md) |
| Contracts | [docs/contracts/INDEX.md](./docs/contracts/INDEX.md) |
| Architecture | [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) |
| Implementation | [docs/implementation/](./docs/implementation/) |
| MVP | [docs/mvp/MVP_DECISIONS.md](./docs/mvp/MVP_DECISIONS.md) |
| Decision Log (ops) | [docs/DECISION_LOG.md](./docs/DECISION_LOG.md) |
| Release Gates | [docs/RELEASE_GATES.md](./docs/RELEASE_GATES.md) |
| Production Readiness (RG-003 plan) | [docs/PRODUCTION_READINESS.md](./docs/PRODUCTION_READINESS.md) |
| Backup Strategy (PR-02) | [docs/ops/BACKUP_STRATEGY.md](./docs/ops/BACKUP_STRATEGY.md) |
| Restore Verification (PR-03) | [docs/ops/RESTORE_VERIFICATION.md](./docs/ops/RESTORE_VERIFICATION.md) |
| Observability MVP (PR-04) | [docs/ops/OBSERVABILITY.md](./docs/ops/OBSERVABILITY.md) |
| Migration Safety (PR-05) | [docs/ops/MIGRATION_SAFETY.md](./docs/ops/MIGRATION_SAFETY.md) |
| Release Verification (PR-06) | [docs/ops/RELEASE_VERIFICATION.md](./docs/ops/RELEASE_VERIFICATION.md) |
| Production Sign-off (PR-07) | [docs/ops/PRODUCTION_SIGNOFF.md](./docs/ops/PRODUCTION_SIGNOFF.md) |
| First Deployment & First Tenant Runbook | [docs/RUNBOOK_FIRST_DEPLOYMENT.md](./docs/RUNBOOK_FIRST_DEPLOYMENT.md) |

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
