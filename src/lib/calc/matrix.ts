import { PARTNERS, PARTNER_IDS, PROGRAMS, type Filter, type PartnerId } from "@/lib/data";

export interface MatrixRow {
  p: PartnerId;
  /** Ratio per program, in PROGRAMS order; null where the card doesn't transfer */
  rates: (number | null)[];
  best: number;
}

/** Partner × card table of transfer ratios, partners A–Z. */
export function transferMatrix(filter: Filter): MatrixRow[] {
  return PARTNER_IDS.filter((p) => filter === "all" || PARTNERS[p].k === filter)
    .sort((a, b) => PARTNERS[a].n.localeCompare(PARTNERS[b].n))
    .flatMap((p) => {
      const rates = PROGRAMS.map((pr) => (pr.r[p] ? pr.r[p][0] : null));
      const known = rates.filter((x): x is number => x != null);
      return known.length ? [{ p, rates, best: Math.max(...known) }] : [];
    });
}
