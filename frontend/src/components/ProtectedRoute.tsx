import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

/**
 * Requires a logged-in user. Students who have not finished onboarding (no level yet)
 * are sent to /onboarding unless `allowUnonboarded` is set.
 */
export function ProtectedRoute({ children, allowUnonboarded = false }: { children: ReactNode; allowUnonboarded?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-8 text-slate-500">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowUnonboarded && user.role === "student" && user.level === null) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
