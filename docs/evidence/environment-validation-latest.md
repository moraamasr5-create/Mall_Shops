# Environment Validation — Latest Run (PR-01)

**Overall:** PASS
**Ran at:** 2026-07-19T15:11:57.653Z
**Base URL (health):** http://127.0.0.1:3000

| Check | Result | Detail |
|-------|--------|--------|
| `env_keys` — Required env keys | **PASS** | all required keys present; DATABASE_URL ≠ DIRECT_URL |
| `database_url` — Database (database_url) | **PASS** | trivial query succeeded |
| `direct_url` — Database (direct_url) | **PASS** | trivial query succeeded |
| `auth` — Supabase Auth | **PASS** | Auth API reachable via anon client |
| `storage` — Supabase Storage | **SKIP** | N/A for VS1 MVP (Storage not used) |
| `health` — Health endpoint | **PASS** | GET http://127.0.0.1:3000/api/health → 200 |
| `versions` — Tooling versions | **PASS** | app=0.1.0; @prisma/client=6.19.3; node=v24.12.0 |

## Notes

- Part of [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) **PR-01**.
- Does not print secrets.
- Storage is SKIP for VS1 MVP.
