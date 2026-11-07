import { CARD_INFO, DATA_CHECKED, FARES, GUIDES, MERCHANTS, PARTNERS, PROGRAMS } from "@/lib/data";

/** All reference data (partners, cards, ratios, guides) as JSON. Prerendered at build time. */
export async function GET() {
  return Response.json({
    checked: DATA_CHECKED,
    partners: PARTNERS,
    programs: PROGRAMS,
    cards: CARD_INFO,
    guides: GUIDES,
    merchants: MERCHANTS,
    fares: FARES,
  });
}
