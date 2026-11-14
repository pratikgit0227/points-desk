import { PARTNERS, PROGRAMS, VOUCHER_BURN, VOUCHER_EARN, type PartnerId, type VoucherBurn, type VoucherEarn } from "@/lib/data";
import { ratioTxt } from "@/lib/format";
import type { Values } from "./types";
import { transferOptions } from "./wallet";

/** The best a programme's point is worth by transferring, at the user's values (null when it can't transfer). */
export function bestTransfer(program: string, values: Values): { per: number; via: string } | null {
  const prog = PROGRAMS.find((p) => p.key === program);
  if (!prog) return null;
  const [best] = transferOptions(prog, { balances: {}, values, filter: "all" });
  return best ? { per: best.per, via: `${PARTNERS[best.p as PartnerId].n} (${ratioTxt(best.ratio)})` } : null;
}

/** What one card point is worth used at its best: transfer or the card's own direct redemption. */
export function pointWorth(program: string, values: Values): { per: number; via: string } {
  const prog = PROGRAMS.find((p) => p.key === program);
  const t = bestTransfer(program, values);
  const base = prog ? { per: prog.base.v, via: prog.base.label } : { per: 0, via: "" };
  return t && t.per > base.per ? { per: t.per, via: "transferred to " + t.via } : { per: base.per, via: base.via };
}

export interface EarnRow {
  e: VoucherEarn;
  /** Points for the month's voucher spend */
  pts: number;
  /** Points the card earns anyway on normal spend of the same amount */
  normal: number;
  /** Spend at which the monthly cap is reached */
  fillAt: number;
  capped: boolean;
  /** ₹ value of the points, at their best use */
  worth: number;
  /** Value as a % of the spend */
  pct: number;
  per: number;
  via: string;
  mine: boolean;
}

/** Points per month from buying `spend` ₹ of vouchers on each card, within its cap. */
export function voucherEarn(e: VoucherEarn, spend: number): { pts: number; fillAt: number; capped: boolean } {
  const s = Math.max(0, spend);
  if (e.cap.kind === "bonus") {
    const extra = e.per100 - e.base;
    const fillAt = extra > 0 ? (e.cap.pts * 100) / extra : Infinity;
    return { pts: (e.base * s) / 100 + Math.min((extra * s) / 100, e.cap.pts), fillAt, capped: s > fillAt };
  }
  const fillAt = (e.cap.pts * 100) / e.per100;
  return { pts: Math.min((e.per100 * s) / 100, e.cap.pts), fillAt, capped: s > fillAt };
}

/**
 * Every card's voucher earnings for one month's spend, valued at the user's
 * values. The user's cards first, then by ₹ value.
 */
export function voucherEarnRows(spend: number, values: Values, mine: readonly string[] | null = null, cardAs: Record<string, string> = {}): EarnRow[] {
  const rows = VOUCHER_EARN.map((e) => {
    const { pts, fillAt, capped } = voucherEarn(e, spend);
    const { per, via } = pointWorth(e.program, values);
    const worth = pts * per;
    const held = Boolean(mine?.includes(e.program)) && (!cardAs[e.program] || cardAs[e.program] === e.card);
    return { e, pts, normal: (e.base * spend) / 100, fillAt, capped, worth, pct: spend > 0 ? (worth / spend) * 100 : 0, per, via, mine: held };
  });
  return rows.sort((a, b) => Number(b.mine) - Number(a.mine) || b.worth - a.worth);
}

export interface BurnRow {
  b: VoucherBurn;
  transfer: { per: number; via: string } | null;
  /** Vouchers pay at least as much as the best transfer */
  voucherWins: boolean;
}

/** Each voucher redemption against the best transfer for the same points. */
export function voucherBurnRows(values: Values, mine: readonly string[] | null = null): BurnRow[] {
  return VOUCHER_BURN.filter((b) => !mine?.length || mine.includes(b.program)).map((b) => {
    const transfer = bestTransfer(b.program, values);
    return { b, transfer, voucherWins: !transfer || b.v >= transfer.per };
  });
}
