# Restaurant Lifecycle Map

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — state machines, not day-workflow narratives  
**Parents:** [AGGREGATE_BOUNDARIES.md](./AGGREGATE_BOUNDARIES.md) · [CAPABILITY_MAP.md](./CAPABILITY_MAP.md) · [DOMAIN_LANGUAGE.md](./DOMAIN_LANGUAGE.md)  
**Contrast:** Evidence “workflows” describe scenarios; **this** document defines allowed states and transitions.

---

## 0. Rules for reading lifecycles

1. Each machine belongs to **one Aggregate Root** (system of record).  
2. Terminal states do not leave except via explicit reopen (normally forbidden).  
3. Cross-Aggregate effects are **application orchestration**, not hidden dual writes without a use case.  
4. MVP may omit states marked 〔Later〕.

---

## 1. Order lifecycle (primary Work Unit)

**Aggregate Root:** `Order`  
**Status field:** `OrderStatus`

```
Created
   │
   ▼
Confirmed
   │
   ▼
Preparing
   │
   ▼
Ready
   │
   ├── (dine_in / pickup) ──► Completed
   │
   └── (delivery) ──► OutForDelivery ──► Delivered ──► Completed

Created | Confirmed | Preparing | Ready | OutForDelivery
   │
   └──► Cancelled

OutForDelivery | Ready 〔delivery failure path〕
   │
   └──► Failed
```

### States

| State | Meaning |
|-------|---------|
| `Created` | Order accepted into the system; not yet restaurant-committed |
| `Confirmed` | Restaurant committed; kitchen hand-off expected |
| `Preparing` | Prep in progress (MVP: Order is SoR; later may mirror KitchenTicket) |
| `Ready` | Ready for guest hand-off or dispatch |
| `OutForDelivery` | Left the place (delivery mode only) |
| `Delivered` | Guest received (delivery mode); precedes Completed |
| `Completed` | Work unit closed successfully |
| `Cancelled` | Aborted before successful completion |
| `Failed` | Fulfillment failed (esp. delivery) after commitment |

### Allowed transitions (normative)

| From | To | Guard (business) |
|------|----|------------------|
| Created | Confirmed | Staff/system confirm; Shift open if Shift in use |
| Created | Cancelled | Before confirm |
| Confirmed | Preparing | Default after confirm (or explicit start prep) |
| Confirmed | Cancelled | Allowed with reason |
| Preparing | Ready | Prep finished |
| Preparing | Cancelled | Allowed with reason (policy may restrict) |
| Ready | Completed | Mode ∈ {dine_in, pickup} |
| Ready | OutForDelivery | Mode = delivery + assignment present |
| Ready | Cancelled | Policy-gated |
| OutForDelivery | Delivered | Delivery success |
| OutForDelivery | Failed | Delivery failure + reason |
| Delivered | Completed | Close work unit |
| *non-terminal* | Cancelled | See policy; not from Completed |

### Forbidden (examples)

- `Created` → `OutForDelivery` (skip commit/prep)  
- `Completed` → any non-terminal  
- `OutForDelivery` when fulfillment mode ≠ `delivery`  
- `Delivered` for dine-in/pickup  

### Mode overlays

| Mode | Path after Ready |
|------|------------------|
| `dine_in` | Ready → Completed |
| `pickup` | Ready → Completed |
| `delivery` | Ready → OutForDelivery → Delivered → Completed (or Failed) |

---

## 2. KitchenTicket lifecycle 〔secondary / optional in MVP〕

**Aggregate Root:** `KitchenTicket`  
**Only if** KitchenTicket Root is persisted (see Aggregate Boundaries).  
**MVP preferred:** omit this machine; use Order `Preparing` / `Ready`.

```
Queued
   │
   ▼
InProgress
   │
   ▼
Ready
   │
   └──► Cancelled (if Order cancelled)
```

| Rule | Detail |
|------|--------|
| Creation | At/after Order `Confirmed` |
| Sync | Ticket `Ready` may authorize Order → `Ready` (orchestration) |
| Never | Ticket must not advance Order to `OutForDelivery` |

---

## 3. Reservation lifecycle

**Aggregate Root:** `Reservation`

```
Pending
   │
   ▼
Confirmed
   │
   ├──► CheckedIn ──► Completed
   │
   └──► Cancelled

Pending ──► Cancelled
Confirmed ──► NoShow 〔Later〕
```

| State | Meaning |
|-------|---------|
| `Pending` | Request held; not yet accepted |
| `Confirmed` | Place accepted the booking |
| `CheckedIn` | Party arrived |
| `Completed` | Visit/booking closed |
| `Cancelled` | Released |
| `NoShow` | 〔Later〕 Confirmed but party did not arrive |

