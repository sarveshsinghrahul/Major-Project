import type { FormEvent, ReactNode } from "react";
import { Mark, btn, input } from "./ui";

// Shared card + error/submit handling for the login and register pages.
export function AuthForm({
  title,
  subtitle,
  error,
  submitting,
  submitLabel,
  onSubmit,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  error: string | null;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <div className="mx-auto mt-6 max-w-[400px] md:mt-12">
      <div className="rounded-lg border border-bezel bg-surface p-7 shadow-lifted sm:p-8">
        <Mark className="mb-5 h-7 w-7 text-primary" />
        <h1 className="board-type text-[30px] font-bold leading-none text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-dense text-muted">{subtitle}</p>}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {children}
          {error && (
            <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-dense text-danger">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className={`${btn.primary} mt-2 w-full`}>
            {submitting ? "Please wait…" : submitLabel}
          </button>
        </form>
      </div>
      <p className="mt-5 text-center text-dense text-muted">{footer}</p>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      <input
        type={type}
        name={autoComplete ?? label}
        spellCheck={type === "email" ? false : undefined}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={input}
      />
    </label>
  );
}
