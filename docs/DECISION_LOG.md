# Decision Log (Operational / Executive)

**Purpose:** Record *why* work is blocked, deferred, or mandatory — and **where each decision sits in its lifecycle**.

**Not** Architecture Lock. **Not** ADRs.  
Architecture decisions stay in [ARCHITECTURE_LOCK.md](./ARCHITECTURE_LOCK.md) and [docs/adr/](./adr/).

**Current program phase:** **Production Hardening** — OP-001 **CLOSED**; freeze at [2026-07-15 Operational Pass](./evidence/2026-07-15-operational-pass.md) (`vs1-operational-pass`).  
**OP-002** is the first authorized work of this phase (see below when AUTHORIZED).

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
4. **Execution Rule:** agents do not advance the roadmap autonomously. Implementation starts only from an unblocked Release Gate, a Decision state change that authorizes work, or an explicit assignment — see [PLATFORM_PRINCIPLES.md](./PLATFORM_PRINCIPLES.md) §11 and `AGENTS.md`.

---

## Index

| ID | Title | State |
|----|-------|--------|
| [OP-001](#op-001) | Cross-Tenant Operational Gate | **CLOSED** (VERIFIED via live PASS) |
| [OP-002](#op-002) | DB Role Hardening | **APPROVED** + **DEFERRED** (eligible after OP-001 CLOSED — **not AUTHORIZED** until explicit assignment) |

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
| **State** | **CLOSED** (was VERIFIED on live **Overall: PASS**, then closed) |
| **Next state** | — (history retained) |
| **Type** | Operational Gate / **Release criterion** |
| **Blocks until CLOSED** | ~~OP-002 authorization; Production Readiness; …~~ — **unblocked for eligibility**; downstream work still requires Execution Rule / explicit assignment |
| **Satisfied by (VERIFIED)** | Evidence report **Overall: PASS** on a **live** Supabase environment (Auth JWT + real RLS + cross-tenant read/write denials) |
| **Not sufficient** | Unit tests alone; **NOT_EXECUTED** |
| **Evidence** | [`docs/evidence/cross-tenant-latest.md`](./evidence/cross-tenant-latest.md) — **Overall: PASS** (2026-07-15T01:24:42.330Z, Mall_Full Staging via app `:3000`) |
| **Procedure** | [`docs/evidence/CROSS_TENANT.md`](./evidence/CROSS_TENANT.md) |
| **Canonical definition** | [Official Architecture Audit](./OFFICIAL_ARCHITECTURE_AUDIT.md) |
| **Why** | Prove runtime isolation matches Architecture Lock Layer 1+2 before hardening DB roles or claiming VS1 complete. |
| **Operational note** | Membership RLS recursion hotfix: migration `20260715043000_fix_membership_rls_recursion` (SECURITY DEFINER helpers; same active-member predicate). |

### Lifecycle progress

```
PROPOSED → APPROVED → AUTHORIZED → IMPLEMENTED → VERIFIED → CLOSED
              ✅           ✅*          ✅          ✅         ✅
```

\*Gate policy was authorized as mandatory when adopted; harness **IMPLEMENTED**; live **VERIFIED** on Mall_Full Staging; **CLOSED** 2026-07-15.

---

## OP-002

| Field | Value |
|-------|--------|
| **ID** | OP-002 |
| **Title** | DB Role Hardening |
| **State** | **APPROVED** + **DEFERRED** |
| **Next state** | **AUTHORIZED** only after **explicit project assignment** (OP-001 is now **CLOSED** — eligibility met; Execution Rule still applies) |
| **Type** | Infrastructure hardening |
| **Blocked by** | ~~OP-001~~ (satisfied) — waiting on **explicit AUTHORIZED** assignment |
| **Implementation** | **Not Authorized Yet** |
| **Proposal** | Non-`BYPASSRLS` app login + `SET ROLE authenticated`; privileged URL for migrations + `createTenant` only |
| **Pre-answers** | [RLS.md — Decision Record](./implementation/RLS.md) |
| **Why deferred** | Do not change connection roles until Cross-Tenant gate closed **and** hardening is explicitly assigned. |

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
2. When `cross-tenant-latest.md` becomes **PASS**: set OP-001 → **VERIFIED**, then **CLOSED** after formal acknowledgment. *(Done 2026-07-15.)*
3. Set OP-002 → drop **DEFERRED**, set **AUTHORIZED** only on **explicit assignment** (OP-001 CLOSED is necessary but not sufficient under the Execution Rule).
4. After OP-002 ships and is proven: **IMPLEMENTED** → **VERIFIED** → **CLOSED**.
5. Append new entries as `OP-00x` — do not create parallel logs.
