# Official Architecture Audit — Final

## Document Status

**Official project reference**

| Field | Value |
|-------|-------|
| Architecture version | v1.0 FINAL LOCKED |
| Audit date | 2026-07-15 |
| Full compliance audit | ~96% Lock-weighted (see §13) |
| Reopen Architecture? | Not warranted by current state |

---

## Governance Position

This document sits in the project governance chain:

```
Platform Principles ............ Enduring constitution (why the platform exists)
Contracts ...................... Business Truth (what must be)
Architecture Lock .............. Fixed architectural decisions
Official Architecture Audit .... Does current implementation match those decisions?
Regression Checklist ........... How we prevent breaking them during development
Operational Gate ............... Live Cross-Tenant evidence before DB Hardening
Decision Log ................... Executive OP-* records (why work is blocked/deferred)
Release Gates .................. RG-* conditions for VS1 Complete / shipping
```

**Documentation rule:** New docs only for **Decision**, **Evidence**, or **Policy** — see [PLATFORM_PRINCIPLES.md](./PLATFORM_PRINCIPLES.md).

---

## 0. Delivery Roadmap (current)

```
Architecture Lock v1.0 ............... ✅ Locked
VS1 Runnable ......................... ✅ Completed
Operational Gate (Cross-Tenant) ...... ✅ OP-001 CLOSED (RG-001 PASSED)
DB Role Hardening .................... → OP-002 (Production Hardening)
Production Readiness ................. ⏳ (RG-003)
VS1 Complete ......................... ⏳ OP-* CLOSED + RGs PASSED
Release Candidate (RC1) .............. ⏳ (RG-004)
Pilot Deployment (trial client) ...... ⏳ (RG-005)
Tag v1.0.0 ........................... ⏳ (RG-006)
Reference Module = Salon ............. ✅ Frozen
First Production Module .............. After RG-006 only
```

**Current program phase:** **Production Hardening** (see [DECISION_LOG.md](./DECISION_LOG.md), [RELEASE_GATES.md](./RELEASE_GATES.md)).  
Historical freeze: [2026-07-15 Operational Pass](./evidence/2026-07-15-operational-pass.md) · git tag `vs1-operational-pass`.

**Governance foundation:** Platform Principles + Architecture Lock + ADR + Decision Log + Operational Gates + Release Gates = **COMPLETE**.  
**Operational foundation:** Live Cross-Tenant **PASS** on Hosted Staging = **COMPLETE**.

| Dimension | Status |
|-----------|--------|
| Architecture Foundation | **COMPLETE** |
| Governance Foundation | **COMPLETE** |
| Operational Foundation | **COMPLETE** |
| Operational Qualification | **COMPLETE** (OP-001 CLOSED) |
| Production Hardening | **IN PROGRESS** (OP-002) |
| Production Qualification | **NOT STARTED** (RG-003+) |
| Module Expansion | **BLOCKED** until RG-006 (Tag v1.0.0) |

**Process rules:**

1. **OP-001 is CLOSED.** DB Role Hardening (OP-002) may proceed only when **AUTHORIZED** and explicitly assigned.
2. Do not start **Production Readiness** until OP-002 path and live evidence policy for that phase are met.
3. Do not claim **VS1 Complete** unless the [formal definition](./RELEASE_GATES.md) is met (mandatory OP-\* **CLOSED** + Release Gates **PASSED**).
4. Do not introduce a new production Module or expand Restaurant until after **RG-006** (Tag v1.0.0).
5. Prefer **RC1 → Pilot (RG-004/RG-005)** before Tag so operational learnings land first.
6. Prefer closing an existing Gate/OP over opening new scope.

---

## Release Criteria — Operational Gates

Operational Gates are **release criteria**, not developer utilities.

| Gate | Required for | Status source |
|------|--------------|---------------|
| Architecture Regression (`npm run verify` / checklist) | Every merge / Vertical Slice | [ARCHITECTURE_REGRESSION_CHECKLIST.md](./ARCHITECTURE_REGRESSION_CHECKLIST.md) |
| **Operational Gate: Cross-Tenant Validation** | DB Hardening start; Production Readiness; VS1 Complete; RC1; Tag v1.0.0; any new production Module | [evidence/CROSS_TENANT.md](./evidence/CROSS_TENANT.md) + `docs/evidence/cross-tenant-latest.md` |

