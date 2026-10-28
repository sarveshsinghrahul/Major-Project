import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-indigo-600">
            LearnPath
          </Link>
          {user && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">{user.name}</span>
              <button onClick={logout} className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100">
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
