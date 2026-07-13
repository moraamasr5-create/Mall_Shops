# DDD Module Pattern (Implementation)

## Status

**Draft — implementation layer.**

This document shows *how* Modules are structured under ADR-003. It is not a Contract and not an ADR.

Business rules live in [Contracts](../contracts/INDEX.md). The decision to use DDD lives in [ADR-003](../adr/ADR-003-Domain-Driven-Design-Adoption.md).

---

## Logical Module Layout

```
modules/{moduleKey}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── aggregates/
│   ├── domain-services/
│   └── repositories/          # interfaces only
├── application/
│   ├── use-cases/
│   ├── dto/
│   └── services/
├── infrastructure/
│   ├── repositories/          # concrete adapters
│   ├── mappers/
│   └── external/
└── presentation/
    ├── controllers/
    ├── routes/
    ├── middleware/
    └── validators/
```

Physical paths may adapt to the chosen framework. The layer boundaries must remain.

---

## Layer Checklist

### Domain

- Entities and value objects with business meaning
- Aggregate roots and invariants
- Domain services spanning multiple entities
- Repository interfaces (no ORM imports)

### Application

- One use case per business operation where practical
- DTOs for input/output
- Permission checks at use-case entry
- Transaction orchestration

### Infrastructure

- Repository implementations
- Mappers (domain ↔ persistence)
- External provider adapters

### Presentation

- Request handlers
- Input validation
- Response mapping
- No business rules

---

## Anti-Patterns

| Wrong | Right |
|-------|-------|
| Business rules in controllers | Controllers call use cases |
| Domain entity saves itself via ORM | Repository persists the entity |
| Module imports another Module | Share only via Core/Shared |
| Persistence types used as Domain types | Map explicitly |

---

## Reference Module

The first Reference Module establishes this pattern for all future Modules.

Which Module is the Reference Module is an MVP decision — see [MVP_DECISIONS.md](../mvp/MVP_DECISIONS.md).

Concrete entity names and Permission vocabularies belong to that Module's implementation slice, not to Core.

---

## Related Documents

- [ADR-003](../adr/ADR-003-Domain-Driven-Design-Adoption.md)
- [MODULE_SYSTEM.md](../architecture/MODULE_SYSTEM.md)
- [API.md](./API.md)
- [PRISMA.md](./PRISMA.md)
