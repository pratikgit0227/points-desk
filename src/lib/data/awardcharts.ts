import type { PartnerId } from "./partners";

/**
 * Published award charts, one-way, for the award price finder (/awards).
 * Every number here comes from the programme's own chart or a dated dataset
 * built from the programme's calculator; see `src` on each chart.
 */
export const AWARD_CHECKED = "2026-11-15";

export interface ChartSource {
  label: string;
  url: string;
  /** YYYY-MM-DD the source was published or updated; the date we checked it when it shows none */
  date: string;
}

export interface ChartInfo {
  p: PartnerId;
  /** Whose flights the chart prices */
  flights: string;
  /** How the chart works, in one line */
  how: string;
  taxes: string;
  /** Things to know before transferring */
  watch: string[];
  src: ChartSource[];
}

/** [up to miles (inclusive), economy, business] */
export type Band = readonly [upTo: number, eco: number, biz: number];

/* ---------------- Aeroplan: partner flights, by zone pair and distance flown ---------------- */

export type AeroplanZone = "NA" | "ATL" | "PAC" | "SA";

/** Asian countries in Aeroplan's Pacific zone; the rest of Asia (India, the Gulf, Middle East) is Atlantic. */
export const AEROPLAN_PACIFIC_ASIA = ["CN", "HK", "MO", "TW", "JP", "KR", "MN", "PH", "VN", "LA", "KH", "TH", "MM", "MY", "SG", "BN", "ID", "TL"];
/** Asian countries in the Atlantic zone */
export const AEROPLAN_ATLANTIC_ASIA = ["IN", "MV", "AE", "QA", "SA", "OM", "BH", "KW", "JO", "LB", "IL", "IQ", "IR", "SY", "YE", "CY", "TR"];
/** Not confirmed: the official zone map is an image, and blogs disagree for these. */
export const AEROPLAN_UNKNOWN = ["LK", "NP", "BD", "BT", "PK", "AF", "KZ", "UZ", "TM", "KG", "TJ", "RU", "GE", "AM", "AZ"];

/** Key: zones sorted alphabetically and joined with "-" ("ATL-NA"), or one zone for travel within it. */
export const AEROPLAN_BANDS: Record<string, readonly Band[]> = {
  ATL: [[1000, 7500, 12500], [2000, 15000, 22500], [4000, 30000, 40000], [6000, 42500, 70000], [Infinity, 50000, 95000]],
  PAC: [[1000, 8000, 20000], [2000, 15000, 30000], [5000, 30000, 52500], [7000, 35000, 72500], [Infinity, 50000, 85000]],
  "ATL-PAC": [[2500, 25000, 47500], [5000, 40000, 75000], [7000, 60000, 92500], [Infinity, 75000, 130000]],
  "ATL-NA": [[4000, 32500, 60000], [6000, 42500, 75000], [8000, 60000, 90000], [Infinity, 75000, 110000]],
  "NA-PAC": [[5000, 32500, 55000], [7500, 50000, 85000], [11000, 65000, 102500], [Infinity, 70000, 115000]],
  "NA-SA": [[2500, 20000, 40000], [4500, 30000, 50000], [Infinity, 40000, 60000]],
  NA: [[500, 6000, 15000], [1500, 10000, 20000], [2750, 12500, 25000], [Infinity, 22500, 35000]],
  SA: [[1600, 10000, 20000], [Infinity, 20000, 35000]],
  "ATL-SA": [[7000, 45000, 80000], [Infinity, 60000, 100000]],
  "PAC-SA": [[11000, 60000, 90000], [Infinity, 80000, 140000]],
};

export const AEROPLAN_ZONE_NAMES: Record<AeroplanZone, string> = { NA: "North America", ATL: "Atlantic", PAC: "Pacific", SA: "South America" };

/* ---------------- KrisFlyer: Singapore Airlines flights, Saver, by zone ---------------- */

export type KfZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export const KF_ZONE_NAMES: Record<KfZone, string> = {
  1: "Singapore", 2: "Malaysia, Indonesia, Brunei", 3: "Thailand, Vietnam, Philippines and nearby", 4: "Hong Kong, Taiwan, China",
  5: "Beijing, Shanghai", 6: "South Asia", 7: "Japan, South Korea", 8: "Perth, Darwin", 9: "Australia, New Zealand",
  10: "Africa, Middle East, Turkey", 11: "Europe", 12: "USA West Coast", 13: "USA East Coast",
};

