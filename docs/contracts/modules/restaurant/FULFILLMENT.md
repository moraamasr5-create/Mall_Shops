# Fulfillment Contract

**Module:** `restaurant`  
**Concept:** Fulfillment  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [ORDER](./ORDER.md) · [DOMAIN_LANGUAGE](../../../modules/restaurant/DOMAIN_LANGUAGE.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

> Fulfillment is **how** work reaches the guest — not a Delivery product and not an HTTP resource.

---

## 1. Purpose

Fulfillment lets the restaurant choose and execute the path of an Order: dine in, pick up, or deliver. The business must support all three modes so Restaurant is not a courier Module.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Fulfillment** | How an Order is executed (inside Order) |
| **mode** | dine_in \| pickup \| delivery |
| **Assignee** | Who carries delivery when mode requires it |

**Forbidden:** Delivery/Pickup/DineIn Aggregates · Driver Aggregate

---

## 3. Responsibilities

**Responsible for:**

- Holding the mode of execution for an Order  
- Assigning who delivers when mode = delivery  
- Progressing dispatch / finish alongside Order Commands  
- Guarding illegal mode paths (e.g. dispatch when dining in)  

**Not responsible for:**

- Being a second Work Unit  
- Owning Order lines or Menu  
- Payroll, maps, aggregator connectors  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Aggregate Root | **None** — lives inside Order |
| Contained by | Order |
| Collaborates with | RestaurantEmployee (assignee), Order Commands (DispatchOrder / CompleteOrder / FailOrder) |

**Consistency rule:** Fulfillment changes that affect leaving the place or finishing delivery happen in the same business action as the corresponding Order Command.

---

## 5. State Machine

```
Mode chosen at CreateOrder
→ AtPlace
→ Assigned          〔when assignee required〕
→ EnRoute           〔delivery only — with Order Dispatch〕
→ Finished          〔with Order Complete / Delivered / Fail〕
```

**Forbidden:** EnRoute when mode ≠ delivery

---

## 6. Invariants

1. Every Order has exactly one Fulfillment.  
2. Mode is immutable after Order Confirm (see Order invariants).  
3. DispatchOrder is allowed only when mode = delivery and an assignee is set.  
4. dine_in and pickup never enter EnRoute.  
5. Fulfillment is never an Aggregate Root.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **ChooseFulfillmentMode** | cashier, manager | Order still Created | Mode set for this Order |
| **AssignFulfillment** | cashier, manager | Order Ready (default); mode needs assignee | Assignee responsible |
| **ClearFulfillmentAssignee** | manager | Not yet Dispatched | Assignee removed |

Order Commands **DispatchOrder**, **MarkDelivered**, **CompleteOrder**, **FailOrder** drive the rest of the path (see ORDER).

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **FulfillmentModeChosen** | ChooseFulfillmentMode | Path selected |
| **FulfillmentAssigned** | AssignFulfillment | Someone will carry delivery |
| **FulfillmentAssigneeCleared** | ClearFulfillmentAssignee | Assignment undone |

OrderDispatched / OrderDelivered / OrderCompleted / OrderFailed remain Order facts.

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | Contains Fulfillment; owns the Work Unit states |
| RestaurantEmployee | Provides assignee |
| Settings | Which modes are allowed |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.fulfillment.update` | ChooseFulfillmentMode |
| `restaurant.fulfillment.assign` | Assign / Clear assignee |
| `restaurant.order.progress` | DispatchOrder / MarkDelivered / CompleteOrder / FailOrder |

---

## 11. Out of Scope

- Live tracking product  
- Aggregator connectors  
- Attendance payroll  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| New mode value (e.g. curbside) | Explicit MVP expansion |
| Shared capacity for assignees | Pattern Extraction + OP |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | ORDER · SETTINGS · RESTAURANT_EMPLOYEE |
| **Uses** | — |
| **Referenced By** | ORDER (contains) · REPORTING |

---

## Acceptance

- [x] Behavior-first · Entity not Root  
- [x] No Delivery Aggregate · no HTTP  
- [x] §13 filled  
