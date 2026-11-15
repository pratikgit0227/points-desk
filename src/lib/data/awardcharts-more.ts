import type { PartnerId } from "./partners";
import type { ChartInfo } from "./awardcharts";

/**
 * Second batch of award charts, in two generic shapes so the engine stays small:
 * - route tables: a price between two places (a hub and a region, or two regions)
 * - distance tables: a price by flight distance, optionally only where the airline flies
 * Checked 15 Nov 2026; sources are in MORE_CHART_INFO.
 */

/** A set of airports: any listed code, country or continent matches. `not` excludes codes. */
export interface Place {
  codes?: readonly string[];
  countries?: readonly string[];
  continents?: readonly string[];
  not?: readonly string[];
}

/** [lowest, highest] or just lowest */
export type Pts = readonly [number, number?];

export interface RouteRow {
  a: Place;
  b: Place;
  eco?: Pts;
  biz?: Pts;
  /** e.g. "Japan – India" */
  label: string;
}

export interface RouteTable {
  p: PartnerId;
  on: string;
  /** chart: published price; seen: typical lowest seen, prices move */
  kind: "chart" | "seen";
  partner?: boolean;
  rows: readonly RouteRow[];
  note?: string;
}

/** [up to miles, economy, business] */
export type DBand = readonly [number, number, number];

export interface DistanceTable {
  p: PartnerId;
  on: string;
  kind: "chart" | "seen";
  partner?: boolean;
  bands: readonly DBand[];
  /** Only for routes touching one of these places (the airline's home) */
  touches?: Place;
  /** Not for routes touching these places (where the programme's own airline flies) */
  skip?: Place;
  /** Not for flights within one of these countries (no partner flies there) */
  notWithin?: readonly string[];
  /** Label for the price basis, before the band */
  basis: string;
  note?: string;
}

const EUROPE: Place = { continents: ["EU"] };
const INDIA: Place = { countries: ["IN"] };
const JAPAN: Place = { countries: ["JP"] };

/* ---------------- Route tables ---------------- */

