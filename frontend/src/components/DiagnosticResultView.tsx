import type { DiagnosticResult } from "../api/client";
import { useAuth } from "../store/auth";
import { DepartureBoard } from "./DepartureBoard";
import { FlapText } from "./ui";

const LEVEL_TONE = {
  beginner: "text-ink",
  intermediate: "text-primary",
  advanced: "text-success",
} as const;

/** Drawn right / wrong marks, in the rail icons' 1.5 stroke. */
export function AnswerMark({ correct }: { correct: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={correct ? "m3.5 8.4 2.8 2.8 6.2-6.4" : "M4.5 4.5l7 7M11.5 4.5l-7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DiagnosticResultView({ result }: { result: DiagnosticResult }) {
  const { user } = useAuth();
  const topicName = new Map(result.topics.map((t) => [t.topic_id, t.name]));
  const memory = `u${user?.id ?? 0}.results`;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-bezel bg-surface p-6 md:p-8">
        <p className="board-type text-[13px] font-semibold text-muted">Your starting level</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className={`text-[30px] font-bold ${LEVEL_TONE[result.level]}`}>
            <FlapText text={result.level} memoryKey={`${memory}.level`} />
          </span>
          <span className="board-type text-[17px] font-semibold text-ink-2">
            {result.correct} of {result.total} correct · overall {Math.round(result.overall * 100)}%
          </span>
        </div>
        <p className="mt-4 max-w-[70ch] text-ink-2">{result.level_reason}</p>
      </section>

      <DepartureBoard
        id="topics-h"
        title="Topic by topic"
        note="Topics open once every prerequisite reaches 60% mastery."
        rows={result.topics}
        memory={memory}
      />

      <details className="rounded-lg border border-bezel bg-surface p-6 md:p-8">
        <summary className="board-type cursor-pointer text-h2 text-ink">Review your answers</summary>
        <ol className="mt-5 space-y-4">
          {result.feedback.map((f, i) => (
            <li key={f.question_id} className="rounded-md border border-hairline p-4">
              <p className="board-type text-[13px] font-semibold text-muted">
                {i + 1}. {topicName.get(f.topic_id)}
              </p>
              <p className="mt-1 font-medium text-ink">{f.text}</p>
              <p className={`mt-2 flex gap-2 text-sm ${f.is_correct ? "text-success" : "text-danger"}`}>
                <AnswerMark correct={f.is_correct} />
                <span>
                  <span className="sr-only">{f.is_correct ? "Correct. " : "Wrong. "}</span>
                  Your answer: {f.chosen === null ? "I don't know this yet" : f.options[f.chosen]}
                </span>
              </p>
              {!f.is_correct && <p className="mt-1 text-sm text-ink-2">Correct answer: {f.options[f.correct_answer]}</p>}
              {f.explanation && <p className="mt-1 text-sm text-muted">{f.explanation}</p>}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
