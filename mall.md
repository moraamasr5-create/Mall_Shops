# mall — دليل فهم منصة Mall Shops لأي AI

**الغرض:** ملف واحد يشرح للمنصة بالكامل — الهيكل، الطبقات، تدفق الطلب، وكيف تُدمج ميزة أو يُعدَّل منطق (Core أو Module) دون كسر المعمارية.

**الجمهور:** أي AI / وكيل / مطوّر يبدأ العمل على المستودع.

**الحقيقة الرسمية:** هذا الدليل خريطة تشغيلية. عند التعارض:
`Architecture Lock → Contracts → Security → Implementation → هذا الملف`.

**اسم الحزمة:** `mall-shops` — منصة تشغيل أعمال متعددة المستأجرين ومتعددة الوحدات (Business Operating Platform).

---

## 0) اقرأ هذا أولاً (قواعد ذهبية)

1. **المنصة ليست تطبيق صالون.** Salon = Reference Implementation فقط. Restaurant = تحقق معماري فقط — لا توسّعه.
2. **JWT = Identity فقط.** لا تضع Tenant ولا Roles ولا Permissions داخل JWT. الـ Tenant يأتي من الهيدر `X-Tenant-Id`.
3. **طبقتا صلاحيات إلزاميتان دائماً:**
   - Layer 1: RLS (عزل المستأجر في قاعدة البيانات)
   - Layer 2: RBAC في التطبيق (`requirePermission`)
4. **مسار قاعدة البيانات العادي:** `withIdentityRls` → `getDb()`. ممنوع تجاوز RLS للطلبات العادية.
5. **الاستثناء الوحيد للإقلاع:** `createTenant` عبر `getPrivilegedDb()` / `DIRECT_URL`.
6. **Core لا يستورد Modules.** صلاحيات الموديول تبقى داخل الموديول.
7. **لا إعادة تصميم معمارية.** التطور عبر ADR / Decision Log / Release Gates فقط.
8. **مرحلة RG-005 (Feature Freeze):** يُسمح فقط بإصلاحات 🔴 حاجز تجريبي / 🟡 UX يعيق الاستخدام / ⚙️ تشغيلية. ممنوع ميزات عمل جديدة أو Schema/Architecture/Modules جديدة إلا بتفويض صريح.

---

## 1) صورة المشروع في جملة واحدة

```
Identity (Supabase Auth)
  → Membership (دور + حالة)
    → Tenant (حدود العزل)
      → TenantModule (تفعيل وحدة)
        → Module data (salon_* / restaurant_*)
```

كل طلب مستخدم تقريباً يمر بهذا المسار:

```
Bearer token + X-Tenant-Id
  → middleware (request-id فقط)
  → handleApi
  → withAuthenticatedDb (= requireIdentity + withIdentityRls)
  → requireTenantContext
  → requirePermission (+ خرائط صلاحيات الموديول)
  → requireEnabledModule
  → service (getDb + Zod)
  → PostgreSQL RLS
  → jsonOk / jsonError
```

---

## 2) خريطة المجلدات (فصل بفصل)

### 2.1 الجذر `/`

| ملف / مجلد | المعنى |
|------------|--------|
| `README.md` | نقطة دخول بشرية: حالة البرنامج، Quick Start، مسارات API الدنيا |
| `AGENTS.md` | دستور الوكلاء: Feature Freeze، أوامر التحقق، قيود التنفيذ |
| `ARCHITECTURE.md` | إعادة توجيه إلى `docs/architecture/ARCHITECTURE.md` |
| `mall.md` | **هذا الملف** — خريطة AI شاملة |
| `package.json` | سكربتات البناء والتحقق والاختبار |
| `.env.example` | قالب البيئة المطلوب |
| `next.config.ts` / `tsconfig.json` / `vitest.config.ts` | إعداد Next / TypeScript / Vitest |
| `src/` | كل كود التطبيق |
| `prisma/` | Schema + Migrations (وفيها RLS) |
| `supabase/` | إعداد Identity Provider المحلي |
| `scripts/` | بوابات معمارية، smoke، evidence |
| `docs/` | العقود، القفل المعماري، البوابات، الأدلة التشغيلية |
| `.github/` | CI / workflows |

