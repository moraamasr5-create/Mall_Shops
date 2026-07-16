"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormActions, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import { usePortal } from "@/portal/session/PortalProvider";

// يستدعي Login عبر PortalProvider (POST /api/v1/auth/login) ثم يوجّه حسب وجود Tenant.
function LoginForm() {
  const { login } = usePortal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // رسالة الخطأ القادمة من الـ API (مع requestId عبر ErrorBanner)
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { tenants } = await login(email.trim(), password);
      if (tenants.length === 0) {
        router.replace("/onboarding/salon");
        return;
      }
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/salon/services");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-card">
      <h1>تسجيل الدخول</h1>
      <p className="lead">ادخل إلى صالونك بالبريد الإلكتروني وكلمة المرور اللذين استخدمتهما عند التسجيل.</p>
      <form className="portal-stack" onSubmit={onSubmit}>
        <ErrorBanner error={error} />
        <FormField label="البريد الإلكتروني">
          <TextInput
            type="email"
            autoComplete="email"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="كلمة المرور">
          <TextInput
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري تسجيل الدخول…" : "تسجيل الدخول"}
          </Button>
        </FormActions>
      </form>
      <p className="lead" style={{ marginTop: "1rem", marginBottom: 0 }}>
        مالك جديد؟ <Link href="/signup">إنشاء حساب</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RouteGuard mode="public">
      <Suspense fallback={<p className="lead">جاري تجهيز الصفحة…</p>}>
        <LoginForm />
      </Suspense>
    </RouteGuard>
  );
}
