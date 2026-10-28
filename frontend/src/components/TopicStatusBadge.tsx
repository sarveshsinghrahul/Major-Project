import type { TopicStatus } from "../api/client";

const STYLES: Record<TopicStatus, { label: string; className: string }> = {
  mastered: { label: "Mastered", className: "bg-emerald-50 text-emerald-700" },
  available: { label: "Ready", className: "bg-indigo-50 text-indigo-700" },
  in_progress: { label: "In progress", className: "bg-amber-50 text-amber-700" },
  locked: { label: "Locked", className: "bg-slate-100 text-slate-500" },
};

export function TopicStatusBadge({ status }: { status: TopicStatus }) {
  const { label, className } = STYLES[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

export function MasteryBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2" aria-label={`Mastery ${pct}%`}>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-slate-500">{pct}%</span>
    </div>
  );
}
