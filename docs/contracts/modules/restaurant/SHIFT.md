# Shift Contract

## Definition

The **Shift** domain handles time, attendance, and scheduling for Employees. It tracks *when* staff are expected to work and when they *actually* worked.

## Entities

### Shift
A planned block of time during which an Employee is scheduled to work. Includes start time, end time, and assigned role for that specific shift.

### TimeEntry
A factual record of attendance (Clock-in / Clock-out).

## Invariants

1. **Decoupled from Employee Core**: This domain depends on `EMPLOYEE.md` for identity, but holds all logic related to time tracking and schedules (Rotating Schedules, Fixed Schedules).
2. **Strict Time Boundaries**: A TimeEntry must belong to a specific operational day or Shift to ensure accurate payroll calculations.
3. **Auditability**: Alterations to TimeEntries (e.g., a manager fixing a missed clock-out) must be tracked.

## Relationships
- **Employee**: Every Shift and TimeEntry references an Employee.
- **Future Expansion**: This domain serves as the foundation for future Payroll modules.