### 2.2 `docs/` — طبقات الحقيقة

| مسار | السلطة | ماذا تفعل به |
|------|--------|--------------|
| `docs/PLATFORM_PRINCIPLES.md` | دستور دائم | ابدأ منه لفهم حدود Core vs Modules |
| `docs/ARCHITECTURE_LOCK.md` | قرارات مقفولة FINAL | لا تخالفها أبداً |
| `docs/contracts/` | حقيقة العمل (Business truth) | أي معنى عمل جديد يبدأ بعقد |
| `docs/architecture/` | تصميم النظام | كيف تتصل المفاهيم |
| `docs/security/RLS_STRATEGY.md` | سياسة العزل | RLS = عزل مستأجر فقط، لا أدوار عمل في SQL |
| `docs/implementation/` | ربط تقني لـ VS1 | قد يتطور؛ ليس Lock |
| `docs/mvp/MVP_DECISIONS.md` | قرارات مؤقتة للإطلاق الأول | مثل تفعيل salon تلقائياً |
| `docs/adr/` | لماذا اتُخذ قرار | ADR-002 (JWT=Identity)، ADR-003 (DDD) |
| `docs/DECISION_LOG.md` | قرارات تشغيلية OP-* | دورة حياة PROPOSED→…→CLOSED |
| `docs/RELEASE_GATES.md` | RG-001…RG-006 | تعريف VS1 Complete + Feature Freeze |
| `docs/evidence/` | إثباتات تشغيلية | Cross-tenant، BAS-001، env |
| `docs/ops/` | تشغيل إنتاج | Backup، Restore، Observability، Sign-off |
| `docs/RUNBOOK_FIRST_DEPLOYMENT.md` | أول نشر | من صفر → migrations → أول Tenant |

**قاعدة التوثيق:** ملفات Markdown جديدة فقط لـ Decision / Evidence / Policy. لا تنشئ نسخ `v2` / `final`.

### 2.3 `src/core/` — البنية التحتية للمنصة (بدون عمل تجاري)

Core يملك السباكة فقط: هوية، مستأجر، عضوية، تفعيل وحدات، RBAC منصّي، HTTP helpers.

| مجلد | ملفات مهمة | الدور |
|------|------------|-------|
| `core/http/` | `api.ts`, `request-context.ts`, `response.ts`, `request-id.ts`, `logger.ts` | غلاف الطلبات، الهوية، السياق، الأخطاء |
| `core/tenant/` | `service.ts` | `createTenant`, `listTenantsForIdentity`, `getTenantById` |
| `core/membership/` | `service.ts`, `last-owner.ts` | دعوة/أدوار/إيقاف؛ منع إزالة آخر OWNER |
| `core/rbac/` | `permissions.ts` | أدوار المنصة + `tenant:*` / `member:*` / `module:*` فقط |
| `core/module/` | `types.ts` | أنواع `ModuleDefinition` فقط — السجل خارج Core |
| `core/tenant-module/` | `service.ts` | تفعيل/قائمة الوحدات؛ لا تعطيل آخر وحدة مفعّلة |

**دوال HTTP الحرجة (`request-context.ts`):**

- `requireIdentity` — Bearer → Supabase `getUser`
- `withAuthenticatedDb` — هوية + `withIdentityRls`
- `requireTenantContext` — يقرأ `X-Tenant-Id` ويحمّل Membership نشطة
- `requirePermission` — Layer 2 (يقبل خرائط صلاحيات إضافية من الموديول)
- `requireEnabledModule` — يتحقق من `TenantModule.enabled`

