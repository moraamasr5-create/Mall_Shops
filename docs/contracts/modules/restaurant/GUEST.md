# Guest Contract

**Module:** `restaurant`  
**Concept:** Guest  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [ORDER](./ORDER.md) · [RESERVATION](./RESERVATION.md) · [AGGREGATE_BOUNDARIES](../../../modules/restaurant/AGGREGATE_BOUNDARIES.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

Guest names who the work or booking is for. The business attaches guest facts when creating Orders or Reservations — Guest does not run its own day.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Guest** | Party served — Entity, not Root |
| **Walk-in** | Minimal guest facts allowed |

**Forbidden:** Guest Aggregate Root · Guest = Core Identity

---

## 3. Responsibilities

**Responsible for:**

- Carrying who is being served on an Order or Reservation  
- Allowing walk-in with minimal identity  

**Not responsible for:**

- Independent Guest lifecycle  
- Login / Membership  
- CRM campaigns  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Aggregate Root | **None** |
| Entity | Anchored by Order and/or Reservation |

**Consistency rule:** Guest facts change only through Order or Reservation Commands — never as a standalone Root business action.

---

## 5. State Machine

**None.**

---

## 6. Invariants

1. Guest is not an Aggregate Root.  
2. Guest ≠ Core Identity.  
3. No independent Guest lifecycle Commands as system of record.  
4. Walk-in (minimal Guest) is valid.  
5. Attach/update always happens via Order or Reservation.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **AttachGuestToOrder** | cashier, manager | Via CreateOrder / revise before Confirm | Order knows who it is for |
| **AttachGuestToReservation** | cashier, manager | Via Reservation Commands | Reservation knows who it is for |
| **ReviseAnchoredGuest** | cashier, manager | Parent still writable | Guest facts updated on that parent |

*There is no CreateGuestRoot command.*

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **GuestAttachedToOrder** | AttachGuestToOrder | Order has a party |
| **GuestAttachedToReservation** | AttachGuestToReservation | Booking has a party |
| **GuestRevised** | ReviseAnchoredGuest | Party facts changed |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | Anchors Guest |
| Reservation | Anchors Guest |
| Core Identity | Not required |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.guest.write` | Attach / Revise via parents |
| `restaurant.guest.read` | Observe |

---

## 11. Out of Scope

- Guest as a standalone Root with its own day  
- Treating Guest as Core Identity  
- Loyalty  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Richer reuse across days | Frequency — still not necessarily a Root |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | — (anchored; parents depend on Guest facts) |
| **Uses** | — |
| **Referenced By** | ORDER · RESERVATION |

---

## Acceptance

- [x] Entity behavior · no Root lifecycle  
- [x] §13 filled  
