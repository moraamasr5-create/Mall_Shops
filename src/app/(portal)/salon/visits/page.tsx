"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type {
  SalonCustomer,
  SalonEmployee,
  SalonService,
  SalonVisit,
} from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

function statusLabel(status: SalonVisit["status"]) {
  if (status === "open") return "مفتوحة";
  if (status === "closed") return "مغلقة";
  return "ملغاة";
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

// حلقة التشغيل اليومية (OP-005): فتح زيارة → خدمات → إغلاق — بلا مواعيد/فواتير.
function VisitsPage() {
  const { api } = usePortal();
  const [visits, setVisits] = useState<SalonVisit[]>([]);
  const [customers, setCustomers] = useState<SalonCustomer[]>([]);
  const [employees, setEmployees] = useState<SalonEmployee[]>([]);
  const [services, setServices] = useState<SalonService[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [listLoading, setListLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "open" | "edit">("list");
  const [editing, setEditing] = useState<SalonVisit | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [customerMode, setCustomerMode] = useState<"existing" | "walkin">("existing");
  const [customerId, setCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("زائر");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"open" | "all">("open");

  const loadLookups = useCallback(async () => {
    const [c, e, s] = await Promise.all([
      api.get<SalonCustomer[]>("/api/v1/salon/customers"),
      api.get<SalonEmployee[]>("/api/v1/salon/employees"),
      api.get<SalonService[]>("/api/v1/salon/services"),
    ]);
    setCustomers(c);
    setEmployees(e);
    setServices(s);
  }, [api]);

  const loadVisits = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const qs = statusFilter === "open" ? "?status=open" : "";
      setVisits(await api.get<SalonVisit[]>(`/api/v1/salon/visits${qs}`));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setListLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => {
    void loadLookups().catch(() => {});
  }, [loadLookups]);

  useEffect(() => {
    void loadVisits().catch(() => {});
  }, [loadVisits]);

  const customerNameById = useMemo(() => {
    const map = new Map(customers.map((c) => [c.id, c.name]));
    return map;
  }, [customers]);

  const employeeNameById = useMemo(() => {
    const map = new Map(employees.map((e) => [e.id, e.name]));
    return map;
  }, [employees]);

  function startOpen() {
    setEditing(null);
    setCustomerMode(customers.length > 0 ? "existing" : "walkin");
    setCustomerId(customers[0]?.id ?? "");
    setWalkInName("زائر");
    setEmployeeId(employees[0]?.id ?? "");
    setSelectedServiceIds(services[0] ? [services[0].id] : []);
    setMode("open");
    setError(null);
  }

  function startEdit(visit: SalonVisit) {
    if (visit.status !== "open") return;
    setEditing(visit);
    setEmployeeId(visit.employeeId ?? "");
    setSelectedServiceIds(visit.services.map((s) => s.serviceId));
    setMode("edit");
    setError(null);
  }

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function submitOpen() {
    setError(null);
    setSubmitting(true);
    try {
      if (customerMode === "existing" && !customerId) {
        throw new Error("اختر عميلًا أو استخدم زائرًا.");
      }
      const body =
        customerMode === "walkin"
          ? {
              walkInCustomer: { name: walkInName.trim() || "زائر" },
              employeeId: employeeId || undefined,
              serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
            }
          : {
              customerId,
              employeeId: employeeId || undefined,
              serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
            };
      await api.post("/api/v1/salon/visits", body);
      await loadLookups();
      await loadVisits();
      setMode("list");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitUpdate() {
    if (!editing) return;
    setError(null);
    if (selectedServiceIds.length < 1) {
      setError(new Error("الزيارة المفتوحة تحتاج خدمة واحدة على الأقل قبل الحفظ."));
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/salon/visits/${editing.id}`, {
        employeeId: employeeId || null,
        serviceIds: selectedServiceIds,
      });
      await loadVisits();
      setMode("list");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function closeVisit(visit: SalonVisit) {
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/api/v1/salon/visits/${visit.id}/close`, {});
      await loadVisits();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelVisit(visit: SalonVisit) {
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/api/v1/salon/visits/${visit.id}/cancel`, {});
      await loadVisits();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "open" || mode === "edit") {
    return (
      <div className="portal-card">
        <h1>{mode === "open" ? "فتح زيارة" : "تعديل زيارة مفتوحة"}</h1>
        <p className="lead">وحدة عمل يومية — ليست حجزًا ولا فاتورة.</p>
        <ErrorBanner error={error} />
        <div className="portal-stack">
          {mode === "open" ? (
            <>
              <FormField label="العميل">
                <select
                  className="portal-input"
                  value={customerMode}
                  disabled={submitting}
                  onChange={(e) => setCustomerMode(e.target.value as "existing" | "walkin")}
                >
                  <option value="existing">عميل موجود</option>
                  <option value="walkin">زائر جديد (يُنشأ كعميل)</option>
                </select>
              </FormField>
              {customerMode === "existing" ? (
                <FormField label="اختر العميل">
                  <select
                    className="portal-input"
                    value={customerId}
                    disabled={submitting || customers.length === 0}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    {customers.length === 0 ? (
                      <option value="">لا يوجد عملاء — استخدم زائرًا</option>
                    ) : (
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </FormField>
              ) : (
                <FormField label="اسم الزائر">
                  <TextInput
                    value={walkInName}
                    disabled={submitting}
                    onChange={(e) => setWalkInName(e.target.value)}
                  />
                </FormField>
              )}
            </>
          ) : null}

          <FormField label="الموظف (اختياري عند الفتح — مطلوب عند الإغلاق)">
            <select
              className="portal-input"
              value={employeeId}
              disabled={submitting}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">— بدون موظف بعد —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="الخدمات">
            <div className="portal-stack">
              {services.length === 0 ? (
                <p>لا توجد خدمات. أضف خدمة من شاشة الخدمات أولًا.</p>
              ) : (
                services.map((s) => (
                  <label key={s.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(s.id)}
                      disabled={submitting}
                      onChange={() => toggleService(s.id)}
                    />
                    <span>
                      {s.name} — {formatMoney(s.priceCents, s.currency)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </FormField>

          <div className="portal-actions">
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void (mode === "open" ? submitOpen() : submitUpdate())}
            >
              {submitting ? "جاري الحفظ…" : mode === "open" ? "فتح الزيارة" : "حفظ التعديل"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setMode("list");
                setError(null);
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorBanner error={error} />
      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between" }}>
          <div>
            <h1>الزيارات</h1>
            <p className="lead">تشغيل يوم العمل: افتح زيارة، أضف خدمات، ثم أغلق.</p>
          </div>
          <Button type="button" onClick={startOpen} disabled={submitting}>
            فتح زيارة
          </Button>
        </div>

        <FormField label="عرض">
          <select
            className="portal-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "open" | "all")}
          >
            <option value="open">المفتوحة فقط</option>
            <option value="all">الكل</option>
          </select>
        </FormField>

        {listLoading ? (
          <p>جاري التحميل…</p>
        ) : visits.length === 0 ? (
          <p>لا توجد زيارات بهذا العرض. افتح أول زيارة.</p>
        ) : (
          <ul className="portal-stack" style={{ listStyle: "none", padding: 0 }}>
            {visits.map((v) => (
              <li key={v.id} className="portal-card" style={{ margin: 0 }}>
                <strong>
                  {customerNameById.get(v.customerId) ?? "عميل"} — {statusLabel(v.status)}
                </strong>
                <div>
                  الموظف: {v.employeeId ? employeeNameById.get(v.employeeId) ?? "—" : "—"}
                </div>
                <div>
                  الخدمات:{" "}
                  {v.services.length === 0
                    ? "لا خدمات بعد"
                    : v.services.map((s) => s.name).join("، ")}
                </div>
                {v.status === "open" ? (
                  <div className="portal-actions" style={{ marginTop: "0.75rem" }}>
                    <Button type="button" disabled={submitting} onClick={() => startEdit(v)}>
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={() => void closeVisit(v)}
                    >
                      إغلاق الزيارة
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={submitting}
                      onClick={() => void cancelVisit(v)}
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <RouteGuard mode="tenant">
      <VisitsPage />
    </RouteGuard>
  );
}
