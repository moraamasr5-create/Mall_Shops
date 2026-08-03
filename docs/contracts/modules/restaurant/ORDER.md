# Order Contract

**Module:** `restaurant`  
**Concept:** Order  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [Reference Design](../../../modules/restaurant/README.md) · [DOMAIN_LANGUAGE](../../../modules/restaurant/DOMAIN_LANGUAGE.md) · [AGGREGATE_BOUNDARIES](../../../modules/restaurant/AGGREGATE_BOUNDARIES.md) · [LIFECYCLE_MAP](../../../modules/restaurant/LIFECYCLE_MAP.md) · [MVP_BOUNDARY](../../../modules/restaurant/MVP_BOUNDARY.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

> This Contract defines **business behavior**. It does not define fields, tables, or APIs.  
> If Prisma needs a column the Contract never justified, Phase 3 is incomplete — fix the Contract first.

---

## 1. Purpose

Order is the primary Operational Work Unit of the restaurant day. The business uses Order to accept work, commit to prepare it, hand it to the guest (or dispatch it), and close that unit of work — successfully, cancelled, or failed.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Order** | Primary work performed for a guest in a period |
| **OrderLine** | One performed/sold line under the Order |
| **Fulfillment** | How the Order is executed (inside the Order) |
| **Guest** | Party served (Entity anchored by the Order) |
| **Channel** | How the Order entered (counter, web, phone, …) |

**Forbidden:** Cart as root · Delivery Aggregate · Invoice as primary work · Visit

---

## 3. Responsibilities

**Responsible for:**

- Accepting new work into the operating day  
- Committing the restaurant to prepare (Confirm)  
- Progressing prep to ready  
- Completing, cancelling, or failing the work unit  
- Keeping lines and money snapshots honest after commitment  
- Carrying exactly one Fulfillment intention  
- Anchoring who the work is for (Guest)  
- Associating work to the open operating period when Shift is in use  

**Not responsible for:**

- Authoring the Menu catalog  
- Owning Reservations  
- Opening/closing the operating period  
- Full Settlement / refunds  
- Printing, notifications, or transport  

---

## 4. Aggregate Boundary

| Kind | Role in the business |
|------|----------------------|
| **Order** (Root) | Consistency boundary for one unit of work |
| Contained | OrderLines · Fulfillment · anchored Guest · PaymentAcceptance (v1) |
| May reference | Menu (snapshot at accept) · Shift (period) · Membership (who acted / assignee) |

**Consistency rule:** Creating, confirming, progressing, completing, cancelling, or failing an Order must keep lines, Fulfillment, and acceptance snapshot consistent with that single business action.

---

## 5. State Machine

```
Created → Confirmed → Preparing → Ready
                ↘ Completed                    〔dine_in | pickup〕
                ↘ OutForDelivery → Delivered → Completed   〔delivery〕
Any non-terminal (per guards) → Cancelled
Delivery path → Failed
```

| From | To | Business guard |
|------|----|----------------|
| Created | Confirmed | ConfirmOrder; period Open if Shift in use |
| Created | Cancelled | Cancel before commit |
| Confirmed | Preparing | StartPreparation (or follows Confirm) |
| Preparing | Ready | MarkReady |
| Ready | Completed | Complete when mode is dine_in or pickup |
| Ready | OutForDelivery | DispatchOrder when mode is delivery and assignee set |
| OutForDelivery | Delivered | Delivery succeeded |
| Delivered | Completed | Complete |
| OutForDelivery | Failed | Fail |
| Non-terminal | Cancelled | Cancel allowed by policy |

**Terminal:** Completed · Cancelled · Failed  

**Forbidden:** skip Confirm into DispatchOrder · reopen Completed into Preparing · DispatchOrder when mode is not delivery · Delivered when mode is dine_in/pickup

---

## 6. Invariants

1. An Order always belongs to exactly one Tenant (with Restaurant Module active).  
2. An Order must have at least one OrderLine.  
3. Fulfillment mode is immutable after Confirm.  
4. After Confirm, OrderLines and money snapshots do not change (no silent rewrite).  
5. Exactly one Fulfillment per Order.  
6. A Completed Order cannot return to Preparing (or any non-terminal state).  
7. Cancelled and Failed are terminal — no return to active work.  
8. Unavailable Menu items must not be newly added as lines.  
9. When Shift is in use, a new Order requires an Open Shift.  
10. **Order never owns a Reservation.**  
11. Order is the only primary Work Unit in Restaurant.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **CreateOrder** | cashier, manager, owner | Module active; Shift Open if required; ≥1 sellable line; mode allowed by Settings | Order exists in Created |
| **ConfirmOrder** | cashier, manager, owner | Created | Restaurant committed; mode frozen |
| **StartPreparation** | kitchen, cashier, manager | Confirmed | Work is Preparing |
| **MarkReady** | kitchen, manager | Preparing | Work is Ready for hand-off or dispatch |
| **DispatchOrder** | cashier, pilot, manager | Ready; mode = delivery; assignee set | Work left the place |
| **MarkDelivered** | pilot, manager | Dispatched | Guest received (delivery) |
| **CompleteOrder** | cashier, manager | Ready (dine_in/pickup) or Delivered (delivery) | Work unit closed successfully |
| **CancelOrder** | cashier, manager, owner | Non-terminal; policy allows | Work abandoned |
| **FailOrder** | pilot, manager | Delivery path where failure applies | Work failed after commitment |

Fulfillment-specific intentions (assign assignee, etc.) are Commands on [FULFILLMENT](./FULFILLMENT.md) invoked in the same business action as needed.

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **OrderCreated** | CreateOrder | New work entered the day |
| **OrderConfirmed** | ConfirmOrder | Restaurant committed to the work |
| **PreparationStarted** | StartPreparation | Prep began |
| **OrderReady** | MarkReady | Ready for guest or dispatch |
| **OrderDispatched** | DispatchOrder | Left the place (delivery) |
| **OrderDelivered** | MarkDelivered | Guest received (delivery) |
| **OrderCompleted** | CompleteOrder | Work unit finished successfully |
| **OrderCancelled** | CancelOrder | Work abandoned |
| **OrderFailed** | FailOrder | Work failed |

These are **domain facts**, not webhooks, not HTTP callbacks, not queue names.

---

## 9. Relationships

| Other concept | Business rule |
|---------------|---------------|
| Menu | Order snapshots from Menu at accept; Menu does not own Orders |
| Fulfillment | Contained; executes “how” |
| Guest | Anchored Entity; not a Root |
| Payment | Acceptance recorded with Order in v1 |
| Shift | Order belongs to an Open period when Shift is in use |
| Reservation | May have been created from a Reservation; **Order never owns Reservation** |
| Settings | Validates allowed modes and period rules |
| RestaurantEmployee | Who may intend Commands / be assignee |

---

## 10. Permissions

| Permission | Authorizes Command(s) |
|------------|------------------------|
| `restaurant.order.create` | CreateOrder |
| `restaurant.order.confirm` | ConfirmOrder |
| `restaurant.order.progress` | StartPreparation, MarkReady, DispatchOrder, MarkDelivered, CompleteOrder |
| `restaurant.order.cancel` | CancelOrder |
| `restaurant.order.fail` | FailOrder |
| `restaurant.order.read` | Observe Orders (no state change) |

---

## 11. Out of Scope

- “Cart” as a business root (work unit is Order only)  
- KitchenTicket as separate Root (MVP)  
- Refunds / full Settlement  
- Inventory side-effects  
- Transport, print, notify mechanisms  

---

## 12. Future Evolution

| Possible change | Business trigger |
|-----------------|------------------|
| Line adjustment after Confirm | Real ops need a formal correction path |
| KitchenTicket Root | Multi-station prep proven |
| Payment Aggregate split | Settlement necessity |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | MENU · GUEST · SETTINGS · SHIFT (when period is in use) · RESTAURANT_EMPLOYEE (actors) |
| **Uses** | FULFILLMENT · PAYMENT |
| **Referenced By** | RESERVATION (may create Order) · REPORTING · SHIFT (close validation) |

---

## Acceptance

- [x] Behavior-first (Commands / Events / Invariants)  
- [x] No Fields / Tables / FK / HTTP  
- [x] Aligns with Reference Design + DOMAIN_LANGUAGE  
- [x] §13 References filled  
