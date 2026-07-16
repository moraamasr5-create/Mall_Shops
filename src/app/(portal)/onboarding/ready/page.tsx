"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { TenantModuleRow } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

// يتحقق أن موديول salon مفعّل بعد Create Tenant (Business Flow → Ready).
// المصدر: GET /api/v1/tenants/{tenantId}/modules عبر PortalProvider.api
function SalonReady() {
  const { api, tenantId } = usePortal();
  const [modules, setModules] = useState<TenantModuleRow[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const verifyModules = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    setModules(null);
    try {
      // يتطلب Authorization + X-Tenant-Id من createApiClient (PortalProvider)
      const rows = await api.get<TenantModuleRow[]>(
        `/api/v1/tenants/${tenantId}/modules`
      );
      setModules(rows);
    } catch (err) {
      setModules(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api, tenantId]);

  useEffect(() => {
    void verifyModules();
  }, [verifyModules]);

  const salonEnabled = Boolean(
    modules?.some((m) => m.moduleKey === "salon" && m.enabled)
  );

  return (
    <div className="portal-card">
      {loading ? (
        <>
          <h1>التحقق من وحدة الصالون</h1>
          <p className="lead">جاري التحقق من الوحدات المفعّلة لمساحة عملك…</p>
        </>
      ) : null}

      <ErrorBanner error={error} />

      {error ? (
        <>
          <p className="lead">
            تعذّر التحقق من وحدة الصالون. يمكنك إعادة المحاولة الآن.
          </p>
          <div className="portal-actions">
            <Button type="button" onClick={() => void verifyModules()} disabled={loading}>
              إعادة المحاولة
            </Button>
          </div>
        </>
      ) : null}

      {!loading && modules && salonEnabled ? (
        <>
          <h1>صالونك جاهز</h1>
          <p className="lead">وحدة الصالون مفعّلة لمساحة عملك. يمكنك البدء بالإدارة.</p>
          <p>
            وحدة الصالون: <strong>مفعّلة</strong>
          </p>
          <div className="portal-actions">
            <Link className="portal-btn" href="/salon/services">
              إدارة الخدمات
            </Link>
          </div>
        </>
      ) : null}

      {!loading && modules && !salonEnabled ? (
        <>
          <h1>الصالون غير جاهز</h1>
          <p className="lead">
            لم نجد وحدة الصالون مفعّلة لهذا الحساب. لا يمكن المتابعة إلى الإدارة.
          </p>
          <p>
            وحدة الصالون: <strong>غير مفعّلة</strong>
          </p>
          <div className="portal-actions">
            <Button type="button" onClick={() => void verifyModules()} disabled={loading}>
              إعادة التحقق
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// RouteGuard (tenant): يمنع الدخول بدون جلسة وبدون tenantId من Session.
export default function OnboardingReadyPage() {
  return (
    <RouteGuard mode="tenant">
      <SalonReady />
    </RouteGuard>
  );
}