A unit-test-green matrix alone does **not** satisfy the Cross-Tenant release gate. Only a stored live report with **Overall: PASS** does.

---

## Operational Gate: Cross-Tenant Validation

This is a **formal project gate**, not an informal script success.

The gate is **PASSED** only when **all** of the following are true:

| # | Requirement |
|---|-------------|
| 1 | Live Supabase environment (local CLI stack or Hosted — real Auth + Postgres + applied migrations/RLS) |
| 2 | Authenticated JWT (Identity-only access token from Supabase Auth) |
| 3 | Real RLS policies active (`FORCE ROW LEVEL SECURITY` from Prisma migrations) |
| 4 | Cross-tenant **read** attempts return **403** or **0** business rows |
| 5 | Cross-tenant **write** attempts **fail** (denied; no foreign-tenant mutation) |
| 6 | Evidence report generated and stored at `docs/evidence/cross-tenant-latest.md` with **Overall: PASS** |

Command:

```bash
npm run evidence:cross-tenant
```

| Report overall | Gate meaning |
|----------------|--------------|
| **PASS** | Gate PASSED — DB Hardening may begin |
| **FAIL** | Gate FAILED — tenant isolation broken; stop and fix |
| **NOT_EXECUTED** | Gate not evaluated — environment unavailable; no conclusion |

