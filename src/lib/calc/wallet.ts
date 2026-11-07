import { MILES_MORE_CAP, PARTNERS, PROGRAMS, type AxisGroup, type PartnerId, type Program } from "@/lib/data";
import type { Balances, Ctx, Values } from "./types";

export function valueOf(values: Values, p: string): number {
  return values[p] ?? PARTNERS[p as PartnerId].v;
}

/** How many card points can actually go to partner p this year, given Axis caps. */
export function usableFor(prog: Program, p: string, grp: AxisGroup | undefined, bal: number) {
  let usable = bal;
  if (grp && prog.caps) usable = Math.min(usable, prog.caps[grp]);
  if (p === "milesmore" && prog.caps) usable = Math.min(usable, MILES_MORE_CAP);
  return { usable, capped: usable < bal };
}

export interface TransferOption {
  p: PartnerId;
  ratio: number;
  grp?: AxisGroup;
  /** ₹ per card point */
  per: number;
  usable: number;
  capped: boolean;
  /** Partner points received */
  got: number;
  worth: number;
}

/** Every partner this card transfers to, best ₹ per point first. */
export function transferOptions(prog: Program, ctx: Ctx): TransferOption[] {
  const bal = ctx.balances[prog.key]?.n || 0;
  const rows: TransferOption[] = [];
  for (const [p, [ratio, grp]] of Object.entries(prog.r)) {
    const partner = PARTNERS[p as PartnerId];
    if (ctx.filter !== "all" && partner.k !== ctx.filter) continue;
    const { usable, capped } = usableFor(prog, p, grp, bal);
    const per = ratio * valueOf(ctx.values, p);
    rows.push({ p: p as PartnerId, ratio, grp, per, usable, capped, got: usable * ratio, worth: usable * per });
  }
  rows.sort((a, b) => b.per - a.per || b.worth - a.worth);
  return rows;
}

export interface WalletSummary {
  prog: Program;
  balance: number;
  options: TransferOption[];
  base: { per: number; worth: number };
  best: TransferOption | undefined;
  /** True when redeeming directly beats (or equals) every partner */
  directWins: boolean;
  bestWorth: number;
}

export function walletSummary(prog: Program, ctx: Ctx): WalletSummary {
  const balance = ctx.balances[prog.key]?.n || 0;
  const options = transferOptions(prog, ctx);
  const base = { per: prog.base.v, worth: balance * prog.base.v };
  const best = options[0];
  return {
    prog,
    balance,
    options,
    base,
    best,
    directWins: !best || base.per >= best.per,
    bestWorth: Math.max(best ? best.worth : 0, base.worth),
  };
}

/** Best-case worth across all cards. */
export function totalWorth(ctx: Ctx): number {
  return PROGRAMS.reduce((sum, prog) => sum + walletSummary(prog, ctx).bestWorth, 0);
}

export interface PoolSource {
  prog: Program;
  ratio: number;
  grp?: AxisGroup;
  bal: number;
  usable: number;
  /** Partner points this card can produce */
  pts: number;
}

export interface Pool {
  srcs: PoolSource[];
  total: number;
  /** Card with the best ratio to this partner */
  bestRatio: PoolSource | null;
}

/** What the user's cards can put into partner p. */
export function pool(p: string, balances: Balances): Pool {
  const srcs: PoolSource[] = [];
  for (const prog of PROGRAMS) {
    const e = prog.r[p];
    if (!e) continue;
    const [ratio, grp] = e;
    const bal = balances[prog.key]?.n || 0;
    const { usable } = usableFor(prog, p, grp, bal);
    srcs.push({ prog, ratio, grp, bal, usable, pts: usable * ratio });
  }
  srcs.sort((a, b) => b.ratio - a.ratio);
  return { srcs, total: srcs.reduce((s, x) => s + x.pts, 0), bestRatio: srcs[0] ?? null };
}

/** Example balances shown to a first-time visitor. */
export function exampleBalances(): Balances {
  return Object.fromEntries(PROGRAMS.map((p) => [p.key, { n: p.ex, src: "ex" as const }]));
}

/** Once the user enters any real balance, clear the example ones. */
export function clearExamples(balances: Balances): Balances {
  const out: Balances = {};
  for (const [k, b] of Object.entries(balances)) out[k] = b.src === "ex" ? { n: 0, src: "manual" } : b;
  return out;
}
