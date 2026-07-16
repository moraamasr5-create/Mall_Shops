"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/portal/session/PortalProvider";

export type GuardMode = "public" | "auth" | "tenant";

// RouteGuard يمنع دخول صفحات الصالون قبل اكتمال الجلسة (PortalProvider.sessionReady).
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

  // انتظار قراءة Session من التخزين فقط
  if (!ready) {
    return (
      <div className="portal-main">
        <p className="lead">جاري تجهيز الصفحة…</p>
      </div>
    );
  }

  // صفحات عامة (Login/Signup): أبقِ النموذج ظاهرًا حتى لو كانت الجلسة تُزامَن،
  // حتى لا يظن المستخدم أن النظام علّق عند فشل الإرسال.
  if (mode === "public") {
    if (isAuthenticated && !sessionReady) {
      return (
        <div className="portal-main">
          <p className="lead">جاري التحقق من حسابك…</p>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (!sessionReady) {
    return (
      <div className="portal-main">
        <p className="lead">جاري التحقق من الجلسة…</p>
      </div>
    );
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
