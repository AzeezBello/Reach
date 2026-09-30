import type { ReactNode } from "react";

import { Badge } from "@/components/ui";
import { humanize, type Tone } from "@/lib/format";

/*
 * Server-safe building blocks shared by the resident dashboard and the
 * superadmin console: headers, panels, stats, tables and form fields.
 */

export const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50";

export const selectClasses = `${inputClasses} pr-9`;

export function AdminHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {text && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Panel({
  title,
  text,
  action,
  children,
  className = "",
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-extrabold text-ink">{title}</h2>
          {text && <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>}
        </div>
        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

export function Table({
  head,
  children,
  empty,
  rows,
}: {
  head: string[];
  children: ReactNode;
  empty: string;
  rows: number;
}) {
  if (rows === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        {empty}
      </p>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            {head.map((label) => (
              <th key={label} scope="col" className="px-5 py-3 first:pl-5 sm:first:pl-6">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export const cell = "px-5 py-3.5 align-top text-slate-700 first:pl-5 sm:first:pl-6";

export function StatusBadge({ status, fallback = "Unknown" }: { status: string | null; fallback?: string }) {
  const tone: Tone = status === "resolved" || status === "completed" || status === "active" || status === "approved"
    ? "brand"
    : status === "in_progress" || status === "under_review" || status === "pending"
      ? "gold"
      : status === "closed" || status === "rejected"
        ? "ink"
        : "slate";

  return <Badge tone={tone}>{humanize(status, fallback)}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "brand" : "slate"}>{active ? "Active" : "Inactive"}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

type FieldBase = {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
};

export function Field({
  label,
  name,
  hint,
  required,
  type = "text",
  defaultValue,
  placeholder,
  autoComplete,
}: FieldBase & {
  type?: string;
  defaultValue?: string | null;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClasses}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextareaField({
  label,
  name,
  hint,
  required,
  defaultValue,
  placeholder,
  rows = 3,
}: FieldBase & { defaultValue?: string | null; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={inputClasses}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  hint,
  required,
  options,
  defaultValue,
  placeholder,
}: FieldBase & {
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={selectClasses}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-slate-300 accent-brand-600"
      />
      <span>
        <span className="font-bold text-ink">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export function labelOptions(values: readonly string[]) {
  return values.map((value) => ({ value, label: humanize(value) }));
}
