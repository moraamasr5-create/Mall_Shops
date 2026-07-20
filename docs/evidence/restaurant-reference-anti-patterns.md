# Restaurant Anti-Patterns

**Date:** 2026-07-19  
**Source:** AbuKhater (`Full_PROv1.zip`)  
**Purpose:** Things that belong **only** to AbuKhater — or must **never** be copied into Mall_Shops.  
**Companion:** [Capability Classification](./restaurant-reference-capability-classification.md) (**Ignore** rows expand here).

**Rule:** Operational Patterns may inform Mall_Shops later. **Implementations, hacks, and brand residue must not.**

---

## 1. Never copy into Mall_Shops

| Anti-pattern | Why it existed in AbuKhater | Harm if copied |
|--------------|----------------------------|----------------|
| PIN-in-`localStorage` “auth” (default PIN) | Fast pilot ops without real Identity | Bypasses **Core** Identity + RLS/RBAC model |
| Dual English + Arabic status strings with client mapping layer | Migration / bilingual UI residue | Corrupts Aggregate clarity; Mall_Shops owns one domain vocabulary per Module |
| Treating n8n / Sheets / Drive / Telegram as architecture | Historical automation path | Replaces platform contracts with brittle glue |
| Expanding primary Work Unit into print + pay + notify + sync | Single-app MVP gravity | Violates OP-005 anti-bloat analogue for Order |
| Hardcoded parallel “simple kitchen menu” beside real catalog | Incomplete sold-out UI | Dual models → data lies |
| Brand constants as domain (InstaPay handle, Vodafone number, GPS, neighborhoods) | One-restaurant product | Fake “platform” config that is really brand |
| Client-generated order sequence in `localStorage` | Offline UX numbering | Conflicts with server truth / multi-device |
| Open RLS-style “allow all” config patterns from pilot SQL | Ship speed | Contradicts Mall_Shops Layer-1 RLS discipline |
| Empty / missing schema pack as “source of truth” | Archive incompleteness (`C-Supabase_plan`) | Guessing schema from scraps |
| Stub notification edge function as real ops channel | Placeholder | Fake capability |
| UI rule ≠ server rule (assign while on_delivery) | Drift during hotfixes | Non-deterministic ops |
| Encoding pilot payroll formula into “platform reporting” | Local labor deal | Locks Shared Reports to one employer’s math |
| Multi-app split (menu SPA + dashboard SPA) as required architecture | Delivery of one business | Mall_Shops Module boundaries ≠ AbuKhater repo layout |
| Overnight shift window hard-wired to one city | Cairo ops | Timezone belongs in **Platform Policy**, not hardcoded Module myth |
| Using Order as fee-only “external trip” vehicle without clear type | Ops shortcut | Pollutes Order meaning |

**Classification for all rows above:** **Ignore** (do not design from them). Real needs underneath may still map to Module/Shared Patterns elsewhere.

---

## 2. AbuKhater-only (valid for them, not for platform design)

| Item | Stay in AbuKhater | Classification |
|------|-------------------|----------------|
| طيار vocabulary + max-7 load + fair-return heuristic constants | Their delivery SOP | **Ignore** as constants; Pattern P7 may still be studied |
| Manual / Talabat / online source labels | Their channels | **Ignore** labels; intake-channel *idea* is Module |
| Reservation + deposit as shipped | Their cafe/table side business | Optional **Restaurant Module** later — not mandated by extraction |
| Thermal print mode toggle UX | Device reality of that shop | Channel detail under Artifact Pattern |
| Capacitor / mobile wrap choices | Their packaging | **Ignore** |
| Arabic status text as DB enum substitute | Their persistence choice | **Ignore** |

---

## 3. Conceptual anti-patterns (governance)

| Anti-pattern | Correct stance |
|--------------|----------------|
| “Copy AbuKhater to get Restaurant Module faster” | Extract Patterns → classify → wait for OP |
| “Delivery Trip is a second primary Work Unit” | Trip is secondary around **Order** |
| “Kitchen needs a Shared KDS because tickets print” | Artifact Pattern ≠ kitchen product |
| “Shift belongs in Core because every business has a day” | Shift is Shared candidate — **not** Core Mission |
| “Put settlement fields deep into Order because COD exists” | Settlement Pattern trails Work Unit |
| “Restaurant reference implies dine-in table service” | **Not evidenced** — inventing is forbidden in extraction |

---

## 4. What *is* allowed to influence Mall_Shops (knowledge only)

- Order as primary Operational Work Unit  
- Confirm → hand-off Artifact → fulfill → terminal  
- Shift as period container Pattern  
- Settlement separable from work  
- Capacity dispatch Pattern (carefully)  

These live in the Workflow / Aggregate Map / Pattern Library — **not** in AbuKhater code, SQL, or APIs.

---

## 5. One-line summary

Reuse AbuKhater’s **workday meaning**; discard its **auth hacks, dual statuses, brand constants, glue integrations, and Aggregate bloat** — none of that becomes Mall_Shops design.
