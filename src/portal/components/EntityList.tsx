"use client";

import type { ReactNode } from "react";
import { Button } from "@/portal/components/FormField";

export type EntityColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function EntityList<T extends { id: string }>({
  title,
  description,
  rows,
  columns,
  emptyMessage,
  onAdd,
  addLabel = "إضافة",
  onEdit,
}: {
  title: string;
  description?: string;
  rows: T[];
  columns: EntityColumn<T>[];
  emptyMessage: string;
  onAdd?: () => void;
  addLabel?: string;
  onEdit?: (row: T) => void;
}) {
  return (
    <div className="portal-card">
      <div className="portal-toolbar">
        <div>
          <h1>{title}</h1>
          {description ? <p className="lead">{description}</p> : null}
        </div>
        {onAdd ? (
          <Button type="button" onClick={onAdd}>
            {addLabel}
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="portal-empty">{emptyMessage}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.header}</th>
                ))}
                {onEdit ? <th>إجراءات</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                  {onEdit ? (
                    <td>
                      <Button type="button" variant="secondary" onClick={() => onEdit(row)}>
                        تعديل
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
