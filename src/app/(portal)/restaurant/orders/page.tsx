"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { RestaurantMenuItem, RestaurantOrder } from "@/portal/api/types";
import { PortalApiError } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

/** A7: day center = Orders — §4 screens only; not Dashboard / Admin / dual-app. */

function dayWindowIso() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return {
    openedFrom: start.toISOString(),
    openedTo: end.toISOString(),
  };
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    created: "جديد",
    confirmed: "مؤكد",
    preparing: "تحضير",
    ready: "جاهز",
    completed: "مكتمل",
    cancelled: "ملغى",
  };
  return map[status] ?? status;
}

function nextAction(status: string): { action: string; label: string } | null {
  if (status === "created") return { action: "confirm", label: "تأكيد" };
  if (status === "confirmed") return { action: "start_preparing", label: "بدء التحضير" };
  if (status === "preparing") return { action: "mark_ready", label: "جاهز" };
  if (status === "ready") return { action: "complete", label: "إكمال (قبول الدفع)" };
  return null;
}

function OrdersPage() {
  const { api, tenantId } = usePortal();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [moduleMissing, setModuleMissing] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"list" | "create">("list");

  const [fulfillmentMode, setFulfillmentMode] = useState<"dine_in" | "pickup" | "delivery">(
    "dine_in",
  );
  const [guestName, setGuestName] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [quickItemName, setQuickItemName] = useState("صنف سريع");

  const availableItems = useMemo(
    () => menuItems.filter((i) => i.available && !i.retired),
    [menuItems],
  );

  const loadOrders = useCallback(async () => {
    setListLoading(true);
    setError(null);
    setModuleMissing(false);
    try {
      const { openedFrom, openedTo } = dayWindowIso();
      const qs = new URLSearchParams({ openedFrom, openedTo });
      setOrders(
        await api.get<RestaurantOrder[]>(`/api/v1/restaurant/orders?${qs}`),
      );
    } catch (err) {
      if (err instanceof PortalApiError && err.code === "MODULE_NOT_ENABLED") {
        setModuleMissing(true);
        setOrders([]);
      } else {
        setError(err);
        throw err;
      }
    } finally {
      setListLoading(false);
    }
  }, [api]);

  const loadMenu = useCallback(async () => {
    try {
      const items = await api.get<RestaurantMenuItem[]>("/api/v1/restaurant/menu-items");
      setMenuItems(items);
      if (items[0] && !menuItemId) setMenuItemId(items[0].id);
    } catch (err) {
      if (!(err instanceof PortalApiError && err.code === "MODULE_NOT_ENABLED")) {
        setError(err);
      }
    }
  }, [api, menuItemId]);

  useEffect(() => {
    void loadOrders().catch(() => {});
    void loadMenu().catch(() => {});
  }, [loadOrders, loadMenu]);

  async function enableRestaurant() {
    if (!tenantId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/v1/tenants/${tenantId}/modules`, {
        moduleKey: "restaurant",
      });
      setModuleMissing(false);
      await loadOrders();
      await loadMenu();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function quickSetupItem() {
    setSubmitting(true);
    setError(null);
    try {
      const cat = await api.post<{ id: string }>("/api/v1/restaurant/categories", {
        name: "قائمة اليوم",
      });
      const item = await api.post<RestaurantMenuItem>("/api/v1/restaurant/menu-items", {
        categoryId: cat.id,
        name: quickItemName.trim() || "صنف سريع",
        priceCents: 1000,
        currency: "SAR",
      });
      setMenuItems((prev) => [...prev, item]);
      setMenuItemId(item.id);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function createOrder() {
    if (!menuItemId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/v1/restaurant/orders", {
        fulfillmentMode,
        guestName: guestName.trim() || undefined,
        lines: [{ menuItemId, quantity: 1 }],
      });
      setMode("list");
      setGuestName("");
      await loadOrders();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function advance(order: RestaurantOrder) {
    const next = nextAction(order.status);
    if (!next) return;
    setSubmitting(true);
    setError(null);
    try {
      const body =
        next.action === "complete"
          ? { action: "complete", paymentAccepted: true, paymentMethod: "cash" }
          : { action: next.action };
      await api.post(`/api/v1/restaurant/orders/${order.id}`, body);
      await loadOrders();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (moduleMissing) {
    return (
      <div className="portal-card" data-a7-surface="restaurant-orders">
        <h1>طلبات المطعم</h1>
        <p className="lead">موديول المطعم غير مفعّل لهذا المستأجر.</p>
        <ErrorBanner error={error} />
        <div className="portal-actions">
          <Button type="button" disabled={submitting} onClick={() => void enableRestaurant()}>
            تفعيل موديول المطعم
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="portal-card" data-a7-surface="restaurant-orders">
        <h1>طلب جديد</h1>
        <p className="lead">مسار Thesis §4 — إنشاء Order فقط.</p>
        <ErrorBanner error={error} />
        {availableItems.length === 0 ? (
          <div className="portal-stack">
            <p className="lead">لا توجد أصناف. إعداد سريع لصنف واحد (ليس لوحة إدارة قائمة).</p>
            <FormField label="اسم الصنف">
              <TextInput
                value={quickItemName}
                onChange={(e) => setQuickItemName(e.target.value)}
              />
            </FormField>
            <div className="portal-actions">
              <Button type="button" disabled={submitting} onClick={() => void quickSetupItem()}>
                إنشاء صنف
              </Button>
              <Button type="button" variant="secondary" onClick={() => setMode("list")}>
                رجوع
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="portal-stack"
            onSubmit={(e) => {
              e.preventDefault();
              void createOrder();
            }}
          >
            <FormField label="وضع التنفيذ">
              <select
                className="portal-input"
                value={fulfillmentMode}
                onChange={(e) =>
                  setFulfillmentMode(e.target.value as "dine_in" | "pickup" | "delivery")
                }
              >
                <option value="dine_in">صالة</option>
                <option value="pickup">استلام</option>
                <option value="delivery">توصيل</option>
              </select>
            </FormField>
            <FormField label="الضيف (اختياري)">
              <TextInput value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </FormField>
            <FormField label="الصنف">
              <select
                className="portal-input"
                value={menuItemId}
                onChange={(e) => setMenuItemId(e.target.value)}
                required
              >
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="portal-actions">
              <Button type="submit" disabled={submitting || !menuItemId}>
                إنشاء الطلب
              </Button>
              <Button type="button" variant="secondary" onClick={() => setMode("list")}>
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="portal-card" data-a7-surface="restaurant-orders">
      <div className="portal-actions" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0 }}>طلبات المطعم</h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            مركز اليوم — قائمة حسب وقت اليوم · بلا Shift
          </p>
        </div>
        <Button type="button" onClick={() => setMode("create")}>
          طلب جديد
        </Button>
      </div>
      <ErrorBanner error={error} />
      {listLoading ? (
        <p className="lead">جاري التحميل…</p>
      ) : orders.length === 0 ? (
        <p className="portal-empty">لا طلبات في نافذة اليوم.</p>
      ) : (
        <ul className="portal-stack" style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {orders.map((order) => {
            const next = nextAction(order.status);
            return (
              <li key={order.id} className="portal-card" style={{ margin: 0 }}>
                <strong>{statusLabel(order.status)}</strong>
                {" · "}
                {order.fulfillmentMode}
                {order.guestName ? ` · ${order.guestName}` : ""}
                <div style={{ fontSize: "0.85rem", color: "var(--portal-muted)" }}>
                  {(order.lines ?? []).map((l) => `${l.name}×${l.quantity}`).join("، ")}
                </div>
                {order.paymentAccepted ? (
                  <div style={{ fontSize: "0.85rem" }}>قبول دفع: {order.paymentMethod ?? "نعم"}</div>
                ) : null}
                {next ? (
                  <div className="portal-actions" style={{ marginTop: "0.75rem" }}>
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={() => void advance(order)}
                    >
                      {next.label}
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function RestaurantOrdersRoute() {
  return (
    <RouteGuard mode="tenant">
      <OrdersPage />
    </RouteGuard>
  );
}
