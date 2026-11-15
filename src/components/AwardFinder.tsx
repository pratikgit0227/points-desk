"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { canShowCard, PARTNERS, type Cabin } from "@/lib/data";
import { CHART_INFO } from "@/lib/data/awardcharts";
import { defaultTripDate, pool } from "@/lib/calc";
import { airport, airportLabel, countryName, searchAirports, type Airport } from "@/lib/calc/airports";
import { AWARD_COMING, awardPrices, awardSearchLinks, sightingsFor, type AwardQuote, type Price } from "@/lib/calc/awards";
import { fmt, longDate, ratioTxt, shortBank } from "@/lib/format";
import { usePersisted } from "@/lib/persisted";
import { Icon } from "./Icons";
import { useStore } from "./store";

interface RouteState {
  from: string;
  to: string;
  cabin: Cabin;
}

const START: RouteState = { from: "DEL", to: "LHR", cabin: "biz" };

const noop = () => () => {};
function useDefaultDate() {
  return useSyncExternalStore(noop, () => defaultTripDate(), () => "");
}

/** Text box with airport suggestions; picks on click or Enter. */
function AirportInput({ label, value, onPick }: { label: string; value: Airport; onPick: (code: string) => void }) {
  const id = useId();
  const [q, setQ] = useState<string | null>(null);
  const hits = useMemo(() => (q ? searchAirports(q) : []), [q]);
  const pick = (a: Airport) => {
    onPick(a.code);
    setQ(null);
  };
  return (
    <div className="aw-field">
      <label htmlFor={id} className="small muted">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder="City or airport code"
        value={q ?? airportLabel(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setQ(null), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) pick(hits[0]);
          if (e.key === "Escape") setQ(null);
        }}
      />
      {hits.length > 0 && (
        <ul className="aw-suggest" role="listbox">
          {hits.map((a) => (
            <li key={a.code}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(a)}>
                <b>{a.code}</b> {a.city}, <span className="muted">{countryName(a.country)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PriceCell({ price }: { price?: Price }) {
  if (!price) return <span className="small muted">No price listed</span>;
  return (
    <>
      <b className="num">{fmt(price.lo)}</b>
      {price.hi && price.hi !== price.lo && <div className="small muted">up to {fmt(price.hi)}</div>}
    </>
  );
}

/** Card that converts best into this programme, and how many card points the award takes. */
function CardCost({ q, cabin }: { q: AwardQuote; cabin: Cabin }) {
  const { balances, mine } = useStore();
  const need = q[cabin]?.lo;
  const pl = pool(q.p, balances);
  const best = pl.srcs.find((s) => s.bal > 0) ?? pl.srcs.find((s) => canShowCard(s.prog.key, mine));
  if (!need || !best) return <span className="small muted">No card of yours transfers here</span>;
  const cardPts = Math.ceil(need / best.ratio);
  return (
    <span className="small">
      <b>{fmt(cardPts)}</b> {best.prog.unit} from {shortBank(best.prog.bank)} {best.prog.card}
      <span className="muted"> ({ratioTxt(best.ratio)})</span>
      {pl.total > 0 && <div className={pl.total >= need ? "ok-text" : "muted"}>{pl.total >= need ? "Your cards cover it" : `Your cards make ${fmt(pl.total)}`}</div>}
    </span>
  );
}

const confPill = (c: AwardQuote["conf"]) =>
  c === "high" ? <span className="pill ok">Chart price</span> : <span className="pill unk">Depends on the route</span>;

/** "Mumbai → New York in business: how many points on each programme?" */
export function AwardFinder() {
  const [route, setRoute] = usePersisted<RouteState>("pd_award_route", START);
  const from = airport(route.from) ?? airport(START.from)!;
  const to = airport(route.to) ?? airport(START.to)!;
  const cabin = route.cabin;
  const date = useDefaultDate();
  const { quotes, missing, miles } = useMemo(() => awardPrices(from, to), [from, to]);
  const rows = useMemo(
    () => [...quotes].sort((a, b) => (a[cabin]?.lo ?? Infinity) - (b[cabin]?.lo ?? Infinity)),
    [quotes, cabin],
  );
  const seen = sightingsFor(from.code, to.code);
  const set = (patch: Partial<RouteState>) => setRoute((r) => ({ ...r, ...patch }));

  return (
    <>
      <section className="finder" aria-labelledby="awH">
        <h2 id="awH" className="with-icon">
          <Icon name="plane" size={20} /> Points needed for any flight
        </h2>
        <div className="aw-route">
          <AirportInput label="From" value={from} onPick={(c) => set({ from: c })} />
          <button type="button" className="aw-swap" aria-label="Swap from and to" onClick={() => set({ from: to.code, to: from.code })}>
            ⇄
          </button>
          <AirportInput label="To" value={to} onPick={(c) => set({ to: c })} />
        </div>
        <div className="chips" role="group" aria-label="Cabin">
          {(["eco", "biz"] as const).map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cabin === c} onClick={() => set({ cabin: c })}>
              {c === "eco" ? "Economy" : "Business"}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          {airportLabel(from)} → {airportLabel(to)}: {fmt(miles)} miles nonstop. One-way, one traveller, from each programme&apos;s published prices. A price here doesn&apos;t mean a seat is free on your date: check with the search links.
        </p>
      </section>

      <section className="panel" aria-labelledby="awT">
        <h2 id="awT">{cabin === "eco" ? "Economy" : "Business"}, cheapest first</h2>
        {rows.length === 0 ? (
          <p className="small muted">None of the charts we have covers this route yet.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Programme and airline</th>
                  <th className="r">Points</th>
                  <th>From your cards</th>
                  <th>Check seats</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q, i) => (
                  <tr key={q.p + q.on} className={i === 0 && q[cabin] ? "rec" : undefined}>
                    <td>
                      <b>{PARTNERS[q.p].n}</b>
                      <div className="small muted">On {q.on}</div>
                      <div className="small muted">{q.basis}</div>
                      {q.note && <div className="small">{q.note}</div>}
                      {confPill(q.conf)}
                    </td>
                    <td className="r">
                      <PriceCell price={q[cabin]} />
                    </td>
                    <td style={{ minWidth: 180 }}>
                      <CardCost q={q} cabin={cabin} />
                    </td>
                    <td className="small">
                      {date &&
                        awardSearchLinks(q.p, from.code, to.code, date).map((l) => (
                          <div key={l.label}>
                            <a href={l.href} target="_blank" rel="noopener noreferrer">
                              {l.label} ↗
                            </a>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {missing.length > 0 && (
          <ul className="g-notes small">
            {missing.map((m) => (
              <li key={m.p}>
                <b>{PARTNERS[m.p].n}:</b> {m.why}
              </li>
            ))}
          </ul>
        )}
        <p className="small muted" style={{ margin: 0 }}>
          Coming next: {AWARD_COMING}. Prices are the lowest a programme charges; &quot;up to&quot; is its peak or Prime price.
        </p>
      </section>

      {seen.length > 0 && (
        <section className="panel" aria-labelledby="awS">
          <h2 id="awS">Seen on this route</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Real searches shared in a credit card points group. One search on one date: seats come and go.
          </p>
          <ul className="aw-seen">
            {seen.map((s) => (
              <li key={s.p + s.from + s.to + s.travel + s.points}>
                <b>
                  {fmt(s.points)} {PARTNERS[s.p].n.split(" ").slice(-1)[0]} points + {s.cash}
                </b>{" "}
                · {s.from} → {s.via?.length ? s.via.join(" → ") + " → " : ""}
                {s.to} · {s.cabin === "eco" ? "Economy" : s.mixed ? "Mixed cabin" : "Business"} on {s.airlines}
                {s.flights ? ` (${s.flights})` : ""}
                <div className="small muted">
                  For {longDate(s.travel)}, seen on {s.tool}, shared {longDate(s.shared)}.
                  {s.note ? " " + s.note : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel" aria-labelledby="awC">
        <h2 id="awC">About these charts</h2>
        {CHART_INFO.map((c) => (
          <details key={c.p}>
            <summary>
              <b>{PARTNERS[c.p].n}</b> <span className="small muted">· {c.flights}</span>
            </summary>
            <p className="small">{c.how}</p>
            <p className="small">
              <b>Cash on top:</b> {c.taxes}
            </p>
            <ul className="g-notes small">
              {c.watch.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="small muted">
              Sources:{" "}
              {c.src.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && "; "}
                  <a href={s.url} target="_blank" rel="noopener">
                    {s.label}
                  </a>{" "}
                  ({longDate(s.date)})
                </span>
              ))}
            </p>
          </details>
        ))}
      </section>
    </>
  );
}
