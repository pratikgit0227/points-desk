"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { awardLinks, beatsValue, cashFareLinks, defaultTripDate, destSlug, matchDestinations, merchantFor, optionKey, routeOrigin, planDestination, priceBasis, PRICE_TAG, togglePick, MAX_PICKS, rankCardsForBooking, type FareLink, type RoutePlan } from "@/lib/calc";
import { DESTINATIONS, ORIGINS, PARTNERS, type Cabin } from "@/lib/data";
import { fmt, inr, ratioTxt, shortBank } from "@/lib/format";
import { FareDetails } from "./FareDetails";
import { Icon } from "./Icons";
import { PartnerLink } from "./PartnerLink";
import { SimpleAnswer } from "./SimpleAnswer";
import { useStore } from "./store";
import { TripBudget } from "./TripBudget";
import { useCheapFare } from "./useCheapFare";

const CABINS: { c: Cabin; label: string }[] = [
  { c: "eco", label: "Economy" },
  { c: "biz", label: "Business" },
];

/** Today + 60 days on the client; empty during the server render (dates can't be prerendered). */
const noop = () => () => {};
function useDefaultDate() {
  return useSyncExternalStore(noop, () => defaultTripDate(), () => "");
}

function Links({ links }: { links: FareLink[] }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "2px 10px" }}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel={(l.aff ? "sponsored " : "") + "noopener noreferrer"} title={l.aff ? "Affiliate link" : undefined} style={{ color: "var(--accent)", fontWeight: 600 }}>
          {l.label} ↗{l.aff && "*"}
        </a>
      ))}
    </span>
  );
}

function cardLabel(plan: RoutePlan) {
  return plan.best ? shortBank(plan.best.prog.bank) + " " + plan.best.prog.card : "";
}

