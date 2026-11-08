import {
  CARD_INFO,
  DESTINATIONS,
  GUIDES,
  PARTNERS,
  PROGRAMS,
  cardName,
  isOpenCard,
  type AwardRoute,
  type AxisGroup,
  type Destination,
  type PartnerId,
  type Program,
  type Spot,
} from "@/lib/data";

/**
 * Facts for the public card and destination pages. These pages are the same
 * for every visitor (good for search engines and sharing), so they use the
 * default partner values, not anyone's saved balances.
 */

export const SITE_URL = "https://suiteandseat.vercel.app";

const CARD_SLUG_OVERRIDES: Record<string, string> = {
  amex_mr: "amex-platinum-travel",
  hdfc_infinia: "hdfc-infinia",
  scapia: "federal-scapia",
};

export function cardSlug(key: string): string {
  return CARD_SLUG_OVERRIDES[key] ?? key.replace(/_/g, "-");
}

export function programBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => cardSlug(p.key) === slug);
}

export function destSlug(d: Destination): string {
  return d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function destinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => destSlug(d) === slug);
}

export interface PartnerRate {
  p: PartnerId;
  ratio: number;
  grp?: AxisGroup;
  /** ₹ per card point at the default partner value */
  per: number;
}

export interface CardFacts {
  prog: Program;
  name: string;
  open: boolean;
  partners: PartnerRate[];
  bestAir?: PartnerRate;
  bestHotel?: PartnerRate;
  /** Best ₹ per card point: best partner or direct redemption */
  bestPer: number;
  /** % of everyday spend returned at the best use */
  returnPct?: number;
  spots: { p: PartnerId; s: Spot; cardPts: number }[];
  destinations: { d: Destination; p: PartnerId; cardPts: number }[];
}

export function cardFacts(prog: Program): CardFacts {
  const partners: PartnerRate[] = Object.entries(prog.r)
    .map(([p, [ratio, grp]]) => ({ p: p as PartnerId, ratio, grp, per: ratio * PARTNERS[p as PartnerId].v }))
    .sort((a, b) => b.per - a.per);
  const bestAir = partners.find((r) => PARTNERS[r.p].k === "air");
  const bestHotel = partners.find((r) => PARTNERS[r.p].k === "hotel");
  const bestPer = Math.max(prog.base.v, partners[0]?.per ?? 0);
  const earn = CARD_INFO[prog.key]?.earn;

  const spots: CardFacts["spots"] = [];
  for (const r of partners) {
    for (const s of GUIDES[r.p]?.spots ?? []) if (s.m) spots.push({ p: r.p, s, cardPts: Math.ceil(s.m / r.ratio) });
  }
  spots.sort((a, b) => a.cardPts - b.cardPts);

  // Cheapest economy (else business) award to each destination this card can fund
  const destinations: CardFacts["destinations"] = [];
  for (const d of DESTINATIONS) {
    let best: CardFacts["destinations"][number] | null = null;
    for (const o of d.options) {
      const rate = prog.r[o.p];
      const miles = o.pricing === "revenue" ? 0 : (o.eco ?? o.biz ?? 0);
      if (!rate || !miles) continue;
      const cardPts = Math.ceil(miles / rate[0]);
      if (!best || cardPts < best.cardPts) best = { d, p: o.p as PartnerId, cardPts };
    }
    if (best) destinations.push(best);
  }
  destinations.sort((a, b) => a.cardPts - b.cardPts);

  return {
    prog,
    name: cardName(prog),
    open: isOpenCard(prog.key),
    partners,
    bestAir,
    bestHotel,
    bestPer,
    returnPct: earn ? (earn.other / 100) * bestPer * 100 : undefined,
    spots,
    destinations,
  };
}

export interface RouteSource {
  prog: Program;
  ratio: number;
  grp?: AxisGroup;
  open: boolean;
  eco?: number;
  biz?: number;
}

export interface RouteFacts {
  r: AwardRoute;
  p: PartnerId;
  /** Every card that transfers to this programme, best ratio first */
  sources: RouteSource[];
  /** Best-ratio card a new applicant can get */
  bestOpen?: RouteSource;
}

export interface DestinationFacts {
  d: Destination;
  routes: RouteFacts[];
  /** Fewest partner points one-way, per cabin (fixed or dynamic awards only) */
  minEco?: RouteFacts;
  minBiz?: RouteFacts;
}

export function destinationFacts(d: Destination): DestinationFacts {
  const routes = d.options.map((r): RouteFacts => {
    const p = r.p as PartnerId;
    const sources = PROGRAMS.filter((prog) => prog.r[p])
      .map((prog) => {
        const [ratio, grp] = prog.r[p];
        return {
          prog,
          ratio,
          grp,
          open: isOpenCard(prog.key),
          eco: r.eco && r.pricing !== "revenue" ? Math.ceil(r.eco / ratio) : undefined,
          biz: r.biz && r.pricing !== "revenue" ? Math.ceil(r.biz / ratio) : undefined,
        };
      })
      .sort((a, b) => b.ratio - a.ratio);
    return { r, p, sources, bestOpen: sources.find((s) => s.open) };
  });
  const award = routes.filter((x) => x.r.pricing !== "revenue");
  const min = (c: "eco" | "biz") => award.filter((x) => x.r[c]).sort((a, b) => a.r[c]! - b.r[c]!)[0];
  return { d, routes, minEco: min("eco"), minBiz: min("biz") };
}