export const ROUTE_TABLES: readonly RouteTable[] = [
  {
    p: "jal", on: "Japan Airlines", kind: "chart",
    note: "Base seat price. When base seats run out, PLUS seats cost more, up to several times this.",
    rows: [
      { a: JAPAN, b: { codes: ["DEL", "BLR"] }, eco: [17500], biz: [40000], label: "Japan – India" },
      { a: JAPAN, b: { codes: ["SIN"] }, eco: [13000], biz: [40000], label: "Japan – Singapore" },
      { a: JAPAN, b: { codes: ["BKK"] }, eco: [13500], biz: [40000], label: "Japan – Bangkok" },
      { a: JAPAN, b: { codes: ["HKG"] }, eco: [11000], biz: [26000], label: "Japan – Hong Kong" },
      { a: JAPAN, b: { codes: ["DOH"] }, eco: [20000], biz: [50000], label: "Japan – Doha" },
      { a: JAPAN, b: { codes: ["LHR", "CDG"] }, eco: [27000], biz: [57000], label: "Japan – London / Paris" },
      { a: JAPAN, b: { codes: ["JFK", "ORD", "DFW", "BOS", "LAX", "SFO", "SEA", "SAN", "YVR"] }, eco: [27000], biz: [55000], label: "Japan – North America" },
      { a: JAPAN, b: { codes: ["SYD"] }, eco: [23000], biz: [45000], label: "Japan – Sydney" },
      { a: JAPAN, b: JAPAN, eco: [4500, 10500], label: "Within Japan (by distance zone; Class J 5,500–13,500)" },
    ],
  },
  {
    p: "qatar", on: "Qatar Airways", kind: "seen",
    note: "Typical lowest (off-peak) price; peak dates cost 20–35% more. A trip connecting in Doha is one award.",
    rows: [
      { a: { codes: ["DOH"] }, b: INDIA, eco: [13000], biz: [26000], label: "Doha – India" },
      { a: INDIA, b: { countries: ["US", "CA"] }, eco: [40000, 48000], biz: [80000], label: "India – North America via Doha" },
      { a: INDIA, b: EUROPE, eco: [27500], biz: [55000], label: "India – Europe via Doha" },
      { a: { codes: ["DOH"] }, b: { countries: ["US"] }, eco: [35000, 47500], biz: [70000, 94500], label: "Doha – USA" },
      { a: { codes: ["DOH"] }, b: EUROPE, eco: [20000, 25000], biz: [42500, 55000], label: "Doha – Europe (London / Paris price)" },
      { a: { codes: ["DOH"] }, b: { codes: ["SIN"] }, eco: [25000, 30000], biz: [50000, 62500], label: "Doha – Singapore" },
      { a: { codes: ["DOH"] }, b: { codes: ["BKK"] }, eco: [20000, 25000], biz: [42500, 55000], label: "Doha – Bangkok" },
      { a: { codes: ["DOH"] }, b: { codes: ["MLE"] }, eco: [15000, 20000], biz: [35000, 42500], label: "Doha – Malé" },
      { a: { codes: ["DOH"] }, b: JAPAN, eco: [25000, 32500], biz: [60000, 75000], label: "Doha – Japan" },
      { a: { codes: ["DOH"] }, b: { countries: ["AU"] }, eco: [35000, 47500], biz: [70000, 94500], label: "Doha – Australia" },
      { a: { codes: ["DOH"] }, b: { countries: ["ZA"] }, eco: [30000, 37500], biz: [75000, 90000], label: "Doha – South Africa" },
    ],
  },
  {
    p: "finnair", on: "Finnair", kind: "chart",
    note: "Each flight is priced on its own; a short European flight connecting to this one is free.",
    rows: [{ a: { codes: ["HEL"] }, b: { countries: ["IN", "QA", "AE"] }, eco: [28000], biz: [55000], label: "Helsinki – zone 5 (India, Doha, Dubai)" }],
  },
  {
    p: "vietnam", on: "Vietnam Airlines", kind: "chart",
    note: "Regular to peak price. Priced to and from Vietnam only.",
    rows: [
      { a: { countries: ["VN"] }, b: { countries: ["IN", "LK"] }, eco: [25000, 35000], biz: [60000, 75000], label: "Vietnam – India / Sri Lanka" },
      { a: { countries: ["VN"] }, b: { countries: ["ID", "MY", "MM", "PH", "SG", "TH"] }, eco: [11000, 20000], biz: [35000, 42000], label: "Vietnam – Southeast Asia" },
      { a: { countries: ["VN"] }, b: { countries: ["CN", "HK", "TW"] }, eco: [18000, 24000], biz: [50000, 60000], label: "Vietnam – China, Hong Kong, Taiwan" },
      { a: { countries: ["VN"] }, b: { countries: ["KR"] }, eco: [20000, 30000], biz: [60000, 72000], label: "Vietnam – Korea" },
      { a: { countries: ["VN"] }, b: JAPAN, eco: [35000, 50000], biz: [90000, 105000], label: "Vietnam – Japan" },
      { a: { countries: ["VN"] }, b: { countries: ["AU"] }, eco: [40000, 55000], biz: [150000, 180000], label: "Vietnam – Australia" },
      { a: { countries: ["VN"] }, b: { countries: ["GB", "FR", "DE", "IT", "DK", "NL"] }, eco: [45000, 60000], biz: [160000, 200000], label: "Vietnam – Europe" },
      { a: { countries: ["VN"] }, b: { countries: ["US"] }, eco: [55000, 70000], biz: [250000, 300000], label: "Vietnam – USA" },
    ],
  },
  {
    p: "virgin", on: "Virgin Atlantic", kind: "chart",
    note: "The most a Saver seat costs, standard to peak season; other seats cost far more. Plus surcharges.",
    rows: [{ a: { codes: ["LHR", "LGW", "MAN"] }, b: INDIA, eco: [10000, 20000], biz: [37500, 47500], label: "London – India, Saver" }],
  },
  {
    p: "virgin", on: "Air France / KLM", kind: "chart", partner: true,
    note: "Off-peak to peak. Usually via Paris or Amsterdam.",
    rows: [{ a: INDIA, b: { countries: ["GB", "FR", "NL", "BE", "DE", "CH", "AT", "IT", "ES", "PT", "IE", "DK", "LU"] }, eco: [15000, 25000], biz: [61000, 71000], label: "India – Western Europe" }],
  },
  {
    p: "flyingblue", on: "Air France / KLM", kind: "seen",
    note: "Prices change daily; this is a typical lowest (Light fare, no checked bag in economy). Promo Rewards cut 25–50% on some routes each month.",
    rows: [
      { a: INDIA, b: EUROPE, eco: [30000], label: "India – Europe via Paris / Amsterdam" },
      { a: { countries: ["US", "CA"] }, b: EUROPE, eco: [25000], biz: [60000], label: "North America – Europe" },
      { a: EUROPE, b: EUROPE, eco: [8000], biz: [20000], label: "Within Europe, about" },
    ],
  },
  {
    p: "united", on: "Star Alliance partners (Air India and others)", kind: "seen",
    note: "United publishes no chart for partner flights; lowest prices seen from India over the last 30 days.",
    rows: [
      { a: INDIA, b: { countries: ["NP", "LK", "BD", "MV", "BT"] }, eco: [12500], biz: [30000], label: "India – neighbours" },
      { a: INDIA, b: { countries: ["SG", "TH", "MY", "ID", "VN", "PH", "KH", "MM", "HK"] }, eco: [22500], biz: [65000], label: "India – Southeast Asia / Hong Kong" },
      { a: INDIA, b: { countries: ["JP", "KR"] }, eco: [35000], biz: [90000], label: "India – Japan / Korea" },
      { a: INDIA, b: { countries: ["AE", "QA", "SA", "OM", "BH", "KW"] }, eco: [40000], biz: [75000], label: "India – Middle East" },
      { a: INDIA, b: EUROPE, eco: [55000], biz: [110000], label: "India – Europe" },
      { a: INDIA, b: { countries: ["US", "CA"] }, eco: [45000, 49500], biz: [88000], label: "India – North America" },
      { a: INDIA, b: { countries: ["AU", "NZ"] }, eco: [50000], biz: [110000], label: "India – Australia / New Zealand" },
    ],
  },
  {
    p: "lifemiles", on: "Star Alliance partners", kind: "seen",
    note: "LifeMiles prices vary by airline; lowest seen from India over the last 30 days. No fuel surcharges.",
    rows: [
      { a: INDIA, b: { countries: ["LK", "NP"] }, biz: [35000], label: "India – Sri Lanka / Nepal" },
      { a: INDIA, b: { countries: ["SG", "TH", "MY", "ID", "VN", "PH", "HK", "JP", "KR", "CN", "TW"] }, eco: [25500, 30000], biz: [40800, 48000], label: "India – East and Southeast Asia" },
      { a: INDIA, b: { countries: ["AE", "QA", "SA", "OM", "BH", "KW"] }, eco: [30000], biz: [55000], label: "India – Middle East" },
      { a: INDIA, b: { countries: ["TR", "AT", "CZ", "NL"] }, eco: [25000], biz: [45000], label: "India – Istanbul, Vienna, Prague, Amsterdam" },
      { a: INDIA, b: EUROPE, eco: [34800], biz: [60100], label: "India – Western Europe" },
      { a: INDIA, b: { countries: ["US", "CA"] }, eco: [55000, 70000], biz: [90000, 110000], label: "India – North America (east to west)" },
      { a: INDIA, b: { countries: ["AU"] }, eco: [48710], biz: [76540], label: "India – Australia" },
    ],
  },
  {
    p: "thai", on: "Thai Airways", kind: "chart",
    note: "A trip beyond Bangkok is one award from India to the final zone.",
    rows: [
      { a: { countries: ["IN"], codes: ["KTM", "CMB"] }, b: { countries: ["TH"] }, eco: [17500], biz: [27500], label: "India – Thailand, nonstop chart" },
      { a: INDIA, b: { codes: ["SIN", "KUL", "HAN", "SGN", "RGN", "PNH"] }, eco: [22500], biz: [35000], label: "India – zone 1 via Bangkok" },
      { a: INDIA, b: { codes: ["HKG", "CAN", "PVG", "SHA", "TPE", "DPS", "CGK", "MNL"] }, eco: [25000], biz: [42500], label: "India – zone 2 via Bangkok" },
      { a: INDIA, b: { countries: ["JP", "KR"], codes: ["PEK"] }, eco: [35000], biz: [65000], label: "India – Japan, Korea, Beijing via Bangkok" },
      { a: INDIA, b: { countries: ["AU"] }, eco: [42500], biz: [90000], label: "India – Australia via Bangkok" },
      { a: INDIA, b: { continents: ["EU"], codes: ["IST"] }, eco: [40000], biz: [95000], label: "India – Europe via Bangkok" },
    ],
  },
];

