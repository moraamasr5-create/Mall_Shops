# TenantModule Contract

## Responsibility

A TenantModule represents **the enablement of a business module for a specific tenant**.

TenantModule is the mechanism for:
- Controlling which modules are active in a tenant
- Determining feature availability
- Supporting future multi-module tenants
- Isolating module-specific data per tenant

## Invariants

1. **One module enabled at most once per tenant**
   - Composite unique constraint on `(tenantId, moduleKey)`
   - A tenant cannot have two rows for the same module

2. **Module keys are predefined and immutable**
   - Valid keys: "salon", "restaurant", "clinic", "gym"
   - Keys are determined at platform design time
   - New modules require application code change

3. **Every tenant must have at least one enabled module**
   - A tenant with all modules disabled cannot perform business operations
   - Application logic must prevent disabling the last module

4. **Module enablement is persistent**
   - Once enabled, a module remains enabled until explicitly toggled
   - `enabled` flag can be true or false
   - Future: Disabling a module should archive its data (not implemented)

5. **TenantModule never exists without a Tenant**
   - `tenantId` is always valid and references an existing Tenant
   - Enforced by Prisma foreign key constraint with onDelete: Cascade

## Relationships

```
Tenant (1)
    ↓
TenantModule (1:N)
    ↓
Module (logical)
    ↓
Module-Specific Tables (salon_employees, salon_services, etc.)
```

**Key relationship constraints:**
- One tenant can have many modules (1:N)
- One module type can be enabled in many tenants (N:N at business level, but 1:1 in data model)
- Deletion of a Tenant cascades to delete all its TenantModules
- Deletion of a TenantModule should trigger cleanup of module-specific data (future: implement with caution)

## Ownership

**A TenantModule does not "own" anything.** It represents:
- The availability of a module for a tenant
- The operational scope of the module

**Ownership of module data is determined by Membership and RLS:**

```
Membership(userId=X, tenantId=Y, role=Z)
    ↓
User X with role Z has access to module M in Tenant Y
    ↓
Module M's data is isolated by tenantId
```

## Lifecycle

### Creation

1. **First Module (Tenant Creation)**
   - When user creates a tenant via `createTenant()`, system auto-creates `TenantModule(tenantId, moduleKey="salon", enabled=true)`
   - Module is immediately available

2. **Additional Modules (Future)**
   - When admin enables a new module for a tenant, system creates `TenantModule(tenantId, moduleKey=MODULE, enabled=true)`
   - Module becomes immediately available
   - *Multi-module support not implemented in MVP*

### Active Operation

- Module remains enabled until toggled
- Module-specific tables are isolated by `tenant_id`
- All module operations are RLS-protected

### Mutation (Future)

- **Enable module**: `UPDATE tenant_module SET enabled = true WHERE tenant_id = Y AND module_key = M`
- **Disable module**: `UPDATE tenant_module SET enabled = false WHERE tenant_id = Y AND module_key = M`
  - Invariant: Cannot disable if it's the last enabled module

### Deletion (Future)

- Explicit removal: `DELETE tenant_module WHERE tenant_id = Y AND module_key = M`
- Cascading: When tenant is deleted, all TenantModules cascade
- Data cleanup: Module-specific tables must be cleaned (implement with caution)

---

## Prisma Schema

```prisma
model TenantModule {
  id                String    @id @default(cuid())
  tenantId          String
  moduleKey         String    // "salon", "restaurant", "clinic", "gym"
  enabled           Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // One module per tenant
  @@unique([tenantId, moduleKey])
  
  // Foreign key to Tenant (enforced)
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

---

## Invariant Enforcement

| Invariant | Enforced By |
|-----------|------------|
| One module instance per tenant | Database unique constraint |
| TenantModule always references valid tenant | Prisma foreign key + database constraint |
| Module key is valid | Application validation (must be in approved list) |
| At least one enabled module | Application logic (check before disable) |
| Immutable module key | Not enforced (future: design pattern) |

---

## Supabase RLS Policies

```sql
-- TenantModules table: Users can see modules of their tenants
CREATE POLICY "users_see_tenant_modules"
  ON public.tenant_module
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.user_id = auth.uid()
    )
  );

-- TenantModules table: Only tenant OWNERs can enable/disable modules
CREATE POLICY "owners_manage_modules"
  ON public.tenant_module
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.user_id = auth.uid()
        AND membership.role = 'OWNER'
    )
  );
```

---

## Module-Specific Data Isolation

All module-specific tables must include `tenant_id` and have RLS policies:

```sql
-- Example: Salon Employees table
CREATE TABLE salon_employee (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ...
);

-- RLS: Users can see employees only in their tenants
CREATE POLICY "users_see_tenant_employees"
  ON public.salon_employee
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership
      WHERE membership.tenant_id = salon_employee.tenant_id
        AND membership.user_id = auth.uid()
    )
  );
```

---

## Related Contracts

- [Tenant](./TENANT.md) — Organizational context
- [Membership](./MEMBERSHIP.md) — User access to modules
