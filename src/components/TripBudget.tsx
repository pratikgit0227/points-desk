"use client";

import { useMemo } from "react";
import { planBudget, TAX_GUESS, type BudgetItem } from "@/lib/calc";
import {
  PARTNERS,
  type Cabin,
  type Destination,
  type PartnerId,
} from "@/lib/data";
import { fmt, inr, shortBank } from "@/lib/format";
import { usePersisted } from "@/lib/persisted";
import { Icon } from "./Icons";
import { useStore } from "./store";

interface BudgetPrefs {
  travellers: number;
  legs: 1 | 2;
  /** 0 = use the default estimate for the cabin */
  tax: number;
  nights: number;
  hotelCash: number;
  hotelP: PartnerId | "any";
  hotelPts: number;
}

const PREFS: BudgetPrefs = {
  travellers: 2,
  legs: 2,
  tax: 0,
  nights: 3,
  hotelCash: 0,
  hotelP: "any",
  hotelPts: 0,
};
const HOTELS = (Object.keys(PARTNERS) as PartnerId[]).filter(
  (p) => PARTNERS[p].k === "hotel",
);

function NumIn({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ""}
        placeholder="0"
        onChange={(e) =>
          onChange(
            Math.max(min, Math.min(max ?? Infinity, +e.target.value || 0)),
          )
        }
      />
    </label>
  );
}

/** Group identical bookings: "3 tickets with points via KrisFlyer". */
function group(items: BudgetItem[]) {
  const out: { item: BudgetItem; n: number }[] = [];
  for (const it of items) {
    const sig = (x: BudgetItem) =>
      x.kind +
      "|" +
      (x.pts
        ? x.pts.p +
          x.pts.what +
          x.pts.draws.map((d) => d.prog.key + d.cardPts).join()
        : "cash");
    const g = out.find((o) => sig(o.item) === sig(it));
    if (g) g.n++;
    else out.push({ item: it, n: 1 });
  }
  return out;
}

