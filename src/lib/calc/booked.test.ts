import { describe, expect, it } from "vitest";
import { bookedDestination, bookedNews, cashCheck, parseBooking, pointsCheck, recordFare, type BookedTrip } from "./booked";

const base: BookedTrip = { id: "1", from: "DEL", to: "DXB", date: "2027-01-14", cabin: "eco", pax: 2, paid: 20000, fee: 3000, airline: "", added: "2026-11-14" };

describe("cashCheck", () => {
  it("counts the fee against the saving", () => {
    const c = cashCheck(base, 15000);
    expect(c.each).toBe(2000);
    expect(c.total).toBe(4000);
    expect(c.worth).toBe(true);
  });
  it("ignores small or negative savings", () => {
    expect(cashCheck(base, 16800).worth).toBe(false);
    expect(cashCheck(base, 25000).worth).toBe(false);
  });
});

describe("recordFare", () => {
  it("keeps the latest and the lowest", () => {
    let b = recordFare(base, { at: "2026-11-14", price: 18000, airline: "EK", link: "" });
    b = recordFare(b, { at: "2026-11-15", price: 19000, airline: "EK", link: "" });
    expect(b.last?.price).toBe(19000);
    expect(b.low?.price).toBe(18000);
  });
});

describe("bookedNews", () => {
  it("counts upcoming bookings worth rebooking", () => {
    const cheap = { ...base, last: { at: "2026-11-14", price: 10000, airline: "", link: "" } };
    const past = { ...cheap, id: "2", date: "2026-01-01" };
    expect(bookedNews([cheap, past, base], "2026-11-14")).toBe(1);
  });
});

describe("bookedDestination", () => {
  it("finds the far end either way", () => {
    expect(bookedDestination({ from: "DEL", to: "DXB" })?.code).toBe("DXB");
    expect(bookedDestination({ from: "DXB", to: "BOM" })?.code).toBe("DXB");
    expect(bookedDestination({ from: "DEL", to: "BOM" })).toBeNull();
  });
});

describe("pointsCheck", () => {
  it("compares an award with the cash refund", () => {
    const p = pointsCheck(base, {});
    expect(p).not.toBeNull();
    expect(p!.miles).toBeGreaterThan(0);
    expect(p!.saved).toBeLessThan((base.paid - base.fee) * base.pax + 1);
  });
  it("is null for routes we don't list", () => {
    expect(pointsCheck({ ...base, to: "BOM" }, {})).toBeNull();
  });
});

describe("parseBooking", () => {
  it("reads a typical confirmation", () => {
    const p = parseBooking(`Your booking is confirmed. PNR AB12CD
      IndiGo 6E 1461  DEL → DXB  Tue, 14 Jan 2027 09:40
      2 Adults
      Base fare ₹ 18,000  Taxes ₹ 4,210
      Grand Total ₹ 22,210`);
    expect(p).toEqual({ from: "DEL", to: "DXB", date: "2027-01-14", paid: 22210, pax: 2, airline: "IndiGo" });
  });
  it("handles brackets and other date styles", () => {
    const p = parseBooking("New Delhi (DEL) to Dubai (DXB) on Jan 9, 2027. Amount paid INR 31,500.00");
    expect(p.from).toBe("DEL");
    expect(p.to).toBe("DXB");
    expect(p.date).toBe("2027-01-09");
    expect(p.paid).toBe(31500);
  });
  it("leaves out what it can't find", () => {
    expect(parseBooking("hello")).toEqual({});
  });
});
