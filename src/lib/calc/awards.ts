// Imported directly, not through the barrels, so the airport list and charts load only on /awards.
import type { PartnerId } from "@/lib/data/partners";
import { AI_ROUTES } from "@/lib/data/airindia-routes";
import {
  AEROPLAN_ATLANTIC_ASIA, AEROPLAN_BANDS, AEROPLAN_PACIFIC_ASIA, AEROPLAN_UNKNOWN, AEROPLAN_ZONE_NAMES, AI_REGIONS,
  BA_HUBS, BA_OWN, KF_FROM_SIN, KF_FROM_SOUTH_ASIA, KF_US, KF_ZONE_NAMES,
  type AeroplanZone, type Band, type KfZone,
} from "@/lib/data/awardcharts";
import { CATHAY_OWN, DISTANCE_TABLES, NO_CHART, ROUTE_TABLES, TK_COUNTRIES, TK_OWN, TK_PARTNER, TK_REGION_NAMES, type DBand, type Place, type Pts, type TkRegion } from "@/lib/data/awardcharts-more";
import { METRO, SIGHTINGS, type Sighting } from "@/lib/data/sightings";
import { airport, distanceMiles, type Airport } from "./airports";
import { awardLinks, type FareLink } from "./trips";

/** One-way price; `hi` is the peak / Prime price where the programme has one. */
export interface Price {
  lo: number;
  hi?: number;
}

export interface AwardQuote {
  p: PartnerId;
  /** Whose flights this price is for */
  on: string;
  eco?: Price;
  biz?: Price;
  /** Why this price: band, zone or route */
  basis: string;
  /** high: exact route or chart cell; medium: region price or a rule that depends on the airline flying it */
  conf: "high" | "medium";
  /** Typical lowest price seen, not a published chart */
  seen?: boolean;
  /** Price on a partner airline: only applies if that partner flies the route */
  partner?: boolean;
  note?: string;
}

export interface AwardMiss {
  p: PartnerId;
  why: string;
}

export interface AwardResult {
  miles: number;
  quotes: AwardQuote[];
  missing: AwardMiss[];
}

const n = (x: number) => x.toLocaleString("en-IN");

/** Band covering this distance, and its label ("1,001–2,000 miles"). */
export function inBand<T extends readonly number[]>(bands: readonly T[], miles: number): { band: T; label: string } {
  let from = 0;
  for (const b of bands) {
    if (miles <= b[0]) return { band: b, label: b[0] === Infinity ? `over ${n(from)} miles` : `${n(from === 0 ? 0 : from + 1)}–${n(b[0])} miles` };
    from = b[0];
  }
  throw new Error("bands must end with Infinity");
}

/* ---------------- Aeroplan ---------------- */

export function aeroplanZone(a: Airport): AeroplanZone | null {
  if (AEROPLAN_UNKNOWN.includes(a.country)) return null;
  if (AEROPLAN_PACIFIC_ASIA.includes(a.country)) return "PAC";
  if (AEROPLAN_ATLANTIC_ASIA.includes(a.country)) return "ATL";
  switch (a.continent) {
    case "EU":
    case "AF":
      return "ATL";
    case "OC":
      return "PAC";
    case "SA":
      return "SA";
    case "NA":
      // Mexico, Central America and the Caribbean aren't confirmed
      return a.country === "US" || a.country === "CA" ? "NA" : null;
    default:
      return null;
  }
}

function aeroplan(from: Airport, to: Airport, miles: number): AwardQuote | AwardMiss {
  const za = aeroplanZone(from);
  const zb = aeroplanZone(to);
  if (!za || !zb) return { p: "aeroplan", why: "We couldn't confirm which Aeroplan zone one of these airports is in." };
  const key = za === zb ? za : [za, zb].sort().join("-");
  const bands = AEROPLAN_BANDS[key];
  if (!bands) return { p: "aeroplan", why: "No published price between these zones." };
  const { band, label } = inBand<Band>(bands, miles);
  const zones = za === zb ? `Within ${AEROPLAN_ZONE_NAMES[za]}` : `${AEROPLAN_ZONE_NAMES[za]} – ${AEROPLAN_ZONE_NAMES[zb]}`;
  return {
    p: "aeroplan",
    on: "Star Alliance partners",
    eco: { lo: band[1] },
    biz: { lo: band[2] },
    basis: `${zones}, ${label}`,
    conf: "high",
    note: "For a nonstop flight. Aeroplan adds up the miles of every flight, so a connection can cost more.",
  };
}

