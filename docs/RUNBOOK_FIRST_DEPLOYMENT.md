# First Deployment & First Tenant Runbook

**What this is:** An operational guide to take this repository from “code + docs on disk” to a **live** Supabase-backed platform: empty database → migrated schema → first Identity → first Tenant → Salon path → Cross-Tenant Operational Evidence.

**What this is not:** Architecture Lock, ADR, Decision Log, or new product scope.  
No code changes are required to follow this runbook.

**Related:**

| Concern | Document |
|---------|----------|
| Cross-Tenant gate (OP-001) | [evidence/CROSS_TENANT.md](./evidence/CROSS_TENANT.md) |
| Decision lifecycle | [DECISION_LOG.md](./DECISION_LOG.md) |
| Env template | [../.env.example](../.env.example) |
| Agent Execution Rule | [../AGENTS.md](../AGENTS.md) |

---

## Goal

Prove, once, that the platform can be stood up on a **supported runtime** and that the VS1 path works:

```
Empty Supabase project
  → Migrations + RLS applied
  → App running with correct .env
  → First Identity (signup)
  → First Tenant (OWNER + salon module)
  → Optional: smoke:vs1
  → evidence:cross-tenant → Overall: PASS
```

That live **PASS** is what advances **OP-001** toward **VERIFIED** / **CLOSED** — not unit tests alone.

---

## Supported runtimes (pick one)

Operational Evidence does **not** require Docker. Docker is only one local option.

| Runtime | When to use | Notes |
|---------|-------------|--------|
| **A — Local Supabase (Docker)** | Developer laptop with Docker Desktop | `npx supabase start` |
| **B — Hosted Supabase** | Cloud project (Staging / dedicated pilot project) | Same Prisma migrations + same app; no local Docker |

Both must provide:

1. Supabase Auth (JWT Identity)
2. PostgreSQL with migrations applied (including RLS in Prisma migrations)
3. App process that can reach Auth + DB via `.env`

```
Operational Evidence
        ↓
Any Supported Runtime
  (Local Docker  OR  Hosted Supabase)
        ↓
Overall: PASS
```

---

## Prerequisites (once)

| Item | Check |
|------|--------|
| Node.js + npm | `node -v` / `npm -v` work |
| Repo clone | This repository at a known commit |
| Dependencies | `npm install` completes |
| Runtime A only | Docker Desktop **running** (engine available) |
| Runtime B only | Access to create/use a Supabase project (dashboard or CLI) |

If Runtime A fails because Docker is missing/stopped: choose **Runtime B**, or start Docker and retry. Do **not** treat Docker absence as Cross-Tenant **FAIL** — that is environment unavailability (**NOT_EXECUTED** for the gate).

---

## Step 0 — Install dependencies

```bash
npm install
```

**Success looks like:** `node_modules/` present; no fatal install errors.

---

## Step 1 — Create / start the Supabase project

### Path A — Local (Docker)

```bash
npx supabase start
npx supabase status
```

**Success looks like:**

- CLI prints local **API URL** (typically `http://127.0.0.1:54321`)
- **anon key** and **service_role key**
- **DB URL** (typically `postgresql://postgres:postgres@127.0.0.1:54322/postgres`)

**Failure (stop and fix environment — do not invent architecture):**

- `docker_engine` / pipe not found → Docker Desktop not installed or not running
- Port conflict → stop the conflicting process or change ports in `supabase/config.toml` only if you know what you are doing

### Path B — Hosted Supabase

1. Create a **new** Supabase project (recommended: empty project used only for this qualification).
2. In the dashboard, open **Project Settings → API** and note:
   - Project URL
   - `anon` `public` key
   - `service_role` key (server-only — never expose to browsers / `NEXT_PUBLIC_*`)
3. Open **Project Settings → Database** and note connection strings:
   - **URI** for the app (often pooler / Transaction mode — use as `DATABASE_URL` when required by hosting)
   - **Direct** / Session connection for migrations (use as `DIRECT_URL`)

**Success looks like:** You can open the SQL Editor and see an empty `public` schema (or only Supabase defaults) before migrations.

---

## Step 2 — Configure `.env`

```bash
cp .env.example .env
```

