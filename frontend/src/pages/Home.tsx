import { useQuery } from "@tanstack/react-query";
import { contentApi, type Topic } from "../api/client";
import { useAuth } from "../store/auth";

// Placeholder dashboard: shows the subject roadmap until onboarding and the
// recommendation engine are built.
export function HomePage() {
  const { user } = useAuth();
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: contentApi.subjects });
  const subject = subjects.data?.[0];
  const topics = useQuery({
    queryKey: ["topics", subject?.id],
    queryFn: () => contentApi.topics(subject!.id),
    enabled: Boolean(subject),
  });

  const byId = new Map<number, Topic>((topics.data ?? []).map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <p className="mt-1 text-slate-600">
          {user?.level
            ? `Current level: ${user.level}`
            : "Take the diagnostic quiz (coming next) to get your personalized path."}
        </p>
      </section>

      {subjects.isError && <p className="text-red-700">Could not load subjects: {subjects.error.message}</p>}

      {subject && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{subject.name}</h2>
          <p className="mb-4 text-sm text-slate-600">{subject.description}</p>
          {topics.isLoading && <p className="text-slate-500">Loading topics…</p>}
          <ol className="space-y-2">
            {topics.data?.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    ~{t.est_minutes} min · difficulty {t.difficulty}/5
                    {t.prerequisite_ids.length > 0 &&
                      ` · after ${t.prerequisite_ids.map((id) => byId.get(id)?.name).join(", ")}`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
