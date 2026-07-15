# Backup Strategy (MVP) — PR-02

**What this is:** Operational procedure for backups during Production Readiness (RG-003).  
**What this is not:** A custom backup product, scheduler, new storage provider, or an executed backup/restore drill.

**Gate:** [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) · **PR-02**  
**Staging project (current):** Mall_Full · ref `ovjbgxhhfjmgatdwqagb`  
**Related:** Restore verification procedure = [RESTORE_VERIFICATION.md](./RESTORE_VERIFICATION.md) (PR-03).

**PR-02 status:** Documentation complete — **no backup or restore was executed** as part of this item.

---

## 1. Scope

### 1.1 What is backed up

| Asset | In MVP backup scope? | Notes |
|-------|----------------------|--------|
| **PostgreSQL application data** (`public` schema: tenant, membership, modules, salon/*, etc.) | **Yes** | Primary recovery target |
| **Prisma migration history** (`_prisma_migrations`) | **Yes** | Included with the database |
| **RLS policies / roles** as stored in the DB | **Yes** | Restored with the database state |
| **Supabase Auth users / sessions** (`auth` schema) | **Yes (platform-managed)** | Covered by Supabase project backups / PITR where the plan provides them — treat Auth + DB as one Hosted project restore story |

### 1.2 What is not backed up (by this strategy)

| Asset | Why |
|-------|-----|
| **Secrets** (`.env`, anon/service_role keys, `app_runtime` / postgres passwords) | Managed **separately** (secret store / password manager). Never rely on DB dumps for secret recovery. |
| **Supabase Storage buckets / objects** | **N/A for VS1 MVP** — Storage is not used. When Storage is introduced, extend this strategy. |
| **Application source code / git history** | Lives in GitHub; not part of DB backup. |
| **Local developer machines / Docker volumes** | Not production/staging recovery targets. |
| **Ephemeral app logs / process memory** | Not durable business state for MVP. |

---

## 2. Backup Procedure

### 2.1 Tool

| Environment | Tool | Notes |
|-------------|------|--------|
| **Hosted Staging / future Production** | **Supabase platform backups** for the project (Dashboard → Project → Database backups / plan features such as daily backups and Point-in-Time Recovery where enabled) | Prefer platform-managed recovery over inventing a parallel pipeline. Official docs: [Database Backups](https://supabase.com/docs/guides/platform/backups). |
| **Optional export (ad hoc)** | Supabase Dashboard SQL / CLI dump **only when explicitly approved** | Not scheduled in MVP. Not automated in this repo. |

**Explicitly out of MVP:** custom cron jobs, third-party backup SaaS, new object-storage buckets, in-app backup modules.

### 2.2 When

| Cadence | MVP rule |
|---------|----------|
| **Automated** | Rely on Supabase’s **plan-default** backup schedule for the project (do not replace with custom schedulers in-repo). |
| **Before risky ops** | Human checkpoint before production-like changes (large migrations, role changes, mass data fixes): confirm recent backup / PITR window is acceptable — **checklist only**, no new tooling. |
| **This PR-02 task** | Does **not** trigger a backup run. |

### 2.3 Where stored

| Location | MVP rule |
|----------|----------|
| **Primary** | Supabase-managed backup storage for the project (operator does not configure a separate Mall_Shops bucket). |
| **Ad hoc dumps** (if ever approved) | Store outside the git repo; treat as **secret-sensitive**; never commit. |

### 2.4 Owner

| Role | Responsibility |
|------|----------------|
| **Project owner** | Approves restore to Staging/Production; confirms plan features (backup / PITR) are enabled for the project tier. |
| **Operator / agent (when assigned)** | Follows this strategy; updates evidence after PR-03; does not invent parallel backup systems. |

---

## 3. Restore Prerequisites

Before any restore (to be drilled in **PR-03**):

1. **Environment Validation** still green: `npm run check:env` (PR-01).  
2. **Target project identified** — prefer a **non-production** or disposable Staging clone for the first drill; never “test restore” by destroying Production without approval.  
3. **Secrets available separately** — `.env` / password manager; restore does not recreate `app_runtime` passwords or API keys by itself.  
4. **App stopped or traffic paused** on the target if cutover would conflict with live writers.  
5. **Migration awareness** — know which Prisma migrations the backup contains vs what `prisma/migrations` in git expects (align in PR-03 / PR-04).  
6. **Written approval** for the restore window (project owner).

---

## 4. Verification

### 4.1 How we know a backup is “usable” (strategy level)

| Check | Meaning |
|-------|---------|
| Platform shows a successful recent backup / PITR window | Backup subsystem is active for the project |
| Restore drill completed on non-prod (**PR-03**) | Backup is proven, not only configured |
| After restore: schema + app path work | See §4.2 |

**PR-02 alone does not prove usability** — it only defines the strategy. Proof = **PR-03**.

### 4.2 What to verify after a restore (for PR-03)

Minimum post-restore checks (documentation contract for the next task):

1. `npm run check:env` → **PASS**  
2. Expected public tables present (tenant, membership, tenant_module, salon_*, etc.)  
3. App starts; `GET /api/health` → **ok**  
4. Smoke or evidence path as assigned in PR-03 (e.g. login + list tenants / `smoke:vs1` / subset of cross-tenant)  
5. Record time-to-restore and evidence note under `docs/evidence/`

---

## 5. Limitations (MVP)

- No custom backup scheduler or in-repo backup agent.  
- No guarantee beyond what the **Supabase project plan** provides (retention, PITR depth, RPO/RTO).  
- Secrets and Storage (when added) need their own procedures.  
- Multi-region / cross-cloud DR is **out of scope**.  
- A green Staging DB that is nearly empty only proves tooling — **operational maturity** requires PR-03 restore verification.  
- This document does **not** change Supabase, Prisma, Architecture Lock, or application schema.

---

## 6. Exit Criteria — when PR-02 is complete

PR-02 is **PASS** when all of the following are true:

1. This document exists and answers Scope, Procedure, Restore Prerequisites, Verification, Limitations, and Exit Criteria.  
2. No new backup services, jobs, or storage providers were added to the repository.  
3. No backup or restore was executed as part of PR-02 (deferred to PR-03 for restore proof).  
4. [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) marks **PR-02** as PASS with a link here.  
5. Work **stops** — **PR-03 is not started** until explicitly assigned.

---

## 7. Next gate

| Next | Requires |
|------|----------|
| **PR-03 Restore Verification** | Explicit assignment after PR-02 closed |
