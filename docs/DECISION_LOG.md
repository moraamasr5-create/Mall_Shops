# Decision Log (Operational / Executive)

**Purpose:** Record *why* work is blocked, deferred, or mandatory — and **where each decision sits in its lifecycle**.

**Not** Architecture Lock. **Not** ADRs.  
Architecture decisions stay in [ARCHITECTURE_LOCK.md](./ARCHITECTURE_LOCK.md) and [docs/adr/](./adr/).

**Current program phase:** **Operational Qualification** — prove the theoretically ready platform works the same way in live runtime.  
Do **not** start a new Module, large Feature, or architectural redesign until **OP-001** reaches **CLOSED**.

---

## Decision lifecycle (State)

Every `OP-*` entry uses this state machine:

```
PROPOSED
  → APPROVED
  → AUTHORIZED
  → IMPLEMENTED
  → VERIFIED
  → CLOSED
```

| State | Meaning |
|-------|---------|
| **PROPOSED** | Idea recorded; not accepted yet |
| **APPROVED** | Accepted as the right decision / gate / plan |
| **AUTHORIZED** | Execution is allowed to start now |
| **IMPLEMENTED** | Work landed in repo / environment |
| **VERIFIED** | Evidence proves it works as intended (live where required) |
| **CLOSED** | Done; no longer an open action — history retained |

**Special status (not a skip of the path):**

| Status | Meaning |
|--------|---------|
| **DEFERRED** | Approved, but execution is **not authorized** yet (usually blocked by another OP). Pair with **APPROVED** until AUTHORIZED. |

Rules:

1. Never jump to **IMPLEMENTED** without **AUTHORIZED** (except documentation-only / harness that defines a gate — record honestly).
2. **DEFERRED** means “do not ask Cursor/agents to implement.”
3. **CLOSED** is the only state that permanently unlocks downstream work that this decision was blocking.

---

## Index

| ID | Title | State |
|----|-------|--------|
| [OP-001](#op-001) | Cross-Tenant Operational Gate | **APPROVED** + **IMPLEMENTED** → awaiting **VERIFIED** / **CLOSED** |
| [OP-002](#op-002) | DB Role Hardening | **APPROVED** + **DEFERRED** (not AUTHORIZED) |

**Release Gates** (claiming Complete / shipping): see [RELEASE_GATES.md](./RELEASE_GATES.md) (RG-001 … RG-006).

```
VS1 Complete = mandatory OP-* CLOSED + Release Gates PASSED
```

---

## OP-001

| Field | Value |
|-------|--------|
| **ID** | OP-001 |
| **Title** | Cross-Tenant Operational Gate |
| **State** | **APPROVED** · **IMPLEMENTED** (gate + harness in repo) |
| **Next state** | **VERIFIED** when live Supabase evidence is **Overall: PASS**, then **CLOSED** |
| **Type** | Operational Gate / **Release criterion** |
| **Blocks until CLOSED** | OP-002 authorization; Production Readiness; VS1 Complete; RC1; Pilot complete; Tag v1.0.0; First Production Module; any new Module / large Feature / architectural redesign |
| **Satisfied by (VERIFIED)** | Evidence report **Overall: PASS** on a **live** Supabase environment (Auth JWT + real RLS + cross-tenant read/write denials) |
| **Not sufficient** | Unit tests alone; **NOT_EXECUTED** |
| **Evidence** | [`docs/evidence/cross-tenant-latest.md`](./evidence/cross-tenant-latest.md) |
| **Procedure** | [`docs/evidence/CROSS_TENANT.md`](./evidence/CROSS_TENANT.md) |
| **Canonical definition** | [Official Architecture Audit](./OFFICIAL_ARCHITECTURE_AUDIT.md) |
| **Why** | Prove runtime isolation matches Architecture Lock Layer 1+2 before hardening DB roles or claiming VS1 complete. |

### Lifecycle progress

```
PROPOSED → APPROVED → AUTHORIZED → IMPLEMENTED → VERIFIED → CLOSED
              ✅           ✅*          ✅          ⏳         ⏳
```

\*Gate policy was authorized as mandatory when adopted; harness **IMPLEMENTED**. Live **VERIFIED** / **CLOSED** still open.

---

## OP-002

| Field | Value |
|-------|--------|
| **ID** | OP-002 |
| **Title** | DB Role Hardening |
| **State** | **APPROVED** + **DEFERRED** |
| **Next state** | **AUTHORIZED** only after **OP-001 → CLOSED** (or at minimum OP-001 **VERIFIED** with explicit project sign-off — default: wait for OP-001 **CLOSED**) |
| **Type** | Infrastructure hardening |
| **Blocked by** | **OP-001** |
| **Implementation** | **Not Authorized Yet** |
| **Proposal** | Non-`BYPASSRLS` app login + `SET ROLE authenticated`; privileged URL for migrations + `createTenant` only |
| **Pre-answers** | [RLS.md — Decision Record](./implementation/RLS.md) |
| **Why deferred** | Do not change connection roles before live Cross-Tenant PASS. |

### Lifecycle progress

```
PROPOSED → APPROVED → AUTHORIZED → IMPLEMENTED → VERIFIED → CLOSED
              ✅
         (+ DEFERRED)
                          ⏳           ⏳           ⏳         ⏳
```

---

## How to update this log

1. Advance **State** only when evidence or an explicit project decision warrants it.
2. When `cross-tenant-latest.md` becomes **PASS**: set OP-001 → **VERIFIED**, then **CLOSED** after formal acknowledgment.
3. Only then set OP-002 → drop **DEFERRED**, set **AUTHORIZED** (implementation may begin).
4. After OP-002 ships and is proven: **IMPLEMENTED** → **VERIFIED** → **CLOSED**.
5. Append new entries as `OP-00x` — do not create parallel logs.
