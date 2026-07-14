# Official Architecture Audit — Final

## Document Status

**Official project reference**

| Field | Value |
|-------|-------|
| Architecture version | v1.0 FINAL LOCKED |
| Audit date | 2026-07-14 |
| Reopen Architecture? | Not warranted by current state |

---

## Governance Position

This document sits in the project governance chain:

```
Contracts ...................... Business Truth (what must be)
Architecture Lock .............. Fixed architectural decisions
Official Architecture Audit .... Does current implementation match those decisions?
Regression Checklist ........... How we prevent breaking them during development
```

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

Implementation Maturity ....... IN PROGRESS
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
| Product | Any unimplemented MVP product features |

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
