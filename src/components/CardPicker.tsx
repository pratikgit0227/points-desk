"use client";

import { useMemo } from "react";
import { pickCards } from "@/lib/calc";
import { cardName } from "@/lib/data";
import { fmt, inr } from "@/lib/format";
import { useStore } from "./store";

export function CardPicker() {
  const { pick, setPick, values, openGuide, mine } = useStore();
  const rows = useMemo(() => pickCards(pick.spend, pick.travel, values), [pick.spend, pick.travel, values]);
  const w = rows[0];

  return (
    <section className="panel" aria-labelledby="pickH">
      <h2 id="pickH">Choosing a card if you travel once a year</h2>
      <p className="small muted" style={{ margin: 0 }}>
        What each open card earns you in a year after its fee, used for your best flight or your best hotel. Change the spend to match yours.
      </p>
      <div className="pick-in">
        <label htmlFor="spendIn">
          Yearly card spend (₹)
          <input type="number" id="spendIn" min="0" step="10000" value={pick.spend} onChange={(e) => setPick({ spend: +e.target.value })} />
        </label>
        <label htmlFor="travelIn">
          of which travel bookings (₹)
          <input type="number" id="travelIn" min="0" step="5000" value={pick.travel} onChange={(e) => setPick({ travel: +e.target.value })} />
        </label>
      </div>
      <div className="tbl-wrap">
        <table id="pickT">
          <thead>
            <tr>
              <th>Card</th>
              <th className="r">Points a year</th>
              <th className="r">As flights</th>
              <th className="r">As hotels</th>
              <th className="r">Fee</th>
              <th className="r">You keep</th>
              <th>Enough for</th>
              <th>Why this card</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.prog.key} className={i === 0 ? "win" : undefined}>
                <td>
                  <div>
                    {r.ci.label || cardName(r.prog)} {mine?.includes(r.prog.key) && <span className="pill mine">You have this</span>}
                  </div>
                  <div className="small muted">{r.ci.status}</div>
                </td>
                <td className="r num">{fmt(r.pts)}</td>
                <td className="r num" title={"via " + r.air.name}>
                  {inr(r.fv)}
                </td>
                <td className="r num" title={"via " + r.hotel.name}>
                  {inr(r.hv)}
                </td>
                <td className="r num">{r.fee ? inr(r.fee) : r.ci.fee ? "Waived" : "Free"}</td>
                <td className={"r num" + (r.net < 0 ? " neg" : "")}>{inr(r.net)}</td>
                <td style={{ whiteSpace: "normal", minWidth: 160 }}>
                  {r.trip ? (
                    <button type="button" className="pl" onClick={() => openGuide(r.trip!.p)}>
                      {r.trip.s.to} · {r.trip.s.cab}
                    </button>
                  ) : (
                    <span className="muted">{r.prog.key === "scapia" ? inr(r.pts * r.prog.base.v) + " off bookings" : "Build up over 2 years"}</span>
                  )}
                </td>
                <td className="why">{`${r.ci.why} Best flight use: ${r.air.name}; best hotel use: ${r.hotel.name}.`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        {w
          ? `At ${inr(pick.spend)} a year, ${w.ci.label || w.prog.card} leaves you the most: ${inr(w.net)} after its fee. Year-1 welcome bonuses aren't counted. Axis Atlas is closed to new applicants, so it isn't in this list.`
          : ""}
      </p>
    </section>
  );
}
