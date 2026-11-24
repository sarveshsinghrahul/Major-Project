import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";
import { Mark, btn } from "./ui";

const ICONS = {
  roadmap: "M2.5 4.5h11M2.5 8h11M2.5 11.5h11M5 3v10",
  results: "M3 13.5V8M8 13.5V3M13 13.5v-7",
  start: "m3.5 8.4 2.8 2.8 6.2-6.4",
  about: "M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 7.5v4M8 5h.01",
};

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const railRow = ({ isActive }: { isActive: boolean }) =>
  `board-type flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-semibold transition-colors ${
    isActive ? "bg-surface text-primary" : "text-muted hover:bg-white/[0.05] hover:text-ink"
  }`;

const barItem = ({ isActive }: { isActive: boolean }) =>
  `board-type flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[12px] font-semibold ${
    isActive ? "text-primary" : "text-muted"
  }`;

const SkipLink = () => (
  <a
    href="#main"
    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-surface"
  >
    Skip to content
  </a>
);

const Brand = () => (
  <Link to="/" className="board-type flex items-center gap-2.5 text-[22px] font-bold tracking-[0.14em] text-ink">
    <Mark className="h-5 w-5 text-primary" />
    LearnPath
  </Link>
);

export function Layout() {
  const { user, logout } = useAuth();

  // Signed out: the steel frame with the name plate across the top.
  if (!user) {
    return (
      <div className="min-h-screen">
        <SkipLink />
        <header className="border-b border-hairline bg-canvas/80">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
            <Brand />
            <a href="/welcome/" className="board-type text-sm font-semibold text-muted hover:text-ink">
              About LearnPath
            </a>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-5 py-10">
          <Outlet />
        </main>
      </div>
    );
  }

  const onboarded = user.role !== "student" || user.level !== null;
  const items = onboarded
    ? [
        { to: "/", label: "Roadmap", icon: ICONS.roadmap, end: true },
        { to: "/onboarding", label: "Results", icon: ICONS.results, end: false },
      ]
    : [{ to: "/onboarding", label: "Getting started", icon: ICONS.start, end: false }];

  return (
    <div className="min-h-screen md:flex">
      <SkipLink />

      {/* Rail: desktop and tablet */}
      <aside className="hidden border-r border-hairline md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col">
        <div className="px-5 pb-6 pt-6">
          <Brand />
          <p className="board-type mt-1 pl-[30px] text-[11px] font-semibold text-muted">DSA study board</p>
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1 px-3">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={railRow}>
              <NavIcon d={it.icon} />
              {it.label}
            </NavLink>
          ))}
          <a href="/welcome/" className={railRow({ isActive: false })}>
            <NavIcon d={ICONS.about} />
            About
          </a>
        </nav>

        <div className="mt-auto border-t border-hairline p-4">
          <p className="board-type text-[11px] font-semibold text-muted">Signed in</p>
          <p className="mt-1 truncate text-dense font-semibold text-ink">{user.name}</p>
          {user.level && (
            <p className="board-type mt-0.5 text-sm font-semibold text-muted">Level · {user.level}</p>
          )}
          <button onClick={logout} className={`${btn.utility} mt-3 w-full`}>
            Log out
          </button>
        </div>
      </aside>

      {/* Top strip: phones */}
      <header className="flex h-14 items-center justify-between border-b border-hairline px-4 md:hidden">
        <Brand />
        <button onClick={logout} className={btn.ghost}>
          Log out
        </button>
      </header>

      <main id="main" className="min-w-0 flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-7 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Bottom bar: phones */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={barItem}>
            <NavIcon d={it.icon} />
            {it.label}
          </NavLink>
        ))}
        <a href="/welcome/" className={barItem({ isActive: false })}>
          <NavIcon d={ICONS.about} />
          About
        </a>
      </nav>
    </div>
  );
}
