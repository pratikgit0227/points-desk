import { z } from "zod";
import { DESTINATIONS, PARTNERS, PROGRAMS, canShowCard, type AwardRoute, type Cabin, type PartnerId, type Program } from "@/lib/data";
import { planDestination } from "./destinations";
import { priceBasis } from "./fareinfo";
import type { Balances, Values } from "./types";
import { valueOf } from "./wallet";

/**
 * Saved trip plans: kept in the browser only. A shared link carries the trip
 * (where, when, who, which options), never balances, cards or values.
 */

export type PlanStatus = "exploring" | "checking" | "ready" | "booked";
export const STATUSES: { s: PlanStatus; label: string }[] = [
  { s: "exploring", label: "Exploring" },
  { s: "checking", label: "Checking seats" },
  { s: "ready", label: "Ready to book" },
  { s: "booked", label: "Booked" },
];

/** The trip itself: everything a share link may carry. */
export interface TripCore {
  /** Destination id */
  dest: string;
  /** Departure airport code */
  from: string;
  /** YYYY-MM-DD, or empty */
  date: string;
  /** Flexible by ± days */
  flex: number;
  cabin: Cabin;
  pax: number;
  legs: 1 | 2;
  /** One-way cash fare per person, ₹ (0 = typical) */
  fare: number;
  /** Award options picked to compare (optionKey), at most MAX_PICKS */
  picks: string[];
}

export interface TripPlan extends TripCore {
  id: string;
  name: string;
  status: PlanStatus;
  /** Private: only shared if the user ticks it */
  notes: string;
  updated: string;
}

export const MAX_PICKS = 3;

export function optionKey(r: Pick<AwardRoute, "p" | "route">): string {
  return r.p + "|" + r.route;
}

/** Add or remove an option; keeps at most MAX_PICKS, dropping the oldest. */
export function togglePick(picks: readonly string[], key: string): string[] {
  if (picks.includes(key)) return picks.filter((k) => k !== key);
  return [...picks, key].slice(-MAX_PICKS);
}

// ---------- share links ----------

const shared = z.object({
  v: z.literal(1),
  name: z.string().max(80),
  dest: z.string().max(10).refine((id) => DESTINATIONS.some((d) => d.id === id), "unknown destination"),
  from: z.string().regex(/^[A-Z]{3}$/),
  date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  flex: z.number().int().min(0).max(14),
  cabin: z.enum(["eco", "biz"]),
  pax: z.number().int().min(1).max(9),
  legs: z.union([z.literal(1), z.literal(2)]),
  fare: z.number().min(0).max(5_000_000),
  picks: z.array(z.string().max(120)).max(MAX_PICKS),
  notes: z.string().max(500).optional(),
});
export type SharedTrip = z.infer<typeof shared>;

/** Exactly what a link carries. Notes only when asked. */
export function shareFields(p: TripPlan, withNotes = false): SharedTrip {
  const out: SharedTrip = { v: 1, name: p.name.slice(0, 80), dest: p.dest, from: p.from, date: p.date, flex: p.flex, cabin: p.cabin, pax: p.pax, legs: p.legs, fare: p.fare, picks: p.picks.slice(0, MAX_PICKS) };
  if (withNotes && p.notes.trim()) out.notes = p.notes.trim().slice(0, 500);
  return out;
}

function b64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeShare(t: SharedTrip): string {
  return b64url(JSON.stringify(t));
}

