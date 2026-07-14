# Fulfillment Contract

## Definition

The **Fulfillment** domain represents a complete sub-domain responsible for how an order reaches the customer. It is not merely an enum on an order; it encompasses policies, windows, and readiness rules.

## Core Concepts

### Fulfillment Type
The primary method of delivery:
- Dine In
- Pickup (with future Curbside expansion)
- Delivery (with future Scheduled Delivery expansion)

### Fulfillment Policy
Rules governing how a fulfillment type operates (e.g., "Delivery requires a minimum basket of $15", "Pickup orders must be retrieved within 30 minutes").

### Windows & Scheduling
Time constraints associated with the fulfillment (e.g., Pickup Window: 18:00 - 18:15).

### Readiness Rules
Logic that determines when the physical handoff can occur (e.g., "All Kitchen Tickets must be Plated").

## Invariants

1. **Separation of Concerns**: Adding a new fulfillment type (e.g., Drive Through) must not require changes to the core `ORDER.md` contract.
2. **One-to-One with Order**: Every Order has exactly one primary Fulfillment strategy.
3. **Location Data**: Any fulfillment-specific location data (e.g., delivery address, table number) belongs to this domain, not the Order.

## Relationships
- **Driver**: Delivery fulfillment strategies interact with the Driver domain for assignment and tracking.
- **Table**: Dine In fulfillment strategies interact with the Table domain.
