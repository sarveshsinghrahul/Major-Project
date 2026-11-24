import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { contentApi } from "../api/client";
import { DepartureBoard } from "../components/DepartureBoard";
import { FlapText, btn } from "../components/ui";
import { useAuth } from "../store/auth";

function BoardFact({ label, value, tone = "text-ink", memoryKey }: { label: string; value: string; tone?: string; memoryKey: string }) {
  return (
    <div>
      <dt className="board-type text-[12px] font-semibold text-muted">{label}</dt>
      <dd className={`mt-1.5 text-[22px] font-bold ${tone}`}>
        <FlapText text={value} memoryKey={memoryKey} />
      </dd>
    </div>
  );
}

// The roadmap as a departures board: topic rows never move, only their status and mastery change.
export function HomePage() {
  const { user } = useAuth();
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: contentApi.subjects });
  const subject = subjects.data?.[0];
  const topics = useQuery({
    queryKey: ["topics", subject?.id],
    queryFn: () => contentApi.topics(subject!.id),
    enabled: Boolean(subject),
  });
  const mastery = useQuery({
    queryKey: ["mastery", subject?.id],
    queryFn: () => contentApi.mastery(subject!.id),
    enabled: Boolean(subject),
  });

  const minutes = new Map<number, number>((topics.data ?? []).map((t) => [t.id, t.est_minutes]));
  const ready = mastery.data?.filter((t) => t.status === "available") ?? [];
  const masteredCount = mastery.data?.filter((t) => t.status === "mastered").length ?? 0;
  const total = mastery.data?.length ?? 0;
  const memory = `u${user?.id ?? 0}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="board-type text-[34px] font-bold leading-none text-ink md:text-title">Welcome back, {user?.name}</h1>
        {user?.level && (
          <Link to="/onboarding" className={btn.secondary}>
            View diagnostic results
          </Link>
        )}
      </div>

      {user?.level ? (
        <dl className="mt-6 grid grid-cols-2 gap-5 rounded-lg border border-bezel bg-surface p-5 sm:grid-cols-3">
          <BoardFact label="Level" value={user.level} memoryKey={`${memory}.level`} />
          <BoardFact
            label="Mastered"
            value={`${String(masteredCount).padStart(2, "0")}/${total}`}
            tone="text-success"
            memoryKey={`${memory}.mastered`}
          />
          <div className="col-span-2 sm:col-span-1">
            <BoardFact label="Ready now" value={ready[0]?.name ?? "None"} tone="text-primary" memoryKey={`${memory}.ready`} />
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-muted">Finish onboarding to get your personalized path.</p>
      )}

      {subjects.isError && <p className="mt-6 text-danger">Could not load subjects: {subjects.error.message}</p>}
      {subject && mastery.isLoading && <p className="mt-8 text-muted">Loading topics…</p>}

      {subject && mastery.data && (
        <div className="mt-8">
          <DepartureBoard
            id="roadmap-h"
            title="Roadmap"
            note={`${subject.name} · topics open when every prerequisite reaches 60%.`}
            rows={mastery.data}
            minutes={minutes}
            memory={memory}
          />
        </div>
      )}
    </div>
  );
}
