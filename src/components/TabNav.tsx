"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "./tabs";

/** Main tabs in the top bar. Each tab is its own page, so it has a link you can share. */
export function TabNav() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => {
        const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="tab" aria-current={on ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
