# Menu Contract

**Module:** `restaurant`  
**Concept:** Menu  
**Status:** Accepted (Phase 3) — behavior Contract  
**Parents:** [DOMAIN_LANGUAGE](../../../modules/restaurant/DOMAIN_LANGUAGE.md) · [MVP_BOUNDARY](../../../modules/restaurant/MVP_BOUNDARY.md)  
**Template:** [CONTRACT.template.md](../../../templates/module-contract/CONTRACT.template.md)

> Behavior Contract — not a catalog schema. No columns, no HTTP.

---

## 1. Purpose

Menu defines what the restaurant **may sell today**. The business uses it to offer items, withdraw them when they cannot be fulfilled, and ensure new Orders never silently sell the unavailable.

---

## 2. Domain Language

| Term | Meaning |
|------|---------|
| **MenuItem** | Something that can be sold / prepared |
| **Category** | Grouping for offering the catalog |
| **Availability** | Whether the item may be newly ordered |

**Forbidden:** Menu as Order · stock ledger as Menu

---

## 3. Responsibilities

**Responsible for:**

- Offering and retiring sellable items  
- Grouping items for the operating catalog  
- Declaring an item available or unavailable for **new** Orders  
- Providing snapshot source data when an Order is created  

**Not responsible for:**

- Progressing Orders  
- Counting inventory / recipes / purchasing  
- Historical rewrite of past Order lines when price/name changes  

---

## 4. Aggregate Boundary

| Kind | Role |
|------|------|
| **MenuItem** (Root) | One sellable offering |
| Contained | Category placement; optional modifiers (thin in MVP) |
| May reference | — |

**Consistency rule:** Changing availability or retiring an item must not alter past Orders; it only governs **future** CreateOrder.

---

## 5. State Machine

```
Available ◄──► Unavailable
```

**Retire** removes the item from the sellable set (end of life for new Orders).

---

## 6. Invariants

1. An unavailable item must not be newly ordered.  
2. Catalog changes do not rewrite historical OrderLines.  
3. Every sellable item belongs to the Tenant’s Restaurant Module.  
4. An item offered for sale has a price the business accepts at order time.

---

## 7. Commands

| Command | Who may intend it | Preconditions | Business result |
|---------|-------------------|---------------|-----------------|
| **OfferMenuItem** | owner, manager | Module active | Item can be sold |
| **ReviseMenuItem** | owner, manager | Item exists | Offering updated for future Orders |
| **GroupMenuItem** | owner, manager | Item exists | Item placed in a Category |
| **MarkUnavailable** | owner, manager, kitchen | Item offered | Cannot be newly ordered |
| **MarkAvailable** | owner, manager, kitchen | Item exists | Can be newly ordered again |
| **RetireMenuItem** | owner, manager | Item exists | Permanently not sellable for new Orders |

---

## 8. Domain Events

| Domain Event | After | Business meaning |
|--------------|-------|------------------|
| **MenuItemOffered** | OfferMenuItem | New sellable item |
| **MenuItemRevised** | ReviseMenuItem | Future offering changed |
| **MenuItemUnavailable** | MarkUnavailable | Stop selling now |
| **MenuItemAvailable** | MarkAvailable | Sell again |
| **MenuItemRetired** | RetireMenuItem | End of sellable life |

---

## 9. Relationships

| Other | Business rule |
|-------|---------------|
| Order | CreateOrder snapshots from Menu; Menu never owns Orders |

---

## 10. Permissions

| Permission | Authorizes |
|------------|------------|
| `restaurant.menu.write` | Offer, Revise, Group, Retire |
| `restaurant.menu.availability` | MarkAvailable / MarkUnavailable |
| `restaurant.menu.read` | Observe catalog |

---

## 11. Out of Scope

- Inventory quantities, BOM, procurement  
- Channel-specific catalogs (Later)  

---

## 12. Future Evolution

| Change | Trigger |
|--------|---------|
| Strict modifier rules | Ops need |
| Inventory link | Explicit Inventory OP |

---

## 13. References

| | Concepts |
|--|----------|
| **Depends On** | SETTINGS · RESTAURANT_EMPLOYEE |
| **Uses** | — |
| **Referenced By** | ORDER |

---

## Acceptance

- [x] Behavior-first  
- [x] No Fields/Tables/HTTP  
- [x] §13 filled  
