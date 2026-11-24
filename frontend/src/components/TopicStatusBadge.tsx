import type { TopicStatus } from "../api/client";
import { FlapText } from "./ui";

// Status reads like a board's status column: the word itself, lit in its lamp colour.
const STYLES: Record<TopicStatus, { label: string; className: string }> = {
  mastered: { label: "Mastered", className: "text-success" },
  available: { label: "Ready", className: "text-primary" },
  in_progress: { label: "In progress", className: "text-line-orange" },
  locked: { label: "Locked", className: "text-muted" },
};

export function TopicStatusBadge({ status }: { status: TopicStatus }) {
  const { label, className } = STYLES[status];
  return <span className={`board-type whitespace-nowrap text-[15px] font-bold ${className}`}>{label}</span>;
}

const SEGMENTS = 10;

/** Mastery on one fixed ramp: ten lamp segments and the percentage, the same everywhere. */
export function MasteryBar({ value, memoryKey }: { value: number; memoryKey?: string }) {
  const pct = Math.round(value * 100);
  const lit = Math.round(value * SEGMENTS);
  const colour = pct >= 80 ? "bg-success" : "bg-primary";
  return (
    <div className="flex items-center gap-2.5" aria-label={`Mastery ${pct}%`}>
      <div className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`h-2.5 w-[5px] rounded-[1px] ${i < lit ? colour : "bg-white/[0.09]"}`} />
        ))}
      </div>
      <span className="board-type w-10 justify-end text-right text-[15px] font-semibold text-ink-2">
        {memoryKey ? <FlapText text={pct + "%"} cells={false} memoryKey={memoryKey} className="justify-end" /> : pct + "%"}
      </span>
    </div>
  );
}
