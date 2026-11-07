import { describe, expect, it } from "vitest";
import { findProgram, GUIDES, MERCHANTS, PARTNERS, PROGRAMS, type PartnerId } from "@/lib/data";
import { inr, ratioTxt } from "@/lib/format";
import {
  clearExamples,
  exampleBalances,
  fareFor,
  fareLinks,
  matchMerchants,
  perPoint,
  pickCards,
  pool,
  rankCardsForBooking,
  totalWorth,
  transferMatrix,
  transferOptions,
  tripList,
  walletSummary,
  type Ctx,
} from "./index";

const atlas = findProgram("axis_atlas")!;
const ctx = (balances: Ctx["balances"], filter: Ctx["filter"] = "all"): Ctx => ({ balances, values: {}, filter });

describe("data integrity", () => {
  it("every program ratio points at a known partner", () => {
    for (const prog of PROGRAMS) for (const p of Object.keys(prog.r)) expect(PARTNERS).toHaveProperty(p);
  });
  it("every guide belongs to a known partner", () => {
    for (const p of Object.keys(GUIDES)) expect(PARTNERS).toHaveProperty(p);
  });
  it("merchant partners exist", () => {
    for (const m of MERCHANTS) if (m.p) expect(PARTNERS).toHaveProperty(m.p);
  });
  it("Axis 23 Sep 2026 changes: Atlas → Qatar is 2:1, → KrisFlyer is 1:2", () => {
    expect(atlas.r.qatar).toEqual([0.5, "A"]);
    expect(atlas.r.krisflyer).toEqual([2, "A"]);
  });
});

describe("format", () => {
  it("uses Indian digit grouping", () => expect(inr(123456)).toBe("₹1,23,456"));
  it("writes ratios as card : partner", () => {
    expect(ratioTxt(2)).toBe("1 : 2");
    expect(ratioTxt(0.5)).toBe("2 : 1");
    expect(ratioTxt(0.33)).toBe("3.03 : 1");
  });
});

describe("transferOptions", () => {
  it("ranks partners by ₹ per card point", () => {
    const rows = transferOptions(atlas, ctx({ axis_atlas: { n: 10000, src: "manual" } }));
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].per).toBeGreaterThanOrEqual(rows[i].per);
    // KrisFlyer 1:2 at ₹1.3 → ₹2.60 per EDGE Mile
    expect(rows.find((r) => r.p === "krisflyer")!.per).toBeCloseTo(2.6);
  });

  it("applies the Group A yearly cap", () => {
    const rows = transferOptions(atlas, ctx({ axis_atlas: { n: 50000, src: "manual" } }));
    const kf = rows.find((r) => r.p === "krisflyer")!;
    expect(kf.usable).toBe(30000);
    expect(kf.capped).toBe(true);
    expect(kf.got).toBe(60000);
  });

  it("respects the flights/hotels filter", () => {
    const rows = transferOptions(atlas, ctx({ axis_atlas: { n: 1000, src: "manual" } }, "hotel"));
    expect(rows.every((r) => PARTNERS[r.p].k === "hotel")).toBe(true);
  });

  it("uses the user's own value per point", () => {
    const rows = transferOptions(atlas, { balances: { axis_atlas: { n: 1000, src: "manual" } }, values: { krisflyer: 0.1 }, filter: "all" });
    expect(rows[0].p).not.toBe("krisflyer");
  });
});

describe("walletSummary / totalWorth", () => {
  it("falls back to direct redemption when no partner beats it", () => {
    const scapia = findProgram("scapia")!;
    const w = walletSummary(scapia, ctx({ scapia: { n: 5000, src: "manual" } }));
    expect(w.directWins).toBe(true);
    expect(w.bestWorth).toBe(1000);
  });

  it("totals each card's best option", () => {
    const b = { axis_atlas: { n: 10000, src: "manual" as const }, scapia: { n: 5000, src: "manual" as const } };
    expect(totalWorth(ctx(b))).toBeCloseTo(10000 * 2.6 + 5000 * 0.2);
  });
});