**ممنوع في Core:**

- استيراد `@/modules/*`
- ذكر أسماء موديولات (`salon`, `restaurant`, …) داخل Core
- وضع صلاحيات `salon:…` داخل `CORE_ROLE_PERMISSIONS`

### 2.4 `src/infrastructure/` — قواعد البيانات والهوية

| ملف | الدور |
|-----|-------|
| `prisma.ts` | عميل Prisma على `DATABASE_URL` (`app_runtime`, NOBYPASSRLS) |
| `privileged-prisma.ts` | عميل على `DIRECT_URL` (migrations + bootstrap) |
| `db.ts` | `getDb`, `getPrivilegedDb`, `withIdentityRls` |
| `supabase/auth.ts` | عميل anon، signup/login، حل الهوية من التوكن |

**كيف يعمل `withIdentityRls`:**

1. يبدأ Transaction
2. يضبط `request.jwt.claims` و `request.jwt.claim.sub` = Identity
3. `SET LOCAL ROLE authenticated`
4. يشغّل الكود داخل AsyncLocalStorage حتى `getDb()` يعيد نفس الـ tx
5. ينظّف الـ claims ويعيد الـ ROLE

### 2.5 `src/modules/` — منطق العمل

| مسار | الحالة | المحتوى |
|------|--------|---------|
| `modules/registry.ts` | سجل التنفيذ | `MODULE_REGISTRY`, `MVP_INITIAL_MODULE_KEYS=["salon"]` |
| `modules/salon/` | مرجع كامل | services / employees / customers + permissions + module.ts |
| `modules/restaurant/` | تحقق فقط | categories فقط — **لا توسّع** |

**نمط الموديول (Salon كمثال):**

```
src/modules/salon/
  module.ts              → { moduleKey: "salon", status: "available", … }
  permissions.ts         → SALON_PERMISSIONS + SALON_ROLE_PERMISSIONS
  services/service.ts    → CRUD عبر getDb() + Zod
  employees/service.ts
  customers/service.ts
```

كل خدمة:

- تستقبل `tenantId` صراحةً
- تستخدم `getDb()` فقط
- تفلتر دائماً بـ `tenantId`
- تتحقق بـ Zod عند الإدخال

### 2.6 `src/app/` — Next.js App Router (صفحات + API)

```
src/app/
  layout.tsx, page.tsx                 → غلاف الجذر + صفحة هبوط عربية
  middleware.ts (تحت src/)             → request-id لمسارات /api فقط
  (portal)/                            → واجهة البوابة
    signup, login
    onboarding/salon, onboarding/ready
    salon/services|employees|customers
  api/
    health/
    v1/auth/signup|login
    v1/tenants[/[tenantId]/members|modules]
    v1/salon/...
    v1/restaurant/categories/...
```

**شكل Route النموذجي** (مثال `api/v1/salon/services/route.ts`):

```
handleApi → withAuthenticatedDb → requireTenantContext
  → requirePermission(..., [SALON_ROLE_PERMISSIONS])
  → requireEnabledModule(..., "salon")
  → service → jsonOk
```

### 2.7 `src/portal/` — طبقة الواجهة والجلسة

| مسار | الدور |
|------|-------|
| `api/client.ts` | يرسل Bearer + `X-Tenant-Id` ويفك `{ data }` |
| `api/types.ts` | أنواع الـ envelope و DTOs |
| `session/PortalProvider.tsx` | signup/login/createTenant/listTenants |
| `session/storage.ts` | حفظ التوكن/المستأجر في sessionStorage |
| `components/AppShell.tsx` | تنقل عربي لكيانات الصالون |
| `components/RouteGuard.tsx` | أوضاع: `public` \| `auth` \| `tenant` |
| `components/EntityList`, `EntityForm`, `FormField`, `ErrorBanner` | CRUD UI مشترك |

