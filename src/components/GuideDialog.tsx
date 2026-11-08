"use client";

import { useEffect, useRef } from "react";
import { defaultTripDate, fareFor, fareLinks, perPoint, pool, valueOf } from "@/lib/calc";
import { GUIDES, PARTNERS, type PartnerId, type Spot } from "@/lib/data";
import { fmt, inr, ratioTxt, shortBank, shortDate } from "@/lib/format";
import { useStore } from "./store";

/** How-to guide for one transfer partner, in a modal dialog. */
export function GuideDialog() {
  const { guide, closeGuide } = useStore();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (guide && !d.open) d.showModal();
    if (!guide && d.open) d.close();
    if (guide) d.scrollTop = 0;
  }, [guide]);

  return (
    <dialog
      id="guide"
      ref={ref}
      aria-labelledby="gTitle"
      onClose={closeGuide}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGuide();
      }}
    >
      {guide && <GuideBody p={guide} onClose={closeGuide} />}
    </dialog>
  );
}

function GuideBody({ p, onClose }: { p: PartnerId; onClose: () => void }) {
  const { balances, values } = useStore();
  const g = GUIDES[p];
  const P = PARTNERS[p];
  const air = P.k === "air";
  const pl = pool(p, balances);
  const v = valueOf(values, p);

  return (
    <>
      <div className="g-head">
        <div>
          <div className="eyebrow">{air ? "Airline programme" : "Hotel programme"}</div>
          <h2 id="gTitle">{P.n}</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="g-body">
        {g && <p>{g.about}</p>}

        <div className="g-have">
          {pl.total > 0 ? (
            <>
              <div>Your cards can move up to</div>
              <div className="big">
                {fmt(pl.total)} {air ? "miles" : "points"}
              </div>
              <div className="small">
                Worth about {inr(pl.total * v)} at ₹{v} a point
              </div>
            </>
          ) : (
            <div>None of your cards have a balance that transfers here yet.</div>
          )}
        </div>

        <div>
          <h4>How to get {air ? "miles" : "points"}</h4>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Card</th>
                  <th className="r">Ratio</th>
                  <th className="r">Your balance</th>
                  <th className="r">You&apos;d get</th>
                </tr>
              </thead>
              <tbody>
                {!pl.srcs.length && (
                  <tr>
                    <td colSpan={4} className="muted">
                      None of the cards here transfer to this programme.
                    </td>
                  </tr>
                )}
                {pl.srcs.map((s) => (
                  <tr key={s.prog.key}>
                    <td>{shortBank(s.prog.bank) + " " + s.prog.card + (s.grp ? " (Group " + s.grp + ")" : "")}</td>
                    <td className="r num">{ratioTxt(s.ratio)}</td>
                    <td className="r num">{fmt(s.bal)}</td>
                    <td className="r num">{fmt(s.pts) + (s.usable < s.bal ? "*" : "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pl.srcs.some((s) => s.usable < s.bal) && <div className="capnote">* Limited by the card&apos;s yearly transfer cap for this group.</div>}
        </div>

        {g && (
          <>
            <Spots p={p} spots={g.spots} total={pl.total} best={pl.bestRatio ? { ratio: pl.bestRatio.ratio, card: pl.bestRatio.prog.card } : null} />
            <div>
              <h4>How to book</h4>
              <ol>
                {g.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            {g.watch.length > 0 && (
              <div>
                <h4>Watch out for</h4>
                <ul>
                  {g.watch.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="small muted">
              Prices are the lowest one-way award prices seen in 2026; seats at that price are limited and taxes are extra. Find the seat first, then transfer.
              {g.src ? " Source: " + g.src + "." : ""}
            </p>
          </>
        )}
      </div>
    </>
  );
}

function Spots({ p, spots, total, best }: { p: PartnerId; spots: Spot[]; total: number; best: { ratio: number; card: string } | null }) {
  const { tripDate, setTripDate } = useStore();
  const air = PARTNERS[p].k === "air";
  const date = tripDate || defaultTripDate();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h4>{air ? "Where it can take you" : "Where you can stay"}</h4>
      <label className="small muted" htmlFor="tripDate" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {air ? "Travel date for the searches " : "Check-in date for the searches "}
        <input
          type="date"
          id="tripDate"
          value={date}
          min={today}
          style={{ width: "auto", padding: "4px 8px" }}
          onChange={(e) => e.target.value && setTripDate(e.target.value)}
        />
      </label>
      <p className="small muted">
        Each trip links to the cash price on fare sites and to award-seat searches for that date. Enter the cash price you find and the taxes the airline asks for on the award booking; the page works out what each point is really worth on that trip. Prices aren&apos;t fetched automatically.
      </p>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>{air ? "To" : "Hotel"}</th>
              {air && <th>From</th>}
              <th>Cabin</th>
              <th className="r">{air ? "Miles one-way" : "Points / night"}</th>
              <th className="r">Your card pts</th>
              <th>You can book</th>
              <th className="r">Cash price ₹</th>
              <th className="r">Award taxes ₹</th>
              <th className="r">₹ per point</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((s, i) => (
              <SpotRow key={i} p={p} i={i} s={s} date={date} total={total} best={best} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cashInput = { width: 96, padding: "4px 6px", fontVariantNumeric: "tabular-nums" } as const;

function SpotRow({ p, i, s, date, total, best }: { p: PartnerId; i: number; s: Spot; date: string; total: number; best: { ratio: number; card: string } | null }) {
  const { cashPrices, setCashPrice, values, setValue } = useStore();
  const air = PARTNERS[p].k === "air";
  const key = p + "|" + i;
  const fare = fareFor(key, cashPrices);
  const cash = fare.cash || 0;
  const tax = fare.tax || 0;
  const v = valueOf(values, p);
  const per = s.m && cash ? perPoint(cash, tax, s.m) : 0;
  const n = s.m ? Math.floor(total / s.m) : 0;

  return (
    <tr>
      <td style={{ whiteSpace: "normal", minWidth: 180 }}>
        <div>{s.to}</div>
        {s.note && <div className="small muted">{s.note}</div>}
        <div className="small" style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 4 }}>
          {fareLinks(p, i, s, date).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel={(l.aff ? "sponsored " : "") + "noopener noreferrer"} title={l.aff ? "Affiliate link" : undefined} style={{ color: "var(--accent)" }}>
              {l.label} ↗{l.aff && "*"}
            </a>
          ))}
        </div>
      </td>
      {air && <td>{s.from}</td>}
      <td>{s.cab === "Hotel" ? "Room" : s.cab}</td>
      <td className="r num">{s.m ? fmt(s.m) : "Varies"}</td>
      <td className="r num">{s.m && best ? fmt(Math.ceil(s.m / best.ratio)) + " " + best.card : "—"}</td>
      <td>{s.m ? <span className={"pill " + (n ? "ok" : "no")}>{n ? n + "×" : "Not yet"}</span> : "Check site"}</td>
      <td className="r">
        <input
          type="number"
          min="0"
          step="500"
          placeholder="—"
          aria-label={`Cash price for ${s.to}`}
          style={cashInput}
          value={cash || ""}
          onChange={(e) => setCashPrice(key, +e.target.value || 0, tax)}
        />
        <div className="small muted" style={{ whiteSpace: "normal", maxWidth: 120, marginLeft: "auto" }}>
          {fare.own ? "Your price" : fare.snap ? "Snapshot " + shortDate(fare.snap.checked) + (fare.snap.travel ? " for " + shortDate(fare.snap.travel) : "") : ""}
        </div>
      </td>
      <td className="r">
        <input
          type="number"
          min="0"
          step="500"
          placeholder="—"
          aria-label={`Award taxes for ${s.to}`}
          style={cashInput}
          value={tax || ""}
          onChange={(e) => setCashPrice(key, cash, +e.target.value || 0)}
        />
      </td>
      <td className="r num">
        {!s.m ? (
          "Varies"
        ) : !cash ? (
          "—"
        ) : (
          <>
            <div>₹{per.toFixed(2)}</div>
            <div className={"small" + (per >= v ? "" : " muted")} style={per >= v ? { color: "var(--good)" } : undefined}>
              {per >= v ? "above your ₹" + v : "below your ₹" + v}
            </div>
            <button type="button" className="link small" onClick={() => setValue(p, +per.toFixed(2))}>
              Use as my value
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
