# Restaurant Module — Reference Design (Phase 2)

**Status:** Reference Design **Architecture Locked** · Phase 3 Contracts **LOCKED** (Business Authority).  
**Evidence:** [restaurant-contracts-review-2026-07-19.md](../../evidence/restaurant-contracts-review-2026-07-19.md)  
**Not:** implementation authorization (Prisma / API / UI / Shared builds still need OP when execution is due).

**Phase path:**

```
Evidence ✅ → Reference Design ✅ LOCKED → Business Contracts ✅ LOCKED → Prisma (derived) → SQL/RLS → Application → UI
```

**Prisma Test:** if a new business decision appears during schema work, stop — amend Contracts first.
## Documents (canonical set)

| # | Document | Role |
|---|----------|------|
| 1 | [VISION.md](./VISION.md) | What Restaurant Module is inside Mall |
| 2 | [CAPABILITY_MAP.md](./CAPABILITY_MAP.md) | Official Module shape |
| 3 | [AGGREGATE_BOUNDARIES.md](./AGGREGATE_BOUNDARIES.md) | Roots, Entities, VOs, ownership |
| 4 | [LIFECYCLE_MAP.md](./LIFECYCLE_MAP.md) | State machines |
| 5 | [PACKAGE_MANIFEST.md](./PACKAGE_MANIFEST.md) | Package requires / exports / roles |
| 6 | [MVP_BOUNDARY.md](./MVP_BOUNDARY.md) | v1 in / out — anti-bloat |
| 7 | [DOMAIN_LANGUAGE.md](./DOMAIN_LANGUAGE.md) | Shared vocabulary for all Contracts |

## Locked architectural notes (Founder)

1. **Guest** = Entity, not Aggregate Root  
2. **Staff** = Core Membership + RestaurantEmployee assignment (no Staff Aggregate)  
3. **Shift** = Module-local for **MVP limits**, not because Shift is restaurant-only  
4. **Fulfillment** = Entity inside Order (`mode` = dine_in \| pickup \| delivery) — not Delivery Aggregate  
5. **Reservation may create Order; Order never owns Reservation**

## Upstream Evidence (Phase 1 — input)

- [restaurant-operational-workflow.md](../../evidence/restaurant-operational-workflow.md)  
- [restaurant-aggregate-map.md](../../evidence/restaurant-aggregate-map.md)  
- [restaurant-capability-classification.md](../../evidence/restaurant-capability-classification.md)  
- [restaurant-pattern-library.md](../../evidence/restaurant-pattern-library.md)  
- [restaurant-anti-patterns.md](../../evidence/restaurant-anti-patterns.md)  
- [restaurant-gap-analysis-salon.md](../../evidence/restaurant-gap-analysis-salon.md)  
- [platform-capability-map-from-salon.md](../../evidence/platform-capability-map-from-salon.md)

## Downstream

| Phase | Status |
|-------|--------|
| Phase 3 — Business Contracts | **LOCKED** → [docs/contracts/modules/restaurant/](../../contracts/modules/restaurant/INDEX.md) |
| Phase 4+ — Prisma / SQL / App / UI | **Blocked** until authorizing OP (schema = translation of Contracts only) |

## Platform reuse

Reference Design shape is templated for every future Module:

→ [docs/templates/module-reference/](../../templates/module-reference/README.md)  
→ Contract shape: [docs/templates/module-contract/CONTRACT.template.md](../../templates/module-contract/CONTRACT.template.md)
## Relation to Salon

Salon remains the **platform Reference Implementation** (OP-005).  
Restaurant Reference Design is the **locked Module blueprint** for hospitality — rename + apply of the primary Work Unit (`Visit` → `Order`), not a delivery-app clone of AbuKhater.