الصفحات في `(portal)` تستخدم `usePortal().api` وتتكلم مع `/api/v1/...` فقط.

### 2.8 `src/shared/` — مشترك عام فقط

| ملف | الدور |
|-----|-------|
| `errors.ts` | `AppError` (code, status, details) |
| `slug.ts` | اشتقاق slug للمستأجر |

لا منطق عمل هنا.

### 2.9 `prisma/` — النماذج والهجرات وRLS

**نماذج Core:** `Tenant`, `Membership`, `TenantModule`  
**نماذج Salon:** `SalonService`, `SalonEmployee`, `SalonCustomer`  
**نماذج Restaurant:** `RestaurantCategory`

قيود Schema:

- لا جدول `User`
- لا `owner_id` على Tenant (الملكية = Membership بدور OWNER)
- جداول Core لا ترتبط بجداول الموديولات بعلاقات Prisma عكسية
- كل جدول عمل يملك `tenantId`

**الهجرات:**

| Migration | الغرض |
|-----------|--------|
| `20260714120000_vs1_init` | الجداول + ENABLE RLS + سياسات العزل |
| `20260715043000_fix_membership_rls_recursion` | دوال `SECURITY DEFINER` لتفادي recursion |
| `20260715050000_op002_app_runtime_role` | دور `app_runtime` بدون BYPASSRLS |

RLS يعيش **داخل** Prisma migrations — لا ملف `rls.sql` منفصل.

### 2.10 `supabase/`

`config.toml` لمشروع محلي `Mall_Shops` (API `:54321`, DB `:54322`).  
الهوية = Supabase Auth. الـ Schema/RLS = عبر Prisma.

### 2.11 `scripts/`

| سكربت | متى تستخدمه |
|-------|-------------|
| `check-architecture.mjs` | بوابة الانحدار المعماري (Core↛Modules، تجميد Core، …) |
| `check-environment.mjs` | التحقق من البيئة (PR-01) |
| `smoke-vs1.mjs` | مسار سعيد كامل لـ Salon (التطبيق + Supabase يعملان) |
| `evidence:cross-tenant` / `evidence-cross-tenant.mjs` | إثبات عزل المستأجرين |
| `bas-001.mjs` | قبول عمل عبر Public APIs |
| `rc1-env-preflight.mjs` | فحص بيئة RC |
| `ops-staging-mailer-autoconfirm.mjs` | تشغيلية staging |

---

## 3) متغيرات البيئة

من `.env.example`:

| متغير | الاستخدام |
|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | عنوان Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح عام للمصادقة |
| `SUPABASE_SERVICE_ROLE_KEY` | ops/scripts فقط — ليس مسار الطلب العادي |
| `DATABASE_URL` | `app_runtime` — طلبات المستخدم + RLS |
| `DIRECT_URL` | postgres/migration — migrate + `createTenant` فقط |

هيدرات الطلب:

```
Authorization: Bearer <supabase-access-token>
X-Tenant-Id: <tenant-id>
```

---

## 4) أوامر التشغيل والتحقق

```bash
cp .env.example .env
npx supabase start          # انسخ URL + anon key إلى .env
npm install
npx prisma migrate deploy   # يشمل RLS
npm run dev
```

| أمر | المعنى |
|-----|--------|
| `npm run verify` | architecture + generate + typecheck + test |
| `ARCH_ALLOW_CORE_CHANGES=true npm run verify` | فقط بعد مراجعة تغييرات Core الأمنية المعتمدة |
| `npm run check:architecture` | بوابة المعمارية وحدها |
| `npm run smoke:vs1` | Smoke لمسار الصالون |
| `npm run evidence:cross-tenant` | بوابة العزل التشغيلية |
| `npm run check:env` | تحقق البيئة |

---

## 5) تدفق العمل من منظور المستخدم (Minimum Path)

