# Menu Contract

## Definition

The **Menu** aggregate manages the product catalog for a restaurant. It defines what can be sold, how it can be customized, and how much it costs.

## Entities

### Category
A logical grouping of menu items (e.g., "Beverages", "Main Courses"). Categories help in structuring the UI and kitchen routing.

### MenuItem
The core product available for sale. Has a base price, description, and availability status.

### ModifierGroup
A grouping of related customization options (e.g., "Size", "Toppings"). Can enforce rules like "Minimum 1, Maximum 3 selections".

### Modifier
A specific variation or add-on within a ModifierGroup (e.g., "Large", "Extra Cheese"). Modifiers can adjust the base price of the MenuItem.

## Invariants

1. **Tenant-Scoped**: The entire menu catalog belongs to a specific Tenant.
2. **Item-Category Relationship**: A MenuItem must belong to at least one Category.
3. **Modifier Constraints**: When a ModifierGroup is attached to a MenuItem, the validation rules (min/max selections) are absolute and must be enforced before an order can be placed.
4. **Active Status**: Items and Modifiers can be marked as inactive (e.g., out of stock) without being deleted. Inactive items cannot be added to new orders.

## Relationships
- **OrderLineItem**: Orders reference MenuItems and Modifiers. However, an OrderLineItem captures the price *at the time of sale*, protecting past orders from future menu price changes.
