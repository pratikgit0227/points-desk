import Image from "next/image";
import Link from "next/link";
import { DATA_CHECKED } from "@/lib/data";
import { longDate } from "@/lib/format";

/** Slim header: brand on the left, data freshness on the right. The sections live in the dock. */
export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <div className="brand-wrap">
          <Link href="/" aria-label="Suite & Seat home">
            <Image src="/logo.png" alt="Aarthik Udaan" width={40} height={40} className="brand-logo" priority />
          </Link>
          <div className="brand-text">
            <Link href="/" className="brand">
              Suite &amp; <span>Seat</span>
            </Link>
            <a className="header-credit" href="https://x.com/pratik0227" target="_blank" rel="noopener noreferrer">
              by <b>CA Pratik Bharda</b>
            </a>
          </div>
        </div>
        <span className="asof" title="Source pages are checked every day; data is re-verified when one changes">
          <span className="asof-dot" aria-hidden="true" />
          Ratios verified {longDate(DATA_CHECKED)} · watched daily
        </span>
      </div>
    </header>
  );
}
