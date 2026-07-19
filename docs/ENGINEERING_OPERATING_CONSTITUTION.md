# Engineering Operating Constitution

**What this is:** The enduring operating mind of Mall Shops — for founders, developers, Cursor, and any future collaborator.  
**What this is not:** Current phase status, Feature Freeze checklists, Release Gate tables, Implementation how-to, or a product roadmap.

**Status:** **ADOPTED** (Founder-approved).  
**Normative:** Other documents derive decisions, implementation details, or **temporary project state** from this file.  
They do not override it without an explicit amendment (see §14 Constitution Amendment Process).

This Constitution **prevents unjustified change**.  
It does **not** forbid organized change when evidence (especially Pilot learning) falsifies a hypothesis.

---

## 0. Decision Hierarchy

When rules or documents conflict, the **higher** level wins:

```
Founder Vision
        ↓
Engineering Operating Constitution   ← this file (normative)
        ↓
Decision Log                         ← why work is blocked / authorized / closed
        ↓
Release Gates                        ← objective ship / phase criteria & current freeze rules
        ↓
Contracts                            ← lasting business guarantees
        ↓
Architecture (Lock + ADRs)           ← locked technical shape
        ↓
Implementation                       ← code, migrations, runbooks, temporary MVP choices
```

| Layer | Holds |
|-------|--------|
| Founder Vision | Why the company exists; sellability; Owner-first product sense |
| Constitution | How we think, decide, protect Core, grow Modules, run Pilots, change Architecture |
| Decision Log | Lifecycle of executive/operational decisions (OP-*) |
| Release Gates | Measurable gates and **current** allowed/forbidden work for a phase |
| Contracts | What the business must guarantee |
| Architecture | How the platform is structured (locked until explicitly changed) |
| Implementation | How it is built today (may be temporary) |

**Current phase, freeze lists, and “do not open gate X” live only in** [RELEASE_GATES.md](./RELEASE_GATES.md), [DECISION_LOG.md](./DECISION_LOG.md), and [PILOT_READINESS.md](./PILOT_READINESS.md) — **not** in this Constitution.

---

## 1. Project identity

Mall Shops is a **Workflow-Driven Business Operating Platform**.

- **Business Operating Platform** — multi-tenant, multi-module SaaS; Core + Modules.
- **Workflow-Driven** — businesses run as sequences of work (bookings, orders, shifts, invoices, queues…), not as eternal CRUD alone.
- A **Reference Module** proves the pattern; it does not permanently redefine the product as a single-vertical app.

---

## 2. Owner Experience and Workflow

> **Workflow exists to improve Owner Experience.**

Workflows are how businesses operate on the platform.  
Owner Experience is the filter: if the owner cannot understand what is happening, a “correct” workflow is still a failure.

### Supreme product rule

> **Every engineering decision must improve the Owner Experience before expanding technical sophistication.**

Before non-trivial work, ask:

1. Does a real place-owner understand what is happening?
2. Can they continue without a developer beside them for ordinary operation?
3. Are we optimizing architecture while the owner is still confused?

If (1) or (2) fails, do not spend the cycle on sophistication.

Owner Experience includes: clear next action, understandable errors, loading that ends, useful empty states, session that survives leave/return, and no need for developer tools for ordinary work.

---

## 3. Sellability

The product must be something you can take to a shop owner and hear:

> “أنا محتاج هذا.” / “I need this.”

We do not optimize for “best architecture in the world” as an end.  
We optimize for a **sellable, usable owner product** that still respects platform rules.

**Every Module must be independently sellable** — not only technically isolated.

- A customer must be able to buy one Module without buying another.
- Coupling that forces purchase of an unrelated Module is a product defect.
- Technical isolation (no Module→Module imports) supports sellability; it does not replace it.

---

## 4. Progressive Discovery

We do not design every domain and every future capability up front.

We **discover the system with real customers**.

