# Restaurant Pattern Library

**Date:** 2026-07-19  
**Source:** AbuKhater operational evidence + cross-check against [Ezz workflow reference](./ezz-business-workflow-reference.md) §7 and [Capability Map](./platform-capability-map-from-salon.md) §3  
**Purpose:** Patterns that **may later** become Shared Platform Capabilities — **only if justified**.  
**Non-goals:** No Shared builds, no Feature naming as backlog, no Core changes.

**Promotion rule (unchanged):**  
Shared build requires **Trigger for Build** + Platform Pattern Extraction (5 questions) + authorizing OP.  
This library is Evidence for a **later** extraction session — not authorization.

---

## How to read

| Column | Meaning |
|--------|---------|
| Pattern | Why the business needed something (not the Feature name) |
| Evidence in AbuKhater | What showed the Pattern |
| Also in Salon/Ezz? | Cross-Module recurrence signal |
| Justified Shared candidate? | Yes / Weak / No |
| Minimal Form (later) | Smallest shape if ever built |

---

## 1. Justified Shared candidates

### P1 — Day / period Container

| | |
|--|--|
| **Pattern** | Operations belong inside a bounded work period that can open and close |
| **Evidence** | Restaurant Shift open/close; Orders gated on open Shift; close blocked while work active |
| **Also in Salon/Ezz?** | Yes — Ezz Shift; Capability Map already lists Shift |
| **Justified Shared candidate?** | **Yes** |
| **Minimal Form** | Open/close Operational Period + “active work blocks close” hook — **not** fiscal Z-report |
| **Classification** | **Shared Platform Capability** |

### P2 — Workflow step produces an Artifact

| | |
|--|--|
| **Pattern** | A material workflow step needs a durable hand-off / proof Artifact |
| **Evidence** | Confirm → kitchen ticket + cashier ticket; assign may reprint with rider name |
| **Also in Salon/Ezz?** | Yes — receipt after sale |
| **Justified Shared candidate?** | **Yes** |
| **Minimal Form** | Artifact record / export port; printing is one channel |
| **Classification** | **Shared Platform Capability** |

### P3 — Work completion (or commitment) may trigger economic settlement

| | |
|--|--|
| **Pattern** | Money posture can trail or accompany the Work Unit without becoming the Work Unit |
| **Evidence** | COD (remaining due) vs prepaid + payment proof; reservation deposit proof |
| **Also in Salon/Ezz?** | Yes — payment panel / invoice around Visit |
| **Justified Shared candidate?** | **Yes** |
| **Minimal Form** | Settlement record linked by id to Work Unit — **not** stuffing Billing into Order Aggregate |
| **Classification** | **Shared Platform Capability** |

### P4 — Operate despite network failure

| | |
|--|--|
| **Pattern** | Staff must continue material actions when the network is unreliable |
| **Evidence** | Offline mutation queue + idempotent replay |
| **Also in Salon/Ezz?** | Yes — offline sync in Ezz |
| **Justified Shared candidate?** | **Yes** (ops Pattern); mechanisms stay **Infrastructure** until productized |
| **Minimal Form** | Edge sync queue with idempotency keys |
| **Classification** | **Shared Platform Capability** |

### P5 — Material changes must be traceable

| | |
|--|--|
| **Pattern** | Who moved an Order through states must be reconstructable |
| **Evidence** | Status history / assignment history needs in delivery ops |
| **Also in Salon/Ezz?** | Yes — audit log Pattern |
| **Justified Shared candidate?** | **Yes** |
| **Minimal Form** | Append-only activity API — not unbounded columns on Order |
| **Classification** | **Shared Platform Capability** |

### P6 — Feedback on work in a period

| | |
|--|--|
| **Pattern** | Owners need period-level feedback on work performed |
| **Evidence** | Day stats, source mixes, pilot load views |
| **Also in Salon/Ezz?** | Yes — barber dashboard / sales aggregates |
| **Justified Shared candidate?** | **Yes** (as Reporting aggregates) |
| **Minimal Form** | Read models / exports by period — not Module-specific pay formulas |
| **Classification** | **Shared Platform Capability** |

### P7 — Contention for scarce capacity (dispatch shape)

| | |
|--|--|
| **Pattern** | More demand than capacity requires ordered allocation of a scarce resource |
| **Evidence** | Fair suggestion of next pilot; max concurrent load; assign only if available |
| **Also in Salon/Ezz?** | Related — Queue for stylists (waiting-room shape differs) |
| **Justified Shared candidate?** | **Yes, with caution** — same *Pattern family* as Queue; **not** identical Feature |
| **Minimal Form** | Capability to claim/release capacity units — **not** “Pilot” tables in Shared |
| **Classification** | **Shared Platform Capability** (candidate); entities remain **Restaurant Module** |

---

## 2. Weak / do not promote yet

### P8 — Customer self-declared intake channel

| | |
|--|--|
| **Pattern** | Party can submit work before staff commits |
| **Evidence** | Customer web menu → pending Order |
| **Also in Salon/Ezz?** | Partial — QR check-in (different) |
| **Justified Shared candidate?** | **Weak** — often Module channel, not Shared product |
| **Classification** | Prefer **Restaurant Module** until ≥2 Modules need a generic intake port |

### P9 — Waiting-room Queue display

| | |
|--|--|
| **Pattern** | Public board of waiting parties |
| **Evidence** | **Not evidenced** in AbuKhater |
| **Justified Shared candidate?** | **No from this source** — remains Map candidate via Salon/Ezz only |
| **Classification** | Do not invent from Restaurant extraction |

### P10 — Multi-stop delivery route

| | |
|--|--|
| **Pattern** | One trip serves many Orders |
| **Evidence** | **Not evidenced** (per-order trip) |
| **Justified Shared candidate?** | **No** |
| **Classification** | **Ignore** as platform Pattern from this source |

---

## 3. Restaurant-only Patterns (keep in Module)

| Pattern | Why not Shared |
|---------|----------------|
| Confirm-then-kitchen-hand-off before rider assign | Restaurant fulfillment sequencing |
| Delivery vs pickup fulfillment modes on Order | Vertical Order meaning |
| Sold-out toggles during service | Catalog readiness, Module language |
| Parallel Reservation track | Vertical; optional |
| Aggregator intake labeled on Order | Vertical channel tag |

Classification: **Restaurant Module**.

---

## 4. Five questions (for later Platform Pattern Extraction only)

When authorized after Pilot, each Shared candidate must answer:

1. لماذا ظهر هذا النمط؟  
2. هل يتكرر في أكثر من Module؟  
3. هل هو Business Rule أم Capability؟  
4. هل مكانه Core أم Shared أم Module؟  
5. ما أقل صورة (Minimal Form) يمكن بناؤها؟

**Do not answer by building.** This file only records candidates.

---

## 5. One-line summary

AbuKhater strengthens Shared candidates already on the map — **Shift, Artifact, Settlement, Sync, Traceability, Reporting, Capacity-dispatch** — while keeping Order language and delivery trip semantics inside **Restaurant Module**.
