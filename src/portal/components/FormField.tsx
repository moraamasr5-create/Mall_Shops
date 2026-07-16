"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="portal-field">
      <label>{label}</label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function TextTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows ?? 3} />;
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="portal-actions">{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const cls =
    variant === "secondary"
      ? "portal-btn secondary"
      : variant === "danger"
        ? "portal-btn danger"
        : "portal-btn";
  return (
    <button type={props.type ?? "button"} className={cls} {...props}>
      {children}
    </button>
  );
}
