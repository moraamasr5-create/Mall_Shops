# Events Contract

## Definition

The **Events** contract lists the Canonical Domain Events published by the Restaurant module. 

These events are used for internal notifications, reporting, and asynchronous integrations. They do **not** imply Event Sourcing; they are simply standard messages emitted when an Aggregate changes state.

## Core Events

### Order Events
- `OrderPlaced`: Emitted when an order transitions from Draft to Placed.
- `OrderAccepted`: Emitted when the restaurant confirms the order.
- `OrderCancelled`: Emitted when an order is aborted.

### Kitchen Events
- `KitchenStarted`: Emitted when preparation begins for an order.
- `KitchenCompleted`: Emitted when all items for an order are plated and ready.

### Fulfillment & Logistics Events
- `DriverAssigned`: Emitted when a DeliveryAssignment is bound to a Driver.
- `DeliveryStarted`: Emitted when the driver is en route to the customer.
- `DeliveryCompleted`: Emitted when the order is handed to the customer.

### Financial Events
- `PaymentCaptured`: Emitted when funds are successfully captured.
- `RefundIssued`: Emitted when a refund is processed.

## Invariants

1. **Decoupling**: Modules emitting these events must not know who is listening to them.
2. **Immutability**: Once published, an event describes something that *happened in the past* and cannot be changed.
