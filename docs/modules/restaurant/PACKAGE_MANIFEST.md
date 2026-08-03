# Restaurant Package Manifest

**Module:** `restaurant`  
**Phase:** Reference Design (Phase 2)  
**Status:** **Architecture Locked (Restaurant Reference Design)** — package contract for Marketplace-ready packaging  
**Not:** npm package.json · deployment config · implementation registry code  
**Parents:** [VISION.md](./VISION.md) · [CAPABILITY_MAP.md](./CAPABILITY_MAP.md) · [MODULE.md](../../contracts/MODULE.md)

---

## 1. Package identity

```yaml
package:
  moduleKey: restaurant
  displayName: Restaurant
  kind: platform-module
  version: 0.1.0-reference   # design version — not a shipped release
  status: reference-design   # not available for Tenant production activation yet
  description: >
    Hospitality Module: Order-centric operating day with menu, multi-mode
    fulfillment, kitchen hand-off, reservation, and period (Shift) support.
```

Aligned with Core `ModuleDefinition` shape (`moduleKey`, `displayName`, `description`, `status`).

---

## 2. Requires

```yaml
requires:
  core:
    - Identity
    - Tenant
    - Membership
    - TenantModule activation
    - Platform RBAC primitives (requirePermission shell)
    - Identity-bound data access (RLS path)

  platform_policy:
    - TimezonePolicy          # how "business day" / now is interpreted
    - CurrencyPolicy          # allowed currencies / rounding
    - LocaleDefaults          # RTL / locale expectations

  shared:                     # NONE required for Module existence
    mandatory: []
    optional_when_available:
      - Shift                 # Pattern is cross-Module; Module-local only for MVP — migrate when Shared ships
      - ArtifactDelivery      # kitchen/cashier ticket export/print channel
      - Notifications
      - OfflineSync
      - SettlementBilling
      - Reporting
      - CapacityContention
```

**Rule:** Restaurant Package must be **sellable with Core alone**.  
Optional Shared items are clothing — never hard dependencies for package identity.

---

## 3. Exports (capabilities the package exposes)

```yaml
exports:
  capabilities:
    - key: menu
      surface: Menu catalog + availability
    - key: ordering
      surface: Order primary work unit + lines
    - key: guest
      surface: Guest Entity (anchored by Order / Reservation — not a Root)
    - key: staff
      surface: RestaurantEmployee assignment on Core Membership
    - key: reservation
      surface: Reservation parallel track (may create Order; Order never owns it)
    - key: fulfillment
      surface: Fulfillment Entity on Order — modes dine_in | pickup | delivery
    - key: kitchen
      surface: Hand-off / prep visibility (depth per MVP)
    - key: payments
      surface: Payment acceptance snapshot (thin)
    - key: shift
      surface: Operating period (Module-local for MVP limits — not restaurant-only Pattern)
    - key: analytics
      surface: Later
    - key: inventory
      surface: Later
    - key: loyalty
      surface: Later

  aggregates:                 # design exports — not DB
    - Order                   # primary; contains Fulfillment Entity, OrderLine, Guest Entity
    - MenuItem
    - Reservation             # contains Guest Entity; may link OrderId
    - Shift                   # MVP-local Pattern implementation
    # Guest — Entity, not Aggregate Root
    # RestaurantEmployee — assignment on Membership, not Aggregate Root
    - KitchenTicket           # optional / deferred per Aggregate Boundaries

  events:                     # names only — Contracts Phase 3 detail
    - restaurant.order.created
    - restaurant.order.confirmed
    - restaurant.order.ready
    - restaurant.order.completed
    - restaurant.order.cancelled
    - restaurant.order.failed
    - restaurant.reservation.confirmed
    - restaurant.shift.opened
    - restaurant.shift.closed
```

---

## 4. Roles (Module vocabulary)

Platform Membership carries the user; Module declares **restaurant roles** (grants map to permissions).

