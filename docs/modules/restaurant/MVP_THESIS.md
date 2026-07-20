# Restaurant MVP Thesis (Product Constitution)

**Status:** **ADOPTED**  
**Adopted:** 2026-07-20  
**Kind:** Product Decision Record — **not** contract dump · **not** Exit Criteria · **not** implementation  
**Derived exclusively from:** Restaurant Knowledge Index and the documents it maps  
**Architecture SoT:** Salon Module v1.0 Reference Locked (OP-007)  
**Operational KB only:** AbuKhater Knowledge Base (CLOSED) — not design SoT  

**Rule:** Restaurant Exit Criteria **translates this Constitution into gates**. It does **not** invent Product scope.  
**Authority:** This document is the **sole Product Constitution** for Restaurant MVP / P0. Later phases (A/B/Review/S1/S2/Lock) execute it; they do not reopen Product trade-offs without a superseding Founder Decision.

### Precedence (normative)

| Layer | Role |
|-------|------|
| **This Thesis (ADOPTED)** | What Product P0 **must** prove (Success Loop) and **must not** require |
| **VISION · MVP_BOUNDARY · Index-canonical Contracts** (Reference Design track) | Module identity, anti-bloat law, business language |
| **Discovery · Patterns · Gaps · Anti-Patterns** | Sequencing evidence & copy bans |
| **Anything conflicting with the above** | **Auto-Legacy** per [Canonical Rule](../../platform/GOVERNANCE_FRAMEWORK.md#1-canonical-rule-permanent--hierarchy-over-banners) — banner optional |

**P0 sequencing vs Reference Design IN:** Where MVP_BOUNDARY marks Shift or Reservation as Module-capable for v1, this Thesis may keep them **out of the P0 Success Loop** when Discovery/Gaps classify them as parallel or Shared-candidate. That is **sequencing**, not revocation of anti-bloat law or identity.

---

## Consistency Audit (2026-07-20) — Thesis only

| Check | Result |
|-------|--------|
| No decision contradicts Index-canonical VISION / MVP_BOUNDARY / ORDER (PWU) / Discovery / Anti-Patterns | **PASS** (with Precedence above) |
| No decision implicitly requires Shared, Shift Aggregate, or other out-of-P0 elements | **PASS** |
| No loose wording that invites Feature Creep | **PASS** (tightened below) |
| Success Loop ↔ Explicit OUT consistent | **PASS** |
| No sentence with two Product readings | **PASS** (tightened below) |
| Legacy stub ORDER/INDEX on some trees vs Thesis | **PASS** — stubs declared non-authoritative |

### Verdict

# ZERO Contradictions

Therefore: **Status = ADOPTED**. Restaurant Exit Criteria = executive translation only.

---

## 0. MLP definition (locked)

> أقل منتج يجعل صاحب مطعم حقيقي يُكمل **Success Loop (§4)** حول **Order** على Mall (Core + Module)، بلا تضخم أبو خاطر وبلا Shared كشرط وجود.

**«يومه بالكامل»** = إكمال §4 وقائمة Orders حسب الوقت — **وليس** إغلاق Shift ولا طقوس Settlement/Reporting.

---

## 1. One-sentence product

**Restaurant Module** is a Mall Tenant Module that runs a hospitality **operating day** around one Primary Work Unit — the **Order** — across fulfillment modes **`dine_in` · `pickup` · `delivery`**, derived by **rename + apply** from the Salon Locked spine — not by copying AbuKhater as a product.

---

## 2. Derivation law (non-negotiable)

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| Architecture / pattern from **Salon Locked** | Rename+apply؛ ليس إعادة اكتشاف يوم العمل | Discovery · Salon pattern · OP-007 |
| AbuKhater = **operational understanding only** | الأرشيف تاريخ فيه تضخم؛ ليس SoT | Index · Anti-Patterns · Inventory CLOSED |
| Exit Criteria / Phases **translate this Thesis** | لا قرارات Product جديدة هناك | Governance Framework |
| UI/UX ≠ Domain | العرض قد يكون mobile-usable؛ الـ Domain = Order | VISION · Anti-Patterns · Discovery Portal |

---

## 3. Product Decision Record

### 3.1 Identity & center

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **Product** = Module `restaurant` via Core `TenantModule` | رأسي قابل للتفعيل؛ ليس منصة ثانية | VISION · Discovery |
| **Primary Work Unit = Order** | جذر واحد لليوم؛ نظير Visit | Index-canonical ORDER · Discovery · Gaps spine |
| **Catalog = Menu** | Category + Item + **flag توفر واحد** (active/available). لا طقس نفاد منتصف اليوم كـ Feature P0 | MENU · MVP_BOUNDARY |
| **Party = Guest Entity رفيع** (ليس Aggregate Root) | طرف على Order؛ ليس CRM | GUEST · MVP_BOUNDARY |
| **Staff = Core Membership + RestaurantEmployee assignment** | نظير Employee على Visit؛ بلا Staff Aggregate | RESTAURANT_EMPLOYEE · MVP_BOUNDARY · Discovery |

### 3.2 Normal Owner Day & Success Loop (Product P0)

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **Normal Owner Day** = Menu جاهز · Orders تتحرك · تحضير/تسليم عبر حالات Order · قائمة حسب الوقت · إكمال/إلغاء الوحدة | يوم قابل للبيع بـ Module + Core | VISION · Discovery · Salon Portal Flow |
| **Shift Aggregate خارج P0** · لا بوابة Open/Close | Shared candidate؛ اليوم = قائمة زمنية كالصالون | Discovery · Gaps G1 · Pattern P1 |
| يوم بدون Shift = قائمة Orders حسب `openedAt`/الوقت | نفس نمط Salon Locked | Discovery · Salon |

### 3.3 Fulfillment & modes

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **Fulfillment = Entity داخل Order** | ليست Aggregates لكل وضع؛ ليست Fulfillment Aggregate مستقلة | FULFILLMENT (Index-canonical) · MVP_BOUNDARY |
| **Modes في P0 = `dine_in` \| `pickup` \| `delivery`** | هوية الموديول؛ كلها جزء من تعريف المنتج لا اختيار قناة أبو خاطر | VISION · MVP_BOUNDARY · Discovery |
| **Delivery = mode لا thesis** | لا Pilot/dispatch product في P0 | VISION Out · Anti-Patterns |
| **Kitchen = Confirm → Preparing → Ready → Complete**؛ لا KitchenTicket Aggregate | hand-off = حالات Order فقط | ORDER lifecycle · MVP_BOUNDARY · Anti-Patterns |
| إن `mode = delivery` | نفس الحالات؛ يجوز مسار `OutForDelivery → Delivered → Complete` **دون** منتج توزيع/مندوب | ORDER lifecycle · Anti-Patterns Pilot OUT |

### 3.4 Explicit OUT of P0 Success Loop

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **Reservation** | مسار موازٍ؛ ليس أول يوم منتج | Discovery §4 · P10 · G10 |
| **Reporting / period analytics** | لا يلزم لإكمال Order | G9 |
| **Full Settlement / refunds / GL / Payment Aggregate** | اللقطة على Order ≠ محاسبة | G5 · MVP_BOUNDARY · Anti-Patterns |
| **Artifact / Printing Shared** | ليس شرط إكمال | P2 · G2 · Anti-Patterns |
| **Offline / Notifications / Realtime Shared** | ملابس | G6–G7 |
| **Dispatch / Pilot capacity** | عادة أبو خاطر | G4 · Anti-Patterns |
| **Shift Aggregate** | خارج الحلقة | G1 · Discovery |

### 3.5 Money & permissions (P0)

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **PaymentAcceptance snapshot على Order إلزامي عند Complete** | لقطة قبول على الوحدة؛ ليست Payment Aggregate وليست Settlement | PAYMENT (Index-canonical) · MVP_BOUNDARY · VISION |
| **Permissions = `restaurant:*`** | غلاف RBAC كالصالون | Discovery · Manifest |

### 3.6 Never Product P0

| Decision |
|----------|
| No Inventory / Recipes / Procurement / multi-warehouse |
| No CRM / Loyalty / marketing |
| No Guest Root · no StaffMember Aggregate |
| No Delivery / Pickup / DineIn / Fulfillment / Payment / KitchenTicket Aggregates |
| No AbuKhater code / PIN / open RLS / n8n / dual-app-as-architecture |
| No Shared builds without Trigger + OP |

### 3.7 Presentation (UX — not Domain)

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| **Day center UI = Orders** | rename+apply من Visits | Discovery · VISION |
| **سطح بوابة Module واحد**؛ PWA/native = Infrastructure لاحقًا | الهوية ≠ عدد التطبيقات | Anti-Patterns |
| **Mobile-usable لشاشات §4 فقط** | قيد عرض؛ لا يوسّع Domain | VISION · Discovery |

---

## 4. Compact Success Loop (normative for P0)

```
Activate restaurant Module
  → Setup Menu + RestaurantEmployee assignments (via Membership)
  → Create Order + Fulfillment.mode ∈ {dine_in, pickup, delivery}
  → Confirm → Preparing → Ready
  → [if delivery: OutForDelivery → Delivered]
  → Complete (requires PaymentAcceptance snapshot on Order)
  → Cancel | Fail = Order lifecycle outcomes only (no extra policy engine)
```

**Not in the loop:** Open/Close Shift · Reservation · Print · Settlement suite · Pilot dispatch · Reporting · Shared products.

**P0 has failed as a definition** if completing §4 requires Inventory, Loyalty, Accounting, Guest Root, Staff Aggregate, Shift Aggregate, KitchenTicket, Payment Aggregate, or any Shared Capability.

---

## 5. What this Constitution is / is not

| Is | Is not |
|----|--------|
| دستور المنتج الرسمي لـ Restaurant MVP / P0 | تجميع عقود |
| المرجع الوحيد لقرارات Product قبل/أثناء Exit Criteria | Exit Criteria |
| تضييق تسلسل P0 حيث تدعم Discovery/Gaps | إلغاء VISION/MVP anti-bloat |
| Decision Record | Backlog أو schema |

---

## 6. Adoption

| State | Meaning |
|-------|---------|
| **ADOPTED** | ملزم الآن |
| **SUPERSEDED** | فقط بقرار مؤسسي صريح جديد |

**Canonicalization:** [restaurant-canonicalization-audit.md](../../evidence/restaurant-canonicalization-audit.md) — **COMPLETE**  
**Canonical restore:** [restaurant-canonical-restore-verified.md](../../evidence/restaurant-canonical-restore-verified.md) — **PASS**  
**Phase closure:** [restaurant-governance-product-phase-closed.md](../../evidence/restaurant-governance-product-phase-closed.md) — Governance + Product Constitution **CLOSED**  

**Exit Criteria:** [restaurant-exit-criteria.md](../../evidence/restaurant-exit-criteria.md) — **ADOPTED**  
**Phase A Assignment:** [restaurant-phase-a-assignment.md](../../evidence/restaurant-phase-a-assignment.md) — **PROPOSED** (execution forbidden until ADOPT)  
**Next Founder command:** **ADOPT** Phase A Assignment.  

**Forbidden until Phase A Assignment ADOPT:** schema · APIs · Portal build · Shared builds · archive re-extraction · Architecture redesign.  
**Executive rule:** conflict with this sequence ⇒ auto-Legacy — [GOVERNANCE_FRAMEWORK §1b](../../platform/GOVERNANCE_FRAMEWORK.md#1b-executive-sequence-rule-permanent--no-silent-exceptions).

---

## 7. Knowledge resolutions (former FD-1…FD-5) — locked

| Ex-FD | Resolution | Anchor |
|-------|------------|--------|
| Modes | All three in P0 | VISION · MVP_BOUNDARY · Discovery |
| Guest | Thin Entity | MVP_BOUNDARY · Gaps Party |
| Staff | Membership + RestaurantEmployee in Setup | MVP_BOUNDARY · Salon Employee pattern |
| Kitchen | Preparing → Ready | ORDER · VISION handoff |
| Payment | PaymentAcceptance snapshot required on Complete | VISION · MVP_BOUNDARY; Settlement OUT |

**True Founder Decisions inside this Constitution:** none.

---

## 8. Audit trail — ambiguities removed before ADOPT

| Was loose | Now means exactly |
|-----------|-------------------|
| «availability أساسية» | flag توفر واحد على Item — لا Feature نفاد منتصف اليوم |
| «Cancel / Fail per Module rules» | نواتج lifecycle الـ Order فقط — لا محرك سياسات إضافي |
| «يومه بالكامل» | إكمال §4 + قائمة زمنية — ليس Close Shift |
| «عمق UX للأوضاع في Exit Criteria» | **محذوف** — Exit Criteria لا تقرّر سمك Product؛ الأوضاع الثلاثة ملزمة؛ ترتيب التنفيذ التشغيلي فقط تحت gates |
| Payment snapshot | **إلزامي عند Complete** |
| Delivery في الحلقة | حالات اختيارية على نفس Order — بلا منتج مندوب |
| تعارض مع stub ORDER على بعض الأفرع | stubs **غير ملزمة**؛ Thesis + Index-canonical Language هي SoT للمنتج |
