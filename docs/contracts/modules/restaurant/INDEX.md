# Restaurant Module Contracts — Index

> ## LEGACY (Read-only) — DO NOT USE AS PRODUCT SOURCE OF TRUTH
>
> **Canonical Rule:** [GOVERNANCE_FRAMEWORK.md](../../platform/GOVERNANCE_FRAMEWORK.md) — hierarchy beats banners; conflict with Thesis / Index / Canonical Contracts / Discovery ⇒ auto-Legacy.  
> **Canonicalization Audit:** [restaurant-canonicalization-audit.md](../../evidence/restaurant-canonicalization-audit.md) (2026-07-20)  
> **Product Constitution:** [MVP_THESIS.md](../../modules/restaurant/MVP_THESIS.md) (**ADOPTED**)  
>
> This entire folder is a **pre–Reference-Design stub pack**. It describes peer Aggregates (Payment, Fulfillment, KitchenTicket, Driver, Table, Customer, …) that **contradict** the ADOPTED Restaurant MVP Thesis.
>
> - **Forbidden:** Exit Criteria · schema · APIs · Portal · S1 language driven from these files  
> - **Allowed:** Historical reading only  
> - **Replace later:** Index-canonical contract pack under an authorized phase — not by silently editing Product into these stubs

---

## Purpose (historical)

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
