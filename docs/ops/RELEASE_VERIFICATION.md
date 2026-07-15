# Release Verification (CI) — PR-06

**What this is:** What must pass before merge / before claiming a release candidate path.  
**What this is not:** Deployment, hosting, or external SaaS CI add-ons beyond GitHub Actions.

**Gate:** [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) · **PR-06**  
**Workflow:** [`.github/workflows/verify.yml`](../../.github/workflows/verify.yml)

---

## 1. What is verified before merge?

On every **pull_request** and every **push** to `main`, GitHub Actions runs:

| Step | Command | Purpose |
|------|---------|---------|
| Install | `npm install` | Reproducible dependency tree for the job |
| Typecheck | `npm run typecheck` | TypeScript safety |
| Tests | `npm test` | Unit / contract tests (Vitest) |
| Architecture | `npm run check:architecture` | Core freeze, dependency direction, RLS role encoding checks |
| Full gate | `npm run verify` | Architecture + `prisma generate` + typecheck + tests |

`npm run verify` already includes architecture + generate + typecheck + test; the discrete steps before it make failures easier to read in the Actions UI.

**Architecture freeze:** compares `src/core` to `origin/main` (`ARCH_CHECK_BASE_REF`). Intentional Core changes require `ARCH_ALLOW_CORE_CHANGES=true` only after Architecture Review (see `AGENTS.md`).

**Not run in this CI (by design for PR-06):**

- Live Supabase / `evidence:cross-tenant` (needs Staging runtime — Operational Evidence, not merge CI)
- `check:env` against secrets (no Staging credentials in CI for MVP)
- Production deploy

---

## 2. What blocks a Release?

A release train step (**RG-004 RC1** and beyond) must **not** proceed if any of the following are true:

| Blocker | Why |
|---------|-----|
| `verify` workflow **red** on the candidate commit | Code/architecture gate failed |
| RG-001 / RG-002 not passed | Operational foundations missing |
| RG-003 not passed (PR-01…PR-07) | Production Readiness incomplete |
| Latest Cross-Tenant evidence not **Overall: PASS** when required by sign-off | Isolation not proven |
| Uncommitted / undeclared local changes treated as “ready” | Not reproducible |
| Conflicting canonical docs unresolved when Sign-off requires it | Governance drift |

**Final Release Audit (before RG-004):** one human/agent review — not a separate PR-xx — covering Architecture Lock intact, OP/RG through RG-003, no conflicting docs, clean `git status`, latest Evidence **PASS**. See [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) § Final Release Audit.

---

## 3. Exit Criteria — when PR-06 is complete

PR-06 is **PASS** when:

1. `.github/workflows/verify.yml` exists and triggers on PR + push to `main`.  
2. Job runs install, typecheck, test, `check:architecture`, and `verify`.  
3. This document exists with pre-merge checks, release blockers, and exit criteria.  
4. No Architecture / RLS / Prisma schema redesign; no new deploy pipeline or external services.  
5. [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) marks **PR-06** PASS.  
6. Work **stops** — **PR-07 not started** until explicitly assigned.

---

## 4. Local equivalent

```bash
npm install
npm run typecheck
npm test
npm run check:architecture
npm run verify
```

Same commands CI uses; prefer green locally before opening a PR.
