"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { usePortal } from "@/portal/session/PortalProvider";

const TENANT_LINKS = [
  { href: "/salon/services", label: "الخدمات" },
  { href: "/salon/employees", label: "الموظفون" },
  { href: "/salon/customers", label: "العملاء" },
];

// هيكل بوابة المالك: تنقل حسب الجلسة (PortalProvider) بعد جاهزية Session.
export function AppShell({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated, tenantId, logout } = usePortal();
  const pathname = usePathname();
  const router = useRouter();

  // يخرج من الجلسة (Session) ويعيد توجيهًا إلى /login.
  function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link href="/" className="portal-brand">
          مول شوبس — المالك
        </Link>
        <nav className="portal-nav" aria-label="بوابة المالك">
          {/* ننتظر Session hydrate حتى لا يختلف HTML بين الخادم والمتصفح */}
          {!ready ? null : !isAuthenticated ? (
            <>
              <Link href="/signup" data-active={pathname === "/signup"}>
                إنشاء حساب
              </Link>
              <Link href="/login" data-active={pathname === "/login"}>
                تسجيل الدخول
              </Link>
            </>
          ) : !tenantId ? (
            <>
              <Link href="/onboarding/salon" data-active={pathname?.startsWith("/onboarding")}>
                إنشاء صالون
              </Link>
              <button type="button" className="portal-btn secondary" onClick={onLogout}>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              {TENANT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={pathname === link.href || pathname?.startsWith(link.href + "/")}
                >
                  {link.label}
                </Link>
              ))}
              <button type="button" className="portal-btn secondary" onClick={onLogout}>
                تسجيل الخروج
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
