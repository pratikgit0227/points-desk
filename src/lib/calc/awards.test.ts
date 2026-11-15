import { describe, expect, it } from "vitest";
import { airport, distanceMiles, searchAirports } from "./airports";
import { aeroplanZone, awardPrices, awardSearchLinks, kfZone, sightingsFor } from "./awards";

const ap = (c: string) => {
  const a = airport(c);
  if (!a) throw new Error("missing airport " + c);
  return a;
};
const quote = (from: string, to: string, p: string, on?: string) =>
  awardPrices(ap(from), ap(to)).quotes.find((q) => q.p === p && (!on || q.on.includes(on)));

describe("airports", () => {
  it("measures Delhi–Mumbai like the airlines do (about 707 miles)", () => {
    expect(distanceMiles(ap("DEL"), ap("BOM"))).toBeGreaterThan(700);
    expect(distanceMiles(ap("DEL"), ap("BOM"))).toBeLessThan(715);
  });
  it("finds airports by code and city", () => {
    expect(searchAirports("bom")[0].code).toBe("BOM");
    expect(searchAirports("mumbai")[0].code).toBe("BOM");
    expect(searchAirports("delhi")[0].code).toBe("DEL");
  });
});

describe("Aeroplan partner chart", () => {
  it("puts India and the Gulf in the Atlantic zone, Singapore in Pacific", () => {
    expect(aeroplanZone(ap("DEL"))).toBe("ATL");
    expect(aeroplanZone(ap("DXB"))).toBe("ATL");
    expect(aeroplanZone(ap("SIN"))).toBe("PAC");
    expect(aeroplanZone(ap("CMB"))).toBeNull();
  });
  it("matches known prices", () => {
    expect(quote("DEL", "BOM", "aeroplan")?.biz?.lo).toBe(12500);
    expect(quote("DEL", "DXB", "aeroplan")).toMatchObject({ eco: { lo: 15000 }, biz: { lo: 22500 } });
    expect(quote("DEL", "LHR", "aeroplan")).toMatchObject({ eco: { lo: 42500 }, biz: { lo: 70000 } });
    expect(quote("JFK", "DEL", "aeroplan")).toMatchObject({ eco: { lo: 60000 }, biz: { lo: 90000 } });
    expect(quote("DEL", "FRA", "aeroplan")?.biz?.lo).toBe(40000);
  });
});

describe("KrisFlyer Saver", () => {
  it("zones", () => {
    expect(kfZone(ap("BOM"))).toBe(6);
    expect(kfZone(ap("PVG"))).toBe(5);
    expect(kfZone(ap("PER"))).toBe(8);
    expect(kfZone(ap("ORD"))).toBeNull();
  });
  it("prices India via Singapore as one award", () => {
    expect(quote("DEL", "SIN", "krisflyer")).toMatchObject({ eco: { lo: 19000 }, biz: { lo: 45000 } });
    expect(quote("DEL", "SYD", "krisflyer")).toMatchObject({ eco: { lo: 42000 }, biz: { lo: 100000 } });
    expect(quote("BOM", "JFK", "krisflyer")?.biz?.lo).toBe(147500);
    expect(quote("SIN", "LHR", "krisflyer")?.biz?.lo).toBe(108500);
  });
  it("says why India–Europe has no Saver price", () => {
    expect(awardPrices(ap("DEL"), ap("LHR")).missing.some((m) => m.p === "krisflyer")).toBe(true);
  });
});

describe("Air India", () => {
  it("uses the route price when listed, in either direction", () => {
    expect(quote("DEL", "BOM", "airindia")).toMatchObject({ eco: { lo: 5000 }, biz: { lo: 20000 }, conf: "high" });
    expect(quote("BOM", "DEL", "airindia")?.eco?.lo).toBe(5000);
    expect(quote("BLR", "MAA", "airindia")?.eco?.lo).toBe(1500);
    expect(quote("JFK", "BOM", "airindia")?.eco?.lo).toBe(40000);
  });
  it("falls back to the region price", () => {
    const q = quote("DEL", "YYZ", "airindia");
    expect(q?.eco?.lo).toBe(50000);
    expect(q?.biz?.lo).toBe(130000);
  });
  it("doesn't price flights that don't touch India", () => {
    expect(quote("LHR", "JFK", "airindia")).toBeUndefined();
  });
});

describe("BA Avios", () => {
  it("prices BA's own Delhi–London flight in zone 6", () => {
    expect(quote("DEL", "LHR", "ba", "British")).toMatchObject({ eco: { lo: 33000, hi: 38500 }, biz: { lo: 99000, hi: 110000 } });
    expect(awardPrices(ap("DEL"), ap("LHR")).quotes.filter((q) => q.p === "ba")).toHaveLength(1);
  });
  it("offers only the partner price away from BA hubs", () => {
    const r = awardPrices(ap("DEL"), ap("KUL")).quotes.filter((q) => q.p === "ba");
    expect(r).toHaveLength(1);
    expect(r[0].partner).toBe(true);
  });
});