Canonical procedure: [docs/evidence/CROSS_TENANT.md](./evidence/CROSS_TENANT.md).  
Executive record: [Decision Log — OP-001](./DECISION_LOG.md#op-001).

**Only after this gate is PASSED may DB Role Hardening begin.**

### Current runtime evidence (living)

| Field | Value |
|-------|--------|
| Last overall | See [`docs/evidence/cross-tenant-latest.md`](./evidence/cross-tenant-latest.md) |
| DB Hardening proposal | **Approved / Deferred** until this gate shows **PASS** |
| Ready for Implementation? | **No** until live **PASS** is recorded |

When a live run succeeds, update the evidence file and change DB Hardening to **Approved / Ready for Implementation** only after confirming no discrepancy between unit-test matrix and live behavior.

---

## 1. Executive Verdict

Architecture v1.0 is validated and internally consistent within the MVP scope. No architectural redesign is required. The remaining work is implementation hardening before production, primarily ensuring that all architectural decisions are fully enforced at runtime (especially Layer 1 database isolation and infrastructure maturity).

The architectural boundaries, dependency direction, module isolation, Core independence, and extensibility have been successfully demonstrated through multiple Vertical Slices, including the introduction of an independent second module without modifying the Core.

Architecture is considered stable. Future work should focus on implementation quality rather than architectural restructuring.

**The architecture has been validated through implementation across multiple Vertical Slices. Remaining work focuses on production hardening rather than architectural evolution.**

| Dimension | Status |
|-----------|--------|
| Architecture | Validated within MVP scope |
| Implementation | Hardening required before production |
| Production readiness | Not yet — does not invalidate the architecture |

---

## 2. Architecture Status

```
Architecture Lock ............. VALIDATED
Contracts ..................... STABLE
Module Boundaries ............. PROVEN
Dependency Direction .......... ENFORCED
Core Independence ............. PROVEN
Second Module Validation ...... PASSED
Regression Gate ............... AUTOMATED
Operational Gate (Cross-Tenant) WAITING LIVE PASS

Implementation Maturity ....... IN PROGRESS
DB Role Hardening ............. APPROVED / DEFERRED (blocked on Operational Gate)
Production Hardening .......... REQUIRED
Production Ready .............. NOT YET
```

---

## 3. Source of Truth

> Contracts are the Source of Truth for business rules. Code is the Source of Truth for the currently executing implementation. Any divergence between the two is an implementation defect against the contracts, not a competing architecture.

| Concern | Source of Truth |
|---------|-----------------|
| Business rules | Contracts (`docs/contracts/`) |
| Currently executing behavior | Code |
| Identity | Identity Provider (Supabase Auth today) |
| Tenant / Membership / TenantModule | Core domain model + persistence implementation |
| Roles / Core permissions | Core RBAC (implements contracts) |
| Module permissions | Owning module |
| Module catalog | Registry concept — constants today are an **implementation choice** and are **not part of the architectural contract** |
| Module activation | TenantModule relationship — `tenant_module` table is a VS1 implementation choice |

---

## 4. Architecture Validation

### Model under Architecture Lock

```
Identity (Supabase Auth)
  → Membership (role)
    → Tenant
      → TenantModule (activation — VS1 persistence choice)
        → Module (registry concept — storage unlocked)
          → Module data (salon_* / restaurant_*)
```

### Authorization layers (design vs primary runtime path)

| Layer | Responsibility | Design | Primary runtime data access path |
|-------|----------------|--------|----------------------------------|
| Layer 1 | Database isolation | Defined (RLS in Prisma migrations) | Enforced on user path via `withIdentityRls` |
| Layer 2 | Business authorization | Defined | Enforced (`requirePermission`) |

Accurate statement for Layer 1:

> **Layer 1 database isolation is defined in Prisma migrations and enforced on the primary user-facing Prisma path via JWT claim injection + `SET LOCAL ROLE authenticated`. Tenant bootstrap uses a restricted privileged path for `createTenant` only.**

**Both layers are required simultaneously. Privileged bootstrap must not become the default data path.**

---

## 5. Proven Architectural Invariants

| # | Invariant | Status |
|---|-----------|--------|
| 1 | Core knows no business modules | ✓ |
| 2 | Modules know Core | ✓ |
| 3 | Modules do not know each other | ✓ |
| 4 | Dependency direction Module → Core | ✓ |
| 5 | Core freeze | ✓ |
| 6 | Module permissions stay inside modules | ✓ |
| 7 | JWT = Identity only; Tenant via request context | ✓ |
| 8 | Explicit RBAC (no inheritance) | ✓ |
| 9 | No reverse Core → module persistence relations | ✓ |
| 10 | Layer 1 policy design isolates tenant only (no business roles) | ✓ |
| 11 | Module Registry is an architectural concept; storage unlocked | ✓ |
| 12 | Second module added without Core changes | ✓ |
| 13 | Architecture Regression Gate enforced in CI/process | ✓ |

These prove Architecture Lock for boundaries, dependency direction, and extensibility.

---

## 6. Implementation Hardening Gaps

Not architectural inconsistencies. Not redesign signals.

### Critical Before Production

**Layer 1 is enforced on the VS1 user-facing Prisma path.** Remaining hardening: continuous cross-tenant penetration tests, connection-role hardening (prefer a non-superuser login that can only `SET ROLE authenticated`), and ops discipline so privileged bootstrap never spreads.

### Progressive Improvements

| Item | Note |
|------|------|
| Repository abstraction | MVP-acceptable; address before production-scale evolution; no ADR now |
| DDD maturation | ADR-003 direction; Route → Service → Prisma does not break Architecture Lock |
| Infrastructure decoupling | Progress with repository abstraction |

---

## 7. Production Readiness Risks

| Risk | Source | Impact |
|------|--------|--------|
| Cross-tenant exposure if privileged bootstrap spreads beyond createTenant | Ops / misuse of getPrivilegedDb | High |
| False assumption that DB isolation auto-protects all API traffic | Ops / misunderstanding | High |
| Architecture regression if Architecture Gate is bypassed | CI / Process | High |
| Harder storage/backend swap later | Direct persistence in services | Medium at scale |

---

## 8. Implementation / Product Backlog

**Out of this audit's scope** (tracked independently):

| Type | Item |
|------|------|
| Docs | Keep MVP_DECISIONS aligned as Salon remains the only auto-enabled module |
| Ops | Prefer dedicated non-superuser DB login for app connections |
| Ops | **DB Role Hardening (OP-002):** analysis **Approved**; implementation **Deferred** / **Not Authorized Yet** until OP-001 PASS — see [DECISION_LOG.md](./DECISION_LOG.md) |
| Product | Any unimplemented MVP product features |
| Future review | Last OWNER — suspend/rollback paths must never leave a Tenant with zero active OWNER |
| Future review | Last OWNER — concurrent revoke/demote race (transaction / row lock / serializable check) |
| Future review | Ownership transfer — always **Grant OWNER then Remove OWNER** (never reverse); not in MVP |

### Future review notes — Last OWNER (not MVP; do not implement in this slice)

Current Membership invariant (`assertLastOwnerInvariant`) covers the single-request demote/suspend/revoke case when `activeOwnerCount <= 1`. The following remain **open for a later hardening pass** — not Architecture Lock reopeners:

1. **Suspend → rollback:** Ensure reactivation / compensating flows cannot leave the Tenant without an active OWNER at any observable commit boundary.
2. **Concurrent dual revoke:** Two requests each seeing `activeOwnerCount = 2` and both succeeding could race; revisit with a DB transaction and appropriate lock/serialization when membership mutation APIs are exposed under concurrency.
3. **Transfer Ownership:** When product needs transfer, order must be Grant OWNER → then Remove/demote source OWNER (Membership Contract already states transfer as grant-then-optionally-revoke).

Incomplete product delivery ≠ architectural failure.

---

## 9. Recommended Next Steps

1. **Before production:** Ensure Layer 1 database isolation is effectively enforced on the primary runtime data access path, regardless of the underlying implementation mechanism.
2. **Before scale evolution:** Repository abstraction and infrastructure decoupling (no ADR required now).
3. **Progressively:** DDD maturation where real domain rules appear.
4. **Independently:** Product, docs, security, and operational backlogs.
5. **Always:** Keep the Architecture Regression Gate mandatory — do not bypass.

Do not reopen Architecture v1.0 unless a real architectural defect appears during implementation.

---

## 10. Delivery Strategy

```
Vertical Slices → Continuous Verification → Implementation Hardening → Production Readiness
```

Continuous Verification (Architecture Regression Gate + `npm run verify`) is a core part of how the project maintains architectural integrity — not a technical detail.

---

## 11. Scope of this Audit

This audit evaluates architectural correctness and implementation alignment with Architecture v1.0.

It does not evaluate:

- Feature completeness
- Product readiness
- Performance
- Security hardening
- Operational readiness

These concerns are tracked independently.

---

## 12. Final Verdict

**Architecture: VALIDATED / STABLE**

**Redesign: NOT REQUIRED**

**Delivery Strategy:** Vertical Slices → Continuous Verification → Implementation Hardening → Production Readiness

---

## 13. Full Compliance Audit Snapshot (2026-07-15)

Lock-weighted score: **~96%**.

| Band | Finding |
|------|---------|
| RED | No hard Architecture Lock violations in executable code |
| ORANGE | Privileged DB limited to `createTenant`; remaining ops hardening = non-BYPASSRLS login |
| YELLOW | Thin DDD (Route → Service → Prisma); Membership last-OWNER revoke rules incomplete |
| GREEN | JWT Identity-only, two-layer auth on user path, Core independence, module isolation, no User/`owner_id`/BusinessUnit |

**Before claiming full “Architecture Compliant” (operational bar):**

1. Core freeze gate fail-closed without Git/base ref — **done** (`check-architecture.mjs`)
2. Lock-contradicting docs aligned (`DOMAIN_MODEL`, `PRISMA_SCHEMA`, `MIGRATION_PLAN`, `PLATFORM_ARCHITECTURE`) — **done**
3. Cross-tenant penetration evidence on live stack — **harness ready** (`npm run evidence:cross-tenant`); treat as proven only when `docs/evidence/cross-tenant-latest.md` shows **PASS**
4. Prefer non-superuser app DB role that can only `SET ROLE authenticated` — **deferred** until Cross-Tenant **PASS**; pre-answers documented in [RLS.md — DB Role Hardening Decision Record](./implementation/RLS.md)
5. Membership last-OWNER protection when revoke/delete membership is implemented

VS1 Architecture Freeze commits already on history: Lock finalize + VS1 storage choices recorded. Branch `cursor/vs1-runnable-rls-bootstrap` is the runnable Layer-1 enforcement slice (Core Security Improvement), not an architecture redesign.

---

## Document Maintenance

This document is a living implementation audit.

- Architecture Lock changes require an Architecture Review.
- Implementation progress should update this audit without modifying the Architecture Lock unless a verified architectural defect is discovered.

---

## Related Documents

- [Architecture Lock v1.0](./ARCHITECTURE_LOCK.md)
- [Architecture Regression Checklist](./ARCHITECTURE_REGRESSION_CHECKLIST.md)
- [Contracts Index](./contracts/INDEX.md)
- [Architecture Overview](./architecture/ARCHITECTURE.md)