| Prefer | Avoid |
|--------|--------|
| Smallest closed owner loop that proves value | Speculative completeness of every vertical |
| Evidence and Pilot learning driving the next slice | Roadmaps built only on internal assumptions |
| Temporary MVP decisions that can expire | Treating every temporary choice as permanent law |

Progressive Discovery is why Pilots and phase freezes exist — details of any freeze belong in Release Gates / Decision Log.

---

## 5. Core Mission

**Description (what Core contains):** Identity linkage, Tenant, Membership, module activation relationship, platform RBAC evaluation — not business workflows of any vertical.

**Mission (why Core exists):**

> The Core exists to provide reusable business foundations that remain independent of any specific business domain.

Any change that makes Core understand Salon, Restaurant, Clinic, or any single vertical’s meaning **pollutes Core** and violates this mission — unless an explicit Architecture / Decision path redefines Core (hierarchy §0).

---

## 6. Modules and Shared Services

| Layer | Mission |
|-------|---------|
| **Module** | Own one sellable business domain’s language, data, permissions, and workflows |
| **Platform Shared Services** | Provide cross-cutting capabilities (e.g. printing, notifications, file generation) that **many Modules** can consume without belonging to any one Module |

Shared Services are introduced when discovery proves need — designed as platform capabilities, never as a single Module’s private forever-solution that must be rewritten for the next vertical.

**Salon operational unit (Reference Module — OP-005):**

> A Visit represents work performed, not a reservation, invoice, payment, or queue.
>
> SalonVisit is the operational unit of work for the Salon Module. It must remain focused on completing a single business workflow. Any capability that can exist independently (Appointments, Queue Management, Billing, Notifications, Printing, Loyalty, etc.) must evolve as separate Aggregates or Platform Services rather than expanding SalonVisit.

How Modules are registered or stored is an Architecture / Implementation concern (may be unlocked); the **sellable isolation** rule is constitutional.

---

## 7. How we change Architecture

Architecture is stable by default.

Change is allowed only when:

1. Evidence shows the current shape harms Owner Experience, sellability, security, or Core Mission, **and**
2. The change is recorded through the Decision Hierarchy (typically ADR / Architecture Lock update / OP as required), **and**
3. Implementation follows Contracts and Gates — it does not silently redefine them.

“It seemed easier” is not a decision.

---

## 8. How we run Pilots (permanent rules)

A Pilot exists to **learn**, not to ship Features.

### Operational Readiness ≠ Product Validation

These are **different stages** in the product lifecycle. Confusing them is a governance failure.

| Stage | Answers | Does **not** answer |
|-------|---------|---------------------|
| **Operational Readiness** (e.g. Pilot Readiness Audit) | Environment, Auth, RLS, Owner Journey, Onboarding work without clear operational blockers | Whether owners will pay, retain, or succeed commercially |
| **Product Validation** (Internal Pilot → real client Pilot → Pilot Review) | Real-use learning; whether the product earns trust and continued use | Mere technical green checks |

A **Ready** / **Ready with Minor Conditions** verdict proves readiness to **start learning**.  
It does **not** prove commercial success, MVP completeness, or that an owner will subscribe and stay.

Product success is measured only after **real usage notes** and a **Pilot Review** — never by Operational Readiness alone.

**Permanent Pilot behaviours:**

- Observe Owner Experience: what they tried, where they stopped, how they completed, classification 🔴 / 🟡 / 🔵.
- 🔴 Blockers that prevent work are fixed promptly.
- 🟡 UX is addressed when it clearly harms natural use.
- 🔵 Feature Requests are recorded and prioritized later by frequency × value — **not** built because the first client asked once.
- Temporary freeze / allow-lists for a given Pilot phase are defined in Release Gates and Pilot Readiness — not restated here as eternal bans.

**Success (product — after Pilot learning):**  
The owner can independently operate the business after initial onboarding without requiring **continuous** developer intervention.

Do not encode call-count quotas as constitutional law. Environment issues may need several ops contacts; continuous developer dependency for ordinary business work is still failure.

