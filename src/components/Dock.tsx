"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, tabIndex } from "./tabs";

/** Dock icon shapes (Material Icons, Apache 2.0). */
const PATHS: Record<(typeof TABS)[number]["icon"], string> = {
  wallet:
    "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  plane: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z",
  card: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
  book: "M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z",
};

/**
 * Mac-style dock at the bottom: the main sections as app icons. Icons grow
 * on hover, the open one has a dot, and pages slide towards the side of the
 * icon you pick (like switching desktops).
 */
export function Dock() {
  const path = usePathname();
  const here = tabIndex(path);
  return (
    <nav className="dock" aria-label="Sections">
      {TABS.map((t, i) => {
        const on = i === here;
        const dir = here < 0 || i === here ? [] : [i > here ? "nav-forward" : "nav-back"];
        return (
          <Link key={t.href} href={t.href} className={"dock-item dock-" + t.icon} aria-current={on ? "page" : undefined} transitionTypes={dir}>
            <span className="dock-tip" aria-hidden="true">
              {t.label}
            </span>
            <span className="dock-ico">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={PATHS[t.icon]} fill="currentColor" />
              </svg>
            </span>
            <span className="dock-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