/* ---------------- KrisFlyer ---------------- */

const KF_MIDDLE_EAST = ["AE", "QA", "SA", "OM", "BH", "KW", "JO", "LB", "IL", "IQ", "IR", "SY", "YE", "TR", "CY"];

export function kfZone(a: Airport): KfZone | null {
  const c = a.country;
  if (a.code === "SIN") return 1;
  if (c === "US") return KF_US[a.code] ?? null;
  if (["MY", "ID", "BN"].includes(c)) return 2;
  if (["TH", "VN", "PH", "MM", "KH", "LA"].includes(c)) return 3;
  if (["PEK", "PKX", "PVG", "SHA"].includes(a.code)) return 5;
  if (["CN", "HK", "TW", "MO"].includes(c)) return 4;
  if (["IN", "LK", "MV", "BD"].includes(c) || a.code === "KTM") return 6;
  if (c === "JP" || c === "KR") return 7;
  if (a.code === "PER" || a.code === "DRW") return 8;
  if (c === "AU" || c === "NZ") return 9;
  if (a.continent === "AF" || KF_MIDDLE_EAST.includes(c)) return 10;
  if (a.continent === "EU") return 11;
  return null;
}

function krisflyer(from: Airport, to: Airport): AwardQuote | AwardMiss | null {
  const za = kfZone(from);
  const zb = kfZone(to);
  if (!za || !zb) return null;
  const other = za === 1 ? zb : zb === 1 ? za : za === 6 ? zb : zb === 6 ? za : null;
  const table = za === 1 || zb === 1 ? KF_FROM_SIN : za === 6 || zb === 6 ? KF_FROM_SOUTH_ASIA : null;
  if (!other || !table) return null;
  const cell = table[other];
  if (!cell) {
    return za === 6 || zb === 6
      ? { p: "krisflyer", why: `Singapore Airlines doesn't publish a Saver price from India to ${KF_ZONE_NAMES[other]}: going via Singapore is too far out of the way.` }
      : null;
  }
  const via = za !== 1 && zb !== 1;
  return {
    p: "krisflyer",
    on: "Singapore Airlines",
    eco: { lo: cell[0] },
    biz: { lo: cell[1] },
    basis: `Saver, ${via ? "South Asia" : "Singapore"} to ${KF_ZONE_NAMES[other]}`,
    conf: "high",
    note: via ? "Via Singapore, priced as one award." : undefined,
  };
}

/* ---------------- Air India ---------------- */

function airIndia(from: Airport, to: Airport): AwardQuote | AwardMiss | null {
  const key = [from.code, to.code].sort().join("-");
  const route = AI_ROUTES[key];
  if (route) {
    const [eco, biz] = route;
    return {
      p: "airindia",
      on: "Air India",
      eco: eco ? { lo: eco[0], hi: eco[1] } : undefined,
      biz: biz ? { lo: biz[0], hi: biz[1] } : undefined,
      basis: "Air India's price for this route",
      conf: "high",
    };
  }
  const inA = from.country === "IN";
  const inB = to.country === "IN";
  if (inA && inB) return { p: "airindia", why: "This route isn't in Air India's published list. Check airindia.com; Air India Express flights start at 1,500 points." };
  if (!inA && !inB) return null;
  const abroad = inA ? to : from;
  const region = AI_REGIONS.find((r) => r.countries.includes(abroad.country));
  if (!region) return null;
  return {
    p: "airindia",
    on: "Air India",
    eco: { lo: region.eco[0], hi: region.eco[1] },
    biz: { lo: region.biz[0], hi: region.biz[1] },
    basis: `India – ${region.name} price`,
    conf: "medium",
    note: "Only if Air India flies this route; a few routes have their own price.",
  };
}

/* ---------------- British Airways Avios ---------------- */