---

## 9. How decisions are executed

Work starts only from:

- An unblocked Release Gate, or
- A Decision Log state that authorizes execution, or
- An explicitly assigned task

Collaborators (human or AI) may propose. They do not set the roadmap.

| Unjustified | Organized |
|-------------|-----------|
| Chat momentum opens scope | Gate / Decision / assignment |
| Silent Architecture drift | Lock / ADR / OP path |
| Core polluted “for speed” | Proven need + hierarchy |

If Pilot falsifies a fundamental hypothesis, follow the Decision Hierarchy to change course — do not deny reality, and do not cowboy-redesign.

---

## 10. Security (enduring)

Two authorization layers remain mandatory:

1. **Layer 1** — Database tenant isolation (RLS or equivalent)  
2. **Layer 2** — Application RBAC  

JWT represents Identity only for business authorization purposes. Tenant context is explicit.  
User-facing data access uses the identity-bound database path. Privileged bootstrap for tenant creation remains a narrow, justified exception — not a general bypass.

Detail lives in Architecture Lock, Contracts, and RLS docs.

---

## 11. AI and human collaborators

This Constitution binds Cursor, any other AI, and human engineers equally.

| Role | Behaviour |
|------|-----------|
| **Executor** | Implement only work authorized by Hierarchy / Gates / Decisions / assignment |
| **Observer** | During Pilots: record Owner Experience; classify; do not invent Features |
| **Advisor** | May propose; may not reorder milestones or open blocked work |
| **Never** | Pollute Core; couple Modules for convenience; expand sophistication while Owner Experience is broken; treat temporary phase bans as if they were written into this Constitution forever |

---

## 12. Success and failure (enduring)

### Success

- Owners can operate after onboarding without continuous developer intervention.
- Evidence precedes promotion claims.
- Modules remain independently sellable.
- Discovery shapes the next slice more than internal assumption.

### Failure

- Ordinary use requires a developer.
- Technical sophistication grows while Owner Experience stays broken.
- Core absorbs a vertical’s meaning.
- Shared capabilities are trapped inside one Module.
- Governance is bypassed by chat or “quick wins.”

---

## 13. Where temporary state lives

| Concern | Canonical location |
|---------|-------------------|
| Current phase, freeze allow/deny for this Pilot, gate status | [RELEASE_GATES.md](./RELEASE_GATES.md) |
| OP lifecycle and why work is deferred/authorized | [DECISION_LOG.md](./DECISION_LOG.md) |
| Pilot pre-flight checklist & observation template | [PILOT_READINESS.md](./PILOT_READINESS.md) |
| Platform axioms (complement) | [PLATFORM_PRINCIPLES.md](./PLATFORM_PRINCIPLES.md) |
| Locked architecture | [ARCHITECTURE_LOCK.md](./ARCHITECTURE_LOCK.md) |
| Business guarantees | [contracts/INDEX.md](./contracts/INDEX.md) |
| Agent entrypoint | [../AGENTS.md](../AGENTS.md) |

---

## 14. Constitution Amendment Process

This Constitution is intentionally stable.

It shall **not** change because of:

- implementation convenience,
- isolated feature requests,
- temporary project pressure,
- chat momentum, or
- preference for elegance alone.

Amendments are permitted **only** when **all** of the following hold:

1. A core assumption is disproven through **real operational evidence** (e.g. Pilot learning), **and**
2. The **Founder** explicitly approves the change, **and**
3. The change **preserves** the long-term vision of the platform (Workflow-Driven BOP, Owner Experience, independently sellable Modules, Core Mission), **and**
4. The rationale is recorded in the [Decision Log](./DECISION_LOG.md).

Every amendment should be **minimal**, **justified**, and **traceable**.

Temporary phase rules (freeze lists, gate status, “do not open X yet”) are **not** amendments to this Constitution — they belong in Release Gates / Decision Log / Pilot Readiness.
