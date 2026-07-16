"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/portal/session/PortalProvider";

export type GuardMode = "public" | "auth" | "tenant";

/**
 * Central route protection for Owner Portal pages.
 * Waits for sessionReady so Refresh never flashes /onboarding before membership sync.
 */
export function RouteGuard({
  mode,
  children,
}: {
  mode: GuardMode;
  children: ReactNode;
}) {
  const { ready, sessionReady, isAuthenticated, tenantId } = usePortal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || !sessionReady) return;

    if (mode === "public") {
      if (isAuthenticated && tenantId) {
        router.replace("/salon/services");
      } else if (isAuthenticated) {
        router.replace("/onboarding/salon");
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (mode === "tenant" && !tenantId) {
      router.replace("/onboarding/salon");
    }
  }, [ready, sessionReady, mode, isAuthenticated, tenantId, router, pathname]);

  if (!ready || !sessionReady) {
    return (
      <div className="portal-main">
        <p className="lead">جاري التحميل…</p>
      </div>
    );
  }

  if (mode === "public") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="portal-main">
        <p className="lead">جاري التوجيه لتسجيل الدخول…</p>
      </div>
    );
  }

  if (mode === "tenant" && !tenantId) {
    return (
      <div className="portal-main">
        <p className="lead">جاري التوجيه لإعداد الصالون…</p>
      </div>
    );
  }

  return <>{children}</>;
}
