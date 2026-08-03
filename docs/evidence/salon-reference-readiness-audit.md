# Salon Reference Readiness Audit

**Date:** 2026-07-20  
**Kind:** Governance / Reference audit — **not** code review, **not** phase execution  
**Question:** Is Salon a valid **Source of Truth** for deriving Restaurant without redesign or returning to AbuKhater as design SoT?  
**Authority:** Founder assignment — last check before treating Salon as official RI for the restaurant path.

---

## Verdict

# READY FOR RESTAURANT DISCOVERY

| Meaning | Not meaning |
|---------|-------------|
| Salon Locked reference is coherent SoT for rename+apply | Restaurant **implementation** authorized |
| Discovery may proceed / is already COMPLETE on Salon pattern | AbuKhater zip is a design reference |
| Next Founder command may be **Restaurant Exit Criteria** | Shared builds / Order Prisma/API/UI allowed |

---

## Direct answers

### 1. هل أصبح Salon هو Source of Truth الوحيد؟

**نعم — لاشتقاق نمط المطعم (spine / governance / placement).**

| Layer | Source of Truth |
|-------|-----------------|
| Governance cycle | [GOVERNANCE_FRAMEWORK.md](../platform/GOVERNANCE_FRAMEWORK.md) + Salon track evidence |
| Module shape | [docs/modules/salon/](../modules/salon/README.md) |
| Contracts | [docs/contracts/modules/salon/](../contracts/modules/salon/INDEX.md) |
| Pattern stack | [salon-module-reference-pattern.md](./salon-module-reference-pattern.md) |
| Lock decision | [OP-007](../DECISION_LOG.md#op-007) · [salon-v1-reference-locked.md](./salon-v1-reference-locked.md) |
| Placement gate | [platform-capability-map-from-salon.md](./platform-capability-map-from-salon.md) |

**ليس SoT:** كود أبو خاطر، أو حزم `restaurant-*.md` السابقة كمنافس للعمود الفقري — هي **أدلة إدخال** (Patterns + Anti-Patterns) فقط.

### 2. هل يمكن بدء Restaurant Discovery دون إعادة تصميم أو الرجوع إلى أبو خاطر كمرجع تصميم؟

**نعم.**  
Discovery قائم أصلًا ومُعلَّم **COMPLETE**: [restaurant-discovery-and-mapping.md](./restaurant-discovery-and-mapping.md) — يربط Visit→Order على المرجع المقفول.  
أبو خاطر يبقى مصدر **ما لا يُنسخ** ([restaurant-anti-patterns.md](./restaurant-anti-patterns.md)) ومعرفة تشغيلية ثانوية — ليس مرجع تصميم المنصة.

### 3. فجوات / مخاطر متبقية

| Risk | Severity | Mitigation |
|------|----------|------------|
| وثائق Restaurant القديمة ما زالت تذكر OP-005 / AbuKhater كـ SoT للاستخراج | WARN | Discovery §7 precedence: Salon Lock > Discovery > prior extracts |
| ضغط Shared (Shift / Artifact / Settlement) من فجوات G1–G12 يدخل Exit Criteria فيُضخَّم MVP | WARN | Exit Criteria يجب أن يلتزم بـ thin spine + Triggers |
| Restaurant Reference Design «LOCKED» موازٍ لـ Discovery | WARN | Contracts/RD ≠ إذن بناء؛ Exit Criteria يحدد MVP المنتج |
| Stale “next = Phase A” في Exit Criteria | **Fixed** in this audit | Historical note added |
| `DOMAIN_MODEL.md` كان يعرض Appointment بدل Visit | **Fixed** in this audit | Visit + pointer to salon packs |

لا توجد فجوة تمنع READY لـ Discovery.

---

## Role Map & Knowledge Hierarchy

خريطة الأدوار (فلسفة الاستخراج — ملزمة لاحقًا):

```
AbuKhater (Operational Reality)
    → Workflow / Aggregates / Patterns / Capability Classification / Anti-Patterns / Gap Analysis
        ↓
Restaurant Reference Design + Business Contracts
        ↓
Filtered through Salon Locked Pattern + Discovery
        ↓
Restaurant Exit Criteria
        ↓
Product Phases (A/B/…)
        ↓
Implementation (future OP only)
```

### Fixed Source of Truth roles

| Role | Authority |
|------|-----------|
| **Architecture & Governance SoT** | **Salon Locked (OP-007)** — modules/salon · salon contracts · reference pattern · Governance Framework · Capability Map placement |
| **Restaurant day-philosophy SoT** | **VISION + MVP_BOUNDARY + ORDER Contract** (`docs/modules/restaurant/` · `docs/contracts/modules/restaurant/ORDER.md`) |
| **Official “what must not transfer”** | **Anti-Patterns** ([restaurant-anti-patterns.md](./restaurant-anti-patterns.md)) |
| **Why Shared may appear later** | **Pattern Library + Gap Analysis** — explain candidates only; **not** MVP unless **Trigger for Build** + independent **OP** |
| **Derivation filter** | Salon Locked Pattern + [restaurant-discovery-and-mapping.md](./restaurant-discovery-and-mapping.md) |

**AbuKhater is never:** Architecture SoT · Governance SoT · Prisma/API authority · permission to inflate Restaurant MVP from the zip.

---

## Critical Challenges Before Restaurant Exit Criteria

1. **Workflow bias:** أبو خاطر منحاز للتوصيل (delivery-heavy). Restaurant Module **must not** become a Delivery System; fulfillment modes include dine_in / pickup / delivery as Module design — delivery is one mode, not the Module thesis ([VISION](../modules/restaurant/VISION.md)).

2. **Shared vs P0:** Shift / Artifact / Settlement remain **Shared Candidates** (Capability Map + Pattern Library). They are **not** automatic Product P0. Entry to MVP only via Trigger + separate OP.

3. **Stale citations:** Any older document that points to **OP-005** or treats **AbuKhater as Source of Truth** is now read under **OP-007 + Discovery Precedence** (Salon Lock → Discovery → prior extracts as input evidence only).

4. **Contract pack size ≠ MVP scope:** Ten Restaurant Contracts being **LOCKED** as business language does **not** mean v1 implements all of them. **Restaurant Exit Criteria** alone decides what enters v1 and what is deferred (e.g. REPORTING, full SHIFT-as-Shared, Reservation depth).

---

## 1. Governance Consistency

| Gate | Evidence | Result |
|------|----------|--------|
| Exit Criteria ADOPTED | `salon-reference-track-exit-criteria.md` | **PASS** |
| Phase A PASSED | `salon-phase-a-evidence.md` | **PASS** |
| Phase B PASSED | `salon-phase-b-evidence.md` | **PASS** |
| Founder Review PASS (Corrections None) | `salon-founder-review.md` | **PASS** |
| S1 Assignment ADOPTED (Reference only) | `salon-phase-s1-assignment.md` | **PASS** |
| S1 Founder Check PASS | `salon-phase-s1-evidence.md` | **PASS** |
| S2 Pattern + PASS | `salon-module-reference-pattern.md` · `salon-phase-s2-evidence.md` | **PASS** |
| Founder Lock OP-007 CLOSED | `salon-v1-reference-locked.md` · Decision Log | **PASS** |
| No reopen of Product after Review | S1 Assignment §0 / §3 | **PASS** |

**Chain:** Exit Criteria → A → B → Review → S1 → S2 → Lock = **closed and consistent**.

---

## 2. Reference surface consistency

| Surface | Status | Result |
|---------|--------|--------|
| Architecture Lock | Core module-agnostic; Salon = RI Module | **PASS** |
| Capability Map | Visit Module-only; Shared not built; PWU rule | **PASS** |
| Contracts Visit/Service/Employee/Customer | Accepted (S1) | **PASS** |
| Module Reference Design pack | Frozen S1 | **PASS** |
| Reference Pattern (7 layers + Restaurant language validation) | EXTRACTED | **PASS** |
| Capability Boundaries Core / Shared / Module | Aligned; anti-Core pollution | **PASS** |

---

## 3. Restaurant Discovery vs Salon Reference

| Check | Result |
|-------|--------|
| Discovery status COMPLETE | **PASS** |
| Mapping Visit→Order on Locked pattern | **PASS** |
| Reuse vs Restaurant-specific listed | **PASS** |
| No Order/API/DB authorized | **PASS** |
| Prior AbuKhater packs as competing SoT? | **WARN** — mitigated by Discovery precedence |
| Anti-Patterns block rename+apply? | **No** — they protect it |

---

## 4. Anti-Patterns compatibility

[restaurant-anti-patterns.md](./restaurant-anti-patterns.md) remains valid:

- لا نسخ كود/RLS/PIN/صيغ أبو خاطر  
- لا Order/Menu في Core  
- لا Shared-as-is  
- لا توسيع SalonVisit إلى Order+Pilot+Shift  

متوافق مع المرجع الحالي ولا يمنع Discovery.

---

## 5. Corrections applied during audit (minimal)

| File | Change |
|------|--------|
| `salon-reference-track-exit-criteria.md` | Stale “Execute Phase A” → historical + current Lock/Discovery note |
| `restaurant-discovery-and-mapping.md` | SoT precedence + Discovery COMPLETE in next-gates diagram |
| `docs/architecture/DOMAIN_MODEL.md` | Appointment → **Visit**; pointer to salon packs |

No S1/S2/Restaurant execution. No Order implementation.

---

## 6. Final decision

```
READY FOR RESTAURANT DISCOVERY
```

**Reasons:**

1. Salon governance chain closed through OP-007.  
2. Architecture · Capability · Contracts · Docs · Pattern form a coherent RI.  
3. Discovery already maps Restaurant to Salon Locked pattern without requiring redesign.  
4. AbuKhater is operational knowledge + warnings — not design SoT (see Role Map).  
5. Residual risks are WARN-level and do not invalidate SoT; Critical Challenges bound Exit Criteria writing.

**Next authorized Founder command (not executed here):**  
«اكتب Restaurant Exit Criteria» — then Phase A Assignment per Governance Framework.  
**Still forbidden without OP:** Restaurant schema · APIs · Portal · Shared builds.

**AbuKhater extraction census (pre–Exit Criteria):** [abukhater-knowledge-inventory.md](./abukhater-knowledge-inventory.md) — **CLOSED** (confidence matrix §10).  
**Unified knowledge map:** [docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md](../knowledge/RESTAURANT_KNOWLEDGE_INDEX.md).  
**Next command only:** Restaurant Exit Criteria.

---

## Closing — Extraction philosophy (normative)

لدينا الآن المعرفة التشغيلية المستخرجة، والأنماط، والحدود، والتصميم المرجعي، والعقود، والـ Mapping على Salon Locked. أبو خاطر أصبح مصدر معرفة وتشغيل وتحذيرات (Operational Knowledge Base)، وليس دستور تصميم أو مصدر حقيقة للمنصة.
