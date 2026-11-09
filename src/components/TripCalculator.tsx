"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { awardLinks, compareOptions, defaultTripDate, optionKey, recommend, type TripCore } from "@/lib/calc";
import { DESTINATIONS, ORIGINS, PARTNERS, type CreatorTrip, type PartnerId } from "@/lib/data";
import { CompareTable, tripOf, useAddPlan } from "./SavedPlans";
import { useStore } from "./store";

const noop = () => () => {};

/**
 * A follower's own version of a creator's trip: their departure city,
 * travellers and date, priced with their own cards and balances. Nothing they
 * enter is sent anywhere or shown to the creator.
 */
export function TripCalculator({ trip }: { trip: CreatorTrip }) {
  const store = useStore();
  const { balances, values, mine, usingExample, setTrip } = store;
  const router = useRouter();
  const addPlan = useAddPlan();
  const fallbackDate = useSyncExternalStore(noop, () => defaultTripDate(), () => "");
  const [from, setFrom] = useState(store.trip.from || "DEL");
  const [pax, setPax] = useState(store.trip.pax || 1);
  const [legs, setLegs] = useState<1 | 2>(2);
  const [dateIn, setDate] = useState("");
  const [saved, setSaved] = useState(false);
  const date = dateIn || fallbackDate;
  const dest = DESTINATIONS.find((d) => d.id === trip.dest)!;

  const core: TripCore = { dest: trip.dest, from, date, flex: 0, cabin: trip.cabin, pax, legs, fare: 0, picks: trip.picks };
  const rows = compareOptions(core, balances, values, mine);
  const rec = recommend(rows, values);
  const seatLinks = date
    ? trip.picks.flatMap((k) => {
        const r = dest.options.find((o) => optionKey(o) === k);
        return r && r.pricing !== "revenue" ? [{ p: r.p as PartnerId, links: awardLinks(r.p as PartnerId, from, dest.code, date) }] : [];
      })
    : [];

  return (
    <section className="panel deco deco-plane" aria-labelledby="calcH">
      <h2 id="calcH">Your version of this trip</h2>
      <p className="small muted" style={{ margin: 0 }}>
        Priced with your own cards and balances. They stay in this browser: the creator never sees them.
        {usingExample && (
          <>
            {" "}
            These are example balances; <Link href="/">add your cards</Link> for your real numbers.
          </>
        )}
      </p>
      <div className="calc-in">
        <label>
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          Travellers
          <select value={pax} onChange={(e) => setPax(+e.target.value || 1)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trip
          <select value={legs} onChange={(e) => setLegs(+e.target.value === 1 ? 1 : 2)}>
            <option value={2}>Return</option>
            <option value={1}>One-way</option>
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <CompareTable rows={rows} recKey={rec?.row.key} cabin={trip.cabin} />
      {rec && (
        <p className="small" style={{ margin: 0 }}>
          <span className="pill ok">For you</span> <b>{rec.row.title}</b>: {rec.why}.
        </p>
      )}

      {seatLinks.length > 0 && (
        <div className="small">
          <b>Check availability first</b> (prices here are recent lows, not live seats):
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {seatLinks.map((s) => (
              <li key={s.p}>
                {PARTNERS[s.p].n}:{" "}
                {s.links.map((l, i) => (
                  <span key={l.label}>
                    {i > 0 && " · "}
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="plan-actions">
        <button
          type="button"
          className="primary"
          disabled={saved}
          onClick={() => {
            addPlan(core, trip.title);
            setSaved(true);
          }}
        >
          {saved ? "Saved to your plans ✓" : "Save as my plan"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTrip(tripOf(core));
            router.push("/plan");
          }}
        >
          Open in the planner →
        </button>
      </div>
    </section>
  );
}
