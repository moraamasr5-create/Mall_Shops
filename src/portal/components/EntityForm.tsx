"use client";

import type { FormEvent, ReactNode } from "react";
import { Button, FormActions } from "@/portal/components/FormField";
import { ErrorBanner } from "@/portal/components/ErrorBanner";

/**
 * Shared create/edit form shell for Services / Employees / Customers.
 */
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
        {children}
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