**MVP minimum:** `Pending` → `Confirmed` → `Completed` \| `Cancelled` (CheckedIn optional).

### Cross-Aggregate invariant (with Order)

| Rule | Statement |
|------|-----------|
| Reservation → Order | **Reservation may create Order** (optional link when booking becomes work) |
| Order → Reservation | **Order never owns Reservation** |
| Independence | Reservation without Order is valid; Order without Reservation is valid |

Reservation lifecycle is **independent** of Order lifecycle in v1 (link is optional orchestration, not ownership).

---

## 4. Shift lifecycle

**Aggregate Root:** `Shift`  
**Implementation:** Module-local for **MVP limits** — the Pattern is **not** restaurant-specific (Shared candidate; Salon and others may adopt later).

```
Closed
   │
   ▼
Open
   │
   ▼
Running          〔optional explicit state — may equal Open〕
   │
   ▼
Closing
   │
   ▼
Closed
```

| State | Meaning |
|-------|---------|
| `Closed` | No active operating period |
| `Open` | Period started; Orders may associate |
| `Running` | 〔Optional〕 synonym/phase of Open during the day |
| `Closing` | Close attempted; validating no blocking Orders / wrapping report |
| `Closed` | Period ended; stats frozen for that Shift |

### Transitions

| From | To | Guard |
|------|----|-------|
| Closed | Open | Inside operating window (Timezone Policy + place hours) or admin force |
| Open / Running | Closing | Close requested |
| Closing | Closed | No blocking non-terminal Orders; attendance rules if any |
| Closing | Open / Running | Close aborted (validation failed) |

**Invariant:** Cannot reach `Closed` from `Closing` while blocking Orders remain.

---

## 5. Fulfillment lifecycle (Entity inside Order)

**Not** a separate Aggregate. **Not** named Delivery/Pickup/DineIn Aggregates.  
`Fulfillment.mode` ∈ { `dine_in`, `pickup`, `delivery` }; status/assignee/times ride on the Entity.

```
(mode set at Order create)
   │
   ▼
Unassigned / AtPlace     〔assignee empty or not required〕
   │
   ▼
Assigned                 〔when mode needs assignee — typically delivery〕
   │
   ▼
EnRoute                  〔aligns with Order OutForDelivery; mode = delivery〕
   │
   ▼
Finished                 〔aligns with Delivered / Failed / Completed hand-off〕
```

| Guard | Detail |
|-------|--------|
| Mode | Exactly one mode per Order.Fulfillment |
| Assign | When required: Order at least `Ready` (default) |
| EnRoute | Only if `mode = delivery` → Order `OutForDelivery` |
| Finished | Order → `Delivered` / `Failed` / `Completed` per mode |

---

## 6. MenuItem availability lifecycle (simple)

**On MenuItem**

```
Available ◄──► Unavailable
```

Unavailable ⇒ cannot be added to **new** Orders. Historical lines unchanged.

---

## 7. PaymentAcceptance (VO on Order) — not a full machine in MVP

MVP tracks attributes, not a bank-grade state machine:

| Attribute idea | Notes |
|----------------|-------|
| method | cash / digital / … |
| paidAmount / remainingAmount | Snapshot |
| proofRef | Optional |

**Later Payment Aggregate** may use: `Pending` → `Captured` → `Refunded` (Shared Settlement territory).  
Do **not** block Order `Confirmed` on a full Payment Aggregate in MVP unless Contracts explicitly require it.

---

## 8. Lifecycle ownership matrix

| Lifecycle | System of record | MVP |
|-----------|------------------|-----|
| Order | Order | Required |
| Reservation | Reservation | Required (thin) |
| Shift | Shift | Required (Module-local) |
| KitchenTicket | KitchenTicket | Optional — prefer Order states |
| Fulfillment | Order Entity | Required; `mode = delivery` uses assignee/en-route path |
| Menu availability | MenuItem | Required |
| Payment capture/refund | Payment 〔Later〕 | Snapshot VO only |

---

## 9. Explicitly not lifecycles in this Module

| Non-lifecycle | Why |
|---------------|-----|
| “Cart building UI steps” | Presentation |
| “n8n webhook retries” | Infrastructure |
| “Pilot attendance payroll day” | Economics / Later Settlement |
| Inventory receive/transfer | Out of Module v1 |
| Loyalty earn/burn | Later |

---

## 10. One-line summary

**Order owns work-unit states; Fulfillment Entity carries mode/status/assignee/times; Reservation may create Order but Order never owns Reservation; Shift is MVP-local Pattern — lifecycle law, not a workday story.**
