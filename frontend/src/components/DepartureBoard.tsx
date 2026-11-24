import type { ReactNode } from "react";
import type { TopicMastery, TopicStatus } from "../api/client";
import { MasteryBar } from "./TopicStatusBadge";
import { FlapText, TopicTile } from "./ui";

const STATUS_TEXT: Record<TopicStatus, { label: string; colour: string }> = {
  mastered: { label: "Mastered", colour: "text-success" },
  available: { label: "Ready", colour: "text-primary" },
  in_progress: { label: "In progress", colour: "text-line-orange" },
  locked: { label: "Locked", colour: "text-muted" },
};

/**
 * Topics as a departures board: rows in prerequisite order that never move; only the status and
 * mastery cells change, and they cascade only when their value differs from the last one shown.
 */
export function DepartureBoard({
  id,
  title,
  note,
  rows,
  minutes,
  memory,
}: {
  id: string;
  title: string;
  note: ReactNode;
  rows: TopicMastery[];
  minutes?: Map<number, number>;
  memory: string; // prefix for the cells' remembered values, e.g. the user's id
}) {
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-lg border border-bezel bg-surface shadow-lifted">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-5 py-4">
        <h2 id={id} className="board-type text-h2 text-ink">
          {title}
        </h2>
        <p className="text-sm text-muted">{note}</p>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="board-type border-b border-hairline text-[12px] text-muted">
            <th scope="col" className="w-16 py-2.5 pl-5 font-semibold">
              No.
            </th>
            <th scope="col" className="py-2.5 pr-3 font-semibold">
              Topic
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Status
            </th>
            {minutes && (
              <th scope="col" className="hidden px-3 py-2.5 text-right font-semibold sm:table-cell">
                Min
              </th>
            )}
            <th scope="col" className="hidden py-2.5 pl-3 pr-5 text-right font-semibold md:table-cell">
              Mastery
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m, i) => {
            const s = STATUS_TEXT[m.status];
            return (
              <tr
                key={m.topic_id}
                className={`border-b border-hairline align-top last:border-b-0 ${m.status === "available" ? "bg-primary-soft" : ""}`}
              >
                <td className="py-3.5 pl-5">
                  <TopicTile index={i} size="sm" />
                </td>
                <td className="py-3.5 pr-3">
                  <p className={`board-type text-[17px] font-bold ${m.status === "locked" ? "text-ink-2" : "text-ink"}`}>{m.name}</p>
                  <p className="mt-1 max-w-[60ch] text-sm leading-snug text-muted">{m.reason}</p>
                  <div className="mt-2 md:hidden">
                    <MasteryBar value={m.mastery} />
                  </div>
                </td>
                <td className={`whitespace-nowrap px-3 py-3.5 text-[15px] font-bold ${s.colour}`}>
                  <FlapText text={s.label} memoryKey={`${memory}.status.${m.topic_id}`} />
                </td>
                {minutes && (
                  <td className="board-type hidden whitespace-nowrap px-3 py-3.5 text-right text-[15px] font-semibold text-ink-2 sm:table-cell">
                    {minutes.get(m.topic_id) ?? ""}
                  </td>
                )}
                <td className="hidden py-3.5 pl-3 pr-5 md:table-cell">
                  <div className="flex justify-end">
                    <MasteryBar value={m.mastery} memoryKey={`${memory}.mastery.${m.topic_id}`} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
