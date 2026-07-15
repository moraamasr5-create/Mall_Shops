# Restore Verification Procedure (MVP) — PR-03

**What this is:** How to **verify** that a restore on **Staging** succeeded — checklist and post-checks.  
**What this is not:** Disaster Recovery design, a Production cutover playbook, or an executed restore.

**Gate:** [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) · **PR-03**  
**Depends on:** [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) (PR-02) · [Environment Validation](../evidence/environment-validation-latest.md) (PR-01)  
**Target environment:** **Staging only** (current: Mall_Full · `ovjbgxhhfjmgatdwqagb`). **Not Production.**

**PR-03 status:** Procedure documented. **No restore was executed. No database was modified. No seed data was created.**

---

## 1. Preconditions

Before starting a Staging restore (when explicitly assigned later), confirm:

| # | Precondition | Pass means |
|---|--------------|------------|
| 1 | Project owner approved the Staging restore window | Written approval exists |
| 2 | Target is Staging (or a disposable Staging clone), **not** Production | Project ref confirmed |
| 3 | Backup / PITR point selected per [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) | Point-in-time or snapshot identified |
| 4 | Secrets available **outside** the backup (`.env` / password manager) | `DATABASE_URL`, `DIRECT_URL`, Supabase keys ready |
| 5 | `npm run check:env` was **PASS** on the last known-good Staging config before restore | PR-01 green |
| 6 | Operators understand OP-002 split | Runtime = `app_runtime`; privileged = `DIRECT_URL` |
| 7 | Git migration folder known | `prisma/migrations` revision matching the intended app build |
| 8 | App traffic to Staging paused or accepted as interruptible | No surprise writers during restore |

If any row fails: **do not restore**.

---

## 2. Restore Validation Checklist

Use during / immediately after the Supabase Staging restore completes (platform UI or approved ops path). Check boxes in the evidence note when a real drill is run.

| # | Check | Pass means |
|---|-------|------------|
| R1 | Restore job finished without platform error | Dashboard / status = success |
| R2 | Project ref still the intended Staging project | No accidental Production target |
| R3 | Database accepts connections again | Privileged and/or pooler connection works |
| R4 | Record restore source | Snapshot id / PITR timestamp noted in evidence |
| R5 | Record wall-clock duration | Time-to-restore written down (ops metric, not SLA claim) |

This section validates **the restore operation**, not yet the application.

---

## 3. Post-Restore Verification

Run only after §2 passes. Still Staging-only.

| # | Check | Command / action | Pass means |
|---|-------|------------------|------------|
| P1 | Environment still coherent | `npm run check:env` | **Overall: PASS** |
| P2 | Health | `GET /api/health` (app running) | `ok: true` |
| P3 | Migration table readable | Inspect `_prisma_migrations` (read-only) | Expected migrations present or gaps documented |
| P4 | Role model intact | Confirm `app_runtime` still usable for `DATABASE_URL` (or document required `ALTER ROLE` / password re-apply from secrets) | App can connect as designed under OP-002 |

**Do not** run `prisma migrate reset` or destructive resets as part of verification.

---

## 4. Application Verification

Minimum Staging app path after restore (no new seed scripts in this procedure):

| # | Check | Pass means |
|---|-------|------------|
| A1 | App boots against restored Staging | `npm run dev` (or hosted app) healthy |
| A2 | Auth reachable | Login or Auth API check succeeds with existing Staging identities **if** Auth was part of the restore; otherwise document Auth-only gap |
| A3 | Tenant path | Existing Staging tenant (if any in backup) can be listed/read with valid JWT + `X-Tenant-Id` |
| A4 | Optional smoke | `npm run smoke:vs1` **only if** assigned for that drill — creates data; treat as optional evidence, not required to close **this documentation** PR |

If the restored backup is empty of tenants, A3 may be **N/A** with note “empty backup”; do not invent seed data solely to force A3 during an unassigned drill.

---

## 5. Data Integrity Checks

Read-only expectations for VS1 Staging schema after restore:

| # | Check | Pass means |
|---|-------|------------|
| D1 | Core tables exist | `tenant`, `membership`, `tenant_module` present |
| D2 | Reference module tables exist | `salon_service`, `salon_employee`, `salon_customer` present |
| D3 | Validation-only table exists | `restaurant_category` present (may be empty) |
| D4 | RLS enabled | Tenant-scoped tables still have RLS enabled (spot-check) |
| D5 | Referential sanity | Sample membership rows (if any) reference existing `tenant_id` |
| D6 | No silent privilege regression | User-facing path still uses `withIdentityRls` / `app_runtime` (config), not accidental single-URL postgres bypass |

Compare counts or spot rows **only** against a pre-restore note if one was taken; do not fabricate baseline data in this PR.

---

## 6. Known Limitations

- This document is a **verification procedure**, not a guarantee that a restore has been performed.  
- Staging restores may still be disruptive to shared Staging users.  
- Supabase plan features (PITR depth, backup retention) bound what can be restored.  
- Secrets are never restored from DB backups.  
- Storage remains N/A for VS1 MVP.  
- Full Disaster Recovery (multi-region, Production failover, RTO/RPO contracts) is **out of scope**.  
- Cross-tenant evidence re-run after restore is valuable but belongs to assigned ops / **PR-11** when runtime changes warrant it — not automatic in this doc-only PR.  
- PR-03 **documentation PASS** ≠ “restore proven in production.”

---

## 7. Exit Criteria — when PR-03 is complete

PR-03 is **PASS** when all of the following are true:

1. This procedure exists with Preconditions, Restore Validation Checklist, Post-Restore Verification, Application Verification, Data Integrity Checks, Known Limitations, and Exit Criteria.  
2. Target is defined as **Staging**, not Production.  
3. No restore was executed, no DB modified, no seed data created, no new tools/services added as part of PR-03.  
4. [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) marks **PR-03** as PASS with a link here.  
5. Work **stops** — **PR-04 is not started** until explicitly assigned.

---

## 8. Evidence template (for a future assigned drill)

When a real Staging restore is later approved, copy into `docs/evidence/restore-verification-YYYY-MM-DD.md`:

```markdown
# Staging Restore Verification — <date>
Project ref:
Backup / PITR point:
Operator:
Duration:
§2 Restore Validation: PASS/FAIL
§3 Post-Restore: PASS/FAIL (attach check:env)
§4 Application: PASS/FAIL / N/A
§5 Data Integrity: PASS/FAIL
Notes:
```
