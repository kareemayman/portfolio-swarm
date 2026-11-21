"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import { THEME_KEY, type Theme } from "./theme";
import styles from "./ThemeToggle.module.css";

const root = () => document.documentElement;

function current(): Theme {
  return root().getAttribute("data-theme") === "light" ? "light" : "dark";
}

function saved(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

// The attribute on <html> is the source of truth, so React reads it as an external store.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function apply(theme: Theme) {
  root().setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked. The theme still applies for this visit.
  }
}

/** Switches theme, revealing the new one in a circle that grows from the button. */
function switchTheme(next: Theme, from: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !document.startViewTransition) return apply(next);

  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document
    .startViewTransition(() => apply(next))
    .ready.then(() =>
      root().animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 650,
          easing: "cubic-bezier(.2,.8,.2,1)",
          pseudoElement: "::view-transition-new(root)",
        },
      ),
    )
    .catch(() => {});
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, current, () => "dark" as Theme);

  // In development, Strict Mode's remount resets <html> to the attributes in JSX
  // and drops the one the inline script set. Put it back before paint.
  useLayoutEffect(() => {
    const t = saved();
    if (t && t !== current()) root().setAttribute("data-theme", t);
  }, []);

  return (
    <button
      type="button"
      className={cx(styles.toggle, className)}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      onClick={(e) => switchTheme(current() === "light" ? "dark" : "light", e.currentTarget)}
      data-b="box"
    >
      {/* Both icons are in the HTML and CSS picks one, so the right icon shows before hydration. */}
      <svg
        className={styles.sun}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
      </svg>
      <svg
        className={styles.moon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" />
      </svg>
    </button>
  );
}
