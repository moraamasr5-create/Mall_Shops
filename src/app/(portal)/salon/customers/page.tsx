"use client";

import { useCallback, useEffect, useState } from "react";
import { EntityForm } from "@/portal/components/EntityForm";
import { EntityList } from "@/portal/components/EntityList";
import { FormField, TextInput, TextTextarea } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { SalonCustomer } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

function CustomersPage() {
  const { api } = usePortal();
  const [rows, setRows] = useState<SalonCustomer[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<SalonCustomer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setRows(await api.get<SalonCustomer[]>("/api/v1/salon/customers"));
  }, [api]);

  useEffect(() => {
    load().catch(setError);
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
    setSubmitting(true);
    setError(null);
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
        onCancel={() => setMode("list")}
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
      <EntityList
        title="العملاء"
        description="الأشخاص الذين يزورون صالونك."
        rows={rows}
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
      {error ? (
        <p className="portal-error" role="alert">
          {error instanceof Error ? error.message : "فشل تحميل العملاء"}
        </p>
      ) : null}
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
