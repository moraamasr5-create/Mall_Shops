# ADR-003: Domain-Driven Design Adoption

## Status

**APPROVED — Architecture Lock v1.0**

---

## Context

Mall Shops supports multiple independent business domains through Modules. As complexity grows, we need a structure that:

- Makes business logic explicit and testable
- Isolates domain knowledge from infrastructure concerns
- Allows Modules to evolve independently
- Scales without architectural redesign

Traditional layered architecture (controllers → services → database) mixes business rules with technical concerns and does not scale well across multiple domains.

---

## Decision

We adopt **Domain-Driven Design (DDD)** principles for Module organization.

Each Module is structured into four logical layers:

| Layer | Responsibility |
|-------|----------------|
| **Domain** | Pure business entities, rules, value objects, aggregates, repository interfaces |
| **Application** | Use cases, orchestration, permission checks at the use-case boundary |
| **Infrastructure** | Persistence adapters, external service adapters, mappers |
| **Presentation** | HTTP/API handlers, input validation, response shaping |

### Dependency Rules

```
Presentation → Application → Domain
Infrastructure → Domain (implements Domain interfaces)
```

- Domain depends on **nothing** outside itself
- Infrastructure and Presentation never contain business rules
- Modules never import from other Modules
- Modules may depend on Core and Shared only

### Repository Interfaces

- Domain defines repository **interfaces**
- Infrastructure provides concrete implementations
- Persistence technology (ORM, SQL, etc.) is swappable without changing Domain

### Mappers

- Domain models are independent of persistence models
- Mappers translate between Domain and storage representations
- Schema changes do not leak into Domain

---

## Rationale

### Why DDD?

1. **Clear separation** — Business rules are visible and isolated
2. **Testability** — Domain logic can be tested without database or framework
3. **Multi-Module scale** — Same pattern repeats for every Module
4. **Replaceable infrastructure** — ORM/auth/framework changes stay outside Domain
5. **Team alignment** — Code structure mirrors business language

### Why four layers?

| Layer | Why it exists |
|-------|---------------|
| Domain | Protect permanent business rules |
| Application | Coordinate use cases without polluting Domain |
| Infrastructure | Contain volatile technology choices |
| Presentation | Isolate transport concerns (HTTP, etc.) |

### Why not put examples in this ADR?

ADRs record **why**. Implementation patterns and code samples live in [docs/implementation/](../implementation/DDD_MODULE_PATTERN.md).

---

## Consequences

### Positive

- Business logic remains technology-independent
- Modules evolve independently
- Framework and ORM changes do not rewrite Domain
- Clear placement for every new piece of code

### Negative

- More structure than a flat service layer
- Requires discipline to keep layers clean
- Mappers add boilerplate

### Mitigation

- Use the first Reference Module to establish the pattern
- Enforce boundaries in code review
- Keep examples in implementation docs, not ADRs

---

## Scope Boundary

This ADR decides **Module internal organization**.

It does **not** decide:

- Which Modules exist (see [MODULE Contract](../contracts/MODULE.md))
- How Modules are activated (see [TENANT_MODULE Contract](../contracts/TENANT_MODULE.md))
- Identity or JWT strategy (see [ADR-002](./ADR-002-Identity-Model-and-JWT-Claims.md))
- Database schema or ORM (see [implementation docs](../implementation/))

---

## Related Documents

- [MODULE_SYSTEM.md](../architecture/MODULE_SYSTEM.md)
- [PLATFORM.md](../architecture/PLATFORM.md)
- [DDD Module Pattern](../implementation/DDD_MODULE_PATTERN.md)
- [Contracts Index](../contracts/INDEX.md)

## Related Decisions

- ADR-002: Identity Model and JWT Claims
- Architecture Lock v1.0
