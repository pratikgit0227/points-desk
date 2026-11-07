import { CARD_INFO, GUIDES, PARTNERS, PROGRAMS, type CardInfo, type PartnerId, type Program, type Spot } from "@/lib/data";
import type { Values } from "./types";
import { valueOf } from "./wallet";

export interface BestUse {
  per: number;
  name: string;
  p?: PartnerId;
  ratio?: number;
}

export interface PickRow {
  prog: Program;
  ci: CardInfo;
  /** Points earned in a year, including milestones */
  pts: number;
  fee: number;
  air: BestUse;
  hotel: BestUse;
  /** ₹ value as flights */
  fv: number;
  /** ₹ value as hotels */
  hv: number;
  /** Best value minus fee */
  net: number;
  /** Biggest award in the guides these points cover */
  trip: { s: Spot; p: PartnerId; w: number } | null;
}

/** Open cards ranked by what they leave you after the fee, for a yearly spend. */
export function pickCards(spend: number, travelSpend: number, values: Values): PickRow[] {
  const travel = Math.min(travelSpend, spend);
  return PROGRAMS.filter((p) => CARD_INFO[p.key]?.pick && CARD_INFO[p.key]?.earn)
    .map((prog) => {
      const ci = CARD_INFO[prog.key];
      const earn = ci.earn!;
      let pts = (travel / 100) * earn.travel + ((spend - travel) / 100) * earn.other;
      for (const b of ci.bonus || []) if (spend >= b.at) pts += b.pts;
      const fee = ci.waive && spend >= ci.waive ? 0 : ci.fee;

      let air: BestUse = { per: prog.base.v, name: prog.base.label };
      let hotel: BestUse = { per: prog.base.v, name: prog.base.label };
      for (const [p, [ratio]] of Object.entries(prog.r)) {
        const partner = PARTNERS[p as PartnerId];
        const per = ratio * valueOf(values, p);
        if (partner.k === "air" && per > air.per) air = { per, name: partner.n, p: p as PartnerId, ratio };
        if (partner.k === "hotel" && per > hotel.per) hotel = { per, name: partner.n, p: p as PartnerId, ratio };
      }

      let trip: PickRow["trip"] = null;
      for (const [p, [ratio]] of Object.entries(prog.r)) {
        for (const s of GUIDES[p as PartnerId]?.spots || []) {
          if (s.m && s.m <= pts * ratio && (!trip || s.m * valueOf(values, p) > trip.w)) trip = { s, p: p as PartnerId, w: s.m * valueOf(values, p) };
        }
      }

      const fv = pts * air.per;
      const hv = pts * hotel.per;
      return { prog, ci, pts, fee, air, hotel, fv, hv, net: Math.max(fv, hv) - fee, trip };
    })
    .sort((a, b) => b.net - a.net);
}
