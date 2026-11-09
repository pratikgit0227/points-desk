"use client";

import Link from "next/link";
import { beatsValue, routeOrigin, TAX_GUESS, type FareLink, type RoutePlan } from "@/lib/calc";
import { PARTNERS, type Cabin, type Destination } from "@/lib/data";
import { fmt, inr, shortBank } from "@/lib/format";
import { FareDetails } from "./FareDetails";
import { ICONS } from "./Icons";
import { useStore, type View } from "./store";

/** Simple / Detailed switch. */
export function ViewSwitch() {
  const { view, setView } = useStore();
  const opts: { v: View; label: string; hint: string }[] = [
    { v: "simple", label: "Beginner", hint: "One clear answer in plain words" },
    { v: "detailed", label: "Pro", hint: "Every option, ratio, cap and the full maths" },
  ];
  return (
    <div className="view-wrap">
      <span className="small muted">View:</span>
    <div className="chips view-switch" role="group" aria-label="Beginner or Pro view">
      {opts.map((o) => (
        <button key={o.v} type="button" className="chip" aria-pressed={view === o.v} title={o.hint} onClick={() => setView(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
    </div>
  );
}

export interface PassProps {
  dest: Destination;
  from: string;
  fromName: string;
  cabin: Cabin;
  pax: number;
  date: string;
  fare: number;
  plan: RoutePlan | undefined;
  /** Best card to pay cash with, if no points option */
  payWith?: { name: string; value: number };
  seatLinks: FareLink[];
}

function when(date: string) {
  if (!date) return "Date not set";
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** The beginner's answer: one boarding-pass card with what to do, in plain words. */
export function SimpleAnswer({ dest, from, fromName, cabin, pax, date, fare, plan, payWith, seatLinks }: PassProps) {
  const { values, setView } = useStore();
  const cabinWord = cabin === "biz" ? "Business" : "Economy";
  const people = pax > 1 ? `${pax} people` : "1 person";
  const cash = fare * pax;
  const revenue = plan?.r.pricing === "revenue";
  const tax = plan && !revenue ? TAX_GUESS[cabin] * pax : 0;
  const good = plan ? revenue || beatsValue(plan, values) : false;
  const card = plan?.best ? `${shortBank(plan.best.prog.bank)} ${plan.best.prog.card}` : "";
  const prog = plan ? PARTNERS[plan.p].n : "";
  const elsewhere = plan ? routeOrigin(plan.r.route, from, fromName) : null;

  let headline: string;
  if (!plan) headline = "Pay cash for this one";
  else if (!plan.canBook) headline = `Almost: you need ${fmt(plan.short)} more points`;
  else if (!good) headline = "You can use points, but cash may be smarter";
  else headline = `Use your ${card} points`;

  return (
    <article className="pass" aria-label="Your answer">
      <div className="pass-stub">
        <div className="pass-label">Boarding pass · one-way</div>
        <div className="pass-route">
          <div>
            <div className="pass-code">{from}</div>
            <div className="pass-city">{fromName}</div>
          </div>
          <svg className="pass-arc" viewBox="0 0 120 40" aria-hidden="true">
            <path d="M4 34 Q60 -6 116 34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
            <path d={ICONS.plane} fill="currentColor" transform="translate(49 -3) scale(.95) rotate(90 12 12)" />
          </svg>
          <div style={{ textAlign: "right" }}>
            <div className="pass-code">{dest.code}</div>
            <div className="pass-city">{dest.name}</div>
          </div>
        </div>
        <dl className="pass-meta">
          <div>
            <dt>Date</dt>
            <dd>{when(date)}</dd>
          </div>
          <div>
            <dt>Class</dt>
            <dd>{cabinWord}</dd>
          </div>
          <div>
            <dt>Travellers</dt>
            <dd>{pax}</dd>
          </div>
        </dl>
      </div>

      <div className="pass-body">
        <div className="pass-label">Our answer</div>
        <h3 className="pass-head">{headline}</h3>

        {plan ? (
          <ul className="pass-facts">
            {revenue ? (
              <li>
                Pay the fare with <b>{fmt(plan.miles)} {prog} points</b> for {people}.
              </li>
            ) : (
              <li>
                Move <b>{fmt(plan.cardPts)} {plan.best!.prog.unit}</b> from your {card} card to <b>{prog}</b>, then book {plan.r.airline} for {people}.
              </li>
            )}
            {!revenue && (
              <li>
                You still pay about <b>{inr(tax)}</b> in taxes and fees (estimate).
              </li>
            )}
            <li>
              Buying the tickets would cost about <b>{inr(cash)}</b>, so points save you about <b>{inr(Math.max(0, cash - tax))}</b>.
            </li>
            <li>
              Good value?{" "}
              {good ? (
                <b>Yes ✓</b>
              ) : (
                <>
                  <b>Not really.</b> Your points are worth more on other trips, so paying cash and keeping them may be smarter.
                </>
              )}
            </li>
            {elsewhere?.fromYou === false && <li className="capnote">This price is for flights from {elsewhere.cities}, not {fromName}. You may need a flight there first.</li>}
          </ul>
        ) : (
          <p className="small" style={{ margin: 0 }}>
            None of your cards&apos; points reach {dest.name} in {cabinWord.toLowerCase()}.
            {payWith ? (
              <>
                {" "}
                Pay with <b>{payWith.name}</b>: it gives back about <b>{inr(payWith.value)}</b> in points on this ticket.
              </>
            ) : null}
          </p>
        )}

        {plan && !revenue && (
          <ol className="pass-steps">
            <li>
              <b>Find the seat first.</b> Search {date ? when(date) : "your date"} for {pax > 1 ? `${pax} seats` : "a seat"}
              {seatLinks.length > 0 && (
                <>
                  {" "}
                  on{" "}
                  {seatLinks.map((l, i) => (
                    <span key={l.label}>
                      {i > 0 && " or "}
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label} ↗
                      </a>
                    </span>
                  ))}
                </>
              )}
              . Our prices are recent lows, not live.
            </li>
            <li>
              <b>Check bags and taxes</b> on that seat.
            </li>
            <li>
              <b>Then move the points.</b> A transfer can&apos;t be undone.
            </li>
          </ol>
        )}
        {plan && <FareDetails airline={plan.r.airline} cabin={cabin} award={!revenue} />}

        <div className="pass-foot">
          <button type="button" className="link" onClick={() => setView("detailed")}>
            Switch to Pro view: all options and the maths →
          </button>
          <Link href="/learn#points-101">New to points? Start here</Link>
        </div>
      </div>
    </article>
  );
}
