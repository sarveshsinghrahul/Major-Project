// Typed fetch wrapper for the LearnPath API. Stores tokens in localStorage and
// retries once with a refreshed access token when the API answers 401.

const API_BASE = "/api/v1";
const ACCESS_KEY = "learnpath.access";
const REFRESH_KEY = "learnpath.refresh";

export type Role = "student" | "instructor" | "admin";
export type Level = "beginner" | "intermediate" | "advanced";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  level: Level | null;
}

export interface Subject {
  id: number;
  slug: string;
  name: string;
  description: string;
}

export interface Topic {
  id: number;
  slug: string;
  name: string;
  description: string;
  difficulty: number;
  est_minutes: number;
  prerequisite_ids: number[];
}

export type Format = "notes" | "video" | "link" | "practice";
export type TopicStatus = "locked" | "available" | "in_progress" | "mastered";

export interface ProfileIn {
  goal: string | null;
  weekly_hours_available: number;
  preferred_days: number[]; // 0 = Monday
  preferred_formats: Format[];
  self_rated_familiarity: number; // 0..1
}

export interface Profile extends ProfileIn {
  level: Level | null;
  level_score: number | null;
  level_reason: string | null;
  onboarding_step: number; // 0 new, 1 profile saved, 2 diagnostic done
}

export interface QuizQuestion {
  id: number;
  topic_id: number;
  text: string;
  options: string[];
}

export interface Quiz {
  id: number;
  subject_id: number;
  kind: string;
  questions: QuizQuestion[];
}

export interface AnswerIn {
  question_id: number;
  chosen: number | null; // null = "I don't know"
  time_taken_sec: number;
}

export interface QuestionFeedback {
  question_id: number;
  topic_id: number;
  text: string;
  options: string[];
  chosen: number | null;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface TopicMastery {
  topic_id: number;
  name: string;
  mastery: number;
  status: TopicStatus;
  reason: string;
}

export interface DiagnosticResult {
  quiz_id: number;
  score: number;
  overall: number;
  level: Level;
  level_reason: string;
  correct: number;
  total: number;
  topics: TopicMastery[];
  feedback: QuestionFeedback[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(pair: TokenPair) {
    localStorage.setItem(ACCESS_KEY, pair.access_token);
    localStorage.setItem(REFRESH_KEY, pair.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function errorMessage(resp: Response): Promise<string> {
  try {
    const body = await resp.json();
    if (typeof body.detail === "string") return body.detail;
    // FastAPI validation errors: [{ loc, msg }, ...]
    if (Array.isArray(body.detail)) return body.detail.map((d: { msg: string }) => d.msg).join("; ");
  } catch {
    // fall through to the status text
  }
  return resp.statusText || `Request failed (${resp.status})`;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const resp = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!resp.ok) {
    tokens.clear();
    return false;
  }
  tokens.set(await resp.json());
  return true;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (tokens.access) headers.set("Authorization", `Bearer ${tokens.access}`);

  const resp = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (resp.status === 401 && retry && (await tryRefresh())) {
    return api<T>(path, init, false);
  }
  if (!resp.ok) throw new ApiError(resp.status, await errorMessage(resp));
  return resp.status === 204 ? (undefined as T) : resp.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false),
  register: (data: { name: string; email: string; password: string; consent_analytics: boolean }) =>
    api<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify(data) }, false),
  me: () => api<User>("/auth/me"),
};

export const contentApi = {
  subjects: () => api<Subject[]>("/subjects"),
  topics: (subjectId: number) => api<Topic[]>(`/subjects/${subjectId}/topics`),
  mastery: (subjectId: number) => api<TopicMastery[]>(`/subjects/${subjectId}/mastery`),
};

export const onboardingApi = {
  profile: () => api<Profile>("/onboarding/profile"),
  saveProfile: (data: ProfileIn) => api<Profile>("/onboarding/profile", { method: "PUT", body: JSON.stringify(data) }),
  startDiagnostic: (subjectId: number) =>
    api<Quiz>("/onboarding/diagnostic", { method: "POST", body: JSON.stringify({ subject_id: subjectId }) }),
  submitDiagnostic: (quizId: number, answers: AnswerIn[]) =>
    api<DiagnosticResult>(`/onboarding/diagnostic/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  latestDiagnostic: () => api<DiagnosticResult>("/onboarding/diagnostic/latest"),
};
