import { type ReactNode } from "react";

export const inputClass =
  "w-full px-4 py-3 bg-surface border border-border rounded-xl font-sans text-base text-text placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: { message?: string };
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium text-text-muted tracking-label uppercase mb-2"
      >
        {label}
      </label>
      {children}
      {error?.message && (
        <p className="mt-1 text-xs text-danger">{error.message}</p>
      )}
    </div>
  );
}