/* ---------------- Turkish Miles&Smiles ---------------- */

export type TkRegion = "TR" | "EU1" | "EU2" | "CAS" | "ME" | "NAF" | "CAF" | "SAF" | "FE" | "NAM" | "SAM" | "OCE";

export const TK_REGION_NAMES: Record<TkRegion, string> = {
  TR: "Türkiye", EU1: "Europe 1", EU2: "Europe 2", CAS: "Central Asia (incl. India)", ME: "Middle East", NAF: "North Africa",
  CAF: "Central Africa", SAF: "Southern Africa", FE: "Far East", NAM: "North America", SAM: "South America", OCE: "Oceania",
};

/** Countries per region; the rest of Europe is Europe 2, the rest of Africa Central Africa, by continent. */
export const TK_COUNTRIES: Partial<Record<TkRegion, readonly string[]>> = {
  TR: ["TR"],
  CAS: ["IN", "PK", "BD", "NP", "AF", "KZ", "UZ", "TM", "KG", "TJ"],
  FE: ["LK", "MV", "CN", "HK", "MO", "TW", "JP", "KR", "MN", "PH", "VN", "LA", "KH", "TH", "MM", "MY", "SG", "BN", "ID"],
  ME: ["AE", "SA", "QA", "BH", "OM", "KW", "IL", "JO", "LB", "IQ", "IR", "SY", "YE"],
  EU1: ["GR", "AL", "BA", "BG", "HR", "ME", "MK", "RS", "SI", "XK", "UA", "GE", "AM", "MD", "RO", "CY"],
  NAF: ["EG", "LY", "TN", "DZ", "MA", "SD"],
  SAF: ["ZA", "NA", "BW", "ZW", "MZ", "ZM", "LS", "SZ", "MG", "MU"],
  NAM: ["US", "CA"],
};

