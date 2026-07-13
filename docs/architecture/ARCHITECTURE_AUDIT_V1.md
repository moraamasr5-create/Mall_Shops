# Architecture Audit v1.0 — Proven by Implementation

## Status

**PASSED — No critical findings**

Date: 2026-07-13

Scope: Full repository audit of Architecture Lock v1.0 against the implemented codebase (Vertical Slices 1–5), not documentation review alone.

Verdict:

> Architecture v1.0 is **Locked** and **Proven by Implementation**.
> Focus may shift to building platform features and production readiness.
> Do not redesign Architecture unless a future slice surfaces a real defect.

---

## Audit Method

| Method | Result |
|--------|--------|
| `npm run check:architecture` | Passed |
| `npm run verify` (architecture + Prisma generate + typecheck + tests) | Passed |
| Resolved import graph over all `src/**/*.ts(x)` | 37 files, **0 cycles** |
| Manual checklist from [ARCHITECTURE_REGRESSION_CHECKLIST.md](../ARCHITECTURE_REGRESSION_CHECKLIST.md) | Passed |
| Layer / Prisma / RLS / RBAC spot checks | Passed (advisories only) |

Audited concerns requested before expanding Vertical Slices:

1. Indirect imports from Core into Modules
2. Undiscovered circular dependencies
3. Module permissions / constants leaking into Core
4. Direct Prisma or Supabase usage in forbidden layers
5. Any Architecture Lock breakage

---

## Critical Findings

**None.**

---

## Checklist Results

### 1. Core → Modules imports (direct and resolved)

| Check | Result |
|-------|--------|
| No `@/modules/...` imports under `src/core` | Pass |
| Resolved relative/`@/` imports never land in `src/modules` | Pass |
| No dynamic `import()` / `require()` bypasses | Pass |

`createTenant` accepts `initialModuleKeys: readonly string[]` from the presentation layer. Core never hardcodes `salon`, `restaurant`, or any other concrete module.

### 2. Circular dependencies

| Check | Result |
|-------|--------|
| Core ↔ Modules cycles | Pass (none) |
| Any cycle in full `src` import graph | Pass (none) |

Observed import matrix (edge counts):

| Direction | Count | Assessment |
|-----------|------:|------------|
| `app → core` | 28 | Expected (presentation) |
| `app → modules` | 26 | Expected (presentation) |
| `modules → core` | 7 | Expected |
| `core → modules` | 0 | Required |
| `modules → modules` | 8 | Registry composition root + same-module / test only |
| Cross-module (`salon` ↔ `restaurant`) | 0 | Required |

### 3. Module permissions / constants in Core

| Check | Result |
|-------|--------|
| Concrete module names in `src/core` | Pass (none) |
| Module-shaped permissions (`module:resource:action`) in `src/core/rbac` | Pass (none) |
| Core RBAC contains only platform permissions (`tenant:*`, `member:*`, `module:*`) | Pass |
| Module permissions live in owning modules | Pass (`salon/permissions.ts`, `restaurant/permissions.ts`) |

### 4. Prisma / Supabase layering

| Check | Result |
|-------|--------|
| `@prisma/client` / `PrismaClient` only in `src/infrastructure/prisma.ts` | Pass |
| `@supabase/supabase-js` only in `src/infrastructure/supabase/auth.ts` | Pass |
| Core / Modules consume Infrastructure adapters, not vendor SDKs directly | Pass |
| JWT used for Identity only (no tenant/role/permission claims) | Pass |
| Core Prisma models (`Tenant`, `Membership`, `TenantModule`) have no relations to module tables | Pass |
| Module tables own their own `tenantId` | Pass |

**Interpretation:** Direct vendor SDK imports are confined to Infrastructure. Core and Modules call thin adapters (`prisma`, `resolveIdentityFromAccessToken`). That matches swappable Infrastructure; it is not a Core ↔ Module leak.

### 5. Architecture Lock invariants

| Locked Decision | Implementation | Result |
|-----------------|----------------|--------|
| No BusinessUnit | Absent from schema and code | Pass |
| No User table / no `owner_id` on Tenant | Ownership via `Membership(role=OWNER)` | Pass |
| JWT = Identity only; Tenant via `X-Tenant-Id` | `request-context.ts` + Supabase auth helper | Pass |
| Explicit Permission mapping, no inheritance | `CORE_ROLE_PERMISSIONS` + module grant maps | Pass |
| Module / TenantModule concepts; storage unlocked | Constants registry + `tenant_module` table | Pass |
| Core never depends on a concrete business Module | Proven by VS5 (Restaurant added without Core changes) | Pass |
| Authorization Layer 1 = RLS tenant isolation only | `supabase/rls.sql` | Pass |
| Authorization Layer 2 = Application Role → Permission | Route handlers + `requirePermission` | Pass |

---

## Advisories (Non-Blocking)

These do **not** block declaring Architecture Proven. They are hygiene / future hardening items.

### A1 — Dependency matrix omitted Infrastructure consumers

`docs/architecture/ARCHITECTURE.md` previously listed Core as importing Shared only. Implementation correctly allows Core and Modules to import Infrastructure adapters.

**Action taken:** Dependency rules updated to document the proven direction.

### A2 — Early-slice services call Prisma adapters directly

Module/Core services use `@/infrastructure/prisma` rather than full DDD repository ports. Acceptable for VS1–5; repository ports remain optional hardening when complexity warrants it ([DDD_MODULE_PATTERN.md](../implementation/DDD_MODULE_PATTERN.md) is Draft).

### A3 — Documentation drift corrected by this audit

| Drift | Correction |
|-------|------------|
| `AGENTS.md` still described a docs-only Phase 0 repo | Updated for implemented toolchain |
| Some MVP notes still treated Restaurant as “planned only” | Marked superseded where VS5 landed |
| Architecture dependency table incomplete for Infrastructure | Completed |

### A4 — Module registry is a composition root

`src/modules/registry.ts` imports concrete modules. That is intentional and outside Core. Adding a new module still requires registering it there — not inside `src/core`.

---

## Evidence Snapshot

```text
npm run check:architecture  → Architecture regression check passed.
npm run verify              → architecture + prisma generate + tsc + vitest passed
                              (16 tests across core + salon + restaurant)
```

Core freeze relative to `origin/main` at audit time: no Core changes in this audit branch (docs + gate hardening only).

---

## Gate Hardening From This Audit

`scripts/check-architecture.mjs` now also enforces:

1. Shared purity (Shared must not import Core / Modules / Infrastructure)
2. No cross-module imports except the modules registry composition root
3. Vendor SDK imports (`@prisma/client`, `@supabase/*`) only under `src/infrastructure`
4. Full-graph cycle detection (not only Core ↔ Modules)

Run before every merge:

```bash
npm run verify
```

---

## Decision

| Question | Answer |
|----------|--------|
| Is Architecture Lock still valid? | Yes |
| Any critical architectural leakage? | No |
| May Architecture be treated as Proven by Implementation? | **Yes** |
| Next focus | Build platform features / production readiness via Vertical Slices |
| When to reopen Architecture? | Only if implementation exposes a real architectural defect |

---

## Related Documents

- [ARCHITECTURE_LOCK.md](../ARCHITECTURE_LOCK.md)
- [ARCHITECTURE_REGRESSION_CHECKLIST.md](../ARCHITECTURE_REGRESSION_CHECKLIST.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [VERTICAL_SLICE_5.md](../implementation/VERTICAL_SLICE_5.md)
