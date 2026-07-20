# Table Contract

## Definition

The **Table** domain manages the physical layout, capacity, and reservations of the restaurant's dine-in space.

## Entities

### Floor / Zone
A logical grouping of tables (e.g., "Main Dining Room", "Patio", "Bar").

### Table
A physical seating asset. Tracks its identifier, seat capacity, and current physical occupancy status.

### Reservation
A future booking for a Table or group of Tables at a specific time for a specific party size.

## Invariants

1. **Independent of Order**: A Table exists permanently. 
   - *A Reservation does not imply Order creation.*
   - *An Order does not necessarily require a Table.*
2. **Capacity Enforcement**: A Reservation cannot exceed the combined capacity of the assigned Tables without explicit manager override.
3. **State Conflicts**: A Table cannot be marked as Available if it has an active, unpaid Dine-In Fulfillment Order linked to it.

## Relationships
- **Fulfillment**: A Dine-In Fulfillment strategy explicitly links an Order to a Table.
- **Customer**: A Reservation is typically linked to a Customer identity.
