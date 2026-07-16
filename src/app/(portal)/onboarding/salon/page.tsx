"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormActions, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import { usePortal } from "@/portal/session/PortalProvider";

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
      await createTenant(name.trim());
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: استوديو لينا للتجميل"
          />
        </FormField>
        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري الإنشاء…" : "إنشاء الصالون"}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}

export default function OnboardingSalonPage() {
  return (
    <RouteGuard mode="auth">
      <CreateSalonForm />
    </RouteGuard>
  );
}
