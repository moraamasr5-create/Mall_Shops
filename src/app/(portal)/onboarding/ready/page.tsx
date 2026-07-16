"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { TenantModuleRow } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

function SalonReady() {
  const { api, tenantId } = usePortal();
  const [modules, setModules] = useState<TenantModuleRow[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.get<TenantModuleRow[]>(
          `/api/v1/tenants/${tenantId}/modules`
        );
        if (!cancelled) setModules(rows);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, tenantId]);

  const salon = modules?.find((m) => m.moduleKey === "salon" && m.enabled);

  return (
    <div className="portal-card">
      <h1>صالونك جاهز</h1>
      <p className="lead">تحققنا من أن وحدة الصالون مفعّلة لمساحة عملك.</p>
      <ErrorBanner error={error} />
      {!modules && !error ? <p className="lead">جاري التحقق من الوحدات…</p> : null}
      {modules && (
        <p>
          وحدة الصالون:{" "}
          <strong>{salon ? "مفعّلة" : "غير مفعّلة"}</strong>
        </p>
      )}
      {salon ? (
        <div className="portal-actions">
          <Link className="portal-btn" href="/salon/services">
            إدارة الخدمات
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function OnboardingReadyPage() {
  return (
    <RouteGuard mode="tenant">
      <SalonReady />
    </RouteGuard>
  );
}