/** Flights + hotel for the trip: what to pay with points, what with cash, and the total. */
export function TripBudget({
  dest,
  cabin,
  fare,
  fareNote,
}: {
  dest: Destination;
  cabin: Cabin;
  fare: number;
  fareNote: string;
}) {
  const { balances, values, usingExample, trip, setTrip } = useStore();
  const [saved, setPrefs] = usePersisted("pd_budget", PREFS);
  // Travellers live with the trip so the finder and the budget always cover the same party
  const b = { ...PREFS, ...saved, travellers: trip.pax || 1, legs: trip.legs || 2 };
  const set = (patch: Partial<BudgetPrefs>) =>
    setPrefs((prev) => ({ ...PREFS, ...prev, ...patch }));
  const awardTax = b.tax || TAX_GUESS[cabin];

  const r = useMemo(
    () =>
      planBudget({
        dest,
        cabin,
        fare,
        travellers: b.travellers,
        legs: b.legs,
        awardTax,
        nights: b.nights,
        hotelCash: b.hotelCash,
        hotelP: b.hotelP,
        hotelPts: b.hotelPts,
        balances,
        values,
      }),
    [
      dest,
      cabin,
      fare,
      b.travellers,
      b.legs,
      awardTax,
      b.nights,
      b.hotelCash,
      b.hotelP,
      b.hotelPts,
      balances,
      values,
    ],
  );
  const tickets = b.travellers * b.legs;
  const hasPoints = Object.values(balances).some((x) => x.n > 0);
  const cashLeft = r.items.filter((x) => !x.pts);

  return (
    <section className="panel budget deco deco-bed" aria-labelledby="budgetH">
      <h2 id="budgetH" className="with-icon">
        <Icon name="bed" size={20} /> Trip budget: {dest.name}
      </h2>
      <p className="small muted" style={{ margin: 0 }}>
        Flights and hotel together. Your points go where they save the most
        rupees, and only where that beats using them directly. Everything else
        is paid in cash.
      </p>

      <div className="pick-in budget-in">
        <NumIn
          label="Travellers"
          value={b.travellers}
          min={1}
          max={9}
          onChange={(n) => setTrip({ pax: n || 1 })}
        />
        <label>
          Trip
          <select
            value={b.legs}
            onChange={(e) => setTrip({ legs: +e.target.value === 1 ? 1 : 2 })}
          >
            <option value={2}>Return</option>
            <option value={1}>One-way</option>
          </select>
        </label>
        <NumIn
          label="Award taxes per ticket (₹)"
          value={awardTax}
          step={500}
          onChange={(n) => set({ tax: n })}
        />
        <NumIn
          label="Hotel nights"
          value={b.nights}
          max={30}
          onChange={(n) => set({ nights: n })}
        />
        <NumIn
          label="Hotel price a night (₹)"
          value={b.hotelCash}
          step={500}
          onChange={(n) => set({ hotelCash: n })}
        />
        <label>
          Hotel chain
          <select
            value={b.hotelP}
            onChange={(e) =>
              set({ hotelP: e.target.value as PartnerId | "any", hotelPts: 0 })
            }
          >
            <option value="any">Any (best for my points)</option>
            {HOTELS.map((p) => (
              <option key={p} value={p}>
                {PARTNERS[p].n}
              </option>
            ))}
          </select>
        </label>
        {b.hotelP !== "any" && (
          <NumIn
            label="Points a night (from the hotel site)"
            value={b.hotelPts}
            step={1000}
            onChange={(n) => set({ hotelPts: n })}
          />
        )}
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Flight: {inr(fare)} a person one-way ({fareNote.toLowerCase()}),{" "}
        {tickets} ticket{tickets > 1 ? "s" : ""}.{" "}
        {b.hotelCash ? "" : "Add the hotel price to include the hotel. "}
        Award taxes default to a rough {inr(TAX_GUESS[cabin])} a ticket; check
        the airline&apos;s site.
      </p>

      <div className="budget-sum">
        <div>
          <div className="eyebrow">All in cash</div>
          <div className="big num">{inr(r.allCash)}</div>
        </div>
        <div>
          <div className="eyebrow">With your points</div>
          <div className="big num">{inr(r.cashPaid)}</div>
          <div className="small muted">
            cash
            {r.used.length
              ? " + " +
                r.used
                  .map(
                    (u) =>
                      `${fmt(u.cardPts)} ${shortBank(u.prog.bank)} ${u.prog.unit}`,
                  )
                  .join(" + ")
              : ""}
          </div>
        </div>
        <div>
          <div className="eyebrow">You save</div>
          <div className="big num good">{inr(r.saved)}</div>
          {r.givenUp > 0 && (
            <div className="small muted">
              Those points would fetch {inr(r.givenUp)} used directly
            </div>
          )}
        </div>
      </div>

      {!hasPoints ? (
        <p className="small capnote">
          Enter your points balances on the My Wallet tab to see what they
          cover.
        </p>
      ) : (
        usingExample && (
          <p className="small capnote">
            Using the example balances. Enter your own on the My Wallet tab.
          </p>
        )
      )}

      <ul className="budget-lines">
        {group(r.items).map(({ item: x, n }, i) => (
          <li key={i} className={x.pts ? "pts" : "cash"}>
            <span className="b-what">
              {x.kind === "flight" ? "✈" : "🏨"} {n}{" "}
              {x.kind === "flight"
                ? n > 1
                  ? "tickets"
                  : "ticket"
                : n > 1
                  ? "nights"
                  : "night"}{" "}
              {x.pts ? "with points" : "in cash"}
              {x.pts && (
                <span className="small muted">
                  {" "}
                  · {x.pts.what}: {fmt(x.pts.miles)} {PARTNERS[x.pts.p].n}{" "}
                  points each{x.pts.est ? " (estimate)" : ""}, from{" "}
                  {x.pts.draws
                    .map(
                      (d) =>
                        `${fmt(d.cardPts)} ${shortBank(d.prog.bank)} ${d.prog.card}`,
                    )
                    .join(" + ")}
                </span>
              )}
            </span>
            <span className="b-amt num">
              {x.pts
                ? x.pts.tax
                  ? `${inr(x.pts.tax * n)} taxes`
                  : "₹0"
                : inr(x.cash * n)}
            </span>
          </li>
        ))}
      </ul>

      {hasPoints && cashLeft.length > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          The {cashLeft.length} booking{cashLeft.length > 1 ? "s" : ""} in cash:
          either your points have run out (or hit a yearly transfer cap), or
          they&apos;re worth more used directly, for example on your bank&apos;s
          travel portal.
        </p>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        Award seats at these prices are limited: find the seats first, then
        transfer. Hotel points are estimated from the cash price unless you pick
        a chain and type its points price.
      </p>
    </section>
  );
}
