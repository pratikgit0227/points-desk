import { describe, expect, it } from "vitest";
import { DESTINATIONS, MERCHANTS, PARTNERS } from "@/lib/data";
import { matchDestinations, merchantFor, planDestination } from "./destinations";

const kuwait = DESTINATIONS.find((d) => d.id === "kwi")!;
const atlas = (n: number) => ({ axis_atlas: { n, src: "manual" as const } });

describe("destination data", () => {
  it("every option uses a known partner and has a price or is revenue-based", () => {
    for (const d of DESTINATIONS) {
      for (const r of d.options) {
        expect(PARTNERS, `${d.id} ${r.p}`).toHaveProperty(r.p);
        if (r.pricing !== "revenue") expect(r.eco || r.biz, `${d.id} ${r.p}`).toBeTruthy();
      }
    }
  });
  it("nonstop merchants exist", () => {
    for (const d of DESTINATIONS) for (const a of d.nonstop) if (a.merchant) expect(MERCHANTS.some((m) => m.id === a.merchant)).toBe(true);
  });
});

describe("matchDestinations", () => {
  it("finds by city, airport code or country", () => {
    expect(matchDestinations("kuwait")[0].id).toBe("kwi");
    expect(matchDestinations("KWI")[0].id).toBe("kwi");
    expect(matchDestinations("saudi").map((d) => d.id)).toEqual(["ruh", "jed"]);
    expect(matchDestinations("umrah")[0].id).toBe("jed");
  });
});

describe("planDestination: Kuwait", () => {
  it("recommends Atlas → Air India: 12,000 points = 6,000 EDGE Miles", () => {
    const [top] = planDestination(kuwait, "eco", 16000, atlas(20000));
    expect(top.p).toBe("airindia");
    expect(top.best!.prog.key).toBe("axis_atlas");
    expect(top.cardPts).toBe(6000);
    expect(top.canBook).toBe(true);
  });

  it("drops economy-only routes in business", () => {
    const plans = planDestination(kuwait, "biz", 60000, atlas(50000));
    expect(plans.some((p) => p.p === "airindia")).toBe(false);
    expect(plans.some((p) => p.p === "indigo")).toBe(false);
  });

  it("prefers a card the user actually holds", () => {
    const [top] = planDestination(kuwait, "eco", 16000, { hdfc_infinia: { n: 50000, src: "manual" } });
    expect(top.best!.prog.key).toBe("hdfc_infinia");
    expect(top.canBook).toBe(true);
  });

  it("prices IndiGo by the user's value per BluChip", () => {
    // Default ₹0.40 per BluChip: a ₹16,000 fare needs 40,000 BluChips
    const atDefault = planDestination(kuwait, "eco", 16000, {}).find((p) => p.p === "indigo")!;
    expect(atDefault.miles).toBe(40000);
    const atOne = planDestination(kuwait, "eco", 16000, {}, { indigo: 1 }).find((p) => p.p === "indigo")!;
    expect(atOne.miles).toBe(16000);
  });

  it("puts bookable routes first", () => {
    const plans = planDestination(kuwait, "eco", 16000, atlas(7000));
    const firstNo = plans.findIndex((p) => !p.canBook);
    if (firstNo >= 0) expect(plans.slice(firstNo).every((p) => !p.canBook)).toBe(true);
  });
});

describe("merchantFor", () => {
  it("falls back to any other airline", () => {
    expect(merchantFor({}).id).toBe("anyair");
    expect(merchantFor({ merchant: "indigo" }).id).toBe("indigo");
  });
});

describe("live price links", () => {
  it("builds dated cash-fare searches from the chosen city", async () => {
    const { cashFareLinks } = await import("./trips");
    const links = cashFareLinks("HYD", "KWI", "2027-01-15", "Business");
    expect(links.map((l) => l.label)).toEqual(["Aviasales (pick cabin)", "Google Flights", "Skyscanner", "MakeMyTrip"]);
    expect(links[0]).toMatchObject({ href: "https://www.aviasales.com/search/HYD1501KWI1?marker=597231", aff: true });
    expect(links[2].href).toContain("/hyd/kwi/270115/");
    expect(links[2].href).toContain("cabinclass=business");
    expect(links[3].href).toContain("itinerary=HYD-KWI-15/01/2027");
    expect(links.filter((l) => l.aff)).toHaveLength(1);
  });
  it("skips Aviasales when there are no airport codes", async () => {
    const { cashFareLinks } = await import("./trips");
    expect(cashFareLinks("Delhi", "Anywhere in Japan", "2027-01-15", "Economy", false).map((l) => l.label)).toEqual(["Google Flights"]);
  });
  it("links award searches for the programme", async () => {
    const { awardLinks } = await import("./trips");
    const links = awardLinks("qatar", "DEL", "KWI", "2027-01-15");
    expect(links[0].href).toBe("https://seats.aero/search?origins=DEL&destinations=KWI&date=2027-01-15");
    expect(links[1].href).toContain("qatarairways.com");
  });
});
