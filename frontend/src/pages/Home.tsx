import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { contentApi, type Topic } from "../api/client";
import { MasteryBar, TopicStatusBadge } from "../components/TopicStatusBadge";
import { useAuth } from "../store/auth";

// Interim dashboard: shows the subject roadmap with the learner's mastery until
// the recommendation engine and full dashboard are built.
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

  const topicById = new Map<number, Topic>((topics.data ?? []).map((t) => [t.id, t]));
  const ready = mastery.data?.filter((t) => t.status === "available") ?? [];
  const masteredCount = mastery.data?.filter((t) => t.status === "mastered").length ?? 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
          <p className="mt-1 text-slate-600">
            {user?.level ? (
              <>
                Level: <span className="font-medium capitalize">{user.level}</span> · {masteredCount} of{" "}
                {mastery.data?.length ?? 0} topics mastered
              </>
            ) : (
              "Finish onboarding to get your personalized path."
            )}
          </p>
        </div>
        {user?.level && (
          <Link to="/onboarding" className="text-sm font-medium text-indigo-600 hover:underline">
            View diagnostic results
          </Link>
        )}
      </section>

      {subjects.isError && <p className="text-red-700">Could not load subjects: {subjects.error.message}</p>}

      {ready.length > 0 && (
        <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Ready to study</h2>
          <p className="mt-1 text-slate-700">{ready.map((t) => t.name).join(" · ")}</p>
          <p className="mt-1 text-xs text-slate-500">Personalized recommendations and a weekly schedule are coming next.</p>
        </section>
      )}

      {subject && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{subject.name}</h2>
          <p className="mb-4 text-sm text-slate-600">{subject.description}</p>
          {mastery.isLoading && <p className="text-slate-500">Loading topics…</p>}
          <ol className="space-y-2">
            {mastery.data?.map((m, i) => {
              const t = topicById.get(m.topic_id);
              return (
                <li
                  key={m.topic_id}
                  className={`flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center ${
                    m.status === "locked" ? "opacity-60" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{m.name}</p>
                      <TopicStatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {t && `~${t.est_minutes} min · difficulty ${t.difficulty}/5 · `}
                      {m.reason}
                    </p>
                  </div>
                  <MasteryBar value={m.mastery} />
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