describe("sightings and links", () => {
  it("finds group sightings for the same cities in either direction", () => {
    expect(sightingsFor("EWR", "BOM").length).toBeGreaterThan(0);
    expect(sightingsFor("BOM", "DEL").map((s) => s.points)).toContain(12500);
    expect(sightingsFor("DEL", "SIN")).toHaveLength(0);
  });
  it("pre-fills the Aeroplan search", () => {
    const l = awardSearchLinks("aeroplan", "DEL", "BOM", "2026-12-24").find((x) => x.label === "Aeroplan search");
    expect(l?.href).toContain("org0=DEL&dest0=BOM&departureDate0=2026-12-24");
  });
});

describe("second batch of charts", () => {
  const own = (from: string, to: string, p: string) =>
    awardPrices(ap(from), ap(to)).quotes.find((q) => q.p === p && !q.partner);
  const partner = (from: string, to: string, p: string) =>
    awardPrices(ap(from), ap(to)).quotes.find((q) => q.p === p && q.partner);

  it("JAL base seats from India", () => {
    expect(own("DEL", "NRT", "jal")).toMatchObject({ eco: { lo: 17500 }, biz: { lo: 40000 }, conf: "high" });
    expect(own("HND", "BLR", "jal")?.biz?.lo).toBe(40000);
  });
  it("Turkish own flights: one region, or two legs via Istanbul", () => {
    expect(own("IST", "DEL", "turkish")).toMatchObject({ eco: { lo: 20000, hi: 25000 }, biz: { lo: 35000, hi: 50000 } });
    expect(own("DEL", "LHR", "turkish")).toMatchObject({ biz: { lo: 60000, hi: 90000 } });
    expect(own("DEL", "BOM", "turkish")).toBeUndefined();
    expect(partner("DEL", "FRA", "turkish")).toMatchObject({ eco: { lo: 35000 }, biz: { lo: 60000 } });
  });
  it("Qatar typical prices are marked as seen", () => {
    expect(own("DEL", "JFK", "qatar")).toMatchObject({ eco: { lo: 40000 }, biz: { lo: 80000 }, seen: true });
    expect(own("BOM", "DOH", "qatar")?.eco?.lo).toBe(13000);
  });
  it("Thai: India–Bangkok and beyond", () => {
    expect(own("DEL", "BKK", "thai")).toMatchObject({ eco: { lo: 17500 }, biz: { lo: 27500 } });
    expect(own("BOM", "SYD", "thai")?.biz?.lo).toBe(90000);
  });
  it("United and LifeMiles from India", () => {
    expect(own("DEL", "EWR", "united")?.biz?.lo).toBe(88000);
    expect(own("DEL", "FRA", "lifemiles")?.biz?.lo).toBe(60100);
  });
  it("Vietnam, Finnair, Virgin, Cathay, Qantas, Etihad", () => {
    expect(own("DEL", "HAN", "vietnam")).toMatchObject({ eco: { lo: 25000, hi: 35000 } });
    expect(own("DEL", "HEL", "finnair")).toMatchObject({ eco: { lo: 28000 }, biz: { lo: 55000 } });
    expect(own("BOM", "LHR", "virgin")?.biz?.lo).toBe(37500);
    expect(own("BOM", "HKG", "cathay")).toMatchObject({ eco: { lo: 13000 }, biz: { lo: 33000 } });
    expect(own("BLR", "SYD", "qantas")?.biz?.lo).toBe(113900);
    expect(own("DEL", "AUH", "etihad")).toMatchObject({ eco: { lo: 13000 }, biz: { lo: 30000 }, seen: true });
  });
  it("lists programmes with no usable chart", () => {
    const why = awardPrices(ap("DEL"), ap("ADD")).missing.map((m) => m.p);
    expect(why).toContain("ethiopian");
    expect(why).toContain("milesmore");
  });
});

describe("no misleading rows", () => {
  it("no partner prices within India, no Istanbul detour to Singapore", () => {
    const dom = awardPrices(ap("DEL"), ap("BOM")).quotes;
    expect(dom.filter((q) => q.partner)).toHaveLength(0);
    expect(awardPrices(ap("DEL"), ap("SIN")).quotes.find((q) => q.p === "turkish" && !q.partner)).toBeUndefined();
    expect(awardPrices(ap("DEL"), ap("LHR")).quotes.find((q) => q.p === "turkish" && !q.partner)).toBeDefined();
  });
});