/** "I'm travelling to Kuwait": best card to use points, and best card to pay cash. */
export function DestinationFinder() {
  const { trip, setTrip, balances, values, mine, view } = useStore();
  const hits = useMemo(() => matchDestinations(trip.q), [trip.q]);
  const id = hits.length && !hits.some((d) => d.id === trip.id) ? hits[0].id : trip.id;
  const dest = DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[0];
  const fallbackDate = useDefaultDate();
  const date = trip.date || fallbackDate;
  const today = fallbackDate ? new Date().toISOString().slice(0, 10) : undefined;
  const cabinName = trip.cabin === "biz" ? "Business" : "Economy";
  // Cheapest recent fare (economy only); used unless the user typed a fare
  const found = useCheapFare(trip.from, dest.code, date, trip.cabin === "eco");
  const foundPrice = found.status === "ok" ? found.fare.price : 0;
  const fare = trip.fare || foundPrice || dest.fare[trip.cabin];
  const fareSource = trip.fare ? "Your fare" : foundPrice ? "Cheapest found on Aviasales" : "Rough estimate: type the real fare";
  const pax = trip.pax || 1;
  const fromName = ORIGINS.find((o) => o.code === trip.from)?.name ?? trip.from;
  const leg = `${fromName} (${trip.from}) → ${dest.name} (${dest.code})`;
  const picks = trip.picks ?? [];
  const party = pax > 1 ? `${pax} travellers` : "1 traveller";
  const plans = useMemo(() => planDestination(dest, trip.cabin, fare, balances, values, mine, pax), [dest, trip.cabin, fare, balances, values, mine, pax]);
  const airline = dest.nonstop[trip.airline] || dest.nonstop[0];
  const payAll = useMemo(
    () => (airline ? rankCardsForBooking({ merchant: merchantFor(airline), amount: fare, values, mine }) : []),
    [airline, fare, values, mine],
  );
  // Your cards first; one card you don't hold only if it beats them
  const payRows = mine ? payAll.filter((r) => r.mine).slice(0, 3) : payAll.slice(0, 3);
  const payBetter = mine ? payAll.find((r) => !r.mine && r.best.v > (payRows[0]?.best.v ?? 0)) : undefined;
  const top = plans[0];

  return (
    <>
    <section className="finder deco deco-plane" aria-labelledby="destH">
      <div>
        <h2 id="destH" className="with-icon">
          <Icon name="plane" size={20} /> Travelling somewhere? Best card for the destination
        </h2>
        <p className="muted small" style={{ margin: "4px 0 0" }}>
          Flying to Kuwait, Bali or London, even on an airline that isn&apos;t a transfer partner? See every way to get there with points, and which card to pay with if you buy the ticket.
        </p>
      </div>
      <div className="f-in trip-in">
        <label>
          From
          <select value={trip.from} onChange={(e) => setTrip({ from: e.target.value, fare: 0 })}>
            {ORIGINS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          Where to?
          <input
            type="text"
            placeholder="kuwait, london, bali, tokyo…"
            autoComplete="off"
            value={trip.q}
            onChange={(e) => {
              const h = matchDestinations(e.target.value);
              setTrip({ q: e.target.value, airline: 0, fare: 0, ...(h.length ? { id: h[0].id } : {}) });
            }}
          />
        </label>
        <label>
          One-way cash fare per person (₹)
          <input type="number" min="0" step="500" inputMode="numeric" value={fare || ""} onChange={(e) => setTrip({ fare: Math.max(0, +e.target.value || 0) })} />
          <span className="small muted">
            {fareSource}
            {trip.fare > 0 && (foundPrice || dest.fare[trip.cabin]) ? (
              <>
                {" · "}
                <button type="button" className="link small" onClick={() => setTrip({ fare: 0 })}>
                  reset
                </button>
              </>
            ) : null}
          </span>
        </label>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div className="f-chips">
          {hits.map((d) => (
            <button key={d.id} type="button" className="chip" aria-pressed={d.id === id} onClick={() => setTrip({ id: d.id, q: d.name, airline: 0, fare: 0 })}>
              {d.name}
            </button>
          ))}
          {!hits.length && <span className="small muted" style={{ padding: "4px 10px" }}>Not in the list yet. Try the nearest big city or hub (e.g. Dubai, Singapore, London).</span>}
        </div>
        <div className="chips" role="group" aria-label="Cabin">
          {CABINS.map((c) => (
            <button key={c.c} type="button" className="chip" aria-pressed={trip.cabin === c.c} onClick={() => setTrip({ cabin: c.c, fare: 0 })}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="live-prices" style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--accent-soft)" }}>
        <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Date
          <input type="date" value={date} min={today} onChange={(e) => setTrip({ date: e.target.value, fare: 0 })} style={{ width: "auto", padding: "5px 8px" }} />
        </label>
        <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Dates
          <select value={trip.flex || 0} onChange={(e) => setTrip({ flex: +e.target.value || 0 })} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)" }}>
            <option value={0}>Exact</option>
            <option value={3}>± 3 days</option>
            <option value={7}>± 7 days</option>
          </select>
        </label>
        <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Travellers
          <select value={pax} onChange={(e) => setTrip({ pax: +e.target.value || 1 })} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {date && (
          <span className="small">
            <b>Live cash fares:</b> <Links links={cashFareLinks(trip.from, dest.code, date, cabinName)} />
          </span>
        )}
      </div>
      <CheapestFare lookup={found} cabin={trip.cabin} code={dest.code} simple={view === "simple"} />

      {dest.note && (
        <p className="small capnote" role="note" style={{ margin: 0, padding: "8px 12px", borderRadius: 8, background: "var(--brass-soft)", border: "1px solid var(--brass-line)" }}>
          ⚠ {dest.note}
        </p>
      )}

      {view === "simple" ? (
        <SimpleAnswer
          dest={dest}
          from={trip.from}
          fromName={fromName}
          cabin={trip.cabin}
          pax={pax}
          date={date}
          fare={fare}
          plan={top}
          payWith={payRows[0] ? { name: payRows[0].name, value: payRows[0].best.v } : undefined}
          seatLinks={top && date ? awardLinks(top.p, trip.from, dest.code, date) : []}
        />
      ) : (
      <>
      {top ? (
        <div className="f-win" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <div className="tag">
              {leg} · {trip.cabin === "biz" ? "business" : "economy"} one-way · {party} ·{" "}
              <Link href={`/fly/${destSlug(dest)}`}>{dest.name} page to share ↗</Link>
            </div>
            <h3>
              Use {cardLabel(top)} → {PARTNERS[top.p].n}
            </h3>
            <div className="big">
              {fmt(top.cardPts)} {top.best!.prog.unit}
            </div>
            <div className="small muted">
              {pax > 1 ? `Total for ${party} (${fmt(top.each)} ${PARTNERS[top.p].n} points each) · ` : ""}
              {priceBasis(top.r).label} · seats not checked
            </div>
            <p className="small">
              {top.r.pricing === "revenue"
                ? `${PARTNERS[top.p].n} points pay the fare directly: about ${fmt(top.miles)} points for ${pax > 1 ? `${pax} tickets at ${inr(fare)} each` : `a ${inr(fare)} ticket`}.`
                : `Transfer at ${ratioTxt(top.best!.ratio)} for ${fmt(top.miles)} ${PARTNERS[top.p].n} points${top.r.confidence === "low" ? " (estimated price)" : ""}, then book ${top.r.airline}: ${top.r.route}.`}{" "}
              {top.canBook ? "Your cards cover it." : `You need ${fmt(top.short)} more partner points.`}
            </p>
            {top.r.pricing !== "revenue" && (
              <p className="small">
                Against a {inr(fare)} cash fare that&apos;s ₹{top.perPoint.toFixed(2)} a {PARTNERS[top.p].n} point
                {beatsValue(top, values) ? ", better than your set value. Use points." : ", below your set value. Paying cash and keeping the points may be better."}
              </p>
            )}
            {top.capLimited && <p className="small capnote">This needs more than the card&apos;s yearly Group {top.best!.grp} transfer cap allows.</p>}
            <OriginNote route={top.r.route} from={trip.from} fromName={fromName} />
            {top.r.note && <p className="small muted">{top.r.note}</p>}
            {top.r.pricing !== "revenue" && <BeforeTransfer plan={top} pax={pax} cabin={cabinName} date={date} flex={trip.flex || 0} links={date ? awardLinks(top.p, trip.from, dest.code, date) : []} />}
            <FareDetails airline={top.r.airline} cabin={trip.cabin} award={top.r.pricing !== "revenue"} />
          </div>
        </div>
      ) : (
        <p className="small muted">No transfer partner on your cards reaches {dest.name} in this cabin. Pay cash with the card below.</p>
      )}

      {plans.length > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          Your trip: <b>{leg}</b>. Each row shows the route the price was seen on; rows marked ✈ leave from another city.
          {" "}Tick up to {MAX_PICKS} options to compare them with paying cash in <a href="#plansH">Your trip plans</a> below.
        </p>
      )}
      {plans.length > 0 && (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Airline &amp; route</th>
                <th className="r">Partner pts{pax > 1 ? `, ${pax} people` : ""}</th>
                <th className="r">Best card</th>
                <th className="r">Card pts</th>
                <th>You can book</th>
                <th className="r">₹ / partner pt</th>
                <th>Seats for {pax}: not checked</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((pl, i) => (
                <tr key={pl.p + pl.r.route} className={i === 0 ? "top1" : undefined}>
                  <td>
                    <PartnerLink p={pl.p} />
                    {pl.best?.grp && <span className="grp">{pl.best.grp}</span>}
                    <label className="small cmp-pick">
                      <input type="checkbox" checked={picks.includes(optionKey(pl.r))} onChange={() => setTrip({ picks: togglePick(picks, optionKey(pl.r)) })} /> Compare
                    </label>
                  </td>
                  <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                    <div>{pl.r.airline}</div>
                    <div className="small muted">
                      {pl.r.route}
                      {pl.r.pricing === "dynamic" ? " · price varies by date" : pl.r.pricing === "revenue" ? " · points pay the fare" : ""}
                    </div>
                    <OriginNote route={pl.r.route} from={trip.from} fromName={fromName} />
                    <FareDetails airline={pl.r.airline} cabin={trip.cabin} award={pl.r.pricing !== "revenue"} />
                  </td>
                  <td className="r num" title={pl.r.note}>
                    {fmt(pl.miles)}
                    {pax > 1 && <div className="small muted">{fmt(pl.each)} each</div>}
                    <div>
                      <span className="pill basis" title={priceBasis(pl.r).label}>
                        {PRICE_TAG[priceBasis(pl.r).kind]}
                      </span>
                    </div>
                  </td>
                  <td className="r">
                    {cardLabel(pl)} <span className="small muted">({ratioTxt(pl.best!.ratio)})</span>
                  </td>
                  <td className="r num">{fmt(pl.cardPts)}</td>
                  <td>{pl.canBook ? <span className="pill ok">Yes</span> : <span className="pill no">Need {fmt(pl.short)}</span>}</td>
                  <td className="r num">{pl.r.pricing === "revenue" ? "—" : "₹" + pl.perPoint.toFixed(2)}</td>
                  <td className="small" style={{ whiteSpace: "normal", minWidth: 120 }}>
                    {date && <Links links={pl.r.pricing === "revenue" ? cashFareLinks(trip.from, dest.code, date, cabinName).slice(0, 1) : awardLinks(pl.p, trip.from, dest.code, date)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dest.nonstop.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 6 }}>Paying cash instead? Earn the most on the ticket</h3>
          <div className="f-chips" style={{ marginBottom: 10 }}>
            {dest.nonstop.map((a, i) => (
              <button key={a.airline} type="button" className="chip" aria-pressed={i === (dest.nonstop[trip.airline] ? trip.airline : 0)} onClick={() => setTrip({ airline: i })}>
                {a.airline}
              </button>
            ))}
          </div>
          {airline && <p className="small muted" style={{ margin: "0 0 8px" }}>Nonstop from {airline.from}. Earnings below are for one {inr(fare)} ticket.</p>}
          <div className="f-list">
            {payRows.map((r) => (
              <div className="f-row" key={r.prog!.key} style={{ gridTemplateColumns: "1fr auto" }}>
                <div>
                  <div>
                    {r.name} · earns {fmt(r.pts)} {r.prog!.unit}
                  </div>
                  <div className="via">{r.best.via}</div>
                </div>
                <div className="val">
                  {inr(r.best.v)}
                  <div className="pct">{((r.best.v / fare) * 100).toFixed(1)}% back</div>
                </div>
              </div>
            ))}
            {payBetter && (
              <p className="small" style={{ margin: "4px 0 0" }}>
                Worth a look: <b>{payBetter.name}</b> would earn {inr(payBetter.best.v)} ({((payBetter.best.v / fare) * 100).toFixed(1)}%) on this ticket.
              </p>
            )}
          </div>
        </div>
      )}

      <p className="small muted">
        Points cover {party}, one-way, {trip.cabin === "biz" ? "business" : "economy"}; the cash fare is per person. Award prices are one-way lows checked {dest.checked}: &quot;chart&quot; is the published chart, &quot;lowest seen&quot; moves by date, &quot;est.&quot; is estimated from nearby routes. No seat is checked or held here. Taxes are extra and seats at that price are limited. The cash fare is a rough starting value: type the real one. Check the seat on the airline&apos;s site before transferring: transfers can&apos;t be reversed. Sources: {dest.src}.
      </p>
      </>
      )}
    </section>
    {view === "detailed" && <TripBudget dest={dest} cabin={trip.cabin} fare={fare} fareNote={fareSource} />}
    </>
  );
}

function CheapestFare({ lookup, cabin, code, simple }: { lookup: ReturnType<typeof useCheapFare>; cabin: Cabin; code: string; simple: boolean }) {
  const note = (
    <p className="small muted" style={{ margin: "-6px 0 0" }}>
      Open a fare site and type the price you see into &quot;One-way cash fare&quot;: the {simple ? "answer below updates" : "₹-per-point figures update"} to that fare.
    </p>
  );
  if (cabin === "biz") return <p className="small muted" style={{ margin: "-6px 0 0" }}>Cheapest-fare lookup covers economy only. For business, open a fare site and type the price you see.</p>;
  if (lookup.status === "off") return note;
  if (lookup.status === "loading") return <p className="small muted" style={{ margin: "-6px 0 0" }}>Looking up the cheapest fare…</p>;
  if (lookup.status === "none" || lookup.status === "error")
    return (
      <p className="small muted" style={{ margin: "-6px 0 0" }}>
        {lookup.status === "none" ? "No recent fares found for this route and date." : lookup.message} Use the fare sites above and type the price.
      </p>
    );
  const f = lookup.fare;
  const when = f.departureAt ? new Date(f.departureAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
  const hrs = f.duration ? `${Math.floor(f.duration / 60)}h ${f.duration % 60}m` : "";
  return (
    <div className="f-row" style={{ gridTemplateColumns: "1fr auto", margin: "-4px 0 0", background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div>
        <div>
          <b>Cheapest found: {inr(f.price)}</b>
          {lookup.month ? ` (best in the month, on ${when})` : ""}
        </div>
        {f.destinationAirport && f.destinationAirport !== code && (
          <div className="small capnote">
            Lands at {f.destinationAirport}, not {code}: a nearby airport. Check the transfer before comparing.
          </div>
        )}
        <div className="via">
          {[f.airline && f.airline + (f.flightNumber ? " " + f.flightNumber : ""), f.transfers ? `${f.transfers} stop${f.transfers > 1 ? "s" : ""}` : "nonstop", hrs].filter(Boolean).join(" · ")}
          {" · found by Aviasales searches in the last 2 days; the price can change. Used for the ₹-per-point maths below."}
        </div>
        <div className="small capnote">Cheapest fares often leave out checked bags: compare the bag rules before comparing prices.</div>
        {f.airline && <FareDetails code={f.airline} cabin={cabin} />}
      </div>
      <a className="val" href={f.link} target="_blank" rel="noopener noreferrer sponsored" style={{ color: "var(--accent)", fontWeight: 700 }}>
        Book ↗
      </a>
    </div>
  );
}

/** Specific steps before moving points: find the seats, check what the award includes, then transfer. */
function BeforeTransfer({ plan, pax, cabin, date, flex, links }: { plan: RoutePlan; pax: number; cabin: string; date: string; flex: number; links: FareLink[] }) {
  const prog = PARTNERS[plan.p].n;
  const card = plan.best!;
  return (
    <div className="pre-transfer small" role="note">
      <h4>Before you transfer</h4>
      <ol>
        <li>
          Find {pax > 1 ? `${pax} seats` : "the seat"} in {cabin.toLowerCase()}
          {date ? ` on ${date}${flex ? ` or up to ${flex} days either side (search each date)` : ""}` : ""} at {fmt(plan.each)} {prog} points{pax > 1 ? " each" : ""}
          {links.length > 0 && (
            <>
              {" "}
              (<Links links={links} />)
            </>
          )}
          . Prices on this page are not live.
        </li>
        <li>Check the taxes and what the award includes: checked bag, cabin bag, seat choice and change fees (details below).</li>
        <li>
          Only then move {fmt(plan.cardPts)} {card.prog.unit} from {shortBank(card.prog.bank)} {card.prog.card} at {ratioTxt(card.ratio)}
          {plan.capLimited ? `; that is more than the yearly Group ${card.grp} cap allows, so split it across cards or years` : ""}. Transfers can&apos;t be reversed, and some take a day or more, so the price can change while you wait.
        </li>
      </ol>
    </div>
  );
}

/** Flags an award route that leaves from a different city than the one picked in From. */
function OriginNote({ route, from, fromName }: { route: string; from: string; fromName: string }) {
  const o = routeOrigin(route, from, fromName);
  if (o.fromYou !== false) return null;
  return (
    <div className="small capnote">
      ✈ Leaves {o.cities}, not {fromName}: add a flight there, or search {from} on the programme&apos;s site (price may differ).
    </div>
  );
}
