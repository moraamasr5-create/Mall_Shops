# Kitchen Contract

## Definition

The **Kitchen** domain manages the preparation workflow of food and beverages. It focuses on the lifecycle of preparation independently of front-of-house order tracking.

## Concepts

### Preparation Workflow
The sequence of steps required to prepare items. A workflow can be simple (Prepare -> Done) or complex (Grill -> Fry -> Assemble).

### Kitchen Status
The internal state of preparation for a specific item or group of items.

### Preparation Assignment
The routing of specific preparation tasks to designated stations (e.g., Cold Station, Grill, Bar).

### KitchenTicket
A logical or physical document grouping items that need to be prepared together. An Order can generate multiple Kitchen Tickets (e.g., one for the Bar, one for the Kitchen).

## Invariants

1. **Workflow Centric**: The domain focuses on the *process* of preparation. A KitchenTicket is merely an artifact of the Preparation Workflow.
2. **Decoupled Status**: The Kitchen Status (e.g., "Grilling", "Plating") is distinct from the Customer-facing Order Status (e.g., "Preparing"). 
3. **Station Routing**: Items are routed to Prep Stations based on Menu configurations, but the routing execution and station load management live here.

## Relationships
- **Order**: An Order triggers the creation of Kitchen Tickets and starts the Preparation Workflow.
- **Status**: The internal states of the workflow are defined by [STATUS.md](./STATUS.md).