/** Saver [economy, business] in miles. From Singapore to each zone. */
export const KF_FROM_SIN: Partial<Record<KfZone, readonly [number, number]>> = {
  2: [8000, 22000], 3: [13000, 25000], 4: [15500, 35500], 5: [20500, 45000], 6: [19000, 45000], 7: [25500, 54500],
  8: [20500, 42500], 9: [29000, 72000], 10: [32000, 68000], 11: [44000, 108500], 12: [44000, 112500], 13: [46000, 117000],
};

/** Saver [economy, business] from South Asia (zone 6) to each zone, via Singapore, priced as one award. Europe and zone 10 aren't priced. */
export const KF_FROM_SOUTH_ASIA: Partial<Record<KfZone, readonly [number, number]>> = {
  1: [19000, 45000], 2: [20000, 47500], 3: [20000, 47500], 4: [25000, 62000], 5: [36000, 78500], 7: [42000, 88000],
  8: [32000, 75000], 9: [42000, 100000], 12: [55000, 133000], 13: [65500, 147500],
};

/** US airports Singapore Airlines flies to. Other US cities need a partner. */
export const KF_US: Record<string, KfZone> = { LAX: 12, SFO: 12, SEA: 12, JFK: 13, EWR: 13 };

/* ---------------- Air India: own flights, by route (see airindia-routes.ts) or region ---------------- */

/** Region prices between India and each region, [Value, Prime], used when a route isn't in the route table. */
export interface AiRegion {
  name: string;
  countries: readonly string[];
  eco: readonly [number, number];
  biz: readonly [number, number];
}

export const AI_REGIONS: readonly AiRegion[] = [
  { name: "Gulf", countries: ["AE", "QA", "SA", "OM", "BH", "KW"], eco: [12000, 30000], biz: [50000, 60000] },
  { name: "Southeast Asia", countries: ["SG", "TH", "MY", "ID", "VN", "PH"], eco: [12000, 40000], biz: [50000, 60000] },
  { name: "Mauritius", countries: ["MU"], eco: [12000, 30000], biz: [50000, 60000] },
  { name: "South Asia", countries: ["LK", "MV", "NP", "BD"], eco: [10000, 25000], biz: [40000, 50000] },
  { name: "East Asia", countries: ["HK", "JP", "KR", "CN"], eco: [30000, 70000], biz: [90000, 110000] },
  { name: "UK and Europe", countries: ["GB", "DE", "FR", "AT", "CH", "IT", "DK", "NL", "IL"], eco: [35000, 70000], biz: [100000, 130000] },
  { name: "USA", countries: ["US"], eco: [40000, 90000], biz: [130000, 180000] },
  { name: "Canada", countries: ["CA"], eco: [50000, 100000], biz: [130000, 180000] },
  { name: "Australia", countries: ["AU"], eco: [40000, 90000], biz: [130000, 160000] },
];

/* ---------------- British Airways Avios: by distance of each flight ---------------- */

/** BA, Iberia and Aer Lingus flights: [up to miles, economy off-peak, economy peak, business off-peak, business peak] */
export const BA_OWN: readonly (readonly [number, number, number, number, number])[] = [
  [650, 10000, 10750, 16500, 18000], [1150, 13000, 14000, 22000, 24500], [2000, 15000, 16750, 26750, 30000],
  [3000, 24750, 30250, 77000, 88000], [4000, 27500, 33000, 88000, 99000], [5500, 33000, 38500, 99000, 110000],
  [6500, 38500, 44000, 110000, 121000], [7000, 44000, 49500, 121000, 132000], [Infinity, 55000, 60500, 159500, 187000],
];

/** Partner flights (Malaysia, SriLankan, Qantas, Royal Jordanian, and Cathay / JAL above 3,000 miles), priced per flight */
export const BA_PARTNER: readonly Band[] = [
  [650, 6500, 14000], [1150, 10000, 18500], [2000, 12500, 24500], [3000, 14500, 43000], [4000, 23000, 68500],
  [5500, 28500, 85000], [6500, 34500, 102500], [7000, 40000, 120000], [Infinity, 57000, 170000],
];

/** BA and Iberia / Aer Lingus hubs: BA's own price applies only to flights touching these */
export const BA_HUBS = ["LHR", "LGW", "LCY", "MAD", "DUB"];

/* ---------------- About each chart ---------------- */

