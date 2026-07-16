"use client";

import { useCallback, useEffect, useState } from "react";
import { EntityForm } from "@/portal/components/EntityForm";
import { EntityList } from "@/portal/components/EntityList";
import { FormField, TextInput, TextTextarea } from "@/portal/components/FormField";
import { RouteGuard } from "@/portal/components/RouteGuard";
import type { SalonService } from "@/portal/api/types";
import { usePortal } from "@/portal/session/PortalProvider";

function ServicesPage() {
  const { api } = usePortal();
  const [rows, setRows] = useState<SalonService[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<SalonService | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState("30");
  const [priceMajor, setPriceMajor] = useState("50");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const data = await api.get<SalonService[]>("/api/v1/salon/services");
    setRows(data);
  }, [api]);

  useEffect(() => {
    load().catch(setError);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setDurationMin("30");
    setPriceMajor("50");
    setMode("create");
    setError(null);
  }

  function openEdit(row: SalonService) {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setDurationMin(String(row.durationMin));
    setPriceMajor((row.priceCents / 100).toFixed(2));
    setMode("edit");
    setError(null);
  }

  async function save() {
    setSubmitting(true);
    setError(null);
    try {
      const priceCents = Math.round(Number(priceMajor) * 100);
      const duration = Number(durationMin);
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMin: duration,
        priceCents,
        currency: "SAR",
      };
      if (mode === "create") {
        await api.post("/api/v1/salon/services", body);
      } else if (editing) {
        await api.patch(`/api/v1/salon/services/${editing.id}`, body);
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
        title={mode === "create" ? "إضافة خدمة" : "تعديل خدمة"}
        description="الأسعار تُخزَّن بالهللة؛ أدخل المبلغ الذي يدفعه العملاء."
        error={error}
        submitting={submitting}
        submitLabel={mode === "create" ? "إنشاء الخدمة" : "حفظ التغييرات"}
        onSubmit={save}
        onCancel={() => setMode("list")}
      >
        <FormField label="الاسم">
          <TextInput required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="المدة (بالدقائق)">
          <TextInput
            type="number"
            required
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </FormField>
        <FormField label="السعر (ر.س)" hint="مثال: 50.00">
          <TextInput
            type="number"
            required
            min={0}
            step="0.01"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
          />
        </FormField>
        <FormField label="الوصف (اختياري)">
          <TextTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
      </EntityForm>
    );
  }

  return (
    <>
      {error ? (
        <div style={{ marginBottom: "1rem" }}>
          {/* list-level load errors */}
        </div>
      ) : null}
      <EntityList
        title="الخدمات"
        description="الخدمات التي يقدمها صالونك."
        rows={rows}
        emptyMessage="لا توجد خدمات بعد. أضف أول خدمة."
        addLabel="إضافة خدمة"
        onAdd={openCreate}
        onEdit={openEdit}
        columns={[
          { key: "name", header: "الاسم", render: (r) => r.name },
          { key: "duration", header: "المدة", render: (r) => `${r.durationMin} د` },
          {
            key: "price",
            header: "السعر",
            render: (r) => `${(r.priceCents / 100).toFixed(2)} ${r.currency}`,
          },
        ]}
      />
      {error ? (
        <p className="portal-error" role="alert">
          {error instanceof Error ? error.message : "فشل تحميل الخدمات"}
        </p>
      ) : null}
    </>
  );
}

export default function Page() {
  return (
    <RouteGuard mode="tenant">
      <ServicesPage />
    </RouteGuard>
  );
}