```yaml
roles:
  - key: owner
    description: Full Module control within Tenant; setup + ops + reports when present
  - key: manager
    description: Ops supervision; force paths; reports; config within policy
  - key: cashier
    description: Intake Orders; confirm; take payment acceptance; manage front
  - key: kitchen
    description: Prep visibility; availability toggles; mark preparing/ready
  - key: pilot
    description: Fulfillment assignee actions when fulfillment.mode = delivery
```

**Binding:** roles attach via **RestaurantEmployee assignment** on Core Membership — not a StaffMember Aggregate.

**Not exported as roles:** Core `OWNER` platform role replaces nothing here — Module roles are grants on Membership, not a second Identity system.

---

## 5. Permissions (vocabulary — Phase 3 will freeze strings)

Illustrative namespace: `restaurant:*`

```yaml
permissions:
  menu:
    - restaurant.menu.read
    - restaurant.menu.write
    - restaurant.menu.availability
  ordering:
    - restaurant.order.read
    - restaurant.order.create
    - restaurant.order.confirm
    - restaurant.order.progress      # preparing/ready/out/deliver
    - restaurant.order.cancel
  guest:
    - restaurant.guest.read
    - restaurant.guest.write
  reservation:
    - restaurant.reservation.read
    - restaurant.reservation.write
    - restaurant.reservation.confirm
  fulfillment:
    - restaurant.fulfillment.update
    - restaurant.fulfillment.assign
    - restaurant.fulfillment.progress      # en route / finish when mode = delivery
  kitchen:
    - restaurant.kitchen.view
    - restaurant.kitchen.progress
  payments:
    - restaurant.payments.accept
  shift:
    - restaurant.shift.open
    - restaurant.shift.close
    - restaurant.shift.force_close
  staff:
    - restaurant.staff.assign
  settings:
    - restaurant.settings.read
    - restaurant.settings.write
  analytics:
    - restaurant.analytics.read          # Later
```

### Default grant sketch (non-normative until Contracts)

| Role | Typical grants |
|------|----------------|
| owner | `restaurant.*` |
| manager | all ops + force_close + analytics |
| cashier | menu.read, order.*, guest.*, reservation.*, payments.accept, shift.open/close |
| kitchen | menu.availability, kitchen.*, order.read, order.progress |
| pilot | order.read (assigned), fulfillment.assign/progress |

---

## 6. Settings (Tenant Configuration consumed by Module)

Not a dumping ground. Sections only:

```yaml
settings:
  general:
    - default_fulfillment_mode
  hours:
    - shift_open_time
    - shift_close_time
    # interpreted under Platform TimezonePolicy
  localization:
    - display_locale          # within Platform Locale policy
  fulfillment:
    - delivery_enabled
    - pickup_enabled
    - dine_in_enabled
  payments:
    - accepted_methods        # within CurrencyPolicy
```

**Forbidden in settings:** Order rows, pilot payroll formulas as “config core”, Shared Policy redefinition.

---

## 7. Extensions (Marketplace future)

```yaml
extensions:
  slots:
    - order.intake.channel        # e.g. aggregator adapter
    - order.artifact.channel       # print/PDF/WhatsApp via Shared Artifact
    - order.notify.channel
    - payments.provider
  rules:
    - Extensions must not create a second primary Work Unit
    - Extensions must not bypass restaurant.* permissions
    - Extensions must not write other Modules' tables
```

Empty in Reference Design — slots reserved for later Marketplace.

---

## 8. Compatibility

```yaml
compatibility:
  platform_core: ">= VS1 Core contracts"
  reference_module_pattern: salon   # structural pattern peer — not a runtime dependency
  imports_modules: []               # Modules never depend on each other
```

---

## 9. Activation

```yaml
activation:
  mechanism: TenantModule (Core)
  on_enable:
    - Module ready for setup (Menu/Staff) then ops
  on_disable:
    - No further restaurant.* ops; data retained per Platform Policy
```

---

## 10. One-line summary

**Restaurant Package requires Core (+ Policy), exports Order-centered capabilities and `restaurant:*` permissions, depends on zero Shared Capabilities mandatorily, and reserves extension slots without inventing a courier platform.**
