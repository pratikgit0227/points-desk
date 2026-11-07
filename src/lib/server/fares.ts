import { cacheLife } from "next/cache";
import { z } from "zod";

/**
 * Cheapest recent cash fares from the Travelpayouts (Aviasales) Data API.
 * Prices come from Aviasales users' searches in roughly the last 48 hours,
 * so they're recent finds, not a live check. Economy only.
 * Needs TRAVELPAYOUTS_TOKEN; TRAVELPAYOUTS_MARKER (partner id) is optional.
 */
export const FARES_ENABLED = Boolean(process.env.TRAVELPAYOUTS_TOKEN);

const API = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";

export interface CheapFare {
  price: number;
  airline: string;
  flightNumber: string;
  departureAt: string;
  transfers: number;
  /** Minutes, if the API gives it */
  duration: number | null;
  /** Aviasales search page for this fare */
  link: string;
  /** Airport the fare actually lands at (the API may return a nearby one, e.g. SHJ for Dubai) */
  destinationAirport: string;
}

const ticket = z
  .object({
    price: z.coerce.number(),
    airline: z.string().optional().default(""),
    flight_number: z.union([z.string(), z.number()]).optional(),
    departure_at: z.string().optional().default(""),
    transfers: z.coerce.number().optional().default(0),
    duration: z.coerce.number().optional(),
    duration_to: z.coerce.number().optional(),
    link: z.string().optional().default(""),
    destination_airport: z.string().optional(),
  })
  .passthrough();

const response = z.object({ success: z.boolean().optional(), data: z.array(z.unknown()).optional().nullable() }).passthrough();

function bookingLink(path: string, from: string, to: string, date: string): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  const base = path ? "https://www.aviasales.com" + (path.startsWith("/") ? path : "/" + path) : `https://www.aviasales.com/search/${from}${date.slice(8, 10)}${date.slice(5, 7)}${to}1`;
  if (!marker) return base;
  return base + (base.includes("?") ? "&" : "?") + "marker=" + encodeURIComponent(marker);
}

/** "/search/DEL0912SHJ1?..." → "SHJ" */
function landingFromLink(link: string): string {
  return link.match(/search\/[A-Z]{3}\d{4}([A-Z]{3})/)?.[1] ?? "";
}

async function query(from: string, to: string, departure: string): Promise<CheapFare[]> {
  const params = new URLSearchParams({
    origin: from,
    destination: to,
    departure_at: departure,
    one_way: "true",
    sorting: "price",
    limit: "10",
    currency: "inr",
    cy: "inr",
    market: "in",
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "X-Access-Token": process.env.TRAVELPAYOUTS_TOKEN!, "Accept-Encoding": "gzip, deflate" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Travelpayouts ${res.status}`);
  const body = response.parse(await res.json());
  return (body.data ?? [])
    .map((t) => ticket.safeParse(t))
    .filter((r) => r.success && r.data.price > 0)
    .map((r) => {
      const t = r.data!;
      return {
        price: Math.round(t.price),
        airline: t.airline,
        flightNumber: t.flight_number != null ? String(t.flight_number) : "",
        departureAt: t.departure_at,
        transfers: t.transfers,
        duration: t.duration_to ?? t.duration ?? null,
        link: bookingLink(t.link, from, to, /^\d{4}-\d{2}-\d{2}/.test(t.departure_at) ? t.departure_at.slice(0, 10) : departure.length === 10 ? departure : departure + "-01"),
        destinationAirport: (t.destination_airport || landingFromLink(t.link) || to).toUpperCase(),
      };
    })
    // Fares into the exact airport first, then cheapest
    .sort((a, b) => Number(b.destinationAirport === to) - Number(a.destinationAirport === to) || a.price - b.price);
}

/**
 * Cheapest fares for a one-way date; falls back to the whole month when the
 * exact day has nothing cached. Cached for an hour to stay inside API limits.
 */
export async function cheapestFares(from: string, to: string, date: string): Promise<{ fares: CheapFare[]; month: boolean }> {
  "use cache";
  cacheLife("hours");
  const day = await query(from, to, date);
  if (day.length) return { fares: day, month: false };
  return { fares: await query(from, to, date.slice(0, 7)), month: true };
}