Fill values from Step 1:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | API URL (local status or hosted Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |
| `DATABASE_URL` | Postgres URL Prisma uses at runtime |
| `DIRECT_URL` | Direct Postgres URL for migrations (+ privileged `createTenant` path) |

**Local defaults** (after `supabase start`) match `.env.example` host/ports; still paste **real** anon/service keys from `supabase status`.

**Hosted tips:**

- Prefer the **direct** connection for `DIRECT_URL` so `prisma migrate deploy` is reliable.
- If the pooler requires `?pgbouncer=true` / `sslmode=require`, keep those query params as Supabase documents for your project.
- Never commit `.env`.

**Success looks like:** Every variable above is non-empty; URLs point at the same project you created in Step 1.

---

## Step 3 — Apply migrations (schema + RLS)

Migrations live under `prisma/migrations/`. RLS is **inside** those migrations — do **not** apply a separate `rls.sql`.

```bash
npx prisma generate
npx prisma migrate deploy
```

**Success looks like:**

- CLI reports migration(s) applied (e.g. `20260714120000_vs1_init`)
- No connection / authentication errors

**Verify tables** (SQL Editor, `psql`, or any Postgres client):

Expected application tables in `public` (minimum):

| Table | Role |
|-------|------|
| `tenant` | Tenant boundary |
| `membership` | Identity ↔ Tenant + role |
| `tenant_module` | Module activation |
| `salon_service` | Salon reference entity |
| `salon_employee` | Salon |
| `salon_customer` | Salon |
| `restaurant_category` | Restaurant validation-only |

Also confirm RLS is enabled on tenant-scoped tables (policies present). Exact policy text is in the migration SQL — you are checking **presence**, not redesigning policies.

**Failure:** wrong `DIRECT_URL`, SSL/pooler mismatch, or empty password — fix `.env` and re-run `migrate deploy`. Do not hand-edit production schemas outside Prisma migrations.

---

## Step 4 — Start the application

```bash
npm run dev
```

Default base URL: `http://127.0.0.1:3000` (override later with `SMOKE_BASE_URL` if needed).

**Success looks like:**

- Next.js ready on port 3000 (or your chosen port)
- Hitting a known API route returns JSON (not connection refused)

Quick reachability check (PowerShell):

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:3000/api/v1/auth/login -Method POST -ContentType "application/json" -Body '{"email":"x@y.com","password":"short"}' | Select-Object StatusCode
```

Expect a **4xx JSON error** (validation/auth), **not** a transport failure. Transport failure ⇒ app not running ⇒ evidence will be **NOT_EXECUTED**.

---

## Step 5 — Create the first Identity (signup)

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "owner1@example.com",
  "password": "ChangeMe1!"
}
```

Example (`curl`):

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/auth/signup \
  -H "content-type: application/json" \
  -d "{\"email\":\"owner1@example.com\",\"password\":\"ChangeMe1!\"}"
```

**Success looks like:** HTTP **201** with JSON shaped like:

```json
{
  "data": {
    "identity": { "id": "<uuid>", "email": "owner1@example.com" },
    "accessToken": "<jwt>",
    "refreshToken": "<token>",
    "expiresAt": <number>
  }
}
```

Save `accessToken` and `identity.id`.

**Also check in Supabase:** Authentication → Users shows the new user.

**Hosted Auth note:** If email confirmations are enabled and signup returns no session, disable confirmations for this qualification project **or** confirm the user in the dashboard, then use `POST /api/v1/auth/login` to obtain a token.

Login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "owner1@example.com", "password": "ChangeMe1!" }
```

---

## Step 6 — Create the first Tenant

Requires `Authorization: Bearer <accessToken>` from Step 5.

```http
POST /api/v1/tenants
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "name": "First Salon" }
```

Example:

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/tenants \
  -H "content-type: application/json" \
  -H "authorization: Bearer <accessToken>" \
  -d "{\"name\":\"First Salon\"}"
```

**Success looks like:** HTTP **201** with a `tenant.id` (and related payload). In the database you should see:

| Check | Expected |
|-------|----------|
| `tenant` | 1 row (`First Salon` / generated slug) |
| `membership` | 1 row: your `identity_id`, that `tenant_id`, role **OWNER**, status active |
| `tenant_module` | at least `module_key = salon`, `enabled = true` |

Confirm modules via API:

```http
GET /api/v1/tenants/<tenantId>/modules
Authorization: Bearer <accessToken>
X-Tenant-Id: <tenantId>
```

**Success:** HTTP **200**; salon listed and enabled.

---

## Step 7 — Exercise the Salon reference path (manual optional)

```http
POST /api/v1/salon/services
Authorization: Bearer <accessToken>
X-Tenant-Id: <tenantId>
Content-Type: application/json

{
  "name": "Haircut",
  "durationMin": 30,
  "priceCents": 5000,
  "currency": "SAR"
}
```

Then:

```http
GET /api/v1/salon/services
Authorization: Bearer <accessToken>
X-Tenant-Id: <tenantId>
```

**Success looks like:** create **201**; list **200** with ≥ 1 service; `salon_service` row exists for that `tenant_id`.

---

## Step 8 — Automated smoke (recommended)

With app + Supabase still running:

```bash
npm run smoke:vs1
```

Optional base URL:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke:vs1
```

**Success looks like:** console ends with `VS1 smoke passed.` (signup → tenant → modules → create/list salon service).

**Failure:** Fix env / Auth / migrations / app reachability before claiming a first deployment.

---

## Step 9 — Cross-Tenant Operational Evidence (OP-001)

This is the **release Operational Gate**, not a developer curiosity.

```bash
npm run evidence:cross-tenant
```

Optional:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run evidence:cross-tenant
```

**Success looks like:**

| Signal | Value |
|--------|--------|
| Console / report overall | **PASS** |
| File | `docs/evidence/cross-tenant-latest.md` overwritten with **Overall: PASS** |
| Process exit code | `0` |

**Other outcomes:**

| Overall | Exit | Meaning |
|---------|------|---------|
| **FAIL** | `1` | Runtime ran; isolation broken — stop and fix (do not close OP-001) |
| **NOT_EXECUTED** | `2` | Environment unavailable (app down, wrong URL, etc.) — **no conclusion**; not a gate failure |

Procedure detail: [evidence/CROSS_TENANT.md](./evidence/CROSS_TENANT.md).

---

## End-to-end checklist

Use this as a single pass/fail sheet for “first deployment worked.”

| # | Step | Pass criterion |
|---|------|----------------|
| 0 | `npm install` | Completes |
| 1 | Supabase runtime up | Local status **or** hosted project reachable |
| 2 | `.env` filled | All required keys point at that project |
| 3 | `prisma migrate deploy` | Tables listed above exist; RLS present |
| 4 | `npm run dev` | App answers on base URL |
| 5 | Signup / login | **201** / token; user in Auth |
| 6 | Create tenant | **201**; OWNER membership + salon module |
| 7 | Salon service (optional) | Create + list OK |
| 8 | `npm run smoke:vs1` | `VS1 smoke passed.` |
| 9 | `npm run evidence:cross-tenant` | **Overall: PASS** |

When row **9** is PASS on a live supported runtime, Operational Qualification for Cross-Tenant is proven in evidence. Governance updates (OP-001 → **VERIFIED** → **CLOSED**, then OP-002 eligibility) are a **separate explicit task** — see Execution Rule in `AGENTS.md` / Decision Log. Do not reorder the roadmap from chat alone.

---

## Common blockers (environment, not architecture)

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| `docker_engine` / pipe not found | Docker not running | Start Docker **or** use Hosted Supabase (Path B) |
| `P1001` / can't reach database | Bad `DATABASE_URL` / `DIRECT_URL` | Fix connection string / SSL / pooler |
| Signup 201 but no `accessToken` | Email confirmation required | Confirm user or disable confirm for the pilot project |
| create tenant 5xx | Privileged DB path / migrations incomplete | Re-check `DIRECT_URL` + migrate deploy |
| evidence **NOT_EXECUTED** | App not on `SMOKE_BASE_URL` | Start `npm run dev`; verify URL |
| evidence **FAIL** | Isolation broken | Treat as gate FAILED — investigate RLS / tenant header path; do not “skip” to hardening |

---

## What this runbook deliberately does not do

- Change Architecture Lock / ADRs / Core design
- Authorize DB Role Hardening (OP-002) before OP-001 is closed
- Start a new Module
- Replace Decision Log updates — those remain an explicit assignment after evidence **PASS**
