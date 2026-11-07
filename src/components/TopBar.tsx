import Image from "next/image";

/** Slim sticky bar, same layout as the Momentum Screener's. */
export function TopBar() {
  return (
    <div className="topbar">
      <div className="brand-wrap">
        <Image src="/logo.png" alt="Aarthik Udaan" width={40} height={40} className="brand-logo" priority />
        <div className="brand-text">
          <div className="brand">
            Points <span>Desk</span>
          </div>
          <a className="header-credit" href="https://x.com/pratik0227" target="_blank" rel="noopener noreferrer">
            by <b>CA Pratik Bharda</b>
          </a>
        </div>
      </div>
      <div className="header-right">
        <span className="asof">Ratios checked 25 Sep 2026</span>
      </div>
    </div>
  );
}
