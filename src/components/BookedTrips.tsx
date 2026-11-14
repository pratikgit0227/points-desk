"use client";

import { useEffect, useRef, useState } from "react";
import { cashCheck, isUpcoming, parseBooking, pointsCheck, recordFare, type BookedTrip, type FareSeen } from "@/lib/calc";
import { BAGGAGE, type Cabin } from "@/lib/data";
import { fmt, inr, longDate } from "@/lib/format";
import { usePersisted, useToday } from "@/lib/persisted";
import { Icon } from "./Icons";
import { useStore } from "./store";
import type { CheapFare } from "./useCheapFare";

const NONE: BookedTrip[] = [];
const today = () => new Date().toISOString().slice(0, 10);
const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

interface Draft {
  from: string;
  to: string;
  date: string;
  cabin: Cabin;
  pax: number;
  /** Totals for everyone, as on the booking */
  total: number;
  feeTotal: number;
  airline: string;
}

const EMPTY: Draft = { from: "", to: "", date: "", cabin: "eco", pax: 1, total: 0, feeTotal: 0, airline: "" };
const code = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);

/**
 * Track a flight already booked (here or anywhere): we re-check the cheapest
 * cash fare once a day while the page is open and compare the points price,
 * and say when rebooking would save money after the cancellation fee.
 */
export function BookedTrips() {
  const [list, setList] = usePersisted("pd_booked", NONE);
  const [adding, setAdding] = useState(false);
  const [off, setOff] = useState(false);
  const now = useToday();
  const upcoming = list.filter((b) => isUpcoming(b, now));
  const past = list.length - upcoming.length;

  // One cash fare check a day per upcoming economy booking
  const due = upcoming.filter((b) => b.cabin === "eco" && b.last?.at !== now).map((b) => b.id).join(",");
  const asked = useRef(new Set<string>());
  useEffect(() => {
    for (const b of list.filter((x) => due.split(",").includes(x.id) && !asked.current.has(x.id))) {
      asked.current.add(b.id);
      fetch(`/api/fares?from=${b.from}&to=${b.to}&date=${b.date}`)
        .then(async (res) => {
          if (res.status === 501) return setOff(true);
          if (!res.ok) return;
          const body = (await res.json()) as { fares?: CheapFare[]; month?: boolean };
          // Only a fare on the same day into the same airport is like-for-like
          const f = body.month ? undefined : body.fares?.find((x) => x.destinationAirport === b.to);
          const seen: FareSeen = f ? { at: today(), price: f.price, airline: f.airline, link: f.link } : { at: today(), price: 0, airline: "", link: "" };
          setList((prev) => prev.map((x) => (x.id !== b.id ? x : f ? recordFare(x, seen) : { ...x, last: seen })));
        })
        .catch(() => {});
    }
  }, [due]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (d: Draft) => {
    const pax = Math.max(1, d.pax);
    const b: BookedTrip = { id: newId(), from: d.from, to: d.to, date: d.date, cabin: d.cabin, pax, paid: Math.round(d.total / pax), fee: Math.round(d.feeTotal / pax), airline: d.airline, added: today() };
    setList((prev) => [b, ...prev].sort((x, y) => x.date.localeCompare(y.date)));
    setAdding(false);
  };

  return (
    <section className="panel" aria-labelledby="bookedH" id="booked">
      <h2 id="bookedH" className="with-icon">
        <Icon name="plane" size={20} /> Trips you already booked
      </h2>
      <p className="small muted" style={{ margin: 0 }}>
        Booked a flight here or anywhere else? Add it and we&apos;ll check whether the same flight got cheaper in cash, or whether points now beat what you paid, after the cancellation fee. We only tell you: nothing is booked or cancelled for you. Saved in this browser only.
      </p>

      {upcoming.map((b) => (
        <BookedCard key={b.id} b={b} off={off} onDelete={() => setList((prev) => prev.filter((x) => x.id !== b.id))} onChange={(patch) => setList((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...patch } : x)))} />
      ))}
      {past > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          {past} past trip{past > 1 ? "s" : ""} hidden.{" "}
          <button type="button" className="linkish" onClick={() => setList((prev) => prev.filter((x) => isUpcoming(x, now)))}>
            Remove {past > 1 ? "them" : "it"}
          </button>
        </p>
      )}

      {adding ? <AddBooked onAdd={add} onCancel={() => setAdding(false)} /> : (
        <div className="plan-actions">
          <button type="button" className={upcoming.length ? "" : "primary"} onClick={() => setAdding(true)}>
            Add a booked flight
          </button>
        </div>
      )}
    </section>
  );
}