/** Turkish's own flights, Türkiye to each region: [promo eco, award eco, promo biz, award biz] */
export const TK_OWN: Record<TkRegion, readonly [number, number, number, number]> = {
  TR: [4500, 8500, 10000, 15000], EU1: [10000, 15000, 20000, 30000], EU2: [15000, 20000, 25000, 40000],
  CAS: [20000, 25000, 35000, 50000], ME: [18000, 23000, 28000, 45000], NAF: [20000, 35000, 40000, 55000],
  CAF: [25000, 55000, 60000, 110000], SAF: [35000, 70000, 75000, 150000], FE: [35000, 55000, 65000, 140000],
  NAM: [40000, 55000, 65000, 135000], SAM: [50000, 65000, 75000, 145000], OCE: [50000, 80000, 100000, 180000],
};

/** Star Alliance partner awards [eco, biz] from Central Asia (India) and the Middle East to each region */
export const TK_PARTNER: Partial<Record<TkRegion, Record<TkRegion, readonly [number, number]>>> = {
  CAS: { TR: [20000, 35000], EU1: [30000, 55000], EU2: [35000, 60000], CAS: [25000, 35000], ME: [38000, 63000], NAF: [40000, 75000], CAF: [45000, 95000], SAF: [55000, 110000], FE: [55000, 100000], NAM: [60000, 100000], SAM: [70000, 110000], OCE: [80000, 175000] },
  ME: { TR: [18000, 28000], EU1: [28000, 48000], EU2: [33000, 53000], CAS: [38000, 63000], ME: [25000, 35000], NAF: [38000, 68000], CAF: [43000, 88000], SAF: [53000, 103000], FE: [53000, 93000], NAM: [58000, 93000], SAM: [68000, 103000], OCE: [78000, 168000] },
};

/* ---------------- Distance tables ---------------- */

