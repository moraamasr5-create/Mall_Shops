"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormActions, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import { usePortal } from "@/portal/session/PortalProvider";

// يبدأ Business Flow: Signup → Create Tenant → Salon Ready → Management
// المصدر: POST /api/v1/auth/signup عبر PortalProvider
function SignupForm() {
  const { signup } = usePortal();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(new Error("كلمتا المرور غير متطابقتين"));
      return;
    }
    setSubmitting(true);
    try {
      const { tenants } = await signup(email.trim(), password);
      if (tenants.length === 0) {
        router.replace("/onboarding/salon");
        return;
      }
      router.replace("/salon/services");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-card">
      <h1>إنشاء حسابك</h1>
      <p className="lead">سجّل كمالك صالون. لا حاجة لأدوات المطورين.</p>
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
        <FormField label="كلمة المرور" hint="ثمانية أحرف على الأقل">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField label="تأكيد كلمة المرور">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={submitting}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>
        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
          </Button>
        </FormActions>
      </form>
      <p className="lead" style={{ marginTop: "1rem", marginBottom: 0 }}>
        لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <RouteGuard mode="public">
      <SignupForm />
    </RouteGuard>
  );
}
