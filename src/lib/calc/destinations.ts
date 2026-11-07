import { DESTINATIONS, MERCHANTS, type AwardRoute, type Cabin, type Destination, type PartnerId } from "@/lib/data";
import type { Balances, Values } from "./types";
import { pool, valueOf, type PoolSource } from "./wallet";

export function matchDestinations(q: string): Destination[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return DESTINATIONS;
  return DESTINATIONS.filter((d) => {
    const hay = `${d.name} ${d.country} ${d.code} ${d.kw}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export interface RoutePlan {
  r: AwardRoute;
  p: PartnerId;
  /** Partner points needed one-way; for revenue programmes this is the fare in points */
  miles: number;
  /** Card that converts best into this programme */
  best: PoolSource | null;
  /** Card points needed from that card */
  cardPts: number;
  /** All the user's cards together can cover it */
  canBook: boolean;
  /** Partner points still missing */
  short: number;
  /** ₹ value of the card points spent if redeemed directly instead (lower is better) */
  cost: number;
  /** ₹ saved per partner point against the cash fare */
  perPoint: number;
  /** Best card's yearly group cap blocks the full amount */
  capLimited: boolean;
}

/**
 * Every way to reach a destination with points, for one cabin.
 * Sorted: bookable first, then by what the card points are worth elsewhere.
 */
export function planDestination(d: Destination, cabin: Cabin, fare: number, balances: Balances, values: Values = {}): RoutePlan[] {
  const plans: RoutePlan[] = [];
  for (const r of d.options) {
    const p = r.p as PartnerId;
    // Revenue programmes (IndiGo, SpiceJet): points pay the fare at the user's value per point
    const miles = r.pricing === "revenue" ? (cabin === "eco" ? Math.ceil(fare / valueOf(values, p)) : 0) : r[cabin];
    if (!miles) continue;
    const pl = pool(p, balances);
    // Best ratio among cards the user holds points on; else the best card overall
    const best = pl.srcs.find((s) => s.bal > 0) ?? pl.bestRatio;
    if (!best) continue;
    const cardPts = Math.ceil(miles / best.ratio);
    plans.push({
      r,
      p,
      miles,
      best,
      cardPts,
      canBook: pl.total >= miles,
      short: Math.max(0, miles - pl.total),
      cost: cardPts * best.prog.base.v,
      perPoint: fare / miles,
      capLimited: best.usable < best.bal && best.usable < cardPts,
    });
  }
  return plans.sort((a, b) => Number(b.canBook) - Number(a.canBook) || a.cost - b.cost);
}

/** Merchant used to work out which card to pay with for a nonstop airline. */
export function merchantFor(airline: { merchant?: string }) {
  return MERCHANTS.find((m) => m.id === airline.merchant) || MERCHANTS.find((m) => m.id === "anyair")!;
}

/** ₹ value of one partner point used on this trip vs the user's set value. */
export function beatsValue(plan: RoutePlan, values: Values): boolean {
  return plan.perPoint >= valueOf(values, plan.p);
}
