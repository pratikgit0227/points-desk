import { DESTINATIONS, PHOTOS, type Photo } from "@/lib/data";

/** Photo for a destination id. */
export function destPhoto(id: string): Photo | undefined {
  return PHOTOS[id];
}

const AREAS: [RegExp, string][] = [
  [/japan/i, "japan"],
  [/usa|us city|america|chicago|newark/i, "usa"],
  [/canada/i, "yyz"],
  [/australia/i, "syd"],
  [/helsinki/i, "helsinki"],
  [/europe|munich|vienna/i, "europe"],
  [/vietnam|hanoi|ho chi minh|da nang/i, "han"],
  [/nairobi|africa|addis|cape town|zanzibar/i, "nbo"],
  [/india|indigo|delhi|mumbai/i, "india"],
];

/**
 * Photo for free text like "Dubai, Doha, Singapore" or "Hilton hotels in Goa":
 * the first destination named, else a wider area, else none.
 */
export function photoFor(text: string, hotel = false): Photo | undefined {
  if (hotel) {
    if (/maldives/i.test(text)) return PHOTOS.mle;
    if (/udaipur|jaipur|palace|raffles|fairmont|barwara/i.test(text)) return PHOTOS.palace;
    if (/goa/i.test(text)) return PHOTOS.goa;
    return PHOTOS.hotel;
  }
  let best: { at: number; id: string } | null = null;
  for (const d of DESTINATIONS) {
    const at = text.toLowerCase().indexOf(d.name.toLowerCase());
    if (at >= 0 && (!best || at < best.at)) best = { at, id: d.id };
  }
  if (best && PHOTOS[best.id]) return PHOTOS[best.id];
  for (const [re, key] of AREAS) if (re.test(text)) return PHOTOS[key];
  return undefined;
}

/** "Photo: Jane Doe · CC BY-SA 4.0", author trimmed for small spaces. */
export function creditText(p: Photo, max = 40): string {
  const by = p.by.length > max ? p.by.slice(0, max - 1) + "…" : p.by;
  return `Photo: ${by} · ${p.license}`;
}