function avios(from: Airport, to: Airport, miles: number): AwardQuote[] {
  const out: AwardQuote[] = [];
  if (BA_HUBS.includes(from.code) || BA_HUBS.includes(to.code)) {
    const { band, label } = inBand(BA_OWN, miles);
    out.push({
      p: "ba",
      on: "British Airways, Iberia, Aer Lingus",
      eco: { lo: band[1], hi: band[2] },
      biz: { lo: band[3], hi: band[4] },
      basis: `Own flights, ${label}`,
      conf: "high",
      note: "Off-peak to peak. Plus a fixed cash charge set by BA.",
    });
    // BA flies this itself; a partner price here would mislead
    return out;
  }
  return out;
}


/* ---------------- Generic route and distance tables ---------------- */

export function inPlace(a: Airport, pl: Place): boolean {
  if (pl.not?.includes(a.code)) return false;
  return Boolean(pl.codes?.includes(a.code) || pl.countries?.includes(a.country) || pl.continents?.includes(a.continent));
}

const price = (x?: Pts): Price | undefined => (x ? { lo: x[0], hi: x[1] } : undefined);

function routeTables(from: Airport, to: Airport): AwardQuote[] {
  const out: AwardQuote[] = [];
  for (const t of ROUTE_TABLES) {
    const row = t.rows.find((r) => (inPlace(from, r.a) && inPlace(to, r.b)) || (inPlace(from, r.b) && inPlace(to, r.a)));
    if (!row) continue;
    out.push({
      p: t.p, on: t.on, eco: price(row.eco), biz: price(row.biz), basis: row.label,
      conf: t.kind === "chart" ? "high" : "medium", seen: t.kind === "seen", partner: t.partner, note: t.note,
    });
  }
  return out;
}

function distanceTables(from: Airport, to: Airport, miles: number): AwardQuote[] {
  const out: AwardQuote[] = [];
  for (const t of DISTANCE_TABLES) {
    if (t.touches && !inPlace(from, t.touches) && !inPlace(to, t.touches)) continue;
    // The programme's own airline flies this, so a partner price would mislead
    if (t.skip && (inPlace(from, t.skip) || inPlace(to, t.skip))) continue;
    // No partner of this programme flies within this country (e.g. no oneworld airline within India)
    if (t.notWithin && from.country === to.country && t.notWithin.includes(from.country)) continue;
    const { band, label } = inBand<DBand>(t.bands, miles);
    out.push({
      p: t.p, on: t.on, eco: { lo: band[1] }, biz: { lo: band[2] }, basis: `${t.basis}, ${label}`,
      conf: "medium", seen: t.kind === "seen", partner: t.partner, note: t.note,
    });
  }
  return out;
}

function cathay(from: Airport, to: Airport, miles: number): AwardQuote | null {
  const other = from.code === "HKG" ? to : to.code === "HKG" ? from : null;
  if (!other) return null;
  let eco: Price;
  let biz: Price;
  let basis: string;
  if (miles <= CATHAY_OWN.ultraShort[0]) {
    eco = { lo: CATHAY_OWN.ultraShort[1] };
    biz = { lo: CATHAY_OWN.ultraShort[2] };
    basis = "Ultra-short haul, up to 750 miles";
  } else if (miles <= 2750) {
    const [e1, e2, b1, b2] = CATHAY_OWN.short;
    const t2 = CATHAY_OWN.type2.includes(other.country);
    eco = t2 ? { lo: e2 } : { lo: e1, hi: e2 };
    biz = t2 ? { lo: b2 } : { lo: b1, hi: b2 };
    basis = t2 ? "Short haul (type 2), 751–2,750 miles" : "Short haul, 751–2,750 miles (type 1 or 2 by city)";
  } else {
    const { band, label } = inBand<DBand>(CATHAY_OWN.longer, miles);
    eco = { lo: band[1] };
    biz = { lo: band[2] };
    basis = label;
  }
  return { p: "cathay", on: "Cathay Pacific", eco, biz, basis, conf: "medium", note: "Only if Cathay flies this route from Hong Kong." };
}

/* ---------------- Turkish Miles&Smiles ---------------- */

export function tkRegion(a: Airport): TkRegion | null {
  for (const [r, list] of Object.entries(TK_COUNTRIES) as [TkRegion, readonly string[]][]) if (list.includes(a.country)) return r;
  switch (a.continent) {
    case "EU": return "EU2";
    case "AF": return "CAF";
    case "SA": return "SAM";
    case "OC": return "OCE";
    default: return null;
  }
}

