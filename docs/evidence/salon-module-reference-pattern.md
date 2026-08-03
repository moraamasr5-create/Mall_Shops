# Salon Module — Reference Pattern (S2)

**Date:** 2026-07-20  
**Status:** **EXTRACTED** — generalized from Salon Reference Implementation  
**Source:** [docs/modules/salon/](../modules/salon/README.md) · Contracts · Capability Map · shipped Visit loop  
**Not:** Restaurant code · Shared builds · Features

---

## Pattern stack (any Module)

| Layer | Salon name | Generalized meaning |
|-------|------------|---------------------|
| 1. Primary Work Unit | **Visit** | Exactly one operational root per Module |
| 2. Lifecycle | open → closed \| cancelled | Explicit states + terminal completions |
| 3. Lines | Visit service lines | Snapshot lines of catalog work on the unit |
| 4. Rules | Employee required on close; ≥1 line on close | Module business rules (not Core schema mandates) |
| 5. Events / facts | Opened / updated / closed / cancelled | Domain facts (commands → outcomes) |
| 6. Permissions | `salon:visit:*` (+ catalog/workforce/clientele) | Module vocabulary on Core RBAC shell |
| 7. Portal Flow | Day center = Work Unit list/open/close | Owner “run the day” surface |

**Spine:** Catalog → Party → **Work Unit** → Lines → Close  

**Platform rule:** Core stays vertical-agnostic. Shared Capabilities wait for Trigger + Pattern Extraction + OP.

---

## Reference Validation (language only)

| Pattern layer | Salon | Restaurant (mapping — not build) |
|---------------|-------|----------------------------------|
| Primary Work Unit | Visit | **Order** |
| Lifecycle | open/closed/cancelled | Order statuses (Module-defined) |
| Lines | Visit services | Order lines / items |
| Rules | Employee on close | Module-specific close/fulfillment rules |
| Permissions | `salon:*` | `restaurant:*` |
| Portal Flow | `/salon/visits` day center | Owner day around Orders |

**Validation result:** Pattern transfers by **rename + apply**, not rediscovery. No Restaurant schema/API/UI authorized by this document.

---

**Out of S2**

Founder Lock Decision (separate) · Shared Capability builds  

**After Lock (done on Founder command):** [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) · [Restaurant Discovery](./restaurant-discovery-and-mapping.md)
