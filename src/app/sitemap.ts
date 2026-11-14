import type { MetadataRoute } from "next";
import { cardSlug, destSlug, SITE_URL } from "@/lib/calc";
import { CREATOR_TRIPS, DESTINATIONS, PROGRAMS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/plan", "/cards", "/learn", "/fly", "/changes", "/trips", "/gift-cards"].map((p) => ({ url: SITE_URL + p, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const cards = PROGRAMS.map((p) => ({ url: `${SITE_URL}/cards/${cardSlug(p.key)}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const dests = DESTINATIONS.map((d) => ({ url: `${SITE_URL}/fly/${destSlug(d)}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const trips = CREATOR_TRIPS.map((t) => ({ url: `${SITE_URL}/trips/${t.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...pages, ...cards, ...dests, ...trips];
}
