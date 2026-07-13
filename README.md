# Mall Shops

Multi-tenant, multi-module Business Operating Platform (BOP).

خدمات لأماكن تجارية

---

## Documentation

| Layer | Location | Purpose |
|-------|----------|---------|
| **Architecture Lock** | [docs/ARCHITECTURE_LOCK.md](./docs/ARCHITECTURE_LOCK.md) | **v1.0 LOCKED** decisions |
| **Contracts** | [docs/contracts/](./docs/contracts/INDEX.md) | Business rules — source of truth |
| **Architecture** | [docs/architecture/](./docs/architecture/ARCHITECTURE.md) | System design |
| **Implementation** | [docs/implementation/](./docs/implementation/) | Technology details (Prisma, Supabase, RLS, API) |
| **MVP** | [docs/mvp/](./docs/mvp/MVP_DECISIONS.md) | Temporary first-release decisions |
| **ADRs** | [docs/adr/](./docs/adr/) | Architecture decision records |

**Start here:** [Architecture Lock v1.0 FINAL](./docs/ARCHITECTURE_LOCK.md) → [Contracts Index](./docs/contracts/INDEX.md)

---

## Status

**Architecture v1.0 FINAL LOCKED.**

Ready for Vertical Slice 1:

`Identity → Tenant → Membership → TenantModule → Salon (Reference Module)`

No further architectural expansion unless a critical flaw is found during implementation.
