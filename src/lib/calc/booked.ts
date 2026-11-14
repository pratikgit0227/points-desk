import { BAGGAGE, DESTINATIONS, ORIGINS, PARTNERS, type Cabin, type Destination } from "@/lib/data";
import { planDestination } from "./destinations";
import { priceBasis } from "./fareinfo";
import { TAX_GUESS } from "./plans";
import type { Balances, Values } from "./types";
import { valueOf } from "./wallet";

/**
 * Flights the user already booked (here or anywhere else), kept in the
 * browser. We re-check the cheapest cash fare and the points price for the
 * same flight and say when rebooking could save money. Nothing is booked,
 * cancelled or refunded for the user: they decide and do it themselves.
 */

export interface FareSeen {
  /** YYYY-MM-DD the fare was found */
  at: string;
  /** One-way economy fare per person, ₹ */
  price: number;
  airline: string;
  link: string;
}

export interface BookedTrip {
  id: string;
  /** Airport codes, one flight (add the return as its own booking) */
  from: string;
  to: string;
  /** YYYY-MM-DD departure */
  date: string;
  cabin: Cabin;
  pax: number;
  /** What the user paid per person for this flight, ₹ */
  paid: number;
  /** Cancellation or change fee per person, ₹ (0 = free or not known) */
  fee: number;
  /** Airline name, if known */
  airline: string;
  /** YYYY-MM-DD added */
  added: string;
  /** Latest cash fare check */
  last?: FareSeen;
  /** Lowest cash fare seen since adding */
  low?: FareSeen;
}

/** Ignore savings smaller than this per person: not worth the hassle of rebooking. */
export const MIN_SAVING = 500;

export const isUpcoming = (b: Pick<BookedTrip, "date">, today: string) => b.date >= today;

/** Records a new cash fare check: keeps the latest and the lowest seen. */
export function recordFare(b: BookedTrip, seen: FareSeen): BookedTrip {
  const low = !b.low || seen.price < b.low.price ? seen : b.low;
  return { ...b, last: seen, low };
}

export interface CashCheck {
  /** Fare found now, per person */
  now: number;
  /** Saving per person after the fee (can be negative) */
  each: number;
  /** Saving for everyone after fees */
  total: number;
  worth: boolean;
}

/** What rebooking at `now` would save after the fee. */
export function cashCheck(b: Pick<BookedTrip, "paid" | "fee" | "pax">, now: number): CashCheck {
  const each = b.paid - now - b.fee;
  return { now, each, total: each * b.pax, worth: b.paid > 0 && each >= MIN_SAVING };
}

/** The destination for a booking: its far-end airport, with India at the other end. */
export function bookedDestination(b: Pick<BookedTrip, "from" | "to">): Destination | null {
  const inIndia = (c: string) => ORIGINS.some((o) => o.code === c);
  const far = inIndia(b.from) ? b.to : inIndia(b.to) ? b.from : "";
  return DESTINATIONS.find((d) => d.code === far) ?? null;
}

export interface PointsCheck {
  title: string;
  /** Partner points for everyone */
  miles: number;
  /** Card points for everyone, and the card */
  cardPts: number;
  card: string;
  /** Award taxes for everyone (estimate) */
  tax: number;
  /** Cash back if the booking is cancelled, minus taxes paid on the award */
  saved: number;
  /** ₹ saved per partner point, and the user's value for that point */
  perPt: number;
  myValue: number;
  short: number;
  beats: boolean;
  /** Price is a published chart price, not an estimate or lowest-seen */
  chart: boolean;
}

/**
 * Best points option for the same trip: cancel the cash ticket (paying the
 * fee) and book an award. Only for destinations we list.
 */
export function pointsCheck(b: BookedTrip, balances: Balances, values: Values = {}, mine: readonly string[] | null = null): PointsCheck | null {
  const d = bookedDestination(b);
  if (!d || b.paid <= 0) return null;
  const refund = (b.paid - b.fee) * b.pax;
  const out: PointsCheck[] = [];
  for (const pl of planDestination(d, b.cabin, b.paid, balances, values, mine, b.pax)) {
    if (!pl.best || pl.capLimited) continue;
    const revenue = pl.r.pricing === "revenue";
    const tax = revenue ? 0 : TAX_GUESS[b.cabin] * b.pax;
    const saved = refund - tax;
    const perPt = pl.miles ? saved / pl.miles : 0;
    const myValue = valueOf(values, pl.p);
    out.push({
      title: `${PARTNERS[pl.p].n} via ${pl.best.prog.bank.replace(" Bank", "")} ${pl.best.prog.card}`,
      miles: pl.miles,
      cardPts: pl.cardPts,
      card: pl.best.prog.unit,
      tax,
      saved,
      perPt,
      myValue,
      short: pl.short,
      beats: saved > 0 && perPt >= myValue,
      chart: priceBasis(pl.r).kind === "chart",
    });
  }
  // Options the user can book now that beat their value, best saving first; else the best per point
  out.sort((x, y) => Number(y.beats && !y.short) - Number(x.beats && !x.short) || y.perPt - x.perPt);
  return out[0] ?? null;
}

