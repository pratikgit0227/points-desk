"use client";

import { useMemo } from "react";
import { totalWorth } from "@/lib/calc";
import { DATA_CHECKED } from "@/lib/data";
import { inr, longDate } from "@/lib/format";
import { useStore } from "./store";

export function Header() {
  const { balances, values, filter, usingExample } = useStore();
  const total = useMemo(() => totalWorth({ balances, values, filter }), [balances, values, filter]);
  const note =
    (filter === "all" ? "Best use of every point" : "Best " + (filter === "air" ? "flight" : "hotel") + " use of every point") +
    ", within yearly transfer caps";
  return (
    <header className="top">
      <div>
        <div className="eyebrow">Credit card points · transfer partners · ₹ value</div>
        <h1>Suite &amp; Seat</h1>
        <p className="pitch">Use your card points like an expert: see what they&apos;re worth, the best way to fly, and when paying cash is smarter.</p>
        <ul className="badges" aria-label="About this site">
          <li>Free, no login</li>
          <li>Your data stays in this browser</li>
          <li>Ratios checked {longDate(DATA_CHECKED)}</li>
        </ul>
        <p className="muted small" style={{ margin: "6px 0 0", maxWidth: "62ch" }}>
          Your card points balances, ranked against every transfer partner each card allows. Includes Axis&apos;s 23 Sep reshuffle. Bank and source pages are checked every day, and the data is updated when they change.
        </p>
      </div>
      <div className="worth">
        <div className="eyebrow">{usingExample ? "Example wallet worth" : "Your points are worth up to"}</div>
        <div className="big">{inr(total)}</div>
        <div className="small muted">{note}</div>
      </div>
    </header>
  );
}
