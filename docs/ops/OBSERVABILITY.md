# Application Observability (MVP) — PR-04

**What this is:** Minimum request/error visibility for Staging ops.  
**What this is not:** Grafana, Prometheus, OpenTelemetry, Sentry, or APM.

**Gate:** [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) · **PR-04**

---

## What operators get

| Signal | Where |
|--------|--------|
| **Health** | `GET /api/health` → `{ ok: true, service, at }` |
| **requestId** | Response header `x-request-id` · JSON `meta.requestId` · structured logs |
| **errorId** | JSON `error.errorId` on failures (correlate with logs) |
| **Structured logs** | One JSON line per event on stdout/stderr |

### Log events

| `msg` | Meaning |
|-------|---------|
| `request.start` | Request entered `handleApi` |
| `request.end` | Handler finished (`status`, `durationMs`) |
| `request.error` | `jsonError` path (`code`, `status`, `errorId`) |
| `request.unhandled` | Thrown outside try/catch inside `handleApi` |

Example:

```json
{"level":"info","at":"...","requestId":"...","msg":"request.start","method":"GET","path":"/api/v1/salon/services"}
{"level":"error","at":"...","requestId":"...","msg":"request.error","errorId":"...","code":"FORBIDDEN","status":403,"message":"..."}
```

No secrets in logs (tokens/passwords must never be added to `logStructured` fields).

---

## Code map

| Piece | Path |
|-------|------|
| Middleware (`x-request-id`) | `src/middleware.ts` |
| Request id ALS | `src/core/http/request-id.ts` |
| Logger | `src/core/http/logger.ts` |
| Handler wrapper | `src/core/http/api.ts` → `handleApi` |
| Response meta / errorId | `src/core/http/response.ts` |

---

## How to diagnose

1. Client reports failure → capture `meta.requestId` and `error.errorId` from body/headers.  
2. Search server logs for that `requestId`.  
3. Read `code` / `status` / `path` / `msg` to classify Auth vs validation vs FORBIDDEN (RLS/RBAC) vs INTERNAL (Prisma/unexpected).

---

## Exit Criteria (PR-04)

1. Health endpoint remains available.  
2. API routes use `handleApi` so one `requestId` ties logs + response.  
3. Errors include `errorId` + structured `request.error` log.  
4. This document exists; PRODUCTION_READINESS marks PR-04 PASS.  
5. No monitoring SaaS added.  
6. Stop — do not start PR-05 until assigned.
