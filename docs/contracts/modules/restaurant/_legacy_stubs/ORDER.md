# Order Contract

## Definition

The **Order** aggregate represents a customer's basket of goods and its financial totals. It is purely a transactional cart and delegates fulfillment, payment, and preparation to other independent domains.

## Entities

### Order
The root entity holding the total amount, tax amount, discount amount, and current state.

### OrderLineItem
A snapshot of a MenuItem (and selected Modifiers) added to the basket. It explicitly stores the unit price, quantity, and total price at the time the order was placed to ensure historical immutability.

## Invariants

1. **Decoupled from Payment**: An Order exists regardless of whether it is paid, unpaid, or partially paid. Payment state is managed by the `Payment` aggregate.
2. **Decoupled from Fulfillment**: How the order is delivered (Dine In, Pickup, Delivery) is managed by the `Fulfillment` aggregate.
3. **Decoupled from Table**: An Order does not intrinsically own a Table. If it is a Dine In order, the association is managed via the Fulfillment domain.
4. **Immutability After Acceptance**: Once an Order transitions out of the `Draft` state (into `Accepted`), its line items and prices are generally immutable unless altered via a formal adjustment process.

## Responsibilities & State
- **State Ownership**: The `Order` aggregate owns its current status (e.g., Draft, Placed, Accepted).
- **Transition Rules**: While the `Order` owns its state, the *rules* governing whether a transition is allowed (e.g., Draft -> Placed requires a minimum order value) are documented in [STATUS.md](./STATUS.md).

## Events
The Order aggregate publishes events such as `OrderPlaced` and `OrderAccepted`. See [EVENTS.md](./EVENTS.md).