export const DISTANCE_TABLES: readonly DistanceTable[] = [
  {
    p: "etihad", on: "Etihad", kind: "seen", touches: { codes: ["AUH"] }, basis: "Starting price",
    note: "Etihad's published starting prices; live prices are often about double. Business carries high surcharges.",
    bands: [[500, 5000, 15000], [1000, 10000, 20000], [1500, 13000, 30000], [2000, 15000, 35000], [2500, 20000, 45000], [3000, 25000, 60000], [4000, 30000, 70000], [5000, 37000, 75000], [6000, 45000, 95000], [Infinity, 60000, 120000]],
  },
  {
    p: "qantas", on: "Qantas", kind: "chart", touches: { countries: ["AU"] }, basis: "Classic Reward",
    note: "Only if Qantas flies this route. Plus carrier charges.",
    bands: [[600, 9200, 19300], [1200, 13800, 29000], [2400, 20700, 43600], [3600, 23300, 68400], [4800, 29000, 82100], [5800, 36200, 98400], [7000, 43200, 113900], [8400, 48200, 130100], [9600, 58900, 151800], [Infinity, 63500, 166300]],
  },
  // Partner airlines: shown separately, because the price applies only if that partner flies the route
  {
    p: "ba", on: "oneworld partners (Malaysia, SriLankan, Qantas…)", kind: "chart", partner: true, notWithin: ["IN"], basis: "Partner flight",
    skip: { codes: ["LHR", "LGW", "LCY", "MAD", "DUB"] },
    note: "Each flight is priced on its own distance. Not for Qatar or Finnair flights; Cathay and JAL cost more under 3,000 miles.",
    bands: [[650, 6500, 14000], [1150, 10000, 18500], [2000, 12500, 24500], [3000, 14500, 43000], [4000, 23000, 68500], [5500, 28500, 85000], [6500, 34500, 102500], [7000, 40000, 120000], [Infinity, 57000, 170000]],
  },
  {
    p: "qatar", on: "oneworld partners", kind: "seen", partner: true, notWithin: ["IN"], basis: "Partner flight",
    note: "Each flight priced on its own distance. Sources disagree on a few bands; check on qatarairways.com.",
    bands: [[650, 6000, 12500], [1151, 9000, 16500], [2000, 11000, 22000], [3000, 13000, 34000], [4000, 18000, 42500], [5500, 24000, 50000], [6500, 30500, 63750], [7000, 34000, 72250], [Infinity, 42500, 85000]],
  },
  {
    p: "etihad", on: "partner airlines", kind: "chart", partner: true, notWithin: ["IN"], basis: "Partner flight",
    bands: [[500, 6000, 10000], [1000, 12000, 20000], [1500, 15000, 30000], [2000, 23000, 40000], [2500, 28000, 50000], [3000, 34000, 60000], [4000, 45000, 80000], [5000, 60000, 100000], [6000, 67000, 120000], [Infinity, 75000, 140000]],
  },
  {
    p: "jal", on: "oneworld partners", kind: "chart", partner: true, notWithin: ["IN"], basis: "Partner award, total distance",
    note: "Priced on the total miles flown, so a connection can cost more. Up to 3 stopovers allowed.",
    bands: [[1000, 12000, 24000], [2000, 15000, 30000], [4000, 23000, 42000], [6000, 37000, 60000], [8000, 45000, 80000], [10000, 47000, 85000], [12000, 50000, 100000], [14000, 55000, 110000], [Infinity, 70000, 130000]],
  },
  {
    p: "cathay", on: "oneworld partners", kind: "chart", partner: true, notWithin: ["IN"], basis: "Partner flight",
    bands: [[750, 10000, 20000], [2750, 17500, 37000], [5000, 27000, 63000], [7500, 40000, 93000], [Infinity, 47000, 120000]],
    note: "Short-haul partner flights cost 15,000 / 33,000 on some routes. Priced on distance flown.",
  },
  {
    p: "qantas", on: "partner airlines", kind: "chart", partner: true, notWithin: ["IN"], basis: "Partner Classic Reward",
    bands: [[600, 11500, 21000], [1200, 16100, 31500], [2400, 23000, 46000], [3600, 28200, 73400], [4800, 34700, 90000], [5800, 43500, 108000], [7000, 51800, 125400], [8400, 57800, 143000], [9600, 70700, 167000], [Infinity, 76100, 182900]],
  },
];

/** Cathay's own flights from Hong Kong, by distance. Short haul has two price types by city. */
export const CATHAY_OWN = {
  ultraShort: [750, 7000, 16000] as DBand,
  /** 751–2,750 miles: [type 1 eco, type 2 eco, type 1 biz, type 2 biz] */
  short: [9000, 13000, 27000, 33000] as const,
  /** Countries priced as short-haul type 2 */
  type2: ["IN", "LK", "JP", "ID"],
  longer: [[5000, 20000, 60000], [7500, 27000, 91000], [Infinity, 38000, 119000]] as readonly DBand[],
};

/** Programmes with no chart we can use, and why. */
export const NO_CHART: { p: PartnerId; why: string }[] = [
  { p: "ethiopian", why: "Ethiopian publishes no chart, only a calculator on shebamiles.ethiopianairlines.com." },
  { p: "milesmore", why: "Lufthansa, Swiss and Austrian flights are priced day to day since June 2025, and the chart for other partners is round-trip only." },
];

