# Reservation Contract

**Module:** `restaurant`  
**Concept:** Reservation  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [ORDER](./ORDER.md) · [DOMAIN_LANGUAGE](../../../modules/restaurant/DOMAIN_LANGUAGE.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

Reservation holds a future promise of capacity/time for a guest party. It is parallel to Order: the business may reserve without ordering, and may order without reserving.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Reservation** | Parallel booking promise |
| **Guest** | Party for the booking (Entity) |

**Forbidden:** Order owns Reservation · Reservation replaces Order

---

## 3. Responsibilities

**Responsible for:**

- Accepting and confirming booking promises  
- Cancelling or completing a booking  
- Optionally turning a confirmed booking into an Order  

**Not responsible for:**

- Floor/table maps  
- Being the primary Work Unit  
- CRM  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| **Reservation** (Root) | Booking consistency |
| Contained | Anchored Guest; deposit acceptance (thin) |
| May create | Order (link) — never owned by Order |

**Consistency rule:** Confirm/Cancel/Complete apply to the booking; creating an Order from a Reservation is an orchestration that links work without transferring ownership to Order.

---

## 5. State Machine

```
Pending → Confirmed → Completed
                   ↘ Cancelled
Pending → Cancelled
```

CheckedIn / NoShow are Later (not required for v1 behavior).

---

## 6. Invariants

1. **Reservation may create Order.**  
2. **Order never owns Reservation.**  
3. Reservation without Order is valid.  
4. Order without Reservation is valid.  
5. Confirm does not require auto-creating an Order.  
6. A Completed or Cancelled reservation does not reopen casually.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **CreateReservation** | cashier, manager, owner | Module active | Booking Pending |
| **ConfirmReservation** | cashier, manager | Pending | Booking Confirmed |
| **CancelReservation** | cashier, manager, owner | Non-terminal | Booking Cancelled |
| **CompleteReservation** | cashier, manager | Confirmed | Booking Completed |
| **CreateOrderFromReservation** | cashier, manager | Confirmed | Order created and linked; Order still does not own Reservation |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **ReservationCreated** | CreateReservation | Promise requested |
| **ReservationConfirmed** | ConfirmReservation | Place accepted the promise |
| **ReservationCancelled** | CancelReservation | Promise released |
| **ReservationCompleted** | CompleteReservation | Promise closed |
| **ReservationOrderCreated** | CreateOrderFromReservation | Booking produced work |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | May create/link; never owned by Order |
| Guest | Anchored on the booking |
| Settings | Hours / policies for when bookings are allowed (as configured) |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.reservation.write` | Create, Cancel, Complete |
| `restaurant.reservation.confirm` | ConfirmReservation |
| `restaurant.order.create` | CreateOrderFromReservation |
| `restaurant.reservation.read` | Observe |

---

## 11. Out of Scope

- Table/Floor Aggregate  
- NoShow automation  
- Full deposit Settlement engine  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| CheckedIn / NoShow | Ops frequency |
| Auto Order on confirm | Explicit decision — not default |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | GUEST · SETTINGS · RESTAURANT_EMPLOYEE |
| **Uses** | ORDER (optional create) |
| **Referenced By** | REPORTING |

---

## Acceptance

- [x] Parallel + may-create / never-owns  
- [x] Behavior-first · §13 filled  
