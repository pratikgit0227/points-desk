"use client";

import Link from "next/link";
import { useMemo } from "react";
import { fareFor, perPoint, photoFor, tripList, valueOf } from "@/lib/calc";
import { PARTNERS } from "@/lib/data";
import { fmt, inr, ratioTxt, shortDate } from "@/lib/format";
import { PhotoBg } from "./PhotoBg";
import { useStore } from "./store";

export function Trips() {
  const { balances, values, filter, cashPrices, openGuide } = useStore();
  const items = useMemo(() => tripList({ balances, values, filter }), [balances, values, filter]);

  return (
    <section className="panel" aria-labelledby="tripH">
      <h2 id="tripH">Where your points can take you</h2>
      <p className="small muted" style={{ margin: 0 }}>
        One-way award flights from India and hotel nights, priced in partner points. &quot;You can book&quot; counts all your cards that transfer to that partner. Tap a trip for the full how-to. Photos show a landmark of the place (<Link href="/learn#photo-credits">credits</Link>).
      </p>
      <div className="trips">
        {!items.length && <p className="small muted">Enter a balance to see trips.</p>}
        {items.map((x) => {
          const m = x.s.m!;
          const best = x.pl.bestRatio!;
          const cardPts = Math.ceil(m / best.ratio);
          const funded = x.pl.srcs.filter((s) => s.pts > 0).map((s) => s.prog.card);
          const fare = fareFor(x.p + "|" + x.i, cashPrices);
          const per = fare.cash ? perPoint(fare.cash, fare.tax || 0, m) : 0;
          return (
            <button key={x.p + "|" + x.i} type="button" className="trip has-photo" style={{ textAlign: "left" }} onClick={() => openGuide(x.p)}>
              <PhotoBg photo={photoFor(x.s.to, PARTNERS[x.p].k === "hotel")} className="trip-photo">
                <div>
                  <span className="pill cab">{x.s.cab}</span>{" "}
                  {x.n >= 1 ? (
                    <span className="pill ok">{x.n > 1 ? `You can book ${x.n}×` : "You can book 1"}</span>
                  ) : (
                    <span className="pill no">Need {fmt(x.short)} more</span>
                  )}
                </div>
                <div className="to">{x.s.to}</div>
              </PhotoBg>
              <div className="trip-body">
              <div className="meta">{(x.s.from ? "From " + x.s.from + " · " : "") + PARTNERS[x.p].n}</div>
              <div className="cost num">
                {`${fmt(m)} ${x.s.cab === "Hotel" ? "pts / night" : "miles one-way"}`}
                {best.usable >= cardPts
                  ? ` = ${fmt(cardPts)} ${best.prog.card} pts`
                  : funded.length
                    ? ` · from ${funded.join(" + ")}`
                    : ` · best rate: ${best.prog.card} ${ratioTxt(best.ratio)}`}
              </div>
              {fare.cash ? (
                <div className="meta" style={per >= valueOf(values, x.p) ? { color: "var(--good)" } : undefined}>
                  {`Cash fare ${inr(fare.cash)} → ₹${per.toFixed(2)} a point` + (fare.snap ? ` (checked ${shortDate(fare.snap.checked)})` : "")}
                </div>
              ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