1. `POST /api/v1/auth/signup` → Identity + access token  
2. `POST /api/v1/tenants` → Tenant + OWNER Membership + تفعيل `salon` (مسار privileged)  
3. `GET /api/v1/tenants/:id/modules` → علاقة التفعيل  
4. عمليات Salon: services / employees / customers  
5. اختياري للتحقق فقط: تفعيل `restaurant` ثم categories  

واجهة البوابة تعكس نفس المسار: signup → onboarding → صفحات CRUD للصالون.

---

## 6) كيف تدمج ميزة أو تعديلاً (Playbooks)

> أثناء Feature Freeze (RG-005): نفّذ هذه الخطوات **فقط** إذا كان التفويض صريحاً (حاجز تجريبي / UX معيّن / تشغيل / مهمة معيّنة).

### 6.1 قرار سريع: أين تضع التغيير؟

| نوع التغيير | المكان الصحيح | ممنوع |
|-------------|---------------|--------|
| كيان عمل جديد (خدمة، عميل، …) | Module (`src/modules/<key>/`) | Core |
| صلاحية عمل `module:entity:action` | `modules/<key>/permissions.ts` | `core/rbac` |
| عزل مستأجر / جدول DB | Prisma model + migration RLS | أدوار OWNER/ADMIN داخل SQL |
| API للمنصة (tenants/members/modules) | `src/core/*` + `app/api/v1/tenants` | داخل موديول |
| API عمل | `app/api/v1/<module>/...` يستدعي خدمات الموديول | تجاوز RBAC/RLS |
| UI | `app/(portal)/...` + `portal/components` | منطق عمل داخل المكوّن |
| تسجيل موديول جديد | `modules/registry.ts` + `module.ts` | تعديل Core لمعرفة اسم الموديول |

### 6.2 Playbook A — Endpoint جديد لكيان موجود

1. أضف/وسّع الدالة في `src/modules/<module>/<entity>/service.ts` باستخدام `getDb()` + Zod.  
2. أنشئ/حدّث `src/app/api/v1/<module>/.../route.ts` بالنمط:
   - `handleApi` → `withAuthenticatedDb` → `requireTenantContext`
   - `requirePermission` مع خريطة صلاحيات الموديول
   - `requireEnabledModule`
   - استدعاء الخدمة → `jsonOk` / `jsonError`
3. إن لزم UI: استدعِ عبر `portal/api` من الصفحة.  
4. شغّل `npm run verify` (+ `smoke:vs1` إن تغيّر السلوك).

### 6.3 Playbook B — كيان نطاق جديد داخل موديول موجود

1. **عقد أولاً** إن كان المعنى جديداً (`docs/contracts/` أو عقد الموديول).  
2. أضف Model في `prisma/schema.prisma` مع `tenantId` (بدون علاقات عكسية من Core).  
3. Migration: جدول + `ENABLE ROW LEVEL SECURITY` + سياسة عزل عضوية فقط (بدون أدوار عمل في SQL).  
4. صلاحيات في `src/modules/<module>/permissions.ts`.  
5. خدمة في `src/modules/<module>/<entity>/service.ts`.  
6. Routes تحت `src/app/api/v1/<module>/<entity>/`.  
7. صفحة portal + أنواع في `portal/api/types.ts` إن لزم.  
8. رابط تنقل في `AppShell.tsx` إن كانت شاشة رئيسية.  
9. **لا تسجّل شيئاً داخل Core.**

### 6.4 Playbook C — صفحة UI جديدة

1. `src/app/(portal)/<area>/page.tsx` مع `"use client"`.  
2. غلّف بـ `<RouteGuard mode="tenant">` (أو `auth` / `public`).  
3. استخدم `usePortal().api` فقط.  
4. أعد استخدام `EntityList` / `EntityForm` / `ErrorBanner` عند الإمكان.  
5. حدّث `TENANT_LINKS` في `AppShell` إن لزم.

### 6.5 Playbook D — موديول جديد بالكامل (بعد رفع التجميد / RG-006+)

