import type { PartnerId } from "./partners";

/**
 * Award prices someone actually saw in a search, shared in a points group.
 * One search on one date: seats come and go, so these show what's possible, not
 * what's available now. Names and personal details are never stored.
 */
export interface Sighting {
  p: PartnerId;
  from: string;
  to: string;
  /** Connection airports, if any */
  via?: string[];
  /** Airlines flown, in order */
  airlines: string;
  flights?: string;
  cabin: "eco" | "biz";
  /** Business on one flight, economy on another */
  mixed?: boolean;
  points: number;
  /** Cash on top, as shown */
  cash: string;
  /** Flight date YYYY-MM-DD */
  travel: string;
  /** Date shared YYYY-MM-DD */
  shared: string;
  /** Where the search was made */
  tool: string;
  note?: string;
}

export const SIGHTINGS: readonly Sighting[] = [
  {
    p: "aeroplan", from: "DEL", to: "BOM", airlines: "Air India", flights: "AI2943, Airbus A350", cabin: "biz",
    points: 12500, cash: "CA$46.10", travel: "2026-12-24", shared: "2026-11-15", tool: "seats.aero",
  },
  {
    p: "aeroplan", from: "WAW", to: "BOM", via: ["DEL"], airlines: "LOT, then Air India", flights: "LO71, AI2943", cabin: "biz", mixed: true,
    points: 40000, cash: "CA$76.60", travel: "2026-12-24", shared: "2026-11-15", tool: "seats.aero",
    note: "Listed under Business, but full business from Europe to India costs 70,000 on the chart: this is most likely economy to Delhi and business on to Mumbai.",
  },
  {
    p: "aeroplan", from: "JFK", to: "BOM", via: ["CAI"], airlines: "EgyptAir", cabin: "eco",
    points: 75000, cash: "CA$96", travel: "2026-12-04", shared: "2026-11-15", tool: "Aeroplan app",
    note: "Same day, routes with an Air Canada flight via Montreal or Toronto and Delhi cost 172,800–182,500.",
  },
  {
    p: "airindia", from: "JFK", to: "BOM", airlines: "Air India", flights: "AI116, nonstop", cabin: "eco",
    points: 40000, cash: "₹3,615", travel: "2026-12-04", shared: "2026-11-15", tool: "airindia.com",
  },
];

/** Same-city airports, so a New York search also finds Newark sightings. */
export const METRO: Record<string, string> = { JFK: "NYC", EWR: "NYC", LGA: "NYC", LHR: "LON", LGW: "LON", LCY: "LON", NRT: "TYO", HND: "TYO", GOI: "GOI", GOX: "GOI" };
