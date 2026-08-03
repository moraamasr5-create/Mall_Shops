# Settings Contract

**Module:** `restaurant`  
**Concept:** Settings  
**Status:** Accepted (Phase 3) — behavior Contract (thin)  
**Parents:** [PACKAGE_MANIFEST](../../../modules/restaurant/PACKAGE_MANIFEST.md) · [MVP_BOUNDARY](../../../modules/restaurant/MVP_BOUNDARY.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

---

## 1. Purpose

Settings configure how this Tenant’s Restaurant Module runs: which fulfillment modes are allowed, when the period may open/close, and which payment acceptance methods are recognized. Settings are not operational work.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **Settings** | Per-Tenant Module configuration |
| **Platform Policy** | Cross-tenant rules Settings must respect |

**Forbidden:** storing Orders in Settings · overriding Timezone Policy

---

## 3. Responsibilities

**Responsible for:**

- Enabling/disabling fulfillment modes  
- Defining period open/close hours for Shift guards  
- Declaring accepted payment methods  
- Choosing a default fulfillment mode  

**Not responsible for:**

- Running Orders  
- Authoring Platform Policy  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| Configuration root | RestaurantSettings (thin) |

**Consistency rule:** Updating Settings changes future guards for Commands — it does not rewrite historical Orders.

---

## 5. State Machine

**None.**

---

## 6. Invariants

1. Settings never hold Work Units.  
2. At least one fulfillment mode must be enabled.  
3. Shift hours are interpreted under Platform Timezone Policy.  
4. Payment methods stay within Currency Policy.  
5. Historical Orders are not mutated by Settings changes.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **UpdateRestaurantSettings** | owner, manager | Module active | Future guards/options change |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **RestaurantSettingsUpdated** | UpdateRestaurantSettings | Configuration changed |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Shift | Uses hours to allow Open |
| Order / Fulfillment | Uses enabled modes |
| Payment | Uses accepted methods |
| Platform Policy | Wins on conflict |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.settings.write` | UpdateRestaurantSettings |
| `restaurant.settings.read` | Observe |

---

## 11. Out of Scope

- Mega settings bag for all future Features  
- Branch topology product  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Align with Tenant Configuration product | Platform expansion |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | RESTAURANT_EMPLOYEE (who may update) · Platform Policy |
| **Uses** | — |
| **Referenced By** | ORDER · FULFILLMENT · SHIFT · PAYMENT · MENU · RESERVATION |

---

## Acceptance

- [x] Config behavior · not Work Unit  
- [x] §13 filled  