1. عقد الموديول تحت `docs/contracts/modules/<name>/`.  
2. `src/modules/<name>/module.ts` + `permissions.ts` + خدمات الكيانات.  
3. تسجيل في `MODULE_REGISTRY` داخل `src/modules/registry.ts`.  
4. Models + RLS migrations.  
5. API تحت `/api/v1/<name>/...`.  
6. UI portal اختياري.  
7. تأكد أن Core ما زال لا يعرف اسم الموديول.  
8. Evidence / Gates حسب المرحلة.

### 6.6 Playbook E — تعديل Core (نادر وحساس)

مسموح فقط لـ: Bug / Performance / Security / Architectural Defect — وغالباً بعد Architecture Review.

1. تأكد أن الحل لا يمكن وضعه في Module.  
2. لا تستورد Modules ولا تضف صلاحيات عمل للمنصة.  
3. لا توسّع استخدام `getPrivilegedDb()` خارج bootstrap.  
4. عند التحقق: `ARCH_ALLOW_CORE_CHANGES=true npm run verify` فقط بعد المراجعة.  
5. بوابة المعمارية تفشل مغلقة إذا غاب Git/`origin/main` إلا بإعفاء صريح `ARCH_SKIP_CORE_FREEZE=true`.

### 6.7 Playbook F — تغيير صلاحية / دور

- صلاحيات المنصة (`tenant:*`, `member:*`, `module:*`) → `src/core/rbac/permissions.ts`
- صلاحيات عمل → ملف permissions داخل الموديول
- لا وراثة ضمنية للأدوار (Lock)
- لا تضع فحص الدور داخل سياسات RLS

### 6.8 Playbook G — تغيير Schema / RLS

1. عدّل `schema.prisma`.  
2. أنشئ migration عبر Prisma.  
3. أضف/حدّث سياسات RLS داخل نفس migration.  
4. السياسة تفحص عضوية نشطة / عزل `tenant_id` فقط.  
5. اختبر بـ `evidence:cross-tenant` عند لمس العزل.

---

## 7) نمط كود مرجعي (انسخه ذهنياً)

### خدمة موديول

```ts
// src/modules/salon/<entity>/service.ts
import { z } from "zod";
import { getDb } from "@/infrastructure/db";

export const createXInputSchema = z.object({ /* ... */ });

export async function listX(tenantId: string) {
  return getDb().x.findMany({ where: { tenantId, active: true } });
}

export async function createX(tenantId: string, input: CreateXInput) {
  return getDb().x.create({ data: { tenantId, ...input, active: true } });
}
```

### Route API

```ts
return handleApi(req, async () => {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      requirePermission(ctx, MODULE_PERMISSIONS.xWrite, [MODULE_ROLE_PERMISSIONS]);
      await requireEnabledModule(ctx.tenant.tenantId, MODULE.moduleKey);
      const body = createXInputSchema.parse(await req.json());
      return jsonOk(await createX(ctx.tenant.tenantId, body), 201);
    });
  } catch (error) {
    return jsonError(error);
  }
});
```

### Envelope الاستجابة

- نجاح: `{ data, meta: { requestId } }`
- فشل: `{ error: { code, message, details? }, meta: { requestId } }`

---

## 8) نموذج التفويض (احفظه)

| الطبقة | المسؤولية | أين | ممنوع أن تفعل |
|--------|-----------|-----|----------------|
| Layer 1 RLS | عزل بيانات المستأجر | سياسات في Prisma migrations | ترميز OWNER/ADMIN/… |
| Layer 2 RBAC | هل يجوز تنفيذ العملية؟ | `requirePermission` + خرائط Core/Module | الاعتماد على العميل وحده |
| Membership | ربط Identity↔Tenant + Role | جدول `membership` | تجاهل آخر OWNER |
| TenantModule | هل الوحدة مفعّلة؟ | `requireEnabledModule` | تشغيل منطق وحدة غير مفعّلة |

