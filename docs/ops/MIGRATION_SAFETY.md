# Migration Safety & Rollback (MVP) — PR-05

**What this is:** Rules for applying and recovering from Prisma migrations on Staging/Production-like Hosted Supabase.  
**What this is not:** A database reset guide, a rewrite of published SQL, or Architecture Lock change.

**Gate:** [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) · **PR-05**  
**Related:** [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) · [RESTORE_VERIFICATION.md](./RESTORE_VERIFICATION.md) · [MIGRATION_PLAN.md](../database/MIGRATION_PLAN.md)

**PR-05 status:** Review complete — **PASS** (see § Review). No published migration was rewritten. No reset/drop executed.

---

## Review of current Prisma migrations (2026-07-15)

| Order | Folder | Purpose | Empty-DB safe? |
|-------|--------|---------|----------------|
| 1 | `20260714120000_vs1_init` | Tables + indexes + FKs + grants to `authenticated` + ENABLE/FORCE RLS + policies | **Yes** (creates schema from scratch) |
| 2 | `20260715043000_fix_membership_rls_recursion` | SECURITY DEFINER helpers + replace membership policies (hotfix) | **Yes** after #1 (`DROP POLICY IF EXISTS` then recreate) |
| 3 | `20260715050000_op002_app_runtime_role` | Create `app_runtime` (idempotent) + `GRANT authenticated` | **Yes** after #1–2 (`IF NOT EXISTS` on role) |

**Checks:**

| Criterion | Result |
|-----------|--------|
| Lexicographic / timestamp order matches dependency order | **Pass** |
| Later migrations do not edit earlier SQL files | **Pass** (hotfix & OP-002 are additive folders) |
| No undocumented “run this by hand first” step inside SQL | **Pass** |
| Hosted prerequisite | Supabase provides `authenticated` role + `auth.uid()` — required by VS1 RLS (platform assumption, not a hidden script) |
| Staging deploy status | `prisma migrate status` → **Database schema is up to date** (3/3 applied) |

**No new migration required** for PR-05 safety. Optional future work (out of this PR): document `ALTER ROLE app_runtime PASSWORD` remains out-of-band (already in OP-002 migration comments).

---

## 1. Migration Rules

1. **Single source of truth:** schema changes ship only via `prisma/migrations/*/migration.sql` + `prisma/schema.prisma`. No parallel `rls.sql`.  
2. **Apply with:** `npx prisma migrate deploy` (Staging/Production). Prefer `DIRECT_URL` / privileged connection for migrate.  
3. **Never** use `prisma migrate reset` on Staging/Production.  
4. **Never** edit a migration folder that has already been applied to any shared environment.  
5. **Always** add a **new** timestamped migration for fixes (including RLS hotfixes).  
6. **One logical change per migration** when practical (reviewability).  
7. Migrations must be **safe on an empty database** when applied in order from zero.  
8. Do not encode secrets (role passwords) in committed SQL; set out-of-band when needed.  
9. After migrate on Staging: run `npm run check:env` when the app env is in use.  
10. Owner approval required before Production-like migrate outside Staging drills.

---

## 2. Forward-only Policy

**Production / shared Staging policy = forward-only.**

| Allowed | Forbidden |
|---------|-----------|
| New migration that fixes forward | Editing `20260714120000_vs1_init` (or any applied migration) |
| Compensating migration (add/drop/replace objects carefully) | `migrate reset`, drop-all, restore-as-substitute for “undo migrate” without approval |
| `CREATE OR REPLACE` / `DROP … IF EXISTS` in **new** migrations when safe | Relying on uncommitted local SQL |

Development may use `migrate dev` locally; that does **not** change the forward-only rule for shared environments.

---

## 3. Rollback Strategy (documentation only)

Prisma does not ship automatic down migrations in this repo’s workflow.

| Situation | Action |
|-----------|--------|
| **Bad migration not yet applied** anywhere shared | Delete/fix the unreleased migration folder before deploy; do not publish |
| **Bad migration already applied** on Staging | Ship a **new** compensating migration; or restore Staging from backup per [RESTORE_VERIFICATION.md](./RESTORE_VERIFICATION.md) then re-deploy known-good migrate set |
| **Need previous data state** | Prefer **restore** (PR-02/PR-03) over reverse-engineering DROP in place |
| **Partial failure mid-migrate** | Stop. Do not hand-edit `_prisma_migrations` without owner approval. Diagnose, then compensating migration or restore |

Rollback here means **operational recovery**, not `DOWN` SQL files.

---

## 4. Hotfix Migration Policy

Used when production/staging is broken by a prior apply (example: membership RLS recursion).

1. Confirm failure with evidence (logs / `requestId` / SQL error).  
2. Write a **new** migration only (e.g. `fix_*` or `op00x_*`).  
3. Prefer idempotent patterns (`IF EXISTS` / `IF NOT EXISTS` / `CREATE OR REPLACE`) when re-run risk exists.  
4. Do **not** change Architecture Lock, Domain, or Contracts in a hotfix migration.  
5. RLS changes allowed **only** to restore intended Layer-1 semantics (as with membership recursion fix) — not to redesign isolation.  
6. After apply: `migrate status` clean + `check:env` + relevant smoke/evidence if runtime path touched.

---

## 5. Recovery Procedure

```
1. Freeze writes if Staging is corrupted mid-change (owner call).
2. Capture evidence (error, migration name, requestId if app-side).
3. Choose path:
   A) Compensating forward migration  → migrate deploy
   B) Staging restore                 → RESTORE_VERIFICATION checklist
4. Re-run: prisma migrate status
5. Re-run: npm run check:env
6. Optional: smoke / evidence as assigned
7. Record note under docs/evidence/ when a real incident occurs
```

---

## 6. Exit Criteria — when PR-05 is complete

PR-05 is **PASS** when:

1. All current migrations reviewed against order / empty-DB / immutability (table above).  
2. This document exists with Migration Rules, Forward-only Policy, Rollback Strategy, Hotfix Policy, Recovery Procedure, Exit Criteria.  
3. No published migration was rewritten; no reset/drop executed as part of PR-05.  
4. [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) marks **PR-05** PASS with a link here.  
5. Work **stops** — **PR-06 not started** until explicitly assigned.

---

## 7. Verdict

| Verdict | **PASS** |
|---------|----------|
| Why | Ordered chain of 3 migrations is coherent, Staging up to date, hotfix/OP-002 follow forward-only pattern, no rewrite of `vs1_init` required |
| Residual risk | Empty-DB proof on a **brand-new** Supabase project was already done once for VS1 Staging bootstrap; re-prove only if migration set changes materially |
