import { describe, expect, it } from "vitest";
import { DESTINATIONS, PROGRAMS, findProgram } from "@/lib/data";
import { cardFacts, cardSlug, destinationBySlug, destinationFacts, destSlug, programBySlug } from "./pages";

describe("page slugs", () => {
  it("every card and destination has a unique slug that maps back", () => {
    const cs = PROGRAMS.map((p) => cardSlug(p.key));
    expect(new Set(cs).size).toBe(cs.length);
    for (const p of PROGRAMS) expect(programBySlug(cardSlug(p.key))).toBe(p);
    const ds = DESTINATIONS.map(destSlug);
    expect(new Set(ds).size).toBe(ds.length);
    for (const d of DESTINATIONS) expect(destinationBySlug(destSlug(d))).toBe(d);
  });
  it("uses readable slugs", () => {
    expect(cardSlug("amex_mr")).toBe("amex-platinum-travel");
    expect(destSlug(DESTINATIONS.find((d) => d.name === "New York")!)).toBe("new-york");
  });
});

describe("cardFacts", () => {
  it("ranks partners by ₹ per point and lists cheapest destinations first", () => {
    const f = cardFacts(findProgram("hsbc_travelone")!);
    for (let i = 1; i < f.partners.length; i++) expect(f.partners[i - 1].per).toBeGreaterThanOrEqual(f.partners[i].per);
    for (let i = 1; i < f.destinations.length; i++) expect(f.destinations[i - 1].cardPts).toBeLessThanOrEqual(f.destinations[i].cardPts);
    expect(f.bestPer).toBeGreaterThanOrEqual(f.prog.base.v);
  });
  it("handles a card with no transfer partners", () => {
    const f = cardFacts(findProgram("scapia")!);
    expect(f.partners).toHaveLength(0);
    expect(f.bestPer).toBe(f.prog.base.v);
    expect(f.destinations).toHaveLength(0);
  });
});

describe("destinationFacts", () => {
  it("picks an open card as the best open source", () => {
    for (const d of DESTINATIONS) {
      for (const r of destinationFacts(d).routes) if (r.bestOpen) expect(r.bestOpen.open).toBe(true);
    }
  });
  it("finds the cheapest award per cabin, ignoring points-pay-the-fare routes", () => {
    const f = destinationFacts(DESTINATIONS.find((d) => d.id === "kwi")!);
    expect(f.minEco!.r.pricing).not.toBe("revenue");
    expect(f.minEco!.r.eco).toBe(Math.min(...f.routes.filter((x) => x.r.pricing !== "revenue" && x.r.eco).map((x) => x.r.eco!)));
  });
});
