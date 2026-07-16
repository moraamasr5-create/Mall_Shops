"use client";

import { useCallback, useEffect, useState } from "react";
import { EntityForm } from "@/portal/components/EntityForm";
import { EntityList } from "@/portal/components/EntityList";
import { FormField, TextInput } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { SalonEmployee } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

function EmployeesPage() {
  const { api } = usePortal();
  const [rows, setRows] = useState<SalonEmployee[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<SalonEmployee | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setRows(await api.get<SalonEmployee[]>("/api/v1/salon/employees"));
  }, [api]);

  useEffect(() => {
    load().catch(setError);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setTitle("");
    setPhone("");
    setEmail("");
    setMode("create");
    setError(null);
  }

  function openEdit(row: SalonEmployee) {
    setEditing(row);
    setName(row.name);
    setTitle(row.title ?? "");
    setPhone(row.phone ?? "");
    setEmail(row.email ?? "");
    setMode("edit");
    setError(null);
  }

  async function save() {
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        title: title.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };
      if (mode === "create") {
        await api.post("/api/v1/salon/employees", body);
      } else if (editing) {
        await api.patch(`/api/v1/salon/employees/${editing.id}`, body);
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
        title={mode === "create" ? "إضافة موظف" : "تعديل موظف"}
        error={error}
        submitting={submitting}
        submitLabel={mode === "create" ? "إنشاء الموظف" : "حفظ التغييرات"}
        onSubmit={save}
        onCancel={() => setMode("list")}
      >
        <FormField label="الاسم">
          <TextInput required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="المسمى الوظيفي (اختياري)">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="الهاتف (اختياري)">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label="البريد الإلكتروني (اختياري)">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
      </EntityForm>
    );
  }

  return (
    <>
      <EntityList
        title="الموظفون"
        description="الأشخاص الذين يعملون في صالونك."
        rows={rows}
        emptyMessage="لا يوجد موظفون بعد. أضف أول موظف."
        addLabel="إضافة موظف"
        onAdd={openCreate}
        onEdit={openEdit}
        columns={[
          { key: "name", header: "الاسم", render: (r) => r.name },
          { key: "title", header: "المسمى", render: (r) => r.title ?? "—" },
          { key: "phone", header: "الهاتف", render: (r) => r.phone ?? "—" },
        ]}
      />
      {error ? (
        <p className="portal-error" role="alert">
          {error instanceof Error ? error.message : "فشل تحميل الموظفين"}
        </p>
      ) : null}
    </>
  );
}

export default function Page() {
  return (
    <RouteGuard mode="tenant">
      <EmployeesPage />
    </RouteGuard>
  );
}
