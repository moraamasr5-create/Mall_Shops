"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/portal/session/PortalProvider";

export type GuardMode = "public" | "auth" | "tenant";

/**
 * Central route protection for Owner Portal pages.
 * - public: signup/login (redirect away if already has tenant)
 * - auth: requires accessToken
 * - tenant: requires accessToken + tenantId
 */
export function RouteGuard({
  mode,
  children,
}: {
  mode: GuardMode;
  children: ReactNode;
}) {
  const { ready, isAuthenticated, tenantId } = usePortal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

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
  }, [ready, mode, isAuthenticated, tenantId, router, pathname]);

  if (!ready) {
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
