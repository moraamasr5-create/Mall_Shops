# Driver Contract

## Definition

The **Driver** domain manages internal and external logistics for order delivery. It tracks driver availability, assignments, and transit states.

## Entities

### Driver
A person or service responsible for transporting an order. A Driver can be an in-house employee or an external 3rd-party logistics provider (e.g., UberEats API driver).

### DeliveryAssignment
The association between a Fulfillment (Delivery) and a Driver. 

## Invariants

1. **Strict Boundary (Execution Only)**: The Driver owns *delivery execution only*. A Driver does **not**:
   - Accept the order.
   - Prepare the order.
   - Process the customer's payment for the order (unless explicitly modeled as a Cash-on-Delivery payment attempt in the `Payment` domain).
   The Driver's workflow strictly begins when the Fulfillment domain determines the order is ready for logistics.
2. **Capacity Limits**: A Driver has a maximum capacity for concurrent DeliveryAssignments.
3. **External Integration**: The domain must abstract whether a driver is an internal `Employee` or a third-party service provider.
4. **Location Tracking**: Driver location and telemetry belong strictly to this domain.

## Relationships
- **Fulfillment**: Only interacts with Orders that have a `Delivery` Fulfillment strategy.
- **Employee**: If the driver is in-house, they may map to a profile in `EMPLOYEE.md`.
