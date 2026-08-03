# Customer Contract

## Definition

The **Customer** domain manages the identity, preferences, and historical data of the guests within the Restaurant module.

## Entities

### Customer
The customer identity within the Restaurant module. Contains contact information, preferences, and loyalty points.

### Address
Saved physical locations associated with a Customer for quick delivery selection.

## Invariants

1. **Tenant-Scoped**: A Customer is strictly scoped to a single Tenant. If John Doe visits Restaurant A and Restaurant B (both using Mall Shops), he has two distinct Customer profiles that do not share data.
2. **Opt-In Loyalty**: Any loyalty or rewards programs are attached to this Customer profile but are isolated from the Core Identity.
3. **Anonymous Orders**: Orders can be placed without a Customer profile, meaning the Customer relationship on an Order is optional.

## Relationships
- **Order**: An Order *may* reference a Customer.
- **Fulfillment**: Addresses stored here can be used to populate Delivery Fulfillment details.
- **Table**: A Reservation typically references a Customer.
