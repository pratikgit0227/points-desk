import { CODES, FARES, GUIDES, PARTNERS, SEATS_AERO, SITES, type FareSnapshot, type PartnerId, type Spot } from "@/lib/data";
import type { CashPrices, Ctx } from "./types";
import { pool, type Pool } from "./wallet";

export interface Fare {
  cash?: number;
  tax?: number;
  own?: boolean;
  snap?: FareSnapshot;
}

/** The user's own cash price wins over the weekly snapshot. */
export function fareFor(key: string, cashPrices: CashPrices): Fare {
  const own = cashPrices[key];
  if (own && own.cash) return { ...own, own: true };
  const f = FARES[key];
  if (f) return { cash: f.cash, tax: own?.tax || 0, snap: f };
  return own || {};
}

/** ₹ per partner point on a trip, after taxes paid on the award. */
export function perPoint(cash: number, tax: number, miles: number): number {
  return Math.max(0, cash - tax) / miles;
}

export interface TripItem {
  p: PartnerId;
  s: Spot;
  /** Index of the spot in its guide */
  i: number;
  pl: Pool;
  /** How many times the user can book it */
  n: number;
  /** Partner points still needed */
  short: number;
}

/** Trips to show: the biggest ones the user can afford, topped up with the closest misses. */
export function tripList(ctx: Ctx): TripItem[] {
  const items: TripItem[] = [];
  for (const [p, g] of Object.entries(GUIDES)) {
    if (ctx.filter !== "all" && PARTNERS[p as PartnerId].k !== ctx.filter) continue;
    const pl = pool(p, ctx.balances);
    if (!pl.srcs.length) continue;
    g.spots.forEach((s, i) => {
      if (!s.m) return;
      items.push({ p: p as PartnerId, s, i, pl, n: Math.floor(pl.total / s.m), short: Math.max(0, s.m - pl.total) });
    });
  }
  const can = items.filter((x) => x.n >= 1).sort((a, b) => b.s.m! - a.s.m!);
  const near = items.filter((x) => x.n < 1).sort((a, b) => a.short - b.short);
  return can.length ? can.slice(0, 12).concat(near.slice(0, Math.max(0, 6 - can.length))) : near.slice(0, 9);
}

export interface FareLink {
  label: string;
  href: string;
}

type Cabin = "first" | "business" | "premiumeconomy" | "economy";

function cabinOf(cab: string): Cabin {
  if (/suites|first/i.test(cab)) return "first";
  if (/business/i.test(cab)) return "business";
  if (/premium/i.test(cab)) return "premiumeconomy";
  return "economy";
}

function addDays(iso: string, days: number) {
  return new Date(new Date(iso).getTime() + days * 864e5).toISOString().slice(0, 10);
}

const CABIN_TXT: Record<Cabin, string> = { first: "first class ", business: "business class ", premiumeconomy: "premium economy ", economy: "" };
const MMT_CABIN: Record<Cabin, string> = { first: "F", business: "B", premiumeconomy: "PE", economy: "E" };

/**
 * Live cash-fare searches for a one-way flight on a date. `from` / `to` are
 * airport codes when known (for Skyscanner and MakeMyTrip), else city names.
 */
export function cashFareLinks(from: string, to: string, date: string, cabin: string, haveCodes = true): FareLink[] {
  const cab = cabinOf(cabin);
  const [y, m, d] = date.split("-");
  const out: FareLink[] = [
    { label: "Google Flights", href: "https://www.google.com/travel/flights?q=" + encodeURIComponent(`one way ${CABIN_TXT[cab]}flights from ${from} to ${to} on ${date}`) },
  ];
  if (haveCodes) {
    out.push({ label: "Skyscanner", href: `https://www.skyscanner.co.in/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${y.slice(2)}${m}${d}/?adultsv2=1&cabinclass=${cab}&rtn=0` });
    out.push({ label: "MakeMyTrip", href: `https://www.makemytrip.com/flight/search?itinerary=${from}-${to}-${d}/${m}/${y}&tripType=O&paxType=A-1_C-0_I-0&intl=true&cabinClass=${MMT_CABIN[cab]}` });
  }
  return out;
}

/** Award-seat searches for a programme on a route: seats.aero (if it covers the programme) and the programme's site. */
export function awardLinks(p: PartnerId, from: string, to: string, date: string): FareLink[] {
  const out: FareLink[] = [];
  if (SEATS_AERO.includes(p)) out.push({ label: "seats.aero", href: `https://seats.aero/search?origins=${from}&destinations=${to}&date=${date}` });
  const site = SITES[p];
  if (site) out.push({ label: new URL(site).hostname.replace(/^www\./, ""), href: site });
  return out;
}

/** Links to cash fares, award-seat search and the programme's site for one spot on a date. */
export function fareLinks(p: PartnerId, i: number, s: Spot, date: string): FareLink[] {
  const out: FareLink[] = [];
  const air = PARTNERS[p].k === "air";
  if (air) {
    const c = CODES[p + "|" + i];
    const from = c ? c[0] : (s.from || "").split(/[\/,]| via /)[0].trim();
    const to = c ? c[1] : s.to.split(/[\/,(]| or |, then /)[0].replace(/^Anywhere in /, "").trim();
    out.push(...cashFareLinks(from, to, date, s.cab, Boolean(c)));
    if (c && SEATS_AERO.includes(p)) out.push({ label: "Award seats: seats.aero", href: `https://seats.aero/search?origins=${c[0]}&destinations=${c[1]}&date=${date}` });
  } else {
    const name = s.to.split(/[\/,]/)[0].trim();
    const checkout = addDays(date, 1);
    out.push({ label: "Google Hotels", href: "https://www.google.com/travel/hotels?q=" + encodeURIComponent(`${name} ${date} to ${checkout}`) });
    out.push({ label: "Booking.com", href: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&checkin=${date}&checkout=${checkout}&group_adults=1&no_rooms=1` });
  }
  const site = SITES[p];
  if (site) out.push({ label: (air ? "Award search: " : "Points rate: ") + PARTNERS[p].n.split(" ")[0], href: site });
  return out;
}

/** Default search date: 60 days out. */
export function defaultTripDate(now = Date.now()): string {
  return new Date(now + 60 * 864e5).toISOString().slice(0, 10);
}