function BookedCard({ b, off, onDelete, onChange }: { b: BookedTrip; off: boolean; onDelete: () => void; onChange: (patch: Partial<BookedTrip>) => void }) {
  const { balances, values, mine } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const cash = b.last && b.last.price > 0 ? cashCheck(b, b.last.price) : null;
  const pts = pointsCheck(b, balances, values, mine);
  const ptsWorth = pts && pts.beats && !pts.short;
  const news = Boolean(cash?.worth) || Boolean(ptsWorth);
  const who = b.pax > 1 ? ` for ${b.pax}` : "";

  return (
    <div className="plan-card">
      <div className="plan-head" style={{ justifyContent: "space-between" }}>
        <b>
          {b.from} → {b.to} · {longDate(b.date)}
        </b>
        <span className="small muted">
          {b.airline ? b.airline + " · " : ""}
          {b.cabin === "biz" ? "business" : "economy"} · {b.pax} traveller{b.pax > 1 ? "s" : ""}
        </span>
      </div>
      <div className="small muted">
        Paid {inr(b.paid * b.pax)}
        {who} · cancellation fee {b.fee ? inr(b.fee * b.pax) : "not set (free?)"} · added {longDate(b.added)}
      </div>

      {news && (
        <div className="plan-alerts" role="status">
          <b>🔔 You could save by rebooking</b>
          <ul>
            {cash?.worth && (
              <li>
                Cash: the same route on the same day was found for {inr(cash.now)} a person ({BAGGAGE.find((a) => a.iata === b.last!.airline)?.name ?? (b.last!.airline || "an airline")}). After the fee that&apos;s <b>{inr(cash.total)} less{who}</b>.{" "}
                <a href={b.last!.link} target="_blank" rel="noopener sponsored">
                  See the fare
                </a>
              </li>
            )}
            {ptsWorth && (
              <li>
                Points: <b>{pts.title}</b> for {fmt(pts.cardPts)} {pts.card}
                {who}. Cancelling and paying about {inr(pts.tax)} in taxes saves {inr(pts.saved)}, ₹{pts.perPt.toFixed(2)} a point (your value: ₹{pts.myValue.toFixed(2)}).
                {!pts.chart && " The points price is an estimate or the lowest seen, so check it first."}
              </li>
            )}
          </ul>
          <div className="small muted">Check the new fare&apos;s bags, times and rules, and your ticket&apos;s exact cancellation fee, before you cancel anything. Book the new ticket first, then cancel the old one.</div>
        </div>
      )}

      <div className="small">
        {b.cabin === "biz" ? (
          <span className="muted">Cash fares are checked for economy only.</span>
        ) : off ? (
          <span className="muted">Cash fare checks aren&apos;t set up on this site.</span>
        ) : !b.last ? (
          <span className="muted">Checking the cash fare…</span>
        ) : b.last.price === 0 ? (
          <span className="muted">No recent cash fare found for this exact day ({longDate(b.last.at)}). We&apos;ll look again tomorrow.</span>
        ) : (
          <span>
            Cheapest cash fare found {longDate(b.last.at)}: <b>{inr(b.last.price)}</b> a person
            {b.low && b.low.price < b.last.price ? `; lowest since you added it: ${inr(b.low.price)} on ${longDate(b.low.at)}` : ""}.{" "}
            <span className="muted">From recent Aviasales searches, not a live price.</span>
          </span>
        )}
      </div>
      {pts && !ptsWorth && (
        <div className="small muted">
          Points: {pts.title} would need {fmt(pts.cardPts)} {pts.card}
          {pts.short ? ` (you're short by ${fmt(pts.short)} partner points)` : ""}, worth ₹{pts.perPt.toFixed(2)} a point here against your ₹{pts.myValue.toFixed(2)} value, so keeping your ticket is better.
        </div>
      )}

      <div className="plan-actions">
        <label className="small" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          Cancellation fee (everyone, ₹)
          <input type="number" min={0} step={500} value={b.fee * b.pax || ""} style={{ width: 110 }} onChange={(e) => onChange({ fee: Math.max(0, Math.round((+e.target.value || 0) / b.pax)) })} />
        </label>
        {confirmDel ? (
          <>
            <button type="button" onClick={onDelete} style={{ color: "var(--bad)" }}>
              Yes, remove
            </button>
            <button type="button" onClick={() => setConfirmDel(false)}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmDel(true)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function AddBooked({ onAdd, onCancel }: { onAdd: (d: Draft) => void; onCancel: () => void }) {
  const now = useToday();
  const [d, setD] = useState<Draft>(EMPTY);
  const [paste, setPaste] = useState("");
  const [found, setFound] = useState("");
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const ok = d.from.length === 3 && d.to.length === 3 && d.from !== d.to && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.total > 0;

  const fill = () => {
    const p = parseBooking(paste);
    const got = [p.from && "route", p.date && "date", p.paid && "amount", p.pax && "travellers", p.airline && "airline"].filter(Boolean);
    set({ ...(p.from && { from: p.from, to: p.to }), ...(p.date && { date: p.date }), ...(p.paid && { total: p.paid }), ...(p.pax && { pax: p.pax }), ...(p.airline && { airline: p.airline }) });
    setFound(got.length ? `Filled in: ${got.join(", ")}. Check them below.` : "Couldn't read anything from that. Fill it in below.");
    setPaste("");
  };

  return (
    <div className="plan-card">
      <label className="small">
        <b>Paste your booking email or e-ticket</b> <span className="muted">(optional: read in your browser, never saved or sent)</span>
        <textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="e.g. DEL → DXB, 14 Jan 2027, 2 Adults, Grand Total ₹22,210" />
      </label>
      <div className="plan-actions">
        <button type="button" disabled={!paste.trim()} onClick={fill}>
          Fill in from the text
        </button>
        {found && <span className="small muted" role="status">{found}</span>}
      </div>
      <div className="pick-in budget-in">
        <label>
          From (airport code)
          <input type="text" value={d.from} placeholder="DEL" onChange={(e) => set({ from: code(e.target.value) })} />
        </label>
        <label>
          To (airport code)
          <input type="text" value={d.to} placeholder="DXB" onChange={(e) => set({ to: code(e.target.value) })} />
        </label>
        <label>
          Flight date
          <input type="date" value={d.date} min={now || undefined} onChange={(e) => set({ date: e.target.value })} />
        </label>
        <label>
          Cabin
          <select value={d.cabin} onChange={(e) => set({ cabin: e.target.value === "biz" ? "biz" : "eco" })}>
            <option value="eco">Economy</option>
            <option value="biz">Business</option>
          </select>
        </label>
        <label>
          Travellers
          <input type="number" min={1} max={9} value={d.pax} onChange={(e) => set({ pax: Math.min(9, Math.max(1, +e.target.value || 1)) })} />
        </label>
        <label>
          Total paid for this flight (₹)
          <input type="number" min={0} step={500} value={d.total || ""} onChange={(e) => set({ total: Math.max(0, +e.target.value || 0) })} />
        </label>
        <label>
          Cancellation fee, everyone (₹)
          <input type="number" min={0} step={500} value={d.feeTotal || ""} placeholder="0 if free" onChange={(e) => set({ feeTotal: Math.max(0, +e.target.value || 0) })} />
        </label>
        <label>
          Airline (optional)
          <input type="text" value={d.airline} maxLength={40} onChange={(e) => set({ airline: e.target.value })} />
        </label>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        One flight at a time. For a return ticket, add each way with half the price: cash fares are checked one way. The cancellation fee is on your ticket or the airline&apos;s fare rules.
      </p>
      <div className="plan-actions">
        <button type="button" className="primary" disabled={!ok} onClick={() => onAdd(d)}>
          Track this flight
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
