# Restaurant Module Contracts — Index

**Phase:** Business Contracts (Phase 3)  
**Status:** **LOCKED** — Business Authority (review PASS 2026-07-19)  
**Evidence:** [restaurant-contracts-review-2026-07-19.md](../../../evidence/restaurant-contracts-review-2026-07-19.md)  
**Authority:** These Contracts are business truth for Restaurant. Prisma/SQL/API/UI must **translate** them — never invent business rules.  
**Litmus (Prisma Test):** If a new business decision appears while writing Prisma, Phase 3 was incomplete — stop and amend Contracts first.  
**Reference Design:** [docs/modules/restaurant/](../../../modules/restaurant/README.md) *(Architecture Locked)*  
**Contract template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)  
**Module templates pack:** [docs/templates/module-reference/](../../../templates/module-reference/README.md)

### Contract philosophy

| Write this | Never write this |
|------------|------------------|
| Commands (`CreateOrder`, `ConfirmOrder`, `DispatchOrder`) | `POST /orders`, GraphQL, RPC |
| Domain Events (`OrderCompleted`) | Webhooks, queues, topics |
| Invariants & Responsibilities | Fields, tables, FKs, `createdAt` |
| §13 References graph | ORM relation diagrams as authority |

---

## Reading order (mandatory)

| # | Contract | Kind |
|---|----------|------|
| 1 | [ORDER.md](./ORDER.md) | Aggregate Root — **primary Work Unit** |
| 2 | [MENU.md](./MENU.md) | Aggregate Root (catalog) |
| 3 | [FULFILLMENT.md](./FULFILLMENT.md) | Entity inside Order |
| 4 | [SHIFT.md](./SHIFT.md) | Aggregate Root (MVP-local Pattern) |
| 5 | [RESERVATION.md](./RESERVATION.md) | Aggregate Root (parallel) |
| 6 | [PAYMENT.md](./PAYMENT.md) | Acceptance behavior on Order (v1) |
| 7 | [GUEST.md](./GUEST.md) | Entity (not Root) |
| 8 | [RESTAURANT_EMPLOYEE.md](./RESTAURANT_EMPLOYEE.md) | Assignment on Membership |
| 9 | [SETTINGS.md](./SETTINGS.md) | Configuration behavior (thin) |
| 10 | [REPORTING.md](./REPORTING.md) | Later / read-side stub |

Each Contract uses **13 sections**: Purpose · Domain Language · Responsibilities · Aggregate Boundary · State Machine · Invariants · Commands · Domain Events · Relationships · Permissions · Out of Scope · Future Evolution · **References**.

---

## Obsolete (must not exist as authority)

Do not restore as Contracts: Customer · Driver · Kitchen · Table · Status · Events · Employee.  
See GUEST / RESTAURANT_EMPLOYEE / ORDER / RESERVATION instead.

---

## Before Phase 4

1. Phase 3 is **LOCKED** — do not casually edit; use an explicit delta if business rules must change.  
2. Prisma/SQL/RLS/API/UI remain **blocked** until an authorizing OP opens Restaurant implementation.  
3. Schema must derive from Contracts — never the reverse.  
4. Vocabulary must match [DOMAIN_LANGUAGE.md](../../../modules/restaurant/DOMAIN_LANGUAGE.md).

---

## Core dependencies (not duplicated here)

Identity · Tenant · Membership · Module · TenantModule · RBAC · Permission — see [docs/contracts/INDEX.md](../../INDEX.md).
