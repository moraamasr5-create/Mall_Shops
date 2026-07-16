# Decision Log (Operational / Executive)

**Purpose:** Record *why* work is blocked, deferred, or mandatory — and **where each decision sits in its lifecycle**.

**Not** Architecture Lock. **Not** ADRs.  
Architecture decisions stay in [ARCHITECTURE_LOCK.md](./ARCHITECTURE_LOCK.md) and [docs/adr/](./adr/).

**Current program phase:** **Pilot Learning (RG-005 eligible)** — RG-004 **PASSED**; start Pilot only on explicit assignment.  
**Feature Freeze** during RG-005: see [RELEASE_GATES.md — RG-005](./RELEASE_GATES.md#rg-005--pilot-pilot-learning-phase).  
Operational freeze retained: [2026-07-15 Operational Pass](./evidence/2026-07-15-operational-pass.md) (`vs1-operational-pass`).

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
| [OP-002](#op-002) | DB Role Hardening | **CLOSED** (VERIFIED — live Cross-Tenant PASS under `app_runtime`) |
| [OP-003](#op-003) | MVP Authentication Policy (Staging Only) | **CLOSED** (Staging Auth enabled BAS-001 PASS) |

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
| **State** | **CLOSED** |
| **Next state** | — (history retained) |
| **Type** | Infrastructure hardening |
| **Blocked by** | ~~OP-001~~ (CLOSED) |
| **Implementation** | **Done** — `app_runtime` (NOBYPASSRLS) + privileged `DIRECT_URL` client; live evidence re-PASS |
| **Proposal** | Non-`BYPASSRLS` app login + `SET ROLE authenticated`; privileged URL for migrations + `createTenant` only |
| **Pre-answers** | [RLS.md — Decision Record](./implementation/RLS.md) |
| **Evidence** | [`cross-tenant-latest.md`](./evidence/cross-tenant-latest.md) — **Overall: PASS** after cutover (`2026-07-15T01:32:00.414Z`) |
| **Why now** | Explicit assignment after `vs1-operational-pass` freeze; first work of **Production Hardening**. |

### Lifecycle progress

```
PROPOSED → APPROVED → AUTHORIZED → IMPLEMENTED → VERIFIED → CLOSED
              ✅           ✅           ✅           ✅         ✅
```

(DEFERRED lifted after OP-001 CLOSED + `vs1-operational-pass` + explicit Production Hardening start.)

---

## OP-003

| Field | Value |
|-------|--------|
| **ID** | OP-003 |
| **Title** | MVP Authentication Policy (**Staging Only**) |
| **State** | **CLOSED** |
| **Next state** | — (Exit Condition still applies before Production Auth policy) |
| **Type** | **Operational decision for Staging / RC1** — not Architecture Lock, not a permanent platform Auth policy |
| **Scope** | Hosted Staging project Mall_Full (`ovjbgxhhfjmgatdwqagb`) only |
| **Triggered by** | RG-004 / BAS-001 Run 1 — **RB-004-01** (Environment) |
| **Evidence of root cause** | [BAS-001 § Root cause proof](./acceptance/BAS-001.md#root-cause-proof-before-staging-auth-change) — signup `400` (no session) + login `401 Email not confirmed` = GoTrue Confirm email, not app/RLS |
| **Decision (Staging / BAS-001 / RC1)** | For the purpose of **BAS-001 and RC1**, disable **Email Confirmation** on Staging so the first salon owner can complete the full journey via **Public APIs only**. |
| **Explicit non-goals** | Does **not** change Architecture. Does **not** prescribe Production Auth policy. Does **not** mean “the platform forever skips email confirmation.” |
| **Production** | Confirm email **may be re-enabled**. If so, update BAS-001 to: **Signup → Confirm Email → Login → Continue** — do not keep Confirm email OFF solely to preserve an old test. |
| **Implementation (ops only)** | Mall_Full Dashboard: Confirm email **OFF** (or `mailer_autoconfirm: true` via Management API). **No application code change.** |
| **Why document** | So readers a year later know this was a **Staging RC1 operational choice** after an Environment blocker — not a permanent product/architecture rule. |
| **Exit Condition** | OP-003 **ends** at the earlier of: **first Production Deployment**, or **RG-006 (v1.0.0)**. Before Production, a **separate Product decision** on Email Verification policy is required; update BAS-001 accordingly (e.g. Signup → Confirm Email → Login → Continue if confirmation is mandatory). Closing via Exit Condition does not by itself change Staging Auth settings. |

### Lifecycle progress

```
PROPOSED → APPROVED → AUTHORIZED → IMPLEMENTED → VERIFIED → CLOSED
              ✅           ✅           ✅           ✅         ✅
```

Staging Auth enabled RC1; BAS-001 PASS 2026-07-16 (runId `1784223356496-122787b4`).

**Exit:** first Production Deployment **or** RG-006 (v1.0.0), whichever comes first — then replace with an independent Product Email Verification decision + BAS-001 update.

---

## How to update this log

1. Advance **State** only when evidence or an explicit project decision warrants it.
2. When `cross-tenant-latest.md` becomes **PASS**: set OP-001 → **VERIFIED**, then **CLOSED** after formal acknowledgment. *(Done 2026-07-15.)*
3. Set OP-002 → drop **DEFERRED**, set **AUTHORIZED** only on **explicit assignment** (OP-001 CLOSED is necessary but not sufficient under the Execution Rule).
4. After OP-002 ships and is proven: **IMPLEMENTED** → **VERIFIED** → **CLOSED**.
5. Append new entries as `OP-00x` — do not create parallel logs.
6. OP-003 (Staging only): **IMPLEMENTED** when Staging Confirm email is OFF; **VERIFIED**/**CLOSED** when BAS-001 Run 2 PASSes. Closing OP-003 does **not** freeze Production Auth policy.