export const CHART_INFO: ChartInfo[] = [
  {
    p: "airindia",
    flights: "Air India flights (and Air India Express, economy only)",
    how: "Priced route by route. Value is the lowest price, released until 30 days before departure; Prime is charged once Value seats are gone.",
    taxes: "Taxes in cash on top: about ₹3,600 one-way from New York to Mumbai in one sighting; lower within India.",
    watch: [
      "Air India calls its prices tentative and can change them without notice; the last big change was 1 April 2026.",
      "Free changes and cancellations depend on your Maharaja Club tier; otherwise 25% of the points.",
    ],
    src: [
      { label: "Air India press release", url: "https://www.airindia.com/content/dam/air-india/newsroom/press-releases/pdf/Press-Release-Maharaja-Club-Changes-01Apr26.pdf", date: "2026-04-01" },
      { label: "The Double Dip route data (Air India calculator)", url: "https://doubledip.in/blog/air-india-revaluation-april-2026", date: "2026-04-01" },
      { label: "AwardWallet", url: "https://awardwallet.com/news/air-india-maharaja-club-award-chart-changes-2026/", date: "2026-04-13" },
    ],
  },
  {
    p: "aeroplan",
    flights: "Star Alliance partners: Air India, Lufthansa, Swiss, Turkish, Singapore, Thai, ANA, EgyptAir, Ethiopian and others",
    how: "Fixed price by the zones you fly between and the total miles flown. Connections add miles, which can push a trip into a dearer band.",
    taxes: "Taxes plus a CA$39 partner booking fee; Aeroplan doesn't add fuel surcharges on partner flights.",
    watch: [
      "Air Canada's own flights, and United, Emirates, flydubai and Etihad, are priced day to day and often cost far more than this chart. On 4 Dec 2026 New York → Mumbai was 75,000 via Cairo on EgyptAir but 172,000+ on routes using Air Canada.",
      "Chart changed on 1 June 2026; long-haul business got dearer.",
    ],
    src: [
      { label: "Aeroplan flight reward chart (PDF, Aug 2026)", url: "https://www.aircanada.com/content/dam/aircanada/loyalty-content/documents/flight-rewards-chart-en.pdf", date: "2026-08-01" },
      { label: "CardExpert on the June 2026 chart", url: "https://www.cardexpert.in/air-canada-aeroplan-points-requirement-changes-june-2026/", date: "2026-04-27" },
      { label: "PointsYeah Aeroplan chart", url: "https://www.pointsyeah.com/insider/airlines/aeroplan-award-chart", date: "2026-11-09" },
    ],
  },
  {
    p: "krisflyer",
    flights: "Singapore Airlines flights (Saver awards)",
    how: "Fixed price by zone. A trip connecting in Singapore is one award from your start zone to your end zone, not two.",
    taxes: "No fuel surcharges on Singapore Airlines flights: about ₹2,200 from Mumbai to Singapore and ₹4,000–6,000 to the USA.",
    watch: [
      "Saver seats go early on popular dates; Advantage awards cost much more but are easier to find.",
      "Saver awards must be ticketed when you book, so transfer first. Miles expire after 3 years.",
    ],
    src: [
      { label: "Singapore Airlines award chart (PDF, effective 1 Nov 2025)", url: "https://www.singaporeair.com/content/dam/sia/web-assets/pdfs/ppsclub-krisflyer/krisflyer/progupdates/awardcharts/Singapore_Airlines_One-Way_AdvantageSaver_Award_Chart_261002.pdf", date: "2025-11-01" },
      { label: "Mainly Miles: chart unchanged", url: "https://mainlymiles.com/2026/10/28/best-sia-krisflyer-redemption-per-minute/", date: "2026-10-28" },
      { label: "CardExpert KrisFlyer guide (taxes)", url: "https://www.cardexpert.in/singapore-airlines-krisflyer-guide/", date: "2025-07-25" },
    ],
  },
  {
    p: "ba",
    flights: "British Airways, Iberia and Aer Lingus flights; oneworld partners such as Malaysia, SriLankan, Qantas, Cathay and JAL",
    how: "Priced by the distance of each flight. A connection is two flights, each priced on its own, so nonstops are cheaper.",
    taxes: "BA's own flights add a fixed cash charge set by country of departure (from London to India: £95 economy, £299.50 business). The amount from India isn't published, so check on ba.com. Partner flights add their actual taxes.",
    watch: [
      "BA's own flights have off-peak and peak prices; the lower number is off-peak.",
      "Qatar and Finnair flights don't use this chart. Cathay and JAL cost more on flights under 3,000 miles.",
      "Prices rose about 10% on 15 Dec 2025, and the cash part rose again on 27 May 2026.",
    ],
    src: [
      { label: "Head for Points: Avios needed per route", url: "https://www.headforpoints.com/2026/08/01/how-many-avios-do-you-need-to-fly-to/", date: "2026-08-01" },
      { label: "Head for Points on the Dec 2025 change", url: "https://www.headforpoints.com/2025/12/16/avios-devaluation-analysis/", date: "2025-12-16" },
      { label: "Verylvke partner chart", url: "https://www.verylvke.com/en/2025/12/19/ba-avios-partner-award-devaluation-full-chart-included/", date: "2025-12-19" },
    ],
  },
];
