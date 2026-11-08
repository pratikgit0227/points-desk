import { CARD_INFO, MERCHANTS, PARTNERS, PROGRAMS, canShowCard, cardName, isHotelMerchant, type CardInfo, type Merchant, type PartnerId, type Program } from "@/lib/data";
import { ratioTxt } from "@/lib/format";
import type { Values } from "./types";
import { valueOf } from "./wallet";

export function matchMerchants(q: string): Merchant[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return MERCHANTS;
  return MERCHANTS.filter((m) => words.every((w) => (m.n + " " + m.kw).toLowerCase().includes(w)));
}

export interface Redemption {
  kind: "cash" | "pts" | "cashback";
  v: number;
  via: string;
}

export interface FinderRow {
  /** The user's own cashback card typed into the finder */
  own?: boolean;
  /** A card the user holds (from "my cards"), or their cashback card */
  mine?: boolean;
  prog?: Program;
  ci?: CardInfo;
  name: string;
  pts: number;
  best: Redemption;
  cash: Redemption | null;
  /** Better use if the points are saved for another trip (>15% more) */
  stretch: Redemption | null;
}

export interface FinderInput {
  merchant: Merchant;
  amount: number;
  values: Values;
  cashbackName?: string;
  cashbackPct?: number;
  /** Cards the user holds; null when not set */
  mine?: readonly string[] | null;
}

/**
 * Every card ranked by what it gives back on one booking. With "my cards" set,
 * the user's cards come first and the rest are open cards worth getting.
 */
export function rankCardsForBooking({ merchant: m, amount, values, cashbackName, cashbackPct = 0, mine = null }: FinderInput): FinderRow[] {
  const kind = isHotelMerchant(m) ? "hotel" : "air";
  const rows: FinderRow[] = [];
  for (const prog of PROGRAMS) {
    const ci = CARD_INFO[prog.key];
    if (!ci?.earn || !canShowCard(prog.key, mine)) continue;
    const pts = (amount / 100) * ci.earn.travel;
    const cash: Redemption = { kind: "cash", v: pts * prog.base.v, via: "Use the points as cash-style credit: " + prog.base.label };
    const opts: Redemption[] = [cash];
    const want = m.p ? prog.r[m.p] : undefined;
    if (m.p && want) {
      opts.push({ kind: "pts", v: pts * want[0] * valueOf(values, m.p), via: "Transfer to " + PARTNERS[m.p as PartnerId].n + " (" + ratioTxt(want[0]) + ")" });
    }
    let bp: Redemption | null = null;
    for (const [p, [ratio]] of Object.entries(prog.r)) {
      if (PARTNERS[p as PartnerId].k !== kind) continue;
      const v = pts * ratio * valueOf(values, p);
      if (!bp || v > bp.v) bp = { kind: "pts", v, via: "Transfer to " + PARTNERS[p as PartnerId].n + " (" + ratioTxt(ratio) + ") for a trip later" };
    }
    opts.sort((x, y) => y.v - x.v);
    rows.push({ prog, ci, mine: mine?.includes(prog.key) ?? false, pts, best: opts[0], cash, stretch: bp && bp.v > opts[0].v * 1.15 ? bp : null, name: cardName(prog) });
  }
  if (cashbackPct > 0) {
    rows.push({
      own: true,
      mine: true,
      name: cashbackName || "Your cashback card",
      pts: 0,
      best: { kind: "cashback", v: (amount * cashbackPct) / 100, via: cashbackPct + "% back, paid as cash" },
      cash: null,
      stretch: null,
    });
  }
  const first = (r: FinderRow) => (mine?.length && r.mine ? 1 : 0);
  return rows.sort((a, b) => first(b) - first(a) || b.best.v - a.best.v);
}
