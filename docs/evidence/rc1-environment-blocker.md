# RC1 Environment Blocker Record

**Gate context:** RG-004  
**Product code changes:** none  
**Retries:** none (external Staging change required)

---

## Gate status (unchanged)

| Item | Status |
|------|--------|
| RG-003 | ✅ PASSED |
| RG-004 | ⏸ **BLOCKED / PENDING** (Environment) |
| BAS-001 | ⏸ **NOT EXECUTED** |
| Product Release Blockers | None confirmed |

---

## Active Environment Blocker

| Field | Value |
|-------|--------|
| **ID** | EB-004-02 |
| **Timestamp (UTC)** | Latest reconfirm: `2026-07-16T17:28:00Z` (owner checklist claimed complete; pre-flight still FAIL) · prior: `2026-07-16T16:53:07.908Z` |
| **Commit** | `18f1858ad17fc583db60a786cd1ac73d9b86af24` |
| **Affected step** | Public signup — `POST /api/v1/auth/signup` (RC1 Environment Validation / first step of BAS-001) |
| **HTTP status** | `400` |
| **Response body (app envelope)** | `{"error":{"code":"AUTH_ERROR","message":"email rate limit exceeded","details":{},"errorId":"…"},"meta":{"requestId":"…"}}` |
| **Upstream meaning** | Supabase Auth / GoTrue mailer rate limit on project **Mall_Full** (`ovjbgxhhfjmgatdwqagb`) |
| **Probable cause** | Hosted Auth email send quota exhausted (many prior signup probes + Confirm-email mailer). Not an app bug. |
| **Classification** | **Environment Blocker only** — not a Product Release Blocker |

### Related (earlier; not re-cleared)

| Field | Value |
|-------|--------|
| **ID** | EB-004-01 |
| **Timestamp (UTC)** | `2026-07-16T16:30:46.167Z` |
| **Affected step** | Signup then Login |
| **HTTP** | Signup `400` — *Sign up succeeded but no session was returned. Confirm email may be required.* · Login `401` — *Email not confirmed* |
| **Probable cause** | Confirm email ON on Staging (`mailer_autoconfirm` false) — diverges from [OP-003](../DECISION_LOG.md#op-003) Staging policy |
| **Classification** | **Environment Blocker only** |

### Health (not blocking)

| Field | Value |
|-------|--------|
| **Timestamp** | `2026-07-16T17:16:09.897Z` |
| **Check** | `GET /api/health` |
| **HTTP** | `200` |
| **Body** | `{"ok":true,"service":"mall-shops","at":"2026-07-16T17:16:09.897Z"}` |

---

## What is required from the owner (to unblock)

### Option A — Dashboard (preferred)

1. Open Supabase Dashboard → project **Mall_Full** (`ovjbgxhhfjmgatdwqagb`).
2. **Authentication → Providers → Email**  
   - Set **Confirm email** = **OFF** (matches OP-003 Staging).  
   - Exact path: `https://supabase.com/dashboard/project/ovjbgxhhfjmgatdwqagb/auth/providers`
3. **Authentication → Rate Limits** (or Auth settings / SMTP related limits)  
   - Ensure signup / email send is not still blocked.  
   - If quota is exhausted: wait for the window to reset **or** raise/adjust limits for Staging.  
   - Exact path (typical): `https://supabase.com/dashboard/project/ovjbgxhhfjmgatdwqagb/auth/rate-limits`
4. Optional sanity check in Dashboard: Authentication → Users — confirm new test signups are allowed.

No product repo credentials required for Option A — only your Supabase org login that owns Mall_Full.

### Option B — Management API script

1. Create a personal access token: https://supabase.com/dashboard/account/tokens  
   - Needs permission to update project Auth config (`auth:write` / equivalent).
2. In a local shell (do not commit the token):

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<your-token>"
node scripts/ops-staging-mailer-autoconfirm.mjs
```

3. Why the token is required: the script calls  
   `PATCH https://api.supabase.com/v1/projects/ovjbgxhhfjmgatdwqagb/config/auth`  
   with `{ "mailer_autoconfirm": true }`. Service Role / `.env` keys **cannot** change this setting.
4. Rate limit still may need Dashboard Option A step 3 — the script only sets autoconfirm.

### Not required

- Product code changes  
- Database SQL  
- Service Role during BAS-001  
- Waiting/retry loops from the agent  

---

## Environment Readiness Checklist

Complete **all** boxes before asking to rerun RC1:

- [ ] Mall_Full → Authentication → Providers → Email → **Confirm email = OFF**
- [ ] Auth email / signup rate limit is cleared (waited out or adjusted in Rate Limits)
- [ ] Manual or Dashboard confirmation that a **new** email can sign up (optional smoke in Dashboard)
- [ ] Local app still points at Mall_Full (`.env` / `NEXT_PUBLIC_SUPABASE_URL` for `ovjbgxhhfjmgatdwqagb`)
- [ ] App is running (`GET /api/health` → `200`)

Then send explicitly: **「Environment checklist complete — rerun RC1」**

Agent will then run only:

1. `node scripts/rc1-env-preflight.mjs`  
2. If PASS → BAS-001 → `smoke:vs1` → `evidence:cross-tenant` → `verify` → Business Acceptance Summary  
3. Stop (no RG-005)

If pre-flight FAIL again → remain **BLOCKED / PENDING**, no BAS-001, no RG-004 FAILED.