function turkish(from: Airport, to: Airport): AwardQuote[] {
  const ra = tkRegion(from);
  const rb = tkRegion(to);
  if (!ra || !rb) return [];
  const out: AwardQuote[] = [];
  // Own flights: each flight is Türkiye ↔ a region; via Istanbul adds two flights
  const legs = ra === "TR" ? [rb] : rb === "TR" ? [ra] : [ra, rb];
  // Via Istanbul only when it's roughly on the way (not Delhi–Mumbai or Delhi–Singapore)
  const ist = airport("IST");
  const onTheWay = ist ? distanceMiles(from, ist) + distanceMiles(ist, to) <= 1.35 * distanceMiles(from, to) : false;
  if (legs.length === 1 || (ra !== rb && onTheWay)) {
    const sum = (i: number) => legs.reduce((t, r) => t + TK_OWN[r][i], 0);
    const via = legs.length === 2;
    out.push({
      p: "turkish", on: "Turkish Airlines",
      eco: { lo: sum(0), hi: sum(1) }, biz: { lo: sum(2), hi: sum(3) },
      basis: via ? `Via Istanbul: ${TK_REGION_NAMES[ra]} + ${TK_REGION_NAMES[rb]}` : `Türkiye – ${TK_REGION_NAMES[legs[0]]}`,
      conf: via ? "medium" : "high",
      note: "Promo seat to standard award seat." + (via ? " Two flights priced separately and added." : ""),
    });
  }
  // Star Alliance partners: chart rows we have start in Central Asia (India) or the Middle East
  const row = TK_PARTNER[ra]?.[rb] ?? TK_PARTNER[rb]?.[ra];
  // Within India only Air India flies, and it blocks Miles&Smiles
  if (row && ra !== "TR" && rb !== "TR" && !(from.country === "IN" && to.country === "IN")) {
    out.push({
      p: "turkish", on: "Star Alliance partners", eco: { lo: row[0] }, biz: { lo: row[1] },
      basis: `Partner award, ${TK_REGION_NAMES[ra]} – ${TK_REGION_NAMES[rb]}`, conf: "medium", partner: true,
      note: "Air India doesn't release seats to Miles&Smiles.",
    });
  }
  return out;
}

/** Every charted one-way price between two airports, cheapest economy first. */
export function awardPrices(from: Airport, to: Airport): AwardResult {
  const miles = distanceMiles(from, to);
  const quotes: AwardQuote[] = [];
  const missing: AwardMiss[] = [];
  if (from.code === to.code) return { miles: 0, quotes, missing };
  const add = (r: AwardQuote | AwardMiss | null) => {
    if (!r) return;
    if ("why" in r) missing.push(r);
    else quotes.push(r);
  };
  add(airIndia(from, to));
  add(aeroplan(from, to, miles));
  add(krisflyer(from, to));
  avios(from, to, miles).forEach(add);
  routeTables(from, to).forEach(add);
  add(cathay(from, to, miles));
  turkish(from, to).forEach(add);
  distanceTables(from, to, miles).forEach(add);
  for (const m of NO_CHART) missing.push(m);
  const key = (q: AwardQuote) => q.eco?.lo ?? Infinity;
  quotes.sort((a, b) => key(a) - key(b));
  return { miles, quotes, missing };
}

/* ---------------- Sightings and search links ---------------- */

const metro = (code: string) => METRO[code] ?? code;

/** Sightings between the same two cities, either direction. */
export function sightingsFor(from: string, to: string): Sighting[] {
  const a = metro(from);
  const b = metro(to);
  return SIGHTINGS.filter((s) => {
    const x = metro(s.from);
    const y = metro(s.to);
    return (x === a && y === b) || (x === b && y === a);
  });
}

/** Where to check real award seats: seats.aero, then the programme's own search (pre-filled where its link format allows). */
export function awardSearchLinks(p: PartnerId, from: string, to: string, date: string): FareLink[] {
  const out = awardLinks(p, from, to, date);
  if (p === "aeroplan") {
    const site = out.find((l) => l.label.includes("aircanada"));
    if (site) {
      site.label = "Aeroplan search";
      site.href = `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${from}&dest0=${to}&departureDate0=${date}&ADT=1&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=O&marketCode=INT`;
    }
  }
  return out;
}
