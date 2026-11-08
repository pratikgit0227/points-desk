import { PARTNERS, PROGRAMS, type AxisGroup, type Cabin, type Destination, type PartnerId, type Program } from "@/lib/data";
import type { Balances, Values } from "./types";
import { valueOf } from "./wallet";

/**
 * Trip budget: which flights and hotel nights to pay with points, and which with cash,
 * so the user's points save the most rupees. Works on the balances the user entered.
 */
export interface BudgetInput {
  dest: Destination;
  cabin: Cabin;
  /** Cash fare per person, one-way, ₹ */
  fare: number;
  travellers: number;
  /** 1 = one-way, 2 = return (same price both ways) */
  legs: 1 | 2;
  /** Taxes and fees per person per one-way award, ₹ */
  awardTax: number;
  nights: number;
  /** Hotel cash price per night, ₹ */
  hotelCash: number;
  /** Hotel programme, or "any" to let the plan choose */
  hotelP: PartnerId | "any";
  /** Points per night shown on the hotel's site; 0 = estimate from the cash price */
  hotelPts: number;
  balances: Balances;
  values: Values;
}

/** Card points taken from one card for one booking. */
export interface Draw {
  prog: Program;
  cardPts: number;
}

export interface BudgetItem {
  kind: "flight" | "hotel";
  /** Cash price of this booking */
  cash: number;
  /** null = pay cash */
  pts: null | {
    p: PartnerId;
    /** Partner points (miles) for this booking */
    miles: number;
    draws: Draw[];
    /** Cash still paid: award taxes */
    tax: number;
    /** Route or hotel note */
    what: string;
    /** Price is an estimate (dynamic award price, or hotel points estimated from cash) */
    est: boolean;
  };
}

export interface BudgetResult {
  items: BudgetItem[];
  allCash: number;
  /** Cash actually paid: cash bookings + award taxes */
  cashPaid: number;
  saved: number;
  /** Card points used, per card */
  used: { prog: Program; cardPts: number }[];
  /** ₹ the used points would have fetched if redeemed directly instead */
  givenUp: number;
}

interface Option {
  p: PartnerId;
  miles: number;
  tax: number;
  what: string;
  est: boolean;
}

interface Source {
  prog: Program;
  ratio: number;
  grp?: AxisGroup;
}

/** Card points left, and Axis yearly cap left per group. */
class Wallet {
  bal: Record<string, number> = {};
  cap: Record<string, number> = {};
  constructor(balances: Balances) {
    for (const prog of PROGRAMS) {
      this.bal[prog.key] = balances[prog.key]?.n || 0;
      if (prog.caps) for (const g of ["A", "B"] as AxisGroup[]) this.cap[prog.key + g] = prog.caps[g];
    }
  }
  usable(s: Source) {
    const b = this.bal[s.prog.key];
    return s.grp && s.prog.caps ? Math.min(b, this.cap[s.prog.key + s.grp]) : b;
  }
  take(s: Source, n: number) {
    this.bal[s.prog.key] -= n;
    if (s.grp && s.prog.caps) this.cap[s.prog.key + s.grp] -= n;
  }
}

function sourcesFor(p: string): Source[] {
  const out: Source[] = [];
  for (const prog of PROGRAMS) {
    const e = prog.r[p];
    if (e) out.push({ prog, ratio: e[0], grp: e[1] });
  }
  // Use the points that are worth least elsewhere first
  return out.sort((a, b) => a.prog.base.v / a.ratio - b.prog.base.v / b.ratio);
}

/** Cover `miles` partner points from the cheapest cards; null if the cards can't. */
function plan(w: Wallet, p: string, miles: number): { draws: Draw[]; givenUp: number; src: Source[] } | null {
  let left = miles;
  const draws: Draw[] = [];
  const src: Source[] = [];
  let givenUp = 0;
  for (const s of sourcesFor(p)) {
    if (left <= 0) break;
    const can = w.usable(s);
    if (can <= 0) continue;
    const need = Math.ceil(left / s.ratio);
    const n = Math.min(can, need);
    draws.push({ prog: s.prog, cardPts: n });
    src.push(s);
    givenUp += n * s.prog.base.v;
    left -= n * s.ratio;
  }
  return left > 0 ? null : { draws, givenUp, src };
}

