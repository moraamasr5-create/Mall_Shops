# Architecture Regression Checklist

Use this checklist before merging every Vertical Slice.

The goal is to protect Architecture v1.0 from accidental coupling between Core and concrete business modules.

## Core Independence

- [ ] `src/core` contains no concrete module imports.
- [ ] `src/core` contains no concrete module names such as Salon, Restaurant, Clinic, Gym, Pharmacy, or Store.
- [ ] Adding a new module does not require modifying existing files inside `src/core`.

## Core Freeze

For MVP, Core is feature-complete.

Future `src/core` changes are allowed only for:

1. Bug Fix
2. Performance Improvement
3. Security Improvement
4. Architectural Defect

Adding business functionality is not a valid reason to modify Core.

- [ ] `git diff -- src/core` is empty unless the slice explicitly targets Core.
- [ ] If `src/core` changed, work stopped for Architecture Review before merge.
- [ ] `ARCH_ALLOW_CORE_CHANGES=true` was not used unless Architecture Review approved the Core change.
- [ ] Architecture gate was run inside a Git repository (fail-closed). `ARCH_SKIP_CORE_FREEZE=true` was not used unless explicitly exempted.

## Dependency Direction

- [ ] Dependencies flow from Modules to Core, never from Core to Modules.
- [ ] Core imports no Module code, types, permissions, services, or implementation files.
- [ ] Core imports no Module-owned Prisma models.
- [ ] No circular dependencies exist between `src/core` and `src/modules`.

## Backward Architecture Compatibility

- [ ] No existing Core abstraction was modified to support a module feature.
- [ ] No existing module behavior was broken.
- [ ] No architectural invariant was weakened.
- [ ] New functionality was added by extension, not by changing Core.
- [ ] If `src/core` changed, the slice explicitly targeted Core and received Architecture Review before merge.

## RBAC and Permissions

- [ ] Core RBAC uses a generic permission model.
- [ ] Core RBAC contains only platform permissions (`tenant:*`, `member:*`, `module:*`, etc.).
- [ ] Module-specific permissions are defined inside the owning module.
- [ ] Business permissions are evaluated in the application layer.

## Data Model

- [ ] Core Prisma models do not reference module-specific tables.
- [ ] Core Prisma models do not define inverse relations to module models.
- [ ] Module schemas own their own `tenantId` fields.
- [ ] Module tables remain tenant-scoped.

## Authorization Layers

- [ ] RLS implements tenant isolation only.
- [ ] RLS does not encode business permissions or role-specific business rules.
- [ ] Application code enforces Role -> Permission authorization.
- [ ] Neither RLS nor application authorization is treated as a replacement for the other.

## Module Addition Workflow

Adding a new module should require only:

1. Create a new module directory.
2. Register the module outside Core.
3. Add module-owned permissions.
4. Add module schema and implementation.
5. Enable it for a tenant.

If adding a module requires editing existing files inside `src/core`, treat it as an architecture regression unless Core itself is intentionally evolving.

## Automated Gate

Run this before every merge:

```bash
npm run verify
```

This executes:

1. Architecture Regression Checklist automation
2. Dependency direction checks
3. Core freeze check
4. Prisma Generate
5. Type Check
6. Test Suite

## Manual Check Commands

```bash
# No concrete module names inside Core
rg -n "salon|restaurant|clinic|gym|pharmacy|store" src/core -i

# No Core -> Modules imports
rg -n "from ['\"]@/modules/" src/core

# No module-specific permission strings in Core RBAC
rg -n "^[^#]*[a-z]+:[a-z]+:" src/core/rbac

# No inverse Core -> module Prisma relations
rg -n "salon|restaurant|clinic|gym|pharmacy|store" prisma/schema.prisma -i

# RLS must not encode business roles
rg -n "role IN|role = 'OWNER'|role = 'ADMIN'|role = 'MANAGER'" supabase docs/implementation/RLS.md docs/security/RLS_STRATEGY.md
```

Expected result for these checks: no matches, except module-owned schema/model names outside Core when explicitly reviewing module files.

---

## Related Documents

- [Architecture Lock v1.0](./ARCHITECTURE_LOCK.md)
- [Official Architecture Audit](./OFFICIAL_ARCHITECTURE_AUDIT.md)
- [Contracts Index](./contracts/INDEX.md)
