import { BAG_STALE_DAYS, BAGGAGE, type AirlineBaggage, type AwardRoute, type BagRule, type Cabin } from "@/lib/data";

/**
 * Flight details shown next to every option: the airline's general baggage
 * rules, how sure we are of the price, and where the numbers came from.
 *
 * A ticket's own baggage is never known here, so it is always "not confirmed";
 * the airline's general rule is shown as guidance only.
 */

const names = BAGGAGE.flatMap((a) => [a.name, ...(a.aka ?? [])].map((n) => ({ n: n.toLowerCase(), a }))).sort((x, y) => y.n.length - x.n.length);

/** Airlines named in route text like "Air India / Singapore Airlines", longest names first so "Air India Express" isn't read as "Air India". */
export function airlinesIn(text: string): AirlineBaggage[] {
  let rest = " " + text.toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
  const out: AirlineBaggage[] = [];
  for (const { n, a } of names) {
    const key = " " + n.replace(/[^a-z0-9]+/g, " ") + " ";
    if (!rest.includes(key)) continue;
    rest = rest.replaceAll(key, " ");
    if (!out.includes(a)) out.push(a);
  }
  return out;
}

/** Airline by its two-letter code, as fare results give it. */
export function airlineByCode(code: string): AirlineBaggage | undefined {
  const c = code.trim().toUpperCase();
  return BAGGAGE.find((a) => a.iata === c);
}

/** Whole days from `from` to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.floor((Date.parse(to) - Date.parse(from)) / 864e5);
}

/** A rule read more than BAG_STALE_DAYS ago may have changed. `today` empty = unknown (server render). */
export function isStale(checked: string, today: string): boolean {
  return Boolean(today) && daysBetween(checked, today) > BAG_STALE_DAYS;
}

/** "1 × 23 kg", "2 × 32 kg", "30 kg", else the rule's own words. */
export function bagShort(r: BagRule): string {
  if (r.pieces && r.kg) return `${r.pieces} × ${r.kg} kg`;
  if (r.kg) return `${r.kg} kg`;
  if (r.pieces) return `${r.pieces} piece${r.pieces > 1 ? "s" : ""}`;
  return "";
}

export interface BagGuide {
  a: AirlineBaggage;
  checkedBag: BagRule;
  cabinBag: BagRule;
  personal: { text: string } | null;
  stale: boolean;
}

/** The general rules for each airline on a route, in one cabin. */
export function bagGuides(airlineText: string, cabin: Cabin, today = ""): BagGuide[] {
  return airlinesIn(airlineText).map((a) => ({
    a,
    checkedBag: a[cabin].checked,
    cabinBag: a[cabin].cabin,
    personal: a[cabin].personal,
    stale: isStale(a.checked, today),
  }));
}

export type PriceKind = "chart" | "lowest" | "estimate" | "revenue";

/** How sure the award price is. Seats are never checked here. */
export function priceBasis(r: AwardRoute): { kind: PriceKind; label: string } {
  if (r.pricing === "revenue") return { kind: "revenue", label: "Points pay the cash fare" };
  if (r.confidence === "low") return { kind: "estimate", label: "Estimated from nearby routes" };
  if (r.pricing === "dynamic") return { kind: "lowest", label: "Lowest price seen; changes by date" };
  return { kind: "chart", label: "Published chart price" };
}

export const PRICE_TAG: Record<PriceKind, string> = { chart: "chart", lowest: "lowest seen", estimate: "est.", revenue: "fare" };

const SOUTH = ["BLR", "MAA", "HYD", "COK", "CCJ", "TRV"];

/**
 * Where an award route leaves from, against the user's departure airport.
 * fromYou: true = leaves from their city, false = from elsewhere, null = route text is general ("Indian cities").
 */
export function routeOrigin(route: string, from: string, fromName: string): { cities: string; fromYou: boolean | null } {
  const cities = route.split("→")[0].trim();
  if (!route.includes("→")) return { cities: "", fromYou: null };
  const c = cities.toLowerCase();
  if (/indian (cities|metros)|many|most/.test(c)) return { cities, fromYou: null };
  if (c.includes(fromName.toLowerCase())) return { cities, fromYou: true };
  if (c.includes("south india") && SOUTH.includes(from)) return { cities, fromYou: true };
  return { cities, fromYou: false };
}
