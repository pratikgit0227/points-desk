import { AIRPORTS, COUNTRY_NAMES, type AirportRow } from "@/lib/data/airports";

export interface Airport {
  code: string;
  city: string;
  /** ISO country code */
  country: string;
  /** Continent code: AF AN AS EU NA OC SA */
  continent: string;
  lat: number;
  lon: number;
}

/** Friendlier city names where OurAirports uses the airport's town. */
const CITY_FIX: Record<string, string> = {
  DEL: "Delhi", GOI: "Goa (Dabolim)", GOX: "Goa (Mopa)", BOM: "Mumbai", BLR: "Bengaluru", MAA: "Chennai", CCU: "Kolkata",
  HYD: "Hyderabad", COK: "Kochi", NRT: "Tokyo Narita", HND: "Tokyo Haneda", EWR: "Newark (New York)", LGA: "New York LaGuardia",
};

const toAirport = ([code, city, country, continent, lat, lon]: AirportRow): Airport => ({ code, city: CITY_FIX[code] ?? city, country, continent, lat, lon });

const BY_CODE = new Map(AIRPORTS.map((r) => [r[0], toAirport(r)]));

export function airport(code: string): Airport | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

export function airportLabel(a: Airport): string {
  return `${a.city} (${a.code})`;
}

/** Airports matching typed text: exact code first, then city / country starts, then contains. */
export function searchAirports(q: string, limit = 8): Airport[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const scored: [number, Airport][] = [];
  for (const a of BY_CODE.values()) {
    const city = a.city.toLowerCase();
    const ctry = countryName(a.country).toLowerCase();
    let score = -1;
    if (a.code.toLowerCase() === s) score = 0;
    else if (city.startsWith(s)) score = 1;
    else if (ctry.startsWith(s)) score = 3;
    else if (city.includes(s)) score = 2;
    if (score >= 0) scored.push([score, a]);
  }
  return scored
    .sort((x, y) => x[0] - y[0] || Number(y[1].country === "IN") - Number(x[1].country === "IN") || x[1].city.localeCompare(y[1].city))
    .slice(0, limit)
    .map((x) => x[1]);
}

/** Great-circle distance in statute miles (what airline charts use). */
export function distanceMiles(a: Pick<Airport, "lat" | "lon">, b: Pick<Airport, "lat" | "lon">): number {
  const R = 3958.8;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