export const MORE_CHART_INFO: ChartInfo[] = [
  {
    p: "jal", flights: "Japan Airlines flights to and from Japan; oneworld partners",
    how: "JAL's own flights have a set price per route (base seats). Partner awards are priced on the total distance flown.",
    taxes: "Fuel surcharges apply on JAL's own international flights.",
    watch: ["Base seats are limited; PLUS seats cost more as a flight fills.", "New accounts may wait about 60 days before booking an award."],
    src: [
      { label: "JAL award miles by route", url: "https://www.jal.co.jp/jp/en/jalmile/use/jal/inter/routemiles.html", date: "2026-04-16" },
      { label: "JAL partner award chart", url: "https://www.jal.co.jp/jp/en/jalmile/use/partner_air/p_jmb/jmb_mile.html", date: "2026-11-15" },
      { label: "JAL domestic awards", url: "https://www.jal.co.jp/jp/en/jalmile/use/jal/domestic-award/miles/", date: "2026-10-26" },
    ],
  },
  {
    p: "qatar", flights: "Qatar Airways flights; oneworld partners",
    how: "No published chart for Qatar's own flights: prices are set per route, off-peak and peak. A trip through Doha is priced as one award.",
    taxes: "Taxes from about US$30; Qatar doesn't add fuel surcharges on its own awards.",
    watch: ["Use Qatar's Avios calculator to check a route before transferring.", "Avios move 1:1 between Qatar and British Airways accounts."],
    src: [
      { label: "AwardFares Qatar guide", url: "https://awardfares.com/blog/qatar-airways-privilege-club-guide/", date: "2026-07-07" },
      { label: "Qatar Avios calculator", url: "https://www.qatarairways.com/en-us/Privilege-Club/qcalculator.html", date: "2026-11-15" },
    ],
  },
  {
    p: "flyingblue", flights: "Air France and KLM flights",
    how: "Dynamic: prices change with demand. We show typical lowest prices seen.",
    taxes: "About ₹7,000–8,000 per flight in economy from India; business is higher.",
    watch: ["Since 8 Sep 2026 awards come as Light, Standard and Flex. The cheapest is Light: no checked bag in economy, no changes.", "Promo Rewards each month cut 25–50% on selected routes."],
    src: [
      { label: "Flying Blue: Light, Standard and Flex", url: "https://www.flyingblue.com/en/news/light-standard-flex-reward-tickets-september-2026", date: "2026-09-08" },
      { label: "Magnify Promo Rewards guide", url: "https://magnify.club", date: "2026-04-06" },
    ],
  },
  {
    p: "etihad", flights: "Etihad flights from Abu Dhabi; partner airlines",
    how: "Etihad's chart gives starting prices by distance; live prices are often higher. Partner flights use a fixed distance chart.",
    taxes: "Business carries surcharges: about ₹43,000 from India to Abu Dhabi in one report.",
    watch: ["Check Etihad's miles calculator for the live price before transferring."],
    src: [
      { label: "AwardFares Etihad Guest guide", url: "https://awardfares.com/blog/etihad-guest-guide/", date: "2026-11-15" },
      { label: "Etihad miles calculator", url: "https://www.etihad.com/en/etihadguest/miles-calculator", date: "2026-11-15" },
    ],
  },
  {
    p: "cathay", flights: "Cathay Pacific flights from Hong Kong; oneworld partners",
    how: "By distance flown. Short flights have two price types; India is the dearer type.",
    taxes: "Fuel surcharges apply on Cathay flights.",
    watch: ["Prices changed on 1 May 2026. Cathay no longer publishes its chart, so these come from blog tables."],
    src: [
      { label: "Australian Frequent Flyer: Cathay award charts", url: "https://www.australianfrequentflyer.com.au/cathay-pacific-award-charts/", date: "2026-05-28" },
    ],
  },
  {
    p: "qantas", flights: "Qantas flights; partner airlines",
    how: "Classic Rewards by flight distance. Classic Plus seats are priced like cash fares and aren't shown.",
    taxes: "Carrier charges on top.",
    watch: ["New prices from 5 August 2025."],
    src: [{ label: "Qantas Classic Flight Reward tables", url: "https://www.qantas.com/en-be/frequent-flyer/use-points/classic-flight-rewards/tables", date: "2025-08-05" }],
  },
  {
    p: "finnair", flights: "Finnair flights to and from Helsinki",
    how: "By zone, the same price every day. Each flight is priced on its own.",
    taxes: "Plus a surcharge of €30 economy / €60 business from zone 5.",
    watch: ["Booking by phone adds 500 Avios."],
    src: [{ label: "Finnair: use Avios on Finnair", url: "https://www.finnair.com/us-en/finnair-plus/collect-and-use-avios/use-avios-on-finnair-award-flights", date: "2026-11-15" }],
  },
  {
    p: "vietnam", flights: "Vietnam Airlines flights to and from Vietnam",
    how: "By route region, regular and peak prices.",
    taxes: "Taxes on top.",
    watch: ["Prices effective 1 June 2026. LotusDay sales sometimes cut prices 50%."],
    src: [{ label: "Vietnam Airlines award chart (PDF)", url: "https://www.vietnamairlines.com/content/dam/vna/vna-assets/global/documents/lotusmiles/redeem/EN_AwardTicket.pdf", date: "2026-06-01" }],
  },
  {
    p: "virgin", flights: "Virgin Atlantic flights; Air France / KLM",
    how: "Virgin's own seats are priced by demand; Saver seats have a maximum per region. Air France / KLM use a zone chart.",
    taxes: "Surcharges on Virgin's own flights; the amount from India isn't published.",
    watch: ["Air India isn't a Virgin partner."],
    src: [
      { label: "AwardFares Flying Club guide", url: "https://awardfares.com/blog/flying-club-guide/", date: "2026-07-10" },
      { label: "Virgin: Air France partner chart", url: "https://www.virginatlantic.com/en-US/flying-club/airline-partners/air-france", date: "2026-11-09" },
    ],
  },
  {
    p: "turkish", flights: "Turkish Airlines flights; Star Alliance partners",
    how: "Turkish's own flights are priced from Türkiye to each region; a trip via Istanbul is two flights added together. Promo seats are cheaper than standard award seats.",
    taxes: "Taxes and some surcharges on top.",
    watch: ["Air India doesn't release seats to Miles&Smiles.", "Turkish has raised prices without notice before (latest: 3 Dec 2025, same-country partner awards)."],
    src: [
      { label: "Turkish Airlines award tickets", url: "https://www.turkishairlines.com/en-tr/miles-and-smiles/redeem-miles/redeem-miles-on-flights/turkish-airlines-award-tickets/", date: "2026-11-15" },
      { label: "AwardFares Miles&Smiles guide", url: "https://awardfares.com/blog/miles-and-smiles-guide/", date: "2026-07-14" },
    ],
  },
  {
    p: "thai", flights: "Thai Airways flights",
    how: "By zone. A trip beyond Bangkok is one award from India to the final zone.",
    taxes: "Taxes and fuel surcharges on top.",
    watch: ["India–Bangkok nonstop prices come from a blog; check Thai's miles calculator."],
    src: [
      { label: "Thai beyond-Bangkok chart (PDF)", url: "https://www.thaiairways.com/content/dam/thaiairways/pdf/BEYOND%20BKK%20AWARD%20CHART_11MAR2026%20EN.pdf.pdf", date: "2026-03-11" },
      { label: "10xTravel Thai award charts", url: "https://10xtravel.com/thai-airways-royal-orchid-plus-award-charts/", date: "2026-11-15" },
    ],
  },
  {
    p: "united", flights: "Star Alliance partners, including Air India",
    how: "No published chart: these are the lowest prices seen from India in the last 30 days.",
    taxes: "United doesn't add fuel surcharges.",
    watch: ["Awards booked within 30 days of departure can cost a little more."],
    src: [{ label: "AwardTool: United from India", url: "https://www.awardtool.com/programs/united-mileageplus/from-india", date: "2026-11-15" }],
  },
  {
    p: "lifemiles", flights: "Star Alliance partners",
    how: "No published chart: these are the lowest prices seen from India in the last 30 days, and they vary by airline.",
    taxes: "No fuel surcharges; a small booking fee.",
    watch: ["Prices changed in Aug 2024 and Feb 2025 without a published chart."],
    src: [{ label: "AwardTool: LifeMiles from India", url: "https://www.awardtool.com/programs/avianca-lifemiles/from-india", date: "2026-11-15" }],
  },
];
