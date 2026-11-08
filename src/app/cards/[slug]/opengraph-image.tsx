import { cardFacts, cardSlug, programBySlug } from "@/lib/calc";
import { CARD_INFO, PARTNERS, PROGRAMS } from "@/lib/data";
import { inr, ratioTxt } from "@/lib/format";
import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = "Credit card transfer partners and best value per point";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: cardSlug(p.key) }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const prog = programBySlug((await params).slug)!;
  const f = cardFacts(prog);
  const ci = CARD_INFO[prog.key];
  const top = f.partners[0];
  return shareImage({
    eyebrow: `${prog.bank} · ${ci?.status ?? ""}`,
    title: f.name,
    big: `Up to ₹${f.bestPer.toFixed(2)} a point`,
    sub:
      (f.partners.length ? `${f.partners.length} transfer partners` : "No transfer partners") +
      (top && top.per > prog.base.v ? ` · ${PARTNERS[top.p].n} at ${ratioTxt(top.ratio)}` : "") +
      (ci ? ` · fee ${ci.fee ? inr(ci.fee) : "nil"}` : ""),
  });
}
