import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DATA_CHECKED } from "@/lib/data";
import { longDate } from "@/lib/format";
import { TabNav } from "./TabNav";
import { TABS } from "./tabs";

/** Slim sticky bar, same layout as the Momentum Screener's, with the main tabs. */
export function TopBar() {
  return (
    <div className="topbar">
      <div className="brand-wrap">
        <Link href="/" aria-label="Points Desk home">
          <Image src="/logo.png" alt="Aarthik Udaan" width={40} height={40} className="brand-logo" priority />
        </Link>
        <div className="brand-text">
          <div className="brand">
            Points <span>Desk</span>
          </div>
          <a className="header-credit" href="https://x.com/pratik0227" target="_blank" rel="noopener noreferrer">
            by <b>CA Pratik Bharda</b>
          </a>
        </div>
      </div>
      <Suspense fallback={<StaticTabs />}>
        <TabNav />
      </Suspense>
      <div className="header-right">
        <span className="asof" title="Source pages are checked every day; data is re-verified when one changes">
          Ratios verified {longDate(DATA_CHECKED)} · watched daily
        </span>
      </div>
    </div>
  );
}

function StaticTabs() {
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className="tab">
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
