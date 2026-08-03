# Employee Contract

## Definition

The **Employee** domain manages the organizational profiles of staff members working within the restaurant. It establishes *who* works there and *what* their professional role is.

## Entities

### Employee
A profile representing a staff member. It contains personal details, contact information, and an active/inactive status.

### Role
The job title or primary responsibility (e.g., Chef, Waiter, Cashier, Manager). 

## Invariants

1. **Independent of Schedule**: An Employee exists in the system regardless of whether they have active shifts. This allows for Fixed Schedules, salaried employees, or future Payroll integrations without forcing a `Shift` dependency.
2. **Tenant-Scoped**: Employees are scoped to a Tenant. An employee cannot work across two different Tenants unless they have two distinct Employee profiles.
3. **Decoupled from Identity**: While an Employee may be linked to a Core `Identity` (to log into the POS), the Employee record itself is a business entity. An Employee can exist without login access (e.g., a dishwasher who doesn't use the system).

## Relationships
- **Shift**: Employees are scheduled and tracked via the `SHIFT.md` domain.
- **Role Permissions**: Employee roles may map to Core Platform RBAC Roles for application access, but this mapping happens at the application boundary, not inside this domain.
