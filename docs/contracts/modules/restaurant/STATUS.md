# Status Contract

## Definition

The **Status** contract documents the centralized State Machine Rules and Transition Policies for the Restaurant module. 

It does **not** own the status data (the aggregates themselves store their current state). Instead, it documents the valid transitions, rules, and constraints (the allowed and forbidden paths) between states.

## 1. Order State Machine

### States
- `Draft`: Cart is being built.
- `Placed`: Order submitted by customer.
- `Accepted`: Restaurant acknowledges the order.
- `Preparing`: Kitchen is working on it.
- `Ready`: Food is ready for fulfillment.
- `Completed`: Order fulfilled.
- `Cancelled`: Order aborted.

### Transition Rules
- `Draft` -> `Placed`: Allowed. Requires minimum order value validation.
- `Placed` -> `Accepted`: Allowed.
- `*` -> `Cancelled`: Allowed, but forbidden if `Payment Status` is `Captured` unless accompanied by a `Refund`.

## 2. Payment State Machine

### States
- `Pending`, `Authorized`, `Captured`, `Failed`, `Refunded`.

### Transition Rules
- `Authorized` -> `Captured`: Allowed (End-of-Day or upon Order Completion).
- `Pending` -> `Refunded`: Forbidden (cannot refund what hasn't been captured).

## 3. Kitchen State Machine

### States
- `Queued`, `In_Progress`, `Plated`.

### Transition Rules
- `Queued` -> `In_Progress`: Allowed.
- `In_Progress` -> `Plated`: Allowed. Triggers internal event to potentially advance Order status.

## 4. Driver State Machine (Delivery)

### States
- `Unassigned`, `Assigned`, `En_Route_To_Restaurant`, `En_Route_To_Customer`, `Delivered`.

### Transition Rules
- `Assigned` -> `En_Route_To_Customer`: Forbidden unless Order Status is `Ready`.