describe("example balances", () => {
  it("are cleared once the user enters their own", () => {
    const cleared = clearExamples(exampleBalances());
    expect(Object.values(cleared).every((b) => b.n === 0 && b.src === "manual")).toBe(true);
  });
});

describe("pool", () => {
  it("adds up every card that transfers to a partner, best ratio first", () => {
    const pl = pool("krisflyer", { axis_atlas: { n: 10000, src: "manual" }, hdfc_infinia: { n: 5000, src: "manual" } });
    expect(pl.bestRatio!.prog.key).toBe("axis_atlas");
    expect(pl.total).toBe(10000 * 2 + 5000 * 1);
  });
  it("caps Miles & More at 2,00,000 card points on Axis", () => {
    const pl = pool("milesmore", { axis_magnus_burgundy: { n: 900000, src: "manual" } });
    expect(pl.srcs.find((s) => s.prog.key === "axis_magnus_burgundy")!.usable).toBe(200000);
  });
});

describe("tripList", () => {
  it("shows affordable trips, biggest first", () => {
    const items = tripList(ctx({ axis_atlas: { n: 30000, src: "manual" } }));
    const can = items.filter((x) => x.n >= 1);
    expect(can.length).toBeGreaterThan(0);
    for (let i = 1; i < can.length; i++) expect(can[i - 1].s.m!).toBeGreaterThanOrEqual(can[i].s.m!);
  });
  it("shows the closest misses when nothing is affordable", () => {
    const items = tripList(ctx({}));
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((x) => x.n === 0)).toBe(true);
  });
});

describe("fares", () => {
  it("prefers the user's own price over the snapshot", () => {
    expect(fareFor("jal|0", {}).snap).toBeDefined();
    expect(fareFor("jal|0", { "jal|0": { cash: 50000, tax: 5000 } })).toMatchObject({ cash: 50000, own: true });
  });
  it("works out ₹ per point after taxes", () => expect(perPoint(70000, 5000, 17500)).toBeCloseTo(3.714, 2));
  it("builds dated fare links", () => {
    const links = fareLinks("jal" as PartnerId, 0, GUIDES.jal!.spots[0], "2026-12-15");
    expect(links.map((l) => l.label)).toContain("Skyscanner");
    expect(links.find((l) => l.label === "Skyscanner")!.href).toContain("/del/nrt/261215/");
  });
});

describe("booking finder", () => {
  it("matches merchants by keyword", () => {
    expect(matchMerchants("indigo")[0].id).toBe("indigo");
    expect(matchMerchants("")).toHaveLength(MERCHANTS.length);
  });
  it("lets a strong cashback card win", () => {
    const rows = rankCardsForBooking({ merchant: MERCHANTS[0], amount: 6000, values: {}, cashbackPct: 30 });
    expect(rows[0].own).toBe(true);
  });
  it("ranks cards by value back", () => {
    const rows = rankCardsForBooking({ merchant: MERCHANTS[0], amount: 6000, values: {} });
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].best.v).toBeGreaterThanOrEqual(rows[i].best.v);
  });
});

describe("card picker", () => {
  it("only lists open cards, sorted by what you keep", () => {
    const rows = pickCards(400000, 60000, {});
    expect(rows.some((r) => r.prog.key === "axis_atlas")).toBe(false);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].net).toBeGreaterThanOrEqual(rows[i].net);
  });
  it("waives the fee above the spend threshold", () => {
    const rg = pickCards(400000, 0, {}).find((r) => r.prog.key === "hdfc_regalia_gold")!;
    expect(rg.fee).toBe(0);
  });
});

describe("transferMatrix", () => {
  it("highlights the best ratio per partner", () => {
    const kf = transferMatrix("all").find((r) => r.p === "krisflyer")!;
    expect(kf.best).toBe(2);
  });
});
