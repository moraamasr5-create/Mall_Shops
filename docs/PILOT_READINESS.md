# Pilot Readiness

**Purpose:** Operational checklist and Pilot Learning rules before / during RG-005.  
**Not** Architecture. **Not** a new Gate. Complements [RELEASE_GATES.md](./RELEASE_GATES.md) § RG-005.

**Phase:** **Operationally Ready – Awaiting Learning.** Foundation complete. Pilot Readiness Audit **CLOSED** (2026-07-19). Await Founder assignment «ابدأ Internal Pilot». RG-005 remains Locked until a real first client is authorized.

**Official Evidence:** [evidence/pilot-readiness-audit-2026-07-19.md](./evidence/pilot-readiness-audit-2026-07-19.md) — **ADOPTED** · verdict **⚠️ Ready with Minor Conditions**.  
**Meaning:** Operational Readiness to **start learning** — **not** commercial success or MVP completion (see Constitution §8).

**Post-foundation:** No proactive analysis, Architecture reviews, or Features. New work only from new Operational Evidence or real Pilot usage notes.

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

## B. Internal Pilot (optional before real client)

Same rules as external Pilot. Observer does **not** drive the mouse for the owner.

| Role | Who |
|------|-----|
| Actor | Non-developer (or you acting as salon owner only) |
| Observer | Records notes only — does not fix mid-session unless 🔴 |

**Journey to observe**

```
Signup → Login → Create Salon → Ready
  → Services → Employees → Customers
  → Logout → Login → data still present
```

**Allowed mid-session:** 🔴 Blocker fix only if journey cannot continue.  
**Forbidden mid-session:** Features, “quick improvements”, Architecture.

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
