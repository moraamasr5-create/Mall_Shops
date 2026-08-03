# Payment Contract

**Module:** `restaurant`  
**Concept:** Payment (v1: acceptance behavior)  
**Status:** Accepted (Phase 3) — behavior Contract (thin)  
**Parents:** [ORDER](./ORDER.md) · [MVP_BOUNDARY](../../../modules/restaurant/MVP_BOUNDARY.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

Payment in v1 records whether and how money was accepted for an Order so the day can run. It is not a billing engine and not Settlement.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **PaymentAcceptance** | Business fact that money was accepted / remains due on an Order |
| **Settlement** | Later economic close Pattern — not this Contract’s v1 duty |

**Forbidden:** Invoice as Work Unit · refund suite in v1

---

## 3. Responsibilities

**Responsible for:**

- Recording that payment was accepted (method and paid vs remaining as business meaning)  
- Allowing staff to update acceptance before the Order is terminal (per policy)  

**Not responsible for:**

- Refunds, capture rails, tax, GL  
- Blocking Confirm on a full Payment Aggregate in MVP  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Aggregate Root | **None in v1** |
| Lives on | Order (acceptance behavior) |
| Future | Payment Root may reference Order |

**Consistency rule:** Acceptance changes accompany Order work; they do not invent a second primary unit.

---

## 5. State Machine

**None** in v1 (acceptance is a fact on the Order, not a bank-grade lifecycle).

---

## 6. Invariants

1. Acceptance does not replace Order as the Work Unit.  
2. ConfirmOrder does not require a full Payment Aggregate in MVP.  
3. Refunds are out of scope for v1.  
4. Accepted methods must be allowed by Settings / Currency Policy.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **AcceptPayment** | cashier, manager | Order non-terminal | Business records money accepted / remaining |
| **RevisePaymentAcceptance** | cashier, manager | Order non-terminal; policy | Acceptance updated |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **PaymentAccepted** | AcceptPayment | Money acceptance recorded |
| **PaymentAcceptanceRevised** | RevisePaymentAcceptance | Acceptance changed |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | Acceptance belongs with the Order in v1 |
| Settings | Allowed methods |
| Reservation | Deposit on Reservation is separate behavior |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.payments.accept` | AcceptPayment, RevisePaymentAcceptance |

---

## 11. Out of Scope

- Refunds, PSP, tips engine, accounting exports  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Payment Aggregate + refunds | Settlement necessity / Shared Trigger |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | ORDER · SETTINGS |
| **Uses** | — |
| **Referenced By** | ORDER · REPORTING |

---

## Acceptance

- [x] Thin behavior · not billing product  
- [x] §13 filled  