/** null for anything that isn't a valid shared trip. */
export function decodeShare(s: string): SharedTrip | null {
  try {
    const r = shared.safeParse(JSON.parse(unb64url(s)));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

// ---------- compare ----------

/** Typical award taxes and fees per person, one-way, from India (rough; varies by airline). */
export const TAX_GUESS: Record<Cabin, number> = { eco: 3500, biz: 9000 };

export interface CompareRow {
  key: string;
  kind: "cash" | "portal" | "transfer" | "revenue";
  title: string;
  sub: string;
  /** Rupees still paid: the fare, or award taxes (estimated) */
  cashPaid: number;
  /** Card points spent, and from which card */
  cardPts: number;
  prog: Program | null;
  /** Partner points (transfer / revenue) */
  partnerPts: number;
  partner: PartnerId | null;
  /** Card points or partner points still missing */
  short: number;
  /** Cash saved against paying cash */
  saved: number;
  /** ₹ each card point is worth in this option */
  perCardPt: number;
  /** How sure the price is */
  basis: string;
  /** Airline flying it, for bag rules */
  airline: string;
  capLimited: boolean;
  /** Price basis is an estimate or lowest-seen, not a chart */
  soft: boolean;
}

/** Best card for a fixed-value redemption: held card with points first, highest ₹ per point. */
function portalCard(balances: Balances, mine: readonly string[] | null): Program | null {
  const held = PROGRAMS.filter((p) => (balances[p.key]?.n ?? 0) > 0);
  const pool = held.length ? held : PROGRAMS.filter((p) => canShowCard(p.key, mine));
  return [...pool].sort((a, b) => b.base.v - a.base.v)[0] ?? null;
}

/**
 * Pay cash, use a card's fixed-value redemption, or transfer to each picked
 * partner — for the whole party and both legs on a return.
 */
export function compareOptions(t: TripCore, balances: Balances, values: Values = {}, mine: readonly string[] | null = null): CompareRow[] {
  const d = DESTINATIONS.find((x) => x.id === t.dest);
  if (!d) return [];
  const fare = t.fare || d.fare[t.cabin];
  const tickets = t.pax * t.legs;
  const cash = fare * tickets;
  const rows: CompareRow[] = [
    { key: "cash", kind: "cash", title: "Pay cash", sub: `${tickets} ticket${tickets > 1 ? "s" : ""} at ${fmtInr(fare)}`, cashPaid: cash, cardPts: 0, prog: null, partnerPts: 0, partner: null, short: 0, saved: 0, perCardPt: 0, basis: t.fare ? "Your fare" : "Typical fare: type the real one", airline: "", capLimited: false, soft: !t.fare },
  ];

  const pc = portalCard(balances, mine);
  if (pc && pc.base.v > 0) {
    const pts = Math.ceil(cash / pc.base.v);
    rows.push({ key: "portal", kind: "portal", title: `${pc.bank.replace(" Bank", "")} ${pc.card}: fixed value`, sub: pc.base.label, cashPaid: 0, cardPts: pts, prog: pc, partnerPts: 0, partner: null, short: Math.max(0, pts - (balances[pc.key]?.n ?? 0)), saved: cash, perCardPt: pc.base.v, basis: "Card's fixed rate; portal fares can be higher than elsewhere", airline: "", capLimited: false, soft: false });
  }

  // Same award price both ways on a return: plan for every ticket at once
  const plans = planDestination(d, t.cabin, fare, balances, values, mine, tickets);
  for (const key of t.picks) {
    const pl = plans.find((x) => optionKey(x.r) === key);
    if (!pl || !pl.best) continue;
    const revenue = pl.r.pricing === "revenue";
    const tax = revenue ? 0 : TAX_GUESS[t.cabin] * tickets;
    const saved = cash - tax;
    const b = priceBasis(pl.r);
    rows.push({
      key,
      kind: revenue ? "revenue" : "transfer",
      title: `${PARTNERS[pl.p].n} via ${pl.best.prog.bank.replace(" Bank", "")} ${pl.best.prog.card}`,
      sub: `${pl.r.airline}: ${pl.r.route}`,
      cashPaid: tax,
      cardPts: pl.cardPts,
      prog: pl.best.prog,
      partnerPts: pl.miles,
      partner: pl.p,
      short: pl.short,
      saved,
      perCardPt: pl.cardPts ? saved / pl.cardPts : 0,
      basis: revenue ? b.label : `${b.label}; taxes about ${fmtInr(TAX_GUESS[t.cabin])} a ticket (estimate)`,
      airline: pl.r.airline,
      capLimited: pl.capLimited,
      soft: b.kind !== "chart",
    });
  }
  return rows;
}

/**
 * One option to suggest: the points option that saves the most cash and is
 * worth more per partner point than the user's own value, with enough points.
 * Otherwise cash.
 */
export function recommend(rows: CompareRow[], values: Values = {}): { row: CompareRow; why: string } | null {
  const cash = rows.find((r) => r.kind === "cash");
  if (!cash) return null;
  const ok = rows
    .filter((r) => r.kind === "transfer" && !r.short && !r.capLimited && r.partner && r.partnerPts && r.saved / r.partnerPts >= valueOf(values, r.partner))
    .sort((a, b) => b.saved - a.saved);
  if (ok[0]) return { row: ok[0], why: `you have the points, and each ${PARTNERS[ok[0].partner!].n} point saves ₹${(ok[0].saved / ok[0].partnerPts).toFixed(2)}, more than your set value` };
  return { row: cash, why: "none of the picked points options is both covered by your balances and worth more than your set point values" };
}

function fmtInr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
