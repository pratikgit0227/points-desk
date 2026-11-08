"use client";

import { useMemo } from "react";
import { matchMerchants, rankCardsForBooking, type FinderRow } from "@/lib/calc";
import { MERCHANTS } from "@/lib/data";
import { fmt, inr, shortBank } from "@/lib/format";
import { CardArt } from "./CardArt";
import { useStore } from "./store";

const pct = (v: number, amt: number) => ((v / amt) * 100).toFixed(1) + "%";

function shortVia(via: string) {
  return via.replace(/^Transfer to | for a trip later|\s\(.*$/g, "");
}

export function BookingFinder() {
  const { finder: f, setFinder, values } = useStore();
  const hits = useMemo(() => matchMerchants(f.q), [f.q]);
  const mid = hits.length && !hits.some((m) => m.id === f.mid) ? hits[0].id : f.mid;
  const merchant = MERCHANTS.find((x) => x.id === mid) || MERCHANTS[0];
  const rows = useMemo(
    () => (f.amt ? rankCardsForBooking({ merchant, amount: f.amt, values, cashbackName: f.cbName, cashbackPct: f.cbPct }) : []),
    [merchant, f.amt, f.cbName, f.cbPct, values],
  );

  return (
    <section className="finder" aria-labelledby="findH">
      <div>
        <h2 id="findH">Which card for this booking?</h2>
        <p className="muted small" style={{ margin: "4px 0 0" }}>
          Booking an IndiGo ticket or a hotel? Type what you&apos;re buying and the amount to see which card gives the most back, in points or cashback. Card pictures are illustrations, not the banks&apos; artwork.
        </p>
      </div>
      <div className="f-in">
        <label>
          What are you buying?
          <input
            type="text"
            placeholder="indigo, air india, hotel…"
            autoComplete="off"
            value={f.q}
            onChange={(e) => {
              const h = matchMerchants(e.target.value);
              setFinder({ q: e.target.value, ...(h.length ? { mid: h[0].id } : {}) });
            }}
          />
        </label>
        <label>
          Ticket amount (₹)
          <input type="number" min="0" step="500" inputMode="numeric" value={f.amt || ""} onChange={(e) => setFinder({ amt: Math.max(0, +e.target.value || 0) })} />
        </label>
      </div>
      <div className="f-chips">
        {hits.map((m) => (
          <button key={m.id} type="button" className="chip" aria-pressed={m.id === mid} onClick={() => setFinder({ mid: m.id, q: m.n })}>
            {m.n}
          </button>
        ))}
        {!hits.length && <span className="small muted">No match. Pick &quot;Any other airline&quot; or &quot;Any other hotel&quot;.</span>}
      </div>
      <div className="f-cb">
        <label>
          Your cashback card (optional)
          <input type="text" placeholder="e.g. SBI Cashback" value={f.cbName} onChange={(e) => setFinder({ cbName: e.target.value })} />
        </label>
        <label>
          Cashback on this booking (%)
          <input type="number" min="0" max="30" step="0.5" placeholder="0" value={f.cbPct || ""} onChange={(e) => setFinder({ cbPct: Math.max(0, +e.target.value || 0) })} />
        </label>
      </div>
      <div aria-live="polite">
        {!f.amt ? <p className="small muted">Enter the ticket amount to see the winner.</p> : <FinderResult rows={rows} amt={f.amt} merchantName={merchant.n} />}
      </div>
    </section>
  );
}

function FinderResult({ rows, amt, merchantName }: { rows: FinderRow[]; amt: number; merchantName: string }) {
  const w = rows[0];
  if (!w) return null;
  const pointsBest = rows.find((r) => !r.own);
  const cb = rows.find((r) => r.own);
  let verdict = "";
  if (cb && pointsBest) {
    verdict =
      cb.best.v >= pointsBest.best.v
        ? `Cashback wins here: ${inr(cb.best.v)} against ${inr(pointsBest.best.v)} from the best points card. Cash is also certain; points are only worth that if you redeem them well.`
        : `Points win: ${inr(pointsBest.best.v)} on ${pointsBest.name} against ${inr(cb.best.v)} cashback.`;
  } else if (pointsBest?.cash) {
    const better = pointsBest.best.v > pointsBest.cash.v ? pointsBest.best : null;
    verdict = better
      ? `Points or cashback? Used like cash, ${pointsBest.name} gives ${inr(pointsBest.cash.v)}; transferred well, up to ${inr(better.v)}. Add your cashback card above to compare.`
      : `Add your cashback card above to see whether cashback beats ${inr(pointsBest.best.v)} in points.`;
  }

  return (
    <>
      <div className="f-win">
        <div>{w.own || !w.prog ? <div className="big">Cashback</div> : <CardArt cardKey={w.prog.key} label={w.prog.card} bank={shortBank(w.prog.bank)} />}</div>
        <div>
          <div className="tag">Pay {merchantName} with</div>
          <h3>{w.name}</h3>
          <div className="big">{inr(w.best.v)} back</div>
          <p className="small">
            {pct(w.best.v, amt)} of {inr(amt)}. {w.own ? "Cash lands in the account." : `${fmt(w.pts)} points earned. ${w.best.via}.`}
          </p>
          {w.stretch && (
            <p className="small muted">
              Stretch: {inr(w.stretch.v)} if the points are saved for another trip. {w.stretch.via.replace(" for a trip later", "")}.
            </p>
          )}
          {verdict && <p className="small">{verdict}</p>}
          {!w.own && w.ci?.est && <p className="small muted">Earn rate is the base retail rate, not checked for this merchant.</p>}
          {!w.own && w.ci?.status && !/^open/i.test(w.ci.status) && <p className="small muted">Card status: {w.ci.status}.</p>}
        </div>
      </div>
      <div className="f-list">
        {rows.slice(1).map((r) => (
          <div className="f-row" key={r.own ? "own" : r.prog!.key}>
            <div>{!r.own && r.prog && <CardArt cardKey={r.prog.key} label={r.prog.card} bank={shortBank(r.prog.bank)} />}</div>
            <div>
              <div>{r.name}</div>
              <div className="via">
                {r.best.via}
                {r.stretch ? ` · up to ${inr(r.stretch.v)} via ${shortVia(r.stretch.via)}` : ""}
                {r.ci?.est ? " · base rate" : ""}
              </div>
            </div>
            <div className="val">
              {inr(r.best.v)}
              <div className="pct">{pct(r.best.v, amt)}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="small muted">
        Assumes the booking is made on the airline or hotel&apos;s own site and counts as travel spend. Portal bookings (SmartBuy, Travel EDGE) earn differently, and some cards exclude certain merchants, so check the card&apos;s terms. Axis Atlas is closed to new applicants. Value per point uses your editable partner values below.
      </p>
    </>
  );
}
