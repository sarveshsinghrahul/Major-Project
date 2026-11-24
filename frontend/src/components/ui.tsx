import { useEffect, useState } from "react";

// Shared class names and small pieces of the departures-board design system (see DESIGN.md).

export const btn = {
  // Amber lamp: the one action to take on a screen.
  primary:
    "board-type inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[15px] font-bold text-surface transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary-active active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none",
  // A framed board button: steel edge on flap black.
  secondary:
    "board-type inline-flex items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-5 py-2.5 text-[15px] font-semibold text-ink transition-[border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-muted active:scale-[0.98] disabled:opacity-40",
  utility:
    "board-type inline-flex items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition-[border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-muted active:scale-[0.98] disabled:invisible",
  ghost: "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-dense text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink",
};

export const input =
  "w-full rounded-md border border-hairline bg-surface px-3 py-2.5 text-base text-ink placeholder:text-faint transition-colors focus-visible:border-primary focus-visible:outline-none";

export const card = "rounded-lg border border-bezel bg-surface";

export const link = "font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary";

// Each topic keeps one line colour, like a rail line, chosen by its permanent position.
const LINES = ["bg-line-sky", "bg-line-violet", "bg-line-pink", "bg-line-orange", "bg-line-teal", "bg-line-green", "bg-line-brown"];

export function sticker(index: number) {
  return { dot: LINES[index % LINES.length] };
}

/** The topic's permanent number in a flap cell, with its line colour beneath. */
export function TopicTile({ index, size = "md" }: { index: number; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "text-[15px]" : "text-lg";
  return (
    <span aria-hidden="true" className={`board-type inline-flex shrink-0 flex-col items-center gap-1 font-bold text-ink ${dims}`}>
      <span className="flex">
        {String(index + 1)
          .padStart(2, "0")
          .split("")
          .map((c, i) => (
            <span key={i} className="flap-cell">
              {c}
            </span>
          ))}
      </span>
      <span className={`h-[3px] w-full rounded-full ${sticker(index).dot}`} />
    </span>
  );
}

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// A board only moves where something changed: each cell remembers the last value it showed.
const MEMORY_PREFIX = "learnpath.flap.";

function lastShown(key: string) {
  try {
    return localStorage.getItem(MEMORY_PREFIX + key);
  } catch {
    return null;
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(MEMORY_PREFIX + key, value);
  } catch {
    // storage unavailable: the cell simply cascades again next time
  }
}

function prefersReducedMotion() {
  return typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches !== false;
}

/**
 * Text set in split-flap cells. With a `memoryKey`, the cells cascade left to right only when the
 * value differs from the one this cell last showed (a topic just opened, mastery moved); otherwise
 * they render settled. Screen readers get the plain text.
 */
export function FlapText({
  text,
  className = "",
  cells = true,
  memoryKey,
}: {
  text: string;
  className?: string;
  cells?: boolean;
  memoryKey?: string;
}) {
  const target = text.toUpperCase();
  const [shown, setShown] = useState(target);

  useEffect(() => {
    const unchanged = memoryKey !== undefined && lastShown(memoryKey) === target;
    if (memoryKey !== undefined) remember(memoryKey, target);
    if (prefersReducedMotion() || unchanged) {
      setShown(target);
      return;
    }
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const next = target
        .split("")
        .map((ch, i) => (ch === " " || tick > i + 5 ? ch : FLAP_CHARS[(tick * 7 + i * 13) % FLAP_CHARS.length]))
        .join("");
      setShown(next);
      if (tick > target.length + 5) window.clearInterval(id);
    }, 38);
    return () => window.clearInterval(id);
  }, [target, memoryKey]);

  return (
    <span className={`board-type inline-flex ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {cells
          ? shown.split("").map((c, i) =>
              c === " " ? (
                <span key={i} className="w-[0.4em]" />
              ) : (
                <span key={i} className="flap-cell">
                  {c}
                </span>
              ),
            )
          : shown}
      </span>
    </span>
  );
}

/** The LearnPath mark: a ring. */
export function Mark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"
      />
    </svg>
  );
}
