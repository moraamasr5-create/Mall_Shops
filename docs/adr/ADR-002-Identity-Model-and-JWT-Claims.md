# ADR-002: Identity Model and JWT Claims

## Status
**PENDING FINALIZATION**

Current Status: Under active development. JWT claim structure being refined based on security requirements and use cases.

## Context

Mall Shops requires a robust identity model to support:
- Multi-tenant architecture with strong isolation
- Role-based access control (RBAC) per tenant
- Dynamic permission assignment
- Row-Level Security (RLS) policies at the database level
- Supabase Auth integration

The key challenge: How should JWT claims from Supabase Auth map to our tenant, role, and permission model?

## Decision (In Progress)

The identity model will follow this architecture:

### Core Identity Structure

```
User (Supabase Auth)
  ├── id: UUID (Supabase UID)
  ├── email: string
  └── metadata: Custom claims

Membership
  ├── user_id: UUID → User
  ├── tenant_id: UUID → Tenant
  ├── role: string (OWNER, ADMIN, MANAGER, STAFF, CUSTOMER)
  ├── business_unit_id: UUID → BusinessUnit
  └── permissions: JSON array or string[] (dynamic)

Tenant (Customer Account)
  ├── id: UUID
  ├── name: string
  └── ...

BusinessUnit
  ├── id: UUID
  ├── tenant_id: UUID → Tenant
  ├── name: string
  └── ...
```

### JWT Claims Strategy (Under Finalization)

**Current Approach** (to be confirmed):
- Supabase Auth provides base JWT with user ID and email
- Custom claims injected via Supabase Auth Hooks (or added on application side)
- Application loads Membership and permissions on each request
- RLS policies reference computed JWT claims

**Proposed JWT Structure**:
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490,
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "tenant_id": "tenant_uuid",
    "business_unit_id": "business_unit_uuid",
    "roles": ["MANAGER"]
  }
}
```

**Pending Decisions**:
1. Should JWT include full role and permission list or just tenant context?
2. Should JWT be refreshed on each request or cached?
3. How to handle permission changes (revoke immediately or allow grace period)?
4. Should JWT include business_unit_id or only tenant_id?

### RLS Policy Implementation

**Status**: Placeholder RLS policies in place pending JWT finalization.

**Upon finalization**:
- RLS policies will use tenant_id from JWT claims
- Multi-table policies will enforce both tenant and business_unit isolation
- Service-level permissions checked via Membership table

## Rationale

### Why JWT Claims for Multi-Tenancy?

1. **Performance**: No database query needed for tenant isolation check
2. **Security**: Database layer enforces boundaries via RLS
3. **Scalability**: JWT can include computed values without storage
4. **Supabase Integration**: Native JWT support with custom claims

### Why Load Permissions Dynamically?

1. **Real-time Updates**: Permission changes take effect immediately
2. **Flexibility**: Avoid JWT bloat with large permission lists
3. **Audit Trail**: Permission changes recorded in database
4. **Simplicity**: Don't cache complex permission logic

## Consequences

### Positive
- Strong isolation at database level via RLS
- Flexible permission model without JWT modification
- Clear mapping between Supabase Auth and our domain model
- Supports real-time permission updates

### Negative
- Additional database query per request for permissions (if not cached)
- JWT structure adds complexity to Supabase Auth setup
- Requires careful RLS policy implementation
- Tenant context must always be available in JWT

### Mitigation
- Implement permission caching with TTL
- Use middleware to load Membership early in request lifecycle
- Comprehensive RLS testing before production
- Document JWT claim requirements clearly

## Open Questions (For Finalization)

1. **JWT Claim Expansion**: What is the maximum safe size for JWT claims?
2. **Permission Caching**: What TTL for permission cache?
3. **Business Unit Context**: Always required or optional?
4. **Multi-Tenant User**: Can a user switch tenants in same session?
5. **Guest Access**: Support unauthenticated users? How to model in JWT?

## Decision Timeline

- **Phase 1 (Current)**: Finalize JWT structure and claims
- **Phase 2**: Implement complete RLS policy suite
- **Phase 3**: Add permission caching layer
- **Phase 4**: Test multi-tenant scenario edge cases

## Related Decisions
- ADR-001: Technology Stack Selection
- ADR-003: Domain-Driven Design Adoption
- ADR-005: Multi-Tenancy and Data Isolation (when created)

## References
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Notes for Next Phase

- Schedule design review once preliminary implementation is complete
- Test RLS policies in staging environment before finalization
- Document JWT structure in this ADR once approved
- Create migration plan for JWT structure changes
