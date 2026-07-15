# Cross-Tenant Operational Evidence — Latest Run

**Overall:** PASS
**Passed:** 6
**Failed:** 0
**Base URL:** http://127.0.0.1:3000
**Ran at:** 2026-07-15T01:24:42.330Z

| Case | Result | Detail |
|------|--------|--------|
| `A_lists_own_services` — Identity A + Tenant A can list own salon services | **PASS** | status 200, rows 1 |
| `B_with_A_tenant_header` — Identity B + X-Tenant-Id=A is denied (no membership) | **PASS** | status 403 |
| `A_with_B_tenant_header` — Identity A + X-Tenant-Id=B is denied (no membership) | **PASS** | status 403 |
| `B_lists_own_services_empty_of_A` — Identity B + Tenant B list does not include Tenant A services | **PASS** | status 200 |
| `B_get_A_service_by_id_denied` — Identity B cannot GET Tenant A service id (wrong tenant header → 403) | **PASS** | status 403 |
| `B_write_A_tenant_denied` — Identity B cannot POST salon service into Tenant A (cross-tenant write denied) | **PASS** | status 403 |

## Status legend

- **PASS** — runtime ran; isolation proven
- **FAIL** — runtime ran; tenant isolation broken
- **NOT_EXECUTED** — environment unavailable; no conclusion

## Interpretation

- **PASS** means Identity/Tenant A cannot read Tenant B data via the public API (and vice versa).
- Expected denials are HTTP **403** with **0** business rows exposed.
- **FAIL** means a live isolation case broke — treat as a security regression.
- This is Operational Evidence for Layer 1+2 isolation on the live request path — not an architecture change.
