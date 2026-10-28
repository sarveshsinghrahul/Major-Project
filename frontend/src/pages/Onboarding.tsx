import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { contentApi, onboardingApi, type DiagnosticResult, type Format, type Profile, type ProfileIn } from "../api/client";
import { DiagnosticResultView } from "../components/DiagnosticResultView";
import { QuizPlayer, clearQuizDraft } from "../components/QuizPlayer";
import { useAuth } from "../store/auth";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FORMATS: { value: Format; label: string }[] = [
  { value: "notes", label: "Short notes" },
  { value: "video", label: "Videos" },
  { value: "link", label: "Articles" },
  { value: "practice", label: "Practice problems" },
];
const FAMILIARITY = [
  { value: 0, label: "I haven't studied it yet" },
  { value: 0.25, label: "I've seen the basics" },
  { value: 0.5, label: "I'm comfortable with the basics" },
  { value: 0.75, label: "I've solved many problems" },
  { value: 1, label: "I'm very confident" },
];

const STEPS = ["Your goals", "Diagnostic quiz", "Your results"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              i < current ? "bg-indigo-600 text-white" : i === current ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={i === current ? "font-medium" : "text-slate-500"}>{label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}

function ProfileStep({ initial, onSaved }: { initial: Profile; onSaved: () => void }) {
  const [form, setForm] = useState<ProfileIn>({
    goal: initial.goal ?? "",
    weekly_hours_available: initial.weekly_hours_available,
    preferred_days: initial.preferred_days,
    preferred_formats: initial.preferred_formats,
    self_rated_familiarity: initial.self_rated_familiarity,
  });
  const save = useMutation({ mutationFn: onboardingApi.saveProfile, onSuccess: onSaved });

  function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ ...form, goal: form.goal?.trim() || null });
      }}
    >
      <label className="block">
        <span className="mb-1 block font-medium">What do you want to achieve?</span>
        <input
          value={form.goal ?? ""}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          placeholder="e.g. Prepare for placement interviews"
          maxLength={255}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-medium">
          Hours per week you can study: <span className="text-indigo-600">{form.weekly_hours_available}</span>
        </span>
        <input
          type="range"
          min={1}
          max={20}
          value={form.weekly_hours_available}
          onChange={(e) => setForm({ ...form, weekly_hours_available: Number(e.target.value) })}
          className="w-full accent-indigo-600"
        />
      </label>

      <fieldset>
        <legend className="mb-2 font-medium">Which days suit you?</legend>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => {
            const on = form.preferred_days.includes(i);
            return (
              <button
                type="button"
                key={day}
                aria-pressed={on}
                onClick={() => setForm({ ...form, preferred_days: toggle(form.preferred_days, i).sort() })}
                className={`rounded-md border px-3 py-1.5 text-sm ${on ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-medium">How do you like to learn?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <label key={f.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.preferred_formats.includes(f.value)}
                onChange={() => setForm({ ...form, preferred_formats: toggle(form.preferred_formats, f.value) })}
                className="accent-indigo-600"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-medium">How well do you know Data Structures & Algorithms?</legend>
        <div className="space-y-1.5">
          {FAMILIARITY.map((f) => (
            <label key={f.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="familiarity"
                checked={form.self_rated_familiarity === f.value}
                onChange={() => setForm({ ...form, self_rated_familiarity: f.value })}
                className="accent-indigo-600"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      {save.isError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {save.error.message}
        </p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{form.preferred_days.length === 0 && "Pick at least one day."}</p>
        <button
          type="submit"
          disabled={save.isPending || form.preferred_days.length === 0}
          className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Continue"}
        </button>
      </div>
    </form>
  );
}

function DiagnosticStep({ onDone }: { onDone: (result: DiagnosticResult) => void }) {
  const [started, setStarted] = useState(false);
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: contentApi.subjects });
  const subjectId = subjects.data?.[0]?.id;
  const quiz = useQuery({
    queryKey: ["diagnostic", subjectId],
    queryFn: () => onboardingApi.startDiagnostic(subjectId!),
    enabled: started && subjectId !== undefined,
    staleTime: Infinity,
  });
  const submit = useMutation({
    mutationFn: (answers: Parameters<typeof onboardingApi.submitDiagnostic>[1]) =>
      onboardingApi.submitDiagnostic(quiz.data!.id, answers),
    onSuccess: (result) => {
      clearQuizDraft(result.quiz_id);
      onDone(result);
    },
  });

  if (!started) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">A quick check of what you already know</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-600">
          <li>About 30 multiple-choice questions, from the basics up to advanced topics. Allow 15–20 minutes.</li>
          <li>It isn't graded. It only sets where your learning path starts.</li>
          <li>
            If you don't know an answer, choose <em>I don't know this yet</em> instead of guessing, so your path fits you
            better.
          </li>
          <li>You can close the page and continue later.</li>
        </ul>
        <button
          onClick={() => setStarted(true)}
          className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Start the diagnostic
        </button>
      </div>
    );
  }

  if (quiz.isError) return <p className="text-red-700">Could not start the diagnostic: {quiz.error.message}</p>;
  if (!quiz.data) return <p className="text-slate-500">Preparing your questions…</p>;

  return (
    <>
      <QuizPlayer
        key={quiz.data.id}
        quizId={quiz.data.id}
        questions={quiz.data.questions}
        submitting={submit.isPending}
        onSubmit={(answers) => submit.mutate(answers)}
      />
      {submit.isError && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {submit.error.message}
        </p>
      )}
    </>
  );
}

function ResultStep({ result }: { result?: DiagnosticResult }) {
  const latest = useQuery({ queryKey: ["diagnostic", "latest"], queryFn: onboardingApi.latestDiagnostic, enabled: !result });
  const shown = result ?? latest.data;
  if (latest.isError) return <p className="text-red-700">{latest.error.message}</p>;
  if (!shown) return <p className="text-slate-500">Loading your results…</p>;

  return (
    <div className="space-y-6">
      <DiagnosticResultView result={shown} />
      <div className="flex justify-end">
        <Link to="/" className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700">
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: onboardingApi.profile });
  const [result, setResult] = useState<DiagnosticResult>();

  if (profile.isError) return <p className="text-red-700">Could not load your profile: {profile.error.message}</p>;
  if (!profile.data) return <p className="text-slate-500">Loading…</p>;

  const step = Math.min(profile.data.onboarding_step, 2);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">Welcome, {user?.name}</h1>
      <p className="mb-6 text-slate-600">A few minutes of setup, and LearnPath will build a study path around you.</p>
      <Stepper current={step} />
      {step === 0 && (
        <ProfileStep initial={profile.data} onSaved={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} />
      )}
      {step === 1 && (
        <DiagnosticStep
          onDone={async (r) => {
            setResult(r);
            await refreshUser();
            await queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["mastery"] });
          }}
        />
      )}
      {step === 2 && <ResultStep result={result} />}
    </div>
  );
}
