import { describe, expect, it } from "vitest";
import { findDate, parseBalances } from "./parse-balance";

const one = (text: string) => {
  const r = parseBalances(text);
  expect(r).toHaveLength(1);
  return r[0];
};

describe("parseBalances", () => {
  it("reads an Axis Atlas SMS", () => {
    const r = one("Dear Customer, your Axis Bank Atlas Credit Card EDGE Miles balance as on 20-Oct-2026 is 48,250.");
    expect(r).toMatchObject({ program: "axis_atlas", balance: 48250, asOf: "2026-10-20" });
    expect(r.evidence).toBe("balance as on 20-Oct-2026 is 48,250");
  });

  it("treats plain EDGE Miles as Atlas", () => {
    expect(one("Your EDGE Miles balance as on 20-Sep-2026 is 48,250").program).toBe("axis_atlas");
  });

  it("reads Indian digit grouping", () => {
    const r = one("HDFC Bank Infinia Credit Card: Reward Points balance: 1,12,400 as of 05/10/2026");
    expect(r).toMatchObject({ program: "hdfc_infinia", balance: 112400, asOf: "2026-10-05" });
  });

  it("reads an Amex statement line", () => {
    const r = one("American Express statement. Membership Rewards points: closing balance 36,000");
    expect(r).toMatchObject({ program: "amex_mr", balance: 36000 });
  });

  it("reads 'you have N points'", () => {
    expect(one("HSBC TravelOne: you now have 12,500 reward points.").balance).toBe(12500);
  });

  it("tells Magnus for Burgundy from Magnus", () => {
    expect(one("Axis Magnus for Burgundy - EDGE Reward points balance is 2,40,000").program).toBe("axis_magnus_burgundy");
    expect(one("Axis Magnus - EDGE Reward points balance is 80,000").program).toBe("axis_magnus");
  });

  it("ignores rupee amounts", () => {
    expect(parseBalances("Atlas card: available balance Rs. 1,50,000 credit limit")).toEqual([]);
  });

  it("ignores points earned on one transaction", () => {
    expect(parseBalances("You have earned 500 EDGE Miles on your Atlas card transaction.")).toEqual([]);
  });

  it("skips messages that don't name a card", () => {
    expect(parseBalances("Your reward points balance is 5,000")).toEqual([]);
  });

  it("reads several messages and keeps the latest per card", () => {
    const text = [
      "Atlas EDGE Miles balance as on 20-Aug-2026 is 40,000",
      "-----",
      "Atlas EDGE Miles balance as on 20-Oct-2026 is 48,250",
      "-----",
      "Regalia Gold Reward Points balance is 22,000",
    ].join("\n");
    const r = parseBalances(text);
    expect(r.find((x) => x.program === "axis_atlas")!.balance).toBe(48250);
    expect(r.find((x) => x.program === "hdfc_regalia_gold")!.balance).toBe(22000);
  });
});

describe("findDate", () => {
  it("handles common formats", () => {
    expect(findDate("as on 20-Sep-2026")).toBe("2026-09-20");
    expect(findDate("as of 5 October 2026")).toBe("2026-10-05");
    expect(findDate("on 05/10/26")).toBe("2026-10-05");
    expect(findDate("2026-09-25")).toBe("2026-09-25");
    expect(findDate("no date")).toBe("");
  });
});
