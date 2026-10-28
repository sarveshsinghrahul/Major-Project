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
};
