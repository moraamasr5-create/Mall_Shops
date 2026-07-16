"use client";

import { useCallback, useEffect, useState } from "react";
import { EntityForm } from "@/portal/components/EntityForm";
import { EntityList } from "@/portal/components/EntityList";
import { ErrorBanner } from "@/portal/components/ErrorBanner";
import { Button, FormField, TextInput, TextTextarea } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { SalonCustomer } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

// إدارة العملاء — GET/POST/PATCH /api/v1/salon/customers (Tenant Context عبر PortalProvider)
function CustomersPage() {
  const { api } = usePortal();
  const [rows, setRows] = useState<SalonCustomer[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [listLoading, setListLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<SalonCustomer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      setRows(await api.get<SalonCustomer[]>("/api/v1/salon/customers"));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setListLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setMode("create");
    setError(null);
  }

  function openEdit(row: SalonCustomer) {
    setEditing(row);
    setName(row.name);
    setPhone(row.phone ?? "");
    setEmail(row.email ?? "");
    setNotes(row.notes ?? "");
    setMode("edit");
    setError(null);
  }

  async function save() {
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError(new Error("أدخل اسم عميل واضحًا (حرفان على الأقل)."));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (mode === "create") {
        await api.post("/api/v1/salon/customers", body);
      } else if (editing) {
        await api.patch(`/api/v1/salon/customers/${editing.id}`, body);
      }
      await load();
      setMode("list");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "create" || mode === "edit") {
    return (
      <EntityForm
        title={mode === "create" ? "إضافة عميل" : "تعديل عميل"}
        error={error}
        submitting={submitting}
        submitLabel={mode === "create" ? "إنشاء العميل" : "حفظ التغييرات"}
        onSubmit={save}
        onCancel={() => {
          setMode("list");
          setError(null);
        }}
      >
        <FormField label="الاسم">
          <TextInput required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="الهاتف (اختياري)">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label="البريد الإلكتروني (اختياري)">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="ملاحظات (اختياري)">
          <TextTextarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </EntityForm>
    );
  }

  return (
    <>
      <ErrorBanner error={error} />
      {error ? (
        <div className="portal-actions" style={{ marginBottom: "1rem" }}>
          <Button type="button" onClick={() => void load().catch(() => {})}>
            إعادة تحميل العملاء
          </Button>
        </div>
      ) : null}
      <EntityList
        title="العملاء"
        description="الأشخاص الذين يزورون صالونك."
        rows={rows}
        loading={listLoading}
        emptyMessage="لا يوجد عملاء بعد. أضف أول عميل."
        addLabel="إضافة عميل"
        onAdd={openCreate}
        onEdit={openEdit}
        columns={[
          { key: "name", header: "الاسم", render: (r) => r.name },
          { key: "phone", header: "الهاتف", render: (r) => r.phone ?? "—" },
          { key: "notes", header: "ملاحظات", render: (r) => r.notes ?? "—" },
        ]}
      />
    </>
  );
}

export default function Page() {
  return (
    <RouteGuard mode="tenant">
      <CustomersPage />
    </RouteGuard>
  );
}
