import { describe, expect, it } from "vitest";
import { CATALOGUE, PROGRAMS, defaultCardFor, searchCatalogue } from "@/lib/data";

describe("card catalogue", () => {
  it("has unique ids", () => {
    expect(new Set(CATALOGUE.map((c) => c.id)).size).toBe(CATALOGUE.length);
  });
  it("only points at real programmes", () => {
    const keys = PROGRAMS.map((p) => p.key);
    for (const c of CATALOGUE) if (c.program) expect(keys, c.id).toContain(c.program);
  });
  it("lists every programme at least once", () => {
    for (const p of PROGRAMS) expect(defaultCardFor(p.key), p.key).toBeDefined();
  });
  it("searches by bank, nickname and card name", () => {
    expect(searchCatalogue("amex")[0].bank).toBe("American Express");
    expect(searchCatalogue("diners").flatMap((g) => g.cards.map((c) => c.id))).toContain("hdfc-dcb");
    expect(searchCatalogue("").length).toBeGreaterThan(3);
  });
});
