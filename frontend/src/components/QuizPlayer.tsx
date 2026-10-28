import { useEffect, useRef, useState } from "react";
import type { AnswerIn, QuizQuestion } from "../api/client";

interface Draft {
  chosen: number | null;
  time: number; // seconds spent on the question so far
}

const draftKey = (quizId: number) => `learnpath.quiz.${quizId}`;

function loadDrafts(quizId: number): Record<number, Draft> {
  try {
    return JSON.parse(localStorage.getItem(draftKey(quizId)) ?? "{}");
  } catch {
    return {};
  }
}

function saveDrafts(quizId: number, drafts: Record<number, Draft>) {
  try {
    localStorage.setItem(draftKey(quizId), JSON.stringify(drafts));
  } catch {
    // Storage unavailable (private mode): the quiz still works, it just won't survive a reload.
  }
}

/**
 * One-question-at-a-time quiz. Tracks time per question and keeps a draft in
 * localStorage so a reload resumes where the learner left off.
 */
export function QuizPlayer({
  quizId,
  questions,
  allowSkip = true,
  submitting,
  onSubmit,
}: {
  quizId: number;
  questions: QuizQuestion[];
  allowSkip?: boolean;
  submitting: boolean;
  onSubmit: (answers: AnswerIn[]) => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => loadDrafts(quizId));
  const [index, setIndex] = useState(() => {
    const firstUnanswered = questions.findIndex((q) => !(q.id in loadDrafts(quizId)));
    return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
  });
  const shownAt = useRef(Date.now());

  const question = questions[index];
  const draft = drafts[question.id];
  const answeredCount = questions.filter((q) => q.id in drafts).length;
  const isLast = index === questions.length - 1;

  useEffect(() => {
    shownAt.current = Date.now();
  }, [index]);

  useEffect(() => saveDrafts(quizId, drafts), [quizId, drafts]);

  // Add the time spent on the current question since it was shown.
  function withElapsed(chosen: number | null): Record<number, Draft> {
    const elapsed = (Date.now() - shownAt.current) / 1000;
    shownAt.current = Date.now();
    const prev = drafts[question.id];
    return { ...drafts, [question.id]: { chosen, time: (prev?.time ?? 0) + elapsed } };
  }

  function choose(option: number | null) {
    setDrafts(withElapsed(option));
  }

  function go(delta: number) {
    if (draft) setDrafts(withElapsed(draft.chosen));
    setIndex((i) => Math.min(Math.max(i + delta, 0), questions.length - 1));
  }

  function submit() {
    const final = draft ? withElapsed(draft.chosen) : drafts;
    onSubmit(
      questions.map((q) => ({
        question_id: q.id,
        chosen: final[q.id]?.chosen ?? null,
        time_taken_sec: Math.round((final[q.id]?.time ?? 0) * 10) / 10,
      })),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex justify-between text-sm text-slate-500">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={answeredCount} aria-valuemax={questions.length}>
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">{question.text}</h2>
        <div className="space-y-2" role="radiogroup" aria-label="Options">
          {question.options.map((option, i) => {
            const selected = draft?.chosen === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={selected}
                onClick={() => choose(i)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  selected ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="mr-3 font-semibold text-slate-400">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
          {allowSkip && (
            <button
              role="radio"
              aria-checked={draft !== undefined && draft.chosen === null}
              onClick={() => choose(null)}
              className={`w-full rounded-lg border border-dashed px-4 py-3 text-left text-slate-500 transition ${
                draft !== undefined && draft.chosen === null ? "border-slate-500 bg-slate-50" : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              I don't know this yet
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-md px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:invisible"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={submit}
            disabled={!draft || submitting}
            className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        ) : (
          <button
            onClick={() => go(1)}
            disabled={!draft}
            className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export function clearQuizDraft(quizId: number) {
  try {
    localStorage.removeItem(draftKey(quizId));
  } catch {
    // ignore
  }
}
