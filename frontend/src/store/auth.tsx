import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, tokens, type User } from "../api/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; consent_analytics: boolean }) => Promise<void>;
  logout: () => void;
  /** Re-fetch the user, e.g. after the diagnostic sets their level. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(tokens.access));

  // Restore the session from stored tokens on first load.
  useEffect(() => {
    if (!tokens.access) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    tokens.set(await authApi.login(email, password));
    setUser(await authApi.me());
  }, []);

  const register = useCallback<AuthState["register"]>(async (data) => {
    tokens.set(await authApi.register(data));
    setUser(await authApi.me());
  }, []);

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authApi.me());
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
