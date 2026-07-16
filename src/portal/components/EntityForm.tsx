"use client";

import type { FormEvent, ReactNode } from "react";
import { Button, FormActions } from "@/portal/components/FormField";
import { ErrorBanner } from "@/portal/components/ErrorBanner";

// غلاف نماذج الإنشاء/التعديل لشاشات الصالون — الأخطاء من API عبر ErrorBanner.
export function EntityForm({
  title,
  description,
  error,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  children,
}: {
  title: string;
  description?: string;
  error: unknown;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  children: ReactNode;
}) {
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <div className="portal-card">
      <h1>{title}</h1>
      {description ? <p className="lead">{description}</p> : null}
      <form className="portal-stack" onSubmit={handleSubmit}>
        <ErrorBanner error={error} />
        <fieldset disabled={submitting} style={{ border: 0, margin: 0, padding: 0 }}>
          {children}
        </fieldset>
        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري الحفظ…" : submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
              إلغاء
            </Button>
          ) : null}
        </FormActions>
      </form>
    </div>
  );
}
