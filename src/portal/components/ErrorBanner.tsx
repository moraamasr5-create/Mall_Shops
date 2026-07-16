"use client";

import { PortalApiError } from "@/portal/api/types";

// يعرض رسالة الخطأ من الـ API مع requestId إن وُجد — مصدرها PortalApiError من api/client.
export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;

  if (error instanceof PortalApiError) {
    return (
      <div className="portal-error" role="alert">
        <div>{error.message}</div>
        <div>
          <code>
            {error.code}
            {error.requestId ? ` · requestId ${error.requestId}` : ""}
          </code>
        </div>
      </div>
    );
  }

  const message = error instanceof Error ? error.message : "حدث خطأ ما";
  return (
    <div className="portal-error" role="alert">
      {message}
    </div>
  );
}
