import { destinationBySlug, destinationFacts, destSlug } from "@/lib/calc";
import { DESTINATIONS, PARTNERS } from "@/lib/data";
import { fmt, inr } from "@/lib/format";
import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = "Award flight prices from India in credit card points";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: destSlug(d) }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const d = destinationBySlug((await params).slug)!;
  const f = destinationFacts(d);
  const lines = [f.minEco && `Economy ${fmt(f.minEco.r.eco!)}`, f.minBiz && `Business ${fmt(f.minBiz.r.biz!)}`].filter(Boolean).join(" · ");
  const via = [
    f.minEco && `economy via ${PARTNERS[f.minEco.p].n}`,
    f.minBiz && f.minBiz.p !== f.minEco?.p && `business via ${PARTNERS[f.minBiz.p].n}`,
  ].filter(Boolean);
  return shareImage({
    eyebrow: `India → ${d.name}, ${d.country}`,
    title: `Fly to ${d.name} on points`,
    big: lines || `${f.routes.length} ways with points`,
    sub: ["Points one-way", ...via, `cash fare about ${inr(d.fare.eco)}`].join(" · "),
  });
}
