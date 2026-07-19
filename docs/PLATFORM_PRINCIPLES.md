# Platform Principles

**What this is:** The enduring constitution of the Mall Shops Business Operating Platform.  
**What this is not:** Architecture Lock detail, ADR rationale, Decision Log status, Release Gate tables, or implementation how-to.

These principles outlive any single Module. If twenty Modules ship, these lines should still hold.

When a principle and a convenience conflict, the principle wins — unless an explicit Architecture / OP / RG decision changes it.

---

## Documentation discipline

New documents are allowed only if they do at least one of:

1. **Decision** — permanent or executive choice (Lock, ADR, Decision Log, Release Gates)
2. **Evidence** — runtime proof (e.g. Cross-Tenant report)
3. **Policy** — enduring rule or principle (this file, Contracts, Security policy)

If a draft fits none of the three, do not create it. Prefer updating a canonical file.

---

## Principles

### 1. Core owns identity and tenancy plumbing — not business

The Core owns Identity linkage, Tenant, Membership, activation relationships, and platform RBAC primitives.  
Business meaning lives in Modules.

### 2. Modules own business

Each Module owns its domain language, permissions, data, and workflows.  
Modules do not own other Modules.

### 3. One platform, many businesses

The product is a multi-module SaaS platform.  
Salon is the **Reference Implementation**, not a redefinition of the platform as “a salon app.”

### 4. Security before convenience

Two authorization layers remain mandatory: database tenant isolation and application RBAC.  
Shortcuts that skip a layer are not shippable.

### 5. Contracts before implementation

Business truth lives in Contracts. Code implements Contracts.  
When they diverge, fix the code (or open an explicit decision) — do not silently redefine the business in code.

### 6. Runtime evidence before promotion

Promotion toward Complete / Hardening / Release requires live Operational Evidence and Release Gates — not unit tests alone and not documentation alone.

### 7. No feature bypasses governance

Features do not skip Architecture Lock, Decision Log, Operational Gates, or Release Gates.  
New work should **close an existing gate**, not invent untracked scope.

### 8. Every module is replaceable

A Module can be added, frozen, or retired without rewriting Core.  
Coupling that forces Core edits for routine Module work is a regression.

### 9. Every tenant is isolated

Cross-tenant read/write must fail.  
Tenant context is explicit. Isolation is proven at runtime before release claims.

### 10. Architecture evolves only through explicit decisions

No silent redesign. Evolution requires Lock/ADR/OP/RG updates as appropriate.  
“It seemed easier” is not a decision record.

### 11. Execution follows Gates and Decisions — not chat momentum

Agents never advance the roadmap autonomously.

The next implementation task must always originate from one of:

- A Release Gate becoming unblocked.
- An approved Decision changing state (Decision Log).
- An explicitly assigned implementation task.

Agents may propose improvements, but may not reorder milestones or begin blocked work.  
The Decision Log and Release Gates drive execution; conversation does not.

---

## What success looks like

If Salon (Reference Implementation) succeeds, then Cafe, Gym, Restaurant, Clinic, or Retail should be **execution of the same rules** — not a new architecture project.

That is the measure of a durable multi-module platform.

---

## Related (do not duplicate)

| Concern | Canonical location |
|---------|-------------------|
| Normative operating mind (Decision Hierarchy, Owner Experience, Core Mission, Amendment Process) | [ENGINEERING_OPERATING_CONSTITUTION.md](./ENGINEERING_OPERATING_CONSTITUTION.md) — **ADOPTED / normative**; other docs derive state/details from it |
| Current phase / Feature Freeze allow-lists | [RELEASE_GATES.md](./RELEASE_GATES.md) · [DECISION_LOG.md](./DECISION_LOG.md) · [PILOT_READINESS.md](./PILOT_READINESS.md) |
| Locked architecture decisions | [ARCHITECTURE_LOCK.md](./ARCHITECTURE_LOCK.md) |
| Why a technical choice was made | [docs/adr/](./adr/) |
| Executive OP lifecycle | [DECISION_LOG.md](./DECISION_LOG.md) |
| Ship / Complete gates | [RELEASE_GATES.md](./RELEASE_GATES.md) |
| Cross-Tenant evidence | [evidence/CROSS_TENANT.md](./evidence/CROSS_TENANT.md) |
| Business rules | [contracts/INDEX.md](./contracts/INDEX.md) |
