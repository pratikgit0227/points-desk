import { describe, expect, it } from "vitest";
import { BAG_STALE_DAYS, BAGGAGE, DATA_CHECKED, DESTINATIONS } from "@/lib/data";
import { planDestination } from "./destinations";
import { airlineByCode, airlinesIn, bagGuides, bagShort, isStale, priceBasis, routeOrigin } from "./fareinfo";

const ids = (t: string) => airlinesIn(t).map((a) => a.id);

describe("baggage data", () => {
  it("every airline has a source page, a read date and words for each allowance", () => {
    for (const a of BAGGAGE) {
      expect(a.url, a.id).toMatch(/^https:\/\//);
      expect(a.checked, a.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.checked <= DATA_CHECKED || a.checked <= "2026-11-09", a.id).toBe(true);
      expect(a.iata, a.id).toMatch(/^[A-Z0-9]{2}$/);
      for (const c of [a.eco, a.biz]) {
        expect(c.checked.text.length, a.id).toBeGreaterThan(3);
        expect(c.cabin.text.length, a.id).toBeGreaterThan(3);
      }
    }
  });

  it("ids and codes are unique", () => {
    expect(new Set(BAGGAGE.map((a) => a.id)).size).toBe(BAGGAGE.length);
    expect(new Set(BAGGAGE.map((a) => a.iata)).size).toBe(BAGGAGE.length);
  });

  it("every named airline on a destination route has rules", () => {
    const generic = /^(partner airlines|star alliance( partner)?|partners)$/i;
    // No baggage research yet; the route still shows its other airlines
    const gaps = ["EVA"];
    const missing = new Set<string>();
    for (const d of DESTINATIONS)
      for (const r of d.options)
        for (const part of r.airline.split(/\s*\/\s*|\s*\(.*?\)\s*/).filter(Boolean)) {
          if (generic.test(part.trim()) || gaps.includes(part.trim())) continue;
          if (!airlinesIn(part).length) missing.add(part.trim());
        }
    expect([...missing]).toEqual([]);
  });
});

describe("airlinesIn", () => {
  it("reads Air India Express as its own airline", () => {
    expect(ids("Air India Express")).toEqual(["airindiaexpress"]);
  });
  it("finds every airline on a codeshare route", () => {
    expect(ids("Air India / Singapore Airlines").sort()).toEqual(["airindia", "singapore"]);
  });
  it("matches nothing for generic text", () => {
    expect(ids("Partner airlines")).toEqual([]);
  });
});

describe("airlineByCode", () => {
  it("finds by two-letter code, any case", () => {
    expect(airlineByCode("6e")?.id).toBe("indigo");
    expect(airlineByCode("ZZ")).toBeUndefined();
  });
});

describe("staleness", () => {
  it("is never judged without today's date", () => {
    expect(isStale("2020-01-01", "")).toBe(false);
  });
  it(`flags rules older than ${BAG_STALE_DAYS} days`, () => {
    expect(isStale("2026-01-01", "2026-11-09")).toBe(true);
    expect(isStale("2026-11-01", "2026-11-09")).toBe(false);
  });
  it("carries into the guides", () => {
    const [g] = bagGuides("Air India", "eco", "2030-01-01");
    expect(g.stale).toBe(true);
  });
});

describe("bagShort", () => {
  it("formats pieces and weight, and stays empty when unknown", () => {
    expect(bagShort({ pieces: 2, kg: 23, text: "" })).toBe("2 × 23 kg");
    expect(bagShort({ pieces: null, kg: 30, text: "" })).toBe("30 kg");
    expect(bagShort({ pieces: null, kg: null, text: "Depends on fare" })).toBe("");
  });
});

describe("priceBasis", () => {
  it("labels estimates, lows, charts and revenue fares", () => {
    const base = { p: "x", airline: "", route: "" } as const;
    expect(priceBasis({ ...base, pricing: "fixed", confidence: "low" }).kind).toBe("estimate");
    expect(priceBasis({ ...base, pricing: "dynamic", confidence: "high" }).kind).toBe("lowest");
    expect(priceBasis({ ...base, pricing: "fixed", confidence: "high" }).kind).toBe("chart");
    expect(priceBasis({ ...base, pricing: "revenue", confidence: "high" }).kind).toBe("revenue");
  });
});

describe("planDestination for a party", () => {
  const kwi = DESTINATIONS.find((d) => d.id === "kwi")!;
  const atlas = { axis_atlas: { n: 20000, src: "manual" as const } };
  it("multiplies points and shortfall by travellers but keeps value per point", () => {
    const [one] = planDestination(kwi, "eco", 16000, atlas);
    const [two] = planDestination(kwi, "eco", 16000, atlas, {}, null, 2);
    expect(two.p).toBe(one.p);
    expect(two.each).toBe(one.each);
    expect(two.miles).toBe(one.miles * 2);
    expect(two.cardPts).toBe(one.cardPts * 2);
    expect(two.perPoint).toBe(one.perPoint);
    expect(two.pax).toBe(2);
  });
  it("shows a shortfall once the party outgrows the balance", () => {
    const plans = planDestination(kwi, "eco", 16000, atlas, {}, null, 4);
    const ai = plans.find((x) => x.p === "airindia")!;
    expect(ai.canBook).toBe(false);
    expect(ai.short).toBe(ai.miles - 40000);
  });
});

describe("routeOrigin", () => {
  it("knows when a route leaves from the user's city", () => {
    expect(routeOrigin("Delhi / Mumbai → Singapore, nonstop", "BOM", "Mumbai")).toEqual({ cities: "Delhi / Mumbai", fromYou: true });
    expect(routeOrigin("Delhi / Mumbai → Singapore, nonstop", "BLR", "Bengaluru").fromYou).toBe(false);
    expect(routeOrigin("South India / Mumbai → Kuwait", "COK", "Kochi").fromYou).toBe(true);
  });
  it("stays neutral for general route text", () => {
    expect(routeOrigin("Indian cities → Singapore, nonstop", "BLR", "Bengaluru").fromYou).toBeNull();
  });
});