function flightOptions(i: BudgetInput): Option[] {
  const out: Option[] = [];
  for (const r of i.dest.options) {
    const p = r.p as PartnerId;
    if (r.pricing === "revenue") {
      // Points pay the fare itself (IndiGo BluChip, SpiceJet): no separate award tax
      if (i.cabin === "eco") out.push({ p, miles: Math.ceil(i.fare / valueOf(i.values, p)), tax: 0, what: `${r.airline}: points pay the fare`, est: false });
      continue;
    }
    const miles = r[i.cabin];
    if (miles) out.push({ p, miles, tax: i.awardTax, what: `${r.airline} · ${r.route}`, est: r.pricing === "dynamic" || r.confidence === "low" });
  }
  return out;
}

function hotelOptions(i: BudgetInput): Option[] {
  const ps = i.hotelP === "any" ? (Object.keys(PARTNERS) as PartnerId[]).filter((p) => PARTNERS[p].k === "hotel") : [i.hotelP];
  return ps.map((p) => {
    const given = i.hotelP !== "any" && i.hotelPts > 0;
    const miles = given ? i.hotelPts : Math.ceil(i.hotelCash / valueOf(i.values, p));
    return { p, miles, tax: 0, what: `${PARTNERS[p].n} hotel, 1 night`, est: !given };
  });
}

/**
 * Greedy plan: repeatedly give points to the booking where they save the most
 * per rupee of value given up, as long as it beats redeeming them directly.
 */
export function planBudget(i: BudgetInput): BudgetResult {
  const w = new Wallet(i.balances);
  const flights = i.fare > 0 ? flightOptions(i) : [];
  const hotels = i.hotelCash > 0 ? hotelOptions(i) : [];
  const open: { kind: "flight" | "hotel"; cash: number; opts: Option[] }[] = [
    ...Array.from({ length: i.travellers * i.legs }, () => ({ kind: "flight" as const, cash: i.fare, opts: flights })),
    ...Array.from({ length: i.hotelCash > 0 ? i.nights : 0 }, () => ({ kind: "hotel" as const, cash: i.hotelCash, opts: hotels })),
  ];
  const items: BudgetItem[] = [];

  for (;;) {
    let best: { idx: number; o: Option; pl: NonNullable<ReturnType<typeof plan>>; score: number; gain: number } | null = null;
    open.forEach((u, idx) => {
      for (const o of u.opts) {
        const saving = u.cash - o.tax;
        if (saving <= 0) continue;
        const pl = plan(w, o.p, o.miles);
        if (!pl || saving <= pl.givenUp) continue;
        const score = pl.givenUp > 0 ? saving / pl.givenUp : Infinity;
        const gain = saving - pl.givenUp;
        if (!best || score > best.score || (score === best.score && gain > best.gain)) best = { idx, o, pl, score, gain };
      }
    });
    if (!best) break;
    const b: { idx: number; o: Option; pl: NonNullable<ReturnType<typeof plan>> } = best;
    b.pl.draws.forEach((d, k) => w.take(b.pl.src[k], d.cardPts));
    const u = open.splice(b.idx, 1)[0];
    items.push({ kind: u.kind, cash: u.cash, pts: { p: b.o.p, miles: b.o.miles, draws: b.pl.draws, tax: b.o.tax, what: b.o.what, est: b.o.est } });
  }
  for (const u of open) items.push({ kind: u.kind, cash: u.cash, pts: null });
  items.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "flight" ? -1 : 1));

  const allCash = items.reduce((s, x) => s + x.cash, 0);
  const cashPaid = items.reduce((s, x) => s + (x.pts ? x.pts.tax : x.cash), 0);
  const usedMap = new Map<string, { prog: Program; cardPts: number }>();
  let givenUp = 0;
  for (const x of items)
    for (const d of x.pts?.draws ?? []) {
      const e = usedMap.get(d.prog.key) ?? { prog: d.prog, cardPts: 0 };
      e.cardPts += d.cardPts;
      usedMap.set(d.prog.key, e);
      givenUp += d.cardPts * d.prog.base.v;
    }
  return { items, allCash, cashPaid, saved: allCash - cashPaid, used: [...usedMap.values()], givenUp };
}
