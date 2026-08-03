# Payment Contract

## Definition

The **Payment** domain handles all financial transactions, attempts, and refunds. It exists as an independent domain to support complex payment strategies without complicating the Order aggregate.

## Entities

### Payment
A financial transaction intent to settle a specific amount.

### PaymentAttempt
A specific attempt to capture funds (e.g., a card authorization request). A Payment can have multiple failed attempts before a successful one.

### Refund
A reversal of a previously successful Payment.

## Supported Strategies
- Cash
- Credit/Debit Card
- Online Payment Gateways
- Digital Wallets
- Split Payments
- Partial Payments

## Invariants

1. **Independent Lifecycle**: A Payment's success or failure is tracked independently of the Order's preparation or fulfillment status.
2. **Cardinality (Zero to Many)**: An Order may have **zero, one, or multiple** Payments depending on the payment policy. It is strictly forbidden to assume a 1:1 relationship between an Order and a Payment.
3. **Immutability of Success**: Once a PaymentAttempt is successful, it cannot be deleted. It can only be negated via a formal `Refund`.
4. **Audit Trail**: Every attempt, whether failed or successful, must be permanently recorded for reconciliation and auditing.

## Relationships
- **Order**: Payments are typically associated with an Order, though the domain allows for standalone transactions.
- **Status**: Payment state transitions are defined in [STATUS.md](./STATUS.md).
