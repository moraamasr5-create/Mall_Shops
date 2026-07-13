# Architecture Documentation

## Overview

Mall Shops is a **Business Operating Platform (BOP)** designed to support multiple business domains through a modular, scalable architecture.

This document describes the foundational architecture established in Phase 0.

## Core Philosophy

1. **MVP First**: Build only what is needed for the current phase
2. **Modular Design**: Modules are independent and never depend on each other
3. **Platform Core**: Handles cross-cutting concerns (Auth, Tenant, RBAC)
4. **Multi-Tenancy**: Built-in at the database level, enforced by Supabase RLS
5. **Vertical Slices**: Complete features end-to-end before starting new ones

## Platform Layers

### 1. Core Layer

**Responsibility**: Platform-wide concerns that apply to ALL business modules

```
Core
├── Authentication (Supabase Auth integration)
├── Identity (User profile management)
├── Tenant (Customer account management)
├── Membership (User-to-Tenant association with roles)
└── RBAC (Role-based access control)
```

**Rules**:
- Core knows NOTHING about Salon, Restaurant, or any business module
- Core never imports from modules
- No business logic in Core

### 2. Shared Layer

**Responsibility**: Types, utilities, and abstractions shared across the platform

```
Shared
├── Types (Common type definitions)
├── Validation (Zod schemas for input validation)
├── Errors (Error classes and utilities)
├── Utils (Utility functions: slugs, grouping, etc.)
└── Value Objects (Email, Slug, PhoneNumber)
```

**Rules**:
- No business logic
- No module-specific concepts
- Reusable across all modules

### 3. Modules Layer

**Responsibility**: Business-specific logic for each domain

```
Modules
├── Salon (Reference implementation)
│   ├── Employees
│   ├── Services
│   ├── Customers
│   └── Appointments
├── Restaurant (Future)
│   ├── Menu Items
│   ├── Tables
│   ├── Orders
│   └── Reservations
├── Clinic (Future)
│   ├── Doctors
│   ├── Patients
│   ├── Treatments
│   └── Appointments
└── Gym (Future)
    ├── Members
    ├── Classes
    ├── Equipment
    └── Memberships
```

**Rules**:
- Each module is completely independent
- Modules NEVER import from each other
- Modules ONLY import from Core and Shared
- Each module has its own database tables
- Each module has its own types and services

### 4. Infrastructure Layer

**Responsibility**: External services and data persistence

```
Infrastructure
├── Supabase (Auth, Database, Realtime, Storage)
├── PostgreSQL (Data persistence)
└── Prisma (ORM and migrations)
```

**Rules**:
- All services handled by Supabase
- No custom infrastructure
- Database access only through Prisma ORM

## Data Model Architecture

### Entity Relationships

```
User (Supabase Auth)
  ↓
Membership
  ↓
Tenant
  ↓
TenantModule
  ↓
Module-Specific Entities

Example: Salon
  User
    ↓
  Membership (role: MANAGER)
    ↓
  Tenant (Golden Group)
    ↓
  TenantModule (salon: enabled)
    ↓
  Salon Entities (Employee, Service, Appointment, etc.)
```

### Multi-Tenancy Model

**NOT** an architecture layer. Tenants are database entities.

**Architecture**:
```
Tenant (Business organization)
  ├── Modules enabled for this tenant
  └── All data filtered by tenant_id
```

**Isolation Strategy**:
- Every business table has `tenant_id` column
- Supabase RLS enforces: `tenant_id = current_user_tenant_id`
- Never rely on application code for isolation
- Database layer is the source of truth

**MVP Constraints**:
- Only ONE module enabled per tenant (Salon)
- Multi-module support prepared but not implemented

## Security Model

### Authentication

- **Provider**: Supabase Auth
- **Methods**: OAuth, Email/Password, SSO (configurable)
- **Session**: JWT token from Supabase
- **Never**: Build custom auth

### Authorization (RBAC)

**Model**:
```
User → Membership → Tenant → Role → Permissions
```

**Roles** (at tenant level):
- `OWNER`: Full access to tenant (all permissions)
- `ADMIN`: Administrative access (read/write/delete)
- `MANAGER`: Manage salon operations
- `STAFF`: Limited access to assigned resources
- `CUSTOMER`: Read-only public data

**Permission Format**: `resource:action:scope`
- Example: `salon:write:limited`
- Wildcard: `*` for all permissions

**Storage**:
- Role stored in `Membership` table
- NOT in User table
- Multiple roles per user (one per tenant)

### Row-Level Security (RLS)

