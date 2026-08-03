# Restaurant Phase A — Kickoff

**Date:** 2026-07-20  
**Status:** **OPEN** — Phase A Execution **COMPLETE (A1–A8)** · awaiting **D6 Founder Acceptance**  
**Evidence rollup:** [restaurant-phase-a-evidence.md](./restaurant-phase-a-evidence.md) (**READY FOR FOUNDER ACCEPTANCE**)  

**Kind:** Kickoff — execution window. Completion = Evidence D1–D6 + Founder Acceptance, **not** merge alone.  
**Forbidden until D6 PASS:** Phase B · Pilot preparation · any next-stage Assignment.

---

## 1. What is open

**Restaurant Phase A Execution** for work packages **WP-A1…WP-A8** only, producing evidence **D1–D6**:

| ID | Evidence |
|----|----------|
| D1 | Domain Contract Evidence |
| D2 | API Boundary Evidence |
| D3 | Persistence Evidence |
| D4 | Permission / RLS Evidence |
| D5 | Runtime Evidence |
| D6 | Founder Acceptance |

---

## 2. What is forbidden during this window

| Forbidden |
|-----------|
| Modify Architecture Lock / redesign Core |
| Re-design Canonical Contracts (escalate gaps; do not invent) |
| Features outside Exit Criteria **A1–A8** |
| Shift · Reservation · Shared services · Pilot/dispatch · Phase B work |
| AbuKhater re-extraction · Product Philosophy re-debate |
| Treating `_legacy_stubs/` as SoT |

---

## 3. Immediate next steps (execution order)

1. ~~A1 Runtime Evidence~~ → **PASS** (`npm run smoke:restaurant-a1`)  
2. ~~A2 Menu + RestaurantEmployee~~ → **PASS** (`npm run smoke:restaurant-a2`)  
3. ~~A3 Order Success Loop~~ → **PASS** (`npm run smoke:restaurant-a3`)  
4. **A4** Delivery-as-mode (no dispatch product) — next  
5. A5–A7 · A8 · D6 Founder Acceptance  

**Do not** start Phase B, S1, Shared, Shift, or Reservation from this Kickoff.


---

## 4. Position on the roadmap

| Layer | State |
|-------|--------|
| Architecture v1.0 | ✅ LOCKED |
| Operational Foundation / Knowledge | ✅ CLOSED |
| Salon Reference | ✅ LOCKED (OP-007) |
| Restaurant Contracts (Canonical) | ✅ Frozen (translate only) |
| Restaurant Exit Criteria | ✅ ADOPTED |
| Restaurant Phase A Assignment | ✅ ADOPTED |
| Phase A Kickoff | ✅ OPEN (this file) |
| Phase A Implementation | ⏳ Authorized — not claimed done |
| Pilot (RG-005 / first client) | 🔒 Locked (separate gates) |

---

## 5. Closing

```
Kickoff = OPEN
Coding may start only inside A1–A8 + D1–D6
No expansion without Founder Decision
```
