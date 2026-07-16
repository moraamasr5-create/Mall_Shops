"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormActions, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import { usePortal } from "@/portal/session/PortalProvider";
import { slugify } from "@/shared/slug";

// إن فشل اشتقاق slug من الاسم (مثل الاسم العربي)، نولّد slug لاتيني للـ API فقط.
// المصدر: POST /api/v1/tenants يقبل slug اختياريًا — بدون تغيير Backend.
function slugForTenantCreate(name: string): string | undefined {
  const fromName = slugify(name);
  if (fromName.length >= 2) return undefined;
  return `salon-${Date.now().toString(36)}`;
}

// يبدأ مرحلة إنشاء الصالون بعد Signup/Login إن لم يوجد Tenant.
// مرتبط بـ POST /api/v1/tenants ثم التوجيه إلى /onboarding/ready.
function CreateSalonForm() {
  const { createTenant } = usePortal();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trimmed = name.trim();
      await createTenant(trimmed, slugForTenantCreate(trimmed));
      router.replace("/onboarding/ready");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-card">
      <h1>إنشاء صالونك</h1>
      <p className="lead">هذا ينشئ مساحة عملك ويفعّل وحدة الصالون تلقائياً.</p>
      <form className="portal-stack" onSubmit={onSubmit}>
        <ErrorBanner error={error} />
        <FormField label="اسم الصالون">
          <TextInput
            required
            minLength={2}
            maxLength={120}
            disabled={submitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: استوديو لينا للتجميل"
          />
        </FormField>
        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري إنشاء الصالون…" : "إنشاء الصالون"}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}

// RouteGuard (auth): يسمح بإنشاء الصالون بعد تسجيل الدخول وقبل وجود Tenant.
export default function OnboardingSalonPage() {
  return (
    <RouteGuard mode="auth">
      <CreateSalonForm />
    </RouteGuard>
  );
}
