import type { FormEvent, ReactNode } from "react";

// Shared card + error/submit handling for the login and register pages.
export function AuthForm({
  title,
  error,
  submitting,
  submitLabel,
  onSubmit,
  children,
  footer,
}: {
  title: string;
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
    <div className="mx-auto mt-12 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Please wait…" : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
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
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );
}