**Invariant آخر OWNER:** لا تُسقط/توقف/تلغِ آخر OWNER نشط لمستأجر.

---

## 9) محظورات صارمة (Checklist قبل أي PR)

- [ ] لم أعد تصميم المعمارية ولم أضف BusinessUnit / User table / `owner_id`
- [ ] JWT ما زال Identity فقط؛ Tenant من الهيدر
- [ ] طبقتا التفويض موجودتان (RLS + RBAC)
- [ ] المسار العادي يستخدم `withIdentityRls`/`getDb` فقط
- [ ] Core لا يستورد ولا يسمّي Modules
- [ ] صلاحيات العمل داخل الموديول
- [ ] جداول العمل تحمل `tenantId` وRLS يعزلها
- [ ] Restaurant لم يُوسَّع كمنتج
- [ ] لم أفتح Scope جديداً خارج Gate/OP/مهمة صريحة
- [ ] أثناء RG-005: التغيير ضمن المسموح (Blocker/UX/Ops) فقط
- [ ] `npm run verify` ناجح

---

## 10) أين تبحث عند مهمة معيّنة؟

| تريد… | ابدأ من… |
|-------|----------|
| فهم القفل المعماري | `docs/ARCHITECTURE_LOCK.md` + `docs/PLATFORM_PRINCIPLES.md` |
| قاعدة عمل (Membership, Tenant, …) | `docs/contracts/*.md` |
| كيف يُبنى الطلب | `src/core/http/request-context.ts` + أي `route.ts` في salon |
| كيف تُعزل البيانات | `src/infrastructure/db.ts` + migrations تحت `prisma/migrations` |
| إضافة كيان صالون | انسخ نمط `src/modules/salon/services/` + routes الموازية |
| واجهة مستخدم | `src/portal/` + صفحات `(portal)` |
| حالة البرنامج / هل يُسمح بالعمل؟ | `docs/RELEASE_GATES.md` + `docs/DECISION_LOG.md` + `AGENTS.md` |
| إثبات عزل | `npm run evidence:cross-tenant` + `docs/evidence/CROSS_TENANT.md` |
| أول نشر | `docs/RUNBOOK_FIRST_DEPLOYMENT.md` |

---

## 11) ملخص ذهني نهائي للـ AI

1. فكّر دائماً: **هل هذا Core أم Module؟** العمل التجاري → Module. السباكة → Core.  
2. انسخ نمط Salon حرفياً للكود الجديد داخل الموديولات.  
3. لا تختصر الأمن: كل طلب مستخدم = هوية + RLS + Membership + Permission + Module enabled.  
4. الوثائق الحاكمة أقوى من الكود عند التعارض — أصلح الكود أو افتح قراراً صريحاً.  
5. لا تتقدم في خارطة الطريق من تلقاء نفسك؛ نفّذ فقط ما يفتحه Gate أو Decision أو تكليف صريح.

---

## 12) فهرس سريع للمسارات الحرجة

```
src/core/http/request-context.ts     # بوابة الطلبات
src/infrastructure/db.ts             # RLS context
src/core/tenant/service.ts           # createTenant (privileged)
src/core/rbac/permissions.ts         # صلاحيات المنصة فقط
src/modules/registry.ts              # سجل الموديولات
src/modules/salon/**                 # المرجع الكامل للعمل
src/app/api/v1/**                    # HTTP surface
src/portal/**                        # UI + session
prisma/schema.prisma                 # النماذج
prisma/migrations/**                 # Schema + RLS
docs/ARCHITECTURE_LOCK.md            # القفل
docs/contracts/INDEX.md              # العقود
docs/RELEASE_GATES.md                # هل يُسمح بالبناء الآن؟
AGENTS.md                            # قواعد الوكيل
```

— نهاية `mall.md` —
