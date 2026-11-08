import type { MetadataRoute } from "next";
import { cardSlug, destSlug, SITE_URL } from "@/lib/calc";
import { DESTINATIONS, PROGRAMS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/plan", "/cards", "/learn", "/fly", "/changes"].map((p) => ({ url: SITE_URL + p, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const cards = PROGRAMS.map((p) => ({ url: `${SITE_URL}/cards/${cardSlug(p.key)}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const dests = DESTINATIONS.map((d) => ({ url: `${SITE_URL}/fly/${destSlug(d)}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  return [...pages, ...cards, ...dests];
}
