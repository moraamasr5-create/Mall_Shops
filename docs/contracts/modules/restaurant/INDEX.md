# Restaurant Module Contracts — Index

## Purpose

This directory contains the Domain Contracts for the `restaurant` module. It defines the business rules, entities, and aggregates that make up the restaurant vertical slice.

These contracts adhere strictly to the platform invariants (e.g., Tenant-scoping, explicit Roles) defined in the Core Contracts (`../../INDEX.md`).

## Aggregate Map & Dependency Rules

The Restaurant domain is highly decoupled. Each aggregate has clear responsibilities and boundaries to prevent leakage.

| Aggregate | Owns | Depends On (Reads) |
|-----------|------|---------------------|
| **[ORDER](./ORDER.md)** | Order, OrderLineItem | Menu, Fulfillment |
| **[PAYMENT](./PAYMENT.md)** | Payment, PaymentAttempt, Refund | Order |
| **[FULFILLMENT](./FULFILLMENT.md)** | Fulfillment Policy, Windows, Readiness Rules | None |
| **[KITCHEN](./KITCHEN.md)** | KitchenTicket, Prep Workflow, Assignment | Order |
| **[DRIVER](./DRIVER.md)** | Driver, DeliveryAssignment | Fulfillment |
| **[TABLE](./TABLE.md)** | Floor, Table, Reservation | Customer |
| **[CUSTOMER](./CUSTOMER.md)** | Customer Profile, Address | None |
| **[MENU](./MENU.md)** | Category, MenuItem, ModifierGroup | None |
| **[EMPLOYEE](./EMPLOYEE.md)** | Employee, Role | None |
| **[SHIFT](./SHIFT.md)** | Shift, TimeEntry | Employee |

## Shared Concepts

| Concept | Purpose |
|---------|---------|
| **[STATUS](./STATUS.md)** | Defines the state machine transition rules for Orders, Payments, and Kitchen. |
| **[EVENTS](./EVENTS.md)** | Canonical Domain Events published by this module for internal integrations. |

## Out of Scope
- **Inventory**: Stock management, recipes, and purchasing are explicitly excluded from this module to maintain focus and prevent the domain from expanding into a full supply-chain system.
