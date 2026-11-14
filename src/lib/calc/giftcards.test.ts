import { describe, expect, it } from "vitest";
import { VOUCHER_BURN, VOUCHER_EARN, PROGRAMS, CATALOGUE } from "@/lib/data";
import { pointWorth, voucherBurnRows, voucherEarn, voucherEarnRows } from "./giftcards";

const infinia = VOUCHER_EARN.find((e) => e.card === "hdfc-infinia")!;
const emeralde = VOUCHER_EARN.find((e) => e.card === "icici-emeralde-pm")!;

describe("gift card data", () => {
  it("points at real cards and programmes, with sources", () => {
    for (const e of VOUCHER_EARN) {
      expect(CATALOGUE.some((c) => c.id === e.card && c.program === e.program)).toBe(true);
      expect(e.per100).toBeGreaterThan(e.base);
      expect(e.src.length).toBeGreaterThan(0);
    }
    for (const b of VOUCHER_BURN) {
      expect(PROGRAMS.some((p) => p.key === b.program)).toBe(true);
      expect(b.src.every((s) => s.url.startsWith("https://"))).toBe(true);
    }
  });
});

describe("voucherEarn", () => {
  it("caps only the extra points on a bonus cap", () => {
    // Infinia: 13.34 extra per ₹100, 3,000 cap → fills at about ₹22,500
    const r = voucherEarn(infinia, 50000);
    expect(r.fillAt).toBeCloseTo(22489, -1);
    expect(r.capped).toBe(true);
    expect(r.pts).toBeCloseTo(3.33 * 500 + 3000, 0);
  });
  it("earns the full rate under the cap", () => {
    expect(voucherEarn(infinia, 10000).pts).toBeCloseTo(1667, 0);
  });
  it("caps all points on a total cap", () => {
    expect(voucherEarn(emeralde, 200000).pts).toBe(18000);
    expect(voucherEarn(emeralde, 50000).pts).toBe(9000);
  });
});

describe("voucherEarnRows", () => {
  it("puts the user's own card first", () => {
    const rows = voucherEarnRows(20000, {}, ["amex_mr"], { amex_mr: "amex-mrcc" });
    expect(rows[0].e.card).toBe("amex-mrcc");
    expect(rows.filter((r) => r.mine)).toHaveLength(1);
  });
  it("values points at their best use", () => {
    const r = voucherEarnRows(10000, {}).find((x) => x.e.card === "hdfc-infinia")!;
    expect(r.per).toBe(pointWorth("hdfc_infinia", {}).per);
    expect(r.worth).toBeCloseTo(r.pts * r.per, 5);
  });
});

describe("voucherBurnRows", () => {
  it("compares vouchers with transfers", () => {
    const rows = voucherBurnRows({});
    const sc = rows.find((r) => r.b.program === "hdfc_regalia_gold" && r.b.what === "Statement credit")!;
    expect(sc.voucherWins).toBe(false);
    // No transfers on IDFC: vouchers are the only route
    expect(rows.find((r) => r.b.program === "idfc_rp")!.voucherWins).toBe(true);
  });
  it("shows only the user's programmes when set", () => {
    expect(voucherBurnRows({}, ["amex_mr"]).every((r) => r.b.program === "amex_mr")).toBe(true);
  });
});