/** Upcoming bookings whose last cash check shows a saving worth rebooking for. */
export function bookedNews(list: readonly BookedTrip[], today: string): number {
  return list.filter((b) => isUpcoming(b, today) && b.last && cashCheck(b, b.last.price).worth).length;
}

// ---------- paste a booking email ----------

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export interface ParsedBooking {
  from?: string;
  to?: string;
  date?: string;
  paid?: number;
  pax?: number;
  airline?: string;
}

const NOT_AIRPORTS = new Set(["PNR", "INR", "USD", "GST", "ADT", "CHD", "INF", "AND", "THE", "FOR", "YOU", "PAX", "TAX"]);

function isoDate(y: number, m: number, d: number): string | undefined {
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const money = (s: string) => Math.round(parseFloat(s.replace(/,/g, "")));

/**
 * Pulls route, date, amount, travellers and airline out of pasted booking
 * text (an e-ticket or confirmation email). Runs in the browser; the text is
 * never stored or sent. Anything not found is left out for the user to fill.
 */
export function parseBooking(text: string): ParsedBooking {
  const out: ParsedBooking = {};
  const t = text.replace(/\s+/g, " ");

  // Route: "DEL → DXB", "DEL-DXB", "DEL to DXB", "(DEL) ... (DXB)"
  const route = [...t.matchAll(/\b([A-Z]{3})\b\s*(?:-|–|—|→|->|>|to)\s*\b([A-Z]{3})\b/g)].find((m) => !NOT_AIRPORTS.has(m[1]) && !NOT_AIRPORTS.has(m[2]) && m[1] !== m[2]);
  if (route) {
    out.from = route[1];
    out.to = route[2];
  } else {
    const codes = [...t.matchAll(/\(([A-Z]{3})\)/g)].map((m) => m[1]).filter((c) => !NOT_AIRPORTS.has(c));
    if (codes.length >= 2 && codes[0] !== codes[1]) {
      out.from = codes[0];
      out.to = codes[1];
    }
  }

  // Date: first of "2027-01-14", "14 Jan 2027", "14-Jan-27", "Jan 14, 2027"
  const dates: { at: number; iso?: string }[] = [];
  for (const m of t.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) dates.push({ at: m.index!, iso: isoDate(+m[1], +m[2], +m[3]) });
  for (const m of t.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?[\s\-/]*([A-Za-z]{3})[a-z]*[\s\-/,']*(\d{4}|\d{2})\b/g)) {
    const mo = MONTHS.indexOf(m[2].toLowerCase());
    if (mo >= 0) dates.push({ at: m.index!, iso: isoDate(+m[3], mo + 1, +m[1]) });
  }
  for (const m of t.matchAll(/\b([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})\b/g)) {
    const mo = MONTHS.indexOf(m[1].toLowerCase());
    if (mo >= 0) dates.push({ at: m.index!, iso: isoDate(+m[3], mo + 1, +m[2]) });
  }
  out.date = dates.filter((d) => d.iso).sort((a, b) => a.at - b.at)[0]?.iso;

  // Amount: after "total" / "amount paid" / "grand total"; else the largest rupee amount
  const amt = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/gi;
  const total = t.match(/(?:grand total|total amount|amount paid|total paid|total fare|total)\D{0,20}?(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i);
  if (total) out.paid = money(total[1]);
  else {
    const all = [...t.matchAll(amt)].map((m) => money(m[1])).filter((n) => n > 0);
    if (all.length) out.paid = Math.max(...all);
  }

  const pax = t.match(/\b(\d)\s*(?:adults?|passengers?|travell?ers?|pax)\b/i);
  if (pax) out.pax = Math.min(9, Math.max(1, +pax[1]));

  const lower = t.toLowerCase();
  const airline = BAGGAGE.find((a) => [a.name, ...(a.aka ?? [])].some((n) => lower.includes(n.toLowerCase())));
  if (airline) out.airline = airline.name;

  return out;
}
