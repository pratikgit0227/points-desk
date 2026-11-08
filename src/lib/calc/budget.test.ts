import { describe, expect, it } from "vitest";
import type { Destination } from "@/lib/data";
import { planBudget, type BudgetInput } from "./budget";

const SIN: Destination = {
  id: "t", name: "Test", country: "X", code: "SIN", kw: "", nonstop: [], checked: "2026-11-08", src: "",
  fare: { eco: 20000, biz: 80000 },
  options: [{ p: "krisflyer", airline: "Singapore Airlines", route: "Delhi → Singapore", eco: 17500, biz: 37500, pricing: "fixed", confidence: "high" }],
};

const base: BudgetInput = {
  dest: SIN, cabin: "eco", fare: 20000, travellers: 2, legs: 2, awardTax: 3000,
  nights: 0, hotelCash: 0, hotelP: "any", hotelPts: 0, values: {},
  balances: { axis_atlas: { n: 48250, src: "manual" } },
};

describe("trip budget", () => {
  it("pays flights with points until the Axis Group A cap runs out, the rest in cash", () => {
    const r = planBudget(base);
    const onPoints = r.items.filter((x) => x.pts);
    // 8,750 Atlas miles a ticket (1:2); the 30,000 Group A cap covers 3 tickets
    expect(onPoints).toHaveLength(3);
    expect(r.allCash).toBe(80000);
    expect(r.cashPaid).toBe(3 * 3000 + 20000);
    expect(r.saved).toBe(80000 - 29000);
    expect(r.used[0]).toMatchObject({ cardPts: 26250 });
  });

  it("combines two cards into one airline account", () => {
    const r = planBudget({ ...base, balances: { axis_atlas: { n: 26250, src: "manual" }, hsbc_travelone: { n: 17500, src: "manual" } } });
    expect(r.items.filter((x) => x.pts)).toHaveLength(4);
    // HSBC points are worth less elsewhere, so they go first
    expect(r.used.find((u) => u.prog.key === "hsbc_travelone")?.cardPts).toBe(17500);
  });

  it("leaves the hotel out until it has a price", () => {
    const r = planBudget({ ...base, nights: 3, hotelCash: 0 });
    expect(r.items.some((x) => x.kind === "hotel")).toBe(false);
  });

  it("pays everything in cash with no points", () => {
    const r = planBudget({ ...base, balances: {} });
    expect(r.cashPaid).toBe(80000);
    expect(r.saved).toBe(0);
  });

  it("skips points when redeeming directly is worth more", () => {
    // A ₹4,000 fare with ₹3,000 taxes saves ₹1,000, less than 8,750 Atlas miles at ₹1 each
    const r = planBudget({ ...base, fare: 4000 });
    expect(r.items.every((x) => !x.pts)).toBe(true);
  });

  it("uses hotel points for nights, with the points price the user typed", () => {
    const r = planBudget({ ...base, travellers: 1, legs: 1, nights: 3, hotelCash: 12000, hotelP: "marriott", hotelPts: 20000, balances: { hsbc_travelone: { n: 40000, src: "manual" } } });
    // HSBC: the flight takes 17,500 (KrisFlyer 1:1); the 22,500 left covers one 20,000-point Marriott night
    const nights = r.items.filter((x) => x.kind === "hotel" && x.pts);
    expect(nights).toHaveLength(1);
    expect(nights[0].pts!.est).toBe(false);
  });

  it("won't spend Infinia on a hotel night worth less than SmartBuy's ₹1 a point", () => {
    const r = planBudget({ ...base, fare: 0, nights: 2, hotelCash: 12000, hotelP: "marriott", hotelPts: 20000, balances: { hdfc_infinia: { n: 100000, src: "manual" } } });
    expect(r.items.every((x) => !x.pts)).toBe(true);
  });
});