Supabase RLS policies enforce multi-tenancy at database level.

**Example Policy**:
```sql
CREATE POLICY "tenants_isolation"
  ON salon_employees
  FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

**Coverage**:
- ALL business tables have RLS policies
- Even if application code has bugs, database isolates tenants
- No bypassing tenant isolation

## Module Structure

### Standard Module Layout

```
modules/salon/
├── types/              # Salon-specific types
├── services/           # Business logic (domain layer)
├── controllers/        # Request handlers (presentation layer)
├── database/           # Data access layer
├── middleware/         # Express middleware (auth, validation)
├── routes/             # API routes
└── README.md           # Module documentation
```

### Module Lifecycle

1. **Phase 0**: Create skeleton (this phase)
2. **Phase N**: Implement schema in Prisma
3. **Phase N**: Implement types and services
4. **Phase N**: Implement controllers and routes
5. **Phase N**: Implement middleware and validation
6. **Phase N**: Add tests and documentation

### Adding a New Module

1. Create `modules/restaurant/` directory
2. Create subdirectories: `types/`, `services/`, `controllers/`, etc.
3. Add Prisma schema with `tenant_id` on all tables
4. Implement types and services
5. Add API routes
6. Update main router to include module routes
7. Add documentation

**Important**: New modules do NOT require changing Core or Shared.

## Dependency Graph

```
Application Code
    ↓
Modules (Independent)
    ↓
Core + Shared (Platform foundation)
    ↓
Infrastructure (Supabase, Prisma)
    ↓
External Services (PostgreSQL, Auth)
```

**Rules**:
- ✅ Modules can import from Core and Shared
- ✅ Core can import from Shared
- ❌ Modules cannot import from modules
- ❌ Core cannot import from modules
- ❌ Shared can only import built-ins

## Development Guidelines

### Adding Business Logic

1. **Determine**: Which module does this belong to?
   - Salon-specific? → `modules/salon/`
   - Applies to all? → `core/` or `shared/`

2. **Create types** in module's `types/` directory
3. **Implement services** in module's `services/` directory
4. **Add database schema** in `prisma/schema.prisma`
5. **Create routes** in module's `routes/` directory
6. **Add validation** using Zod schemas
7. **Document** in module README

### Avoiding Common Mistakes

❌ **Wrong**: Importing Salon types in Restaurant module
```typescript
import { SalonEmployee } from '@salon/types'
```

✅ **Right**: Define common types in Shared, use in both modules
```typescript
import { TimeSlot } from '@shared/types'
```

❌ **Wrong**: Storing role directly on User
```typescript
model User {
  role: string
}
```

✅ **Right**: Store role in Membership
```typescript
model Membership {
  role: MembershipRole
}
```

❌ **Wrong**: Application code enforcing tenant isolation
```typescript
if (req.user.tenantId !== entity.tenantId) {
  // Do nothing, trust RLS
}
```

✅ **Right**: Rely on database RLS, assume data is isolated

## Scalability Considerations

### Current (MVP)

- Single module: Salon
- Single module per tenant
- Authentication: Email/OAuth
- Database: PostgreSQL with Supabase

### Future Scaling

- Add modules without touching Core
- Multi-module per tenant (when needed)
- Additional auth methods via Supabase
- Read replicas for reporting
- Caching layer (Redis)
- Event streaming (Supabase Realtime)
- Separate databases per domain (if needed)

## Technology Rationale

### Why Supabase?

- Built-in Auth (no custom auth)
- PostgreSQL managed service
- RLS for multi-tenancy security
- Realtime subscriptions
- Storage for files
- No DevOps overhead

### Why Prisma?

- Type-safe ORM
- Migrations managed
- Relationship handling
- Developer experience

### Why Modular Architecture?

- Independent scaling per module
- Teams can work in parallel
- Modules reusable across deployments
- Easy to disable/enable modules per tenant
- Clear responsibility boundaries

### Why No Plugin System?

- MVP complexity trade-off
- When we add modules, we'll update code
- Plugin systems add indirection
- Static dependencies are simpler to debug

## Next Steps

### Phase 1: Authentication

1. Integrate Supabase Auth
2. Create login/signup pages
3. Session management
4. Protected routes

### Phase 2: Tenant Creation

1. Tenant registration flow
2. Initial setup
3. Owner assignment
4. TenantModule initialization (Salon enabled)

### Phase 3: Membership

1. User invitation
2. Role assignment
3. Permission checking
4. Dashboard with role-based views

---

This architecture is designed to support the BOP vision: a single codebase that powers multiple business domains without architectural redesigns.
