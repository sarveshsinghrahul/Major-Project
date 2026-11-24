import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { AnswerIn, QuizQuestion } from "../api/client";
import { btn } from "./ui";

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

  // Arrow keys move the choice between options, as in a native radio group.
  function moveChoice(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]"));
    const at = radios.indexOf(document.activeElement as HTMLButtonElement);
    const next = radios[(at + step + radios.length) % radios.length];
    next.focus();
    next.click();
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
        <div className="board-type mb-2 flex justify-between text-[14px] font-semibold text-muted">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuenow={answeredCount} aria-valuemax={questions.length}>
          <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-bezel bg-surface p-6 md:p-8">
        <h2 className="mb-5 text-h3 text-ink">{question.text}</h2>
        <div className="space-y-2" role="radiogroup" aria-label="Options" onKeyDown={moveChoice}>
          {question.options.map((option, i) => {
            const selected = draft?.chosen === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={selected}
                onClick={() => choose(i)}
                className={`flex w-full items-center rounded-md border px-4 py-3 text-left transition-colors ${
                  selected ? "border-primary bg-primary-soft shadow-[inset_0_0_0_1px_#ffb000]" : "border-hairline hover:bg-canvas"
                }`}
              >
                <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-white/[0.06] text-xs font-semibold text-muted">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
          {allowSkip && (
            <button
              role="radio"
              aria-checked={draft !== undefined && draft.chosen === null}
              onClick={() => choose(null)}
              className={`w-full rounded-md border border-dashed px-4 py-3 text-left text-muted transition-colors ${
                draft !== undefined && draft.chosen === null ? "border-ink-2 bg-white/[0.05] text-ink" : "border-hairline hover:border-muted"
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
          className={btn.utility}
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={submit}
            disabled={!draft || submitting}
            className={btn.primary}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        ) : (
          <button
            onClick={() => go(1)}
            disabled={!draft}
            className={btn.primary}
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
