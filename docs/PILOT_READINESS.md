# Pilot Readiness

**Purpose:** Operational checklist and Pilot Learning rules before / during RG-005.  
**Not** Architecture. **Not** a new Gate. Complements [RELEASE_GATES.md](./RELEASE_GATES.md) § RG-005.

**Phase:** **Internal Pilot (Learning)** — OP-005 **CLOSED**; OP-006 **AUTHORIZED**. RG-005 remains Locked until a real first client is authorized.

**Official Evidence (pre-Pilot):** [evidence/pilot-readiness-audit-2026-07-19.md](./evidence/pilot-readiness-audit-2026-07-19.md) — **ADOPTED** · verdict **⚠️ Ready with Minor Conditions**.  
**Meaning:** Operational Readiness enabled learning — **not** commercial success (Constitution §8).

**During Internal Pilot:** implement **only** 🔴 bugs that block the Visit loop, or ⚙️ operational fixes. **No Features.**

---

## A. Pre-flight checklist (clean environment)

Use a **fresh identity** every run. Do not rely leftover session or prior Pilot data.

### Environment & Auth

| # | Item | Done |
|---|------|------|
| 1 | Fresh / known-good database (migrations applied) | ☑ |
| 2 | Confirm Email **OFF** (Staging / OP-003) | ☑ |
| 3 | Signup rate limit not blocking | ☑ |
| 4 | Production-like or approved Staging ENV (`.env` correct) | ☑ |
| 5 | Single app instance (`npm run dev` / deploy URL clear) | ☑ |

### Owner journey (browser — no DB tools)

| # | Item | Done |
|---|------|------|
| 6 | Owner creation (Signup) | ☑ |
| 7 | Login | ☑ |
| 8 | Tenant / Salon creation | ☑ |
| 9 | Ready (salon module enabled) | ☑ |
| 10 | First Service | ☑ |
| 11 | First Employee | ☑ |
| 12 | First Customer | ☑ |
| 13 | Logout | ☑ |
| 14 | Login again + Session restore (data still there) | ☑ |

### Ops / evidence (not Features)

| # | Item | Done |
|---|------|------|
| 15 | RLS / cross-tenant evidence still valid for this ENV | ☑ |
| 16 | Error logging reachable (`requestId` in UI + server logs) | ☑ |
| 17 | Backup enabled (or Staging backup policy known) | ☑* |
| 18 | Rollback plan known (who / how if Pilot ENV breaks) | ☑ |
| 19 | Pilot contact named (who the owner reaches) | ☐ |
| 20 | Observation template ready (section C) | ☑ |
| 21 | Success metrics agreed (section D) | ☑ |
| 22 | Exit Criteria understood ([RG-005](./RELEASE_GATES.md#rg-005--pilot-pilot-learning-phase)) | ☑ |

\* #17 = policy documented; live Dashboard backup/PITR not re-confirmed in 2026-07-19 audit — see evidence note.

---

## B. Internal Pilot (OP-006 — in progress)

Same discipline as external Pilot. Observer does **not** drive the mouse for the owner.

| Role | Who |
|------|-----|
| Actor | Non-developer (or Founder acting as salon owner / receptionist only) |
| Observer | Records notes only — does not fix mid-session unless 🔴 |

**Status:** **AUTHORIZED** ([OP-006](./DECISION_LOG.md#op-006)). Not RG-005.

**Journey to observe (Operational Loop)**

```
Setup (Services → Employees → Customers as needed)
  → Open Visit → choose services → Close Visit
  → (optional) Logout → Login → open visits still visible
```

**Allowed mid-session:** 🔴 Bug / loop blocker only if the Visit journey cannot continue; ⚙️ operational if environment breaks.  
**Forbidden mid-session:** Features, “quick improvements”, Architecture, Appointments / Queue / Billing.  
**Domain freeze:** Do **not** change Salon Domain / Visit Aggregate / schema during Internal Pilot — even if an owner asks for Printing, Appointments, etc.

### Feature requests → frequency before VS1.1

Individual asks are **not** authorization to build.

| Signal | Action |
|--------|--------|
| First owner asks (e.g. Printing) | Record 🔵 only |
| Second similar ask | Record again (frequency++) |
| Third similar ask | Eligible candidate for **VS1.1** prioritization — still not auto-build |

Difference: **individual request** vs **product need**.

### Internal Pilot observation questions (VS1.1 inputs)

These — not code taste — determine VS1.1 priorities:

1. هل موظف الاستقبال فهم فكرة «فتح زيارة» مباشرة؟
2. هل أنهى زيارة دون مساعدة؟
3. هل اختار الخدمات بسهولة؟
4. هل شعر أن النظام يسرّع عمله أم يضيف خطوات؟
5. هل قال تلقائيًا: «أين أرى الزيارات المفتوحة؟»

Record answers with the four-field template in §C. Classify 🔴 / 🟡 / 🔵. Features (🔵) wait for Pilot Review → VS1.1 (and frequency rule above).

### Root-cause notes for 🔴 (mandatory)

Do **not** stop at the surface symptom. Write the **root cause** that drove the stop.

| Weak | Better |
|------|--------|
| المستخدم لم يجد زر الإغلاق | المستخدم لم يدرك أن الزيارة ما زالت مفتوحة، لأن حالة الزيارة لم تكن واضحة بصريًا |

The second leads to a better fix (and better VS1.1 judgment). Still: fix during Pilot **only** if it is a 🔴 loop blocker or ⚙️ ops — otherwise record for Review.

---

## C. Observation template (four fields only)

For each note:

| Field | Example |
|-------|---------|
| ماذا كان يحاول أن يفعل؟ | إضافة خدمة |
| أين توقف؟ | لم يفهم رسالة الخطأ |
| كيف أكمل؟ | اتصل بالمراقب / أكمل وحده |
| التصنيف | 🔴 Blocker / 🟡 UX / 🔵 Feature Request |

**Decision rule**

| Type | Action |
|------|--------|
| 🔴 | Fix immediately |
| 🟡 | Only if it blocks/confuses real use |
| 🔵 | Backlog only — not during Freeze |

---

## D. Success metrics (Pilot)

| Metric | Success |
|--------|---------|
| هل احتاج العميل التواصل مع المطور في أول يوم؟ | لا، أو مرة واحدة فقط بسبب إعدادات التشغيل وليس المنتج |
| إكمال التجهيز من المتصفح بدون أدوات/DB | نعم |
| Logout → Login → البيانات كما تُركت | نعم |
| حوادث تمنع المتابعة بدون حل | 0 غير محلولة في نافذة المراقبة |

---

## E. What this is not

- Not authorization to start Printing / Appointments / Shared Services / new Modules.
- Not a substitute for explicit assignment to open RG-005.
- Not a Feature backlog — Feature Requests wait for Pilot Review → VS1.1.

---

## Related

| Concern | Location |
|---------|----------|
| Feature Freeze + Exit Criteria | [RELEASE_GATES.md](./RELEASE_GATES.md) § RG-005 |
| Program phase | [DECISION_LOG.md](./DECISION_LOG.md) |
| First deploy / env | [RUNBOOK_FIRST_DEPLOYMENT.md](./RUNBOOK_FIRST_DEPLOYMENT.md) |
| BAS-001 (API acceptance) | [evidence/business-acceptance-summary-bas-001.md](./evidence/business-acceptance-summary-bas-001.md) |
