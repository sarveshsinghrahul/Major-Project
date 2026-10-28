import type { DiagnosticResult } from "../api/client";
import { MasteryBar, TopicStatusBadge } from "./TopicStatusBadge";

const LEVEL_STYLE = {
  beginner: "bg-sky-100 text-sky-800",
  intermediate: "bg-violet-100 text-violet-800",
  advanced: "bg-emerald-100 text-emerald-800",
} as const;

export function DiagnosticResultView({ result }: { result: DiagnosticResult }) {
  const topicName = new Map(result.topics.map((t) => [t.topic_id, t.name]));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Your starting level</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-lg font-semibold capitalize ${LEVEL_STYLE[result.level]}`}>
            {result.level}
          </span>
          <span className="text-slate-600">
            {result.correct} of {result.total} correct · overall {Math.round(result.overall * 100)}%
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">{result.level_reason}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">Topic by topic</h2>
        <p className="mb-4 text-sm text-slate-500">Topics unlock once their prerequisites reach 60% mastery.</p>
        <ul className="divide-y divide-slate-100">
          {result.topics.map((t) => (
            <li key={t.topic_id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  <TopicStatusBadge status={t.status} />
                </div>
                <p className="text-xs text-slate-500">{t.reason}</p>
              </div>
              <MasteryBar value={t.mastery} />
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded-xl border border-slate-200 bg-white p-6">
        <summary className="cursor-pointer text-lg font-semibold">Review your answers</summary>
        <ol className="mt-4 space-y-4">
          {result.feedback.map((f, i) => (
            <li key={f.question_id} className="rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-400">
                {i + 1}. {topicName.get(f.topic_id)}
              </p>
              <p className="font-medium">{f.text}</p>
              <p className={`mt-2 text-sm ${f.is_correct ? "text-emerald-700" : "text-red-700"}`}>
                {f.is_correct ? "✓ " : "✗ "}
                Your answer: {f.chosen === null ? "I don't know this yet" : f.options[f.chosen]}
              </p>
              {!f.is_correct && <p className="text-sm text-slate-700">Correct answer: {f.options[f.correct_answer]}</p>}
              {f.explanation && <p className="mt-1 text-sm text-slate-500">{f.explanation}</p>}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
