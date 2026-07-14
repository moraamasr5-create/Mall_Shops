# Supabase Integration

## Status

**Draft — implementation layer.** Describes the current Identity Provider and infrastructure choice.

The [Identity Contract](../contracts/IDENTITY.md) refers to an abstract "Identity Provider" — Supabase Auth is today's implementation of that abstraction.

---

## Services Used

| Supabase Service | Purpose |
|-----------------|---------|
| **Auth** | Identity Provider — registration, login, sessions, JWT |
| **Database** | Managed PostgreSQL hosting |
| **Realtime** | Future — live updates |
| **Storage** | Future — file uploads |

---

## Identity Provider Mapping

| Contract Concept | Supabase Implementation |
|-----------------|------------------------|
| Identity | `auth.users` (managed by Supabase) |
| Identity reference | `auth.uid()` / JWT `sub` claim |
| Session proof | Supabase JWT |
| Registration | `supabase.auth.signUp()` |
| Authentication | `supabase.auth.signInWithPassword()` / OAuth |
| Deactivation | Supabase Admin API |

**No `User` table in the application schema.** The application references `auth.uid()` as `identity_id` in Membership.

---

## JWT Claims (Architecture Lock v1.0)

JWT represents **Identity only**.

```json
{
  "sub": "identity-uuid",
  "email": "user@example.com",
  "aud": "authenticated",
  "role": "authenticated"
}
```

JWT must **never** contain:

- `tenant_id` / `active_tenant`
- `roles`
- `permissions`
- Module context

### Active Tenant

Selected by the application and sent as:

```
X-Tenant-Id: <tenant-id>
```

### Authorization Resolution

On each request:

1. Validate JWT → `identity_id`
2. Load Membership(`identity_id`, `X-Tenant-Id`)
3. Resolve Role → explicit Permissions
4. If Module-scoped: verify TenantModule enabled

See [ADR-002](../adr/ADR-002-Identity-Model-and-JWT-Claims.md) — **APPROVED**.

---

## Environment Configuration

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project API URL (local: `http://127.0.0.1:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key for Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin key (never expose to client) |
| `DATABASE_URL` | PostgreSQL connection for Prisma |
| `DIRECT_URL` | Direct PostgreSQL URL for migrations |

Local stack: `supabase/config.toml` + `npx supabase start`.

---

## Client vs Server

| Context | Supabase Client | Access |
|---------|----------------|--------|
| Browser (future) | Anon key client | Auth, RLS-protected queries |
| Server API | Anon key for Auth validation; Prisma under `authenticated` for data | Privileged DB only for migrations + tenant bootstrap |

---

## Auth Flow (VS1)

```
1. User registers/logs in via POST /api/v1/auth/signup|login (Supabase Auth)
2. Supabase returns JWT with sub = identity_id
3. Client sends Authorization: Bearer <access_token>
4. On each request:
   a. Validate JWT via Supabase
   b. Extract identity_id from sub
   c. withIdentityRls → set JWT claims + SET LOCAL ROLE authenticated
   d. Load Membership(s) from application database under RLS
   e. Resolve Tenant context (X-Tenant-Id) + Role + Permissions
5. Execute business operation (Layer 1 + Layer 2)
```

---

## Replaceability

To migrate away from Supabase:

1. Implement a new Identity Provider adapter
2. Map its identity references to existing `membership.identity_id`
3. Update JWT validation middleware
4. Migrate database hosting (PostgreSQL is portable)
5. Contracts remain unchanged

---

## Related Documents

- [IDENTITY Contract](../contracts/IDENTITY.md) — Abstract identity rules
- [RLS.md](./RLS.md) — Database-level security
- [ADR-002](../adr/ADR-002-Identity-Model-and-JWT-Claims.md) — JWT decisions
- [PRISMA.md](./PRISMA.md) — ORM configuration
