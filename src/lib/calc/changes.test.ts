import { describe, expect, it } from "vitest";
import { CHANGES, GUIDES, PARTNERS, PROGRAMS } from "@/lib/data";
import { changeDate, changesFor, postText } from "./changes";

describe("changes feed data", () => {
  it("is newest first with unique ids, real cards and partners, and at least one source", () => {
    const ids = CHANGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < CHANGES.length; i++) expect(CHANGES[i - 1].date >= CHANGES[i].date).toBe(true);
    const keys = PROGRAMS.map((p) => p.key);
    for (const c of CHANGES) {
      expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.cards.every((k) => keys.includes(k))).toBe(true);
      expect(c.partners.every((p) => p in PARTNERS)).toBe(true);
      expect(c.sources.length).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.href).toMatch(/^https:\/\//);
    }
    expect(GUIDES).toBeTruthy();
  });
  it("every post fits on X", () => {
    for (const c of CHANGES) {
      const text = postText(c);
      const [body] = text.split("\n\n");
      expect(body.length + 2 + 23).toBeLessThanOrEqual(280);
    }
  });
});

describe("changesFor", () => {
  it("filters to the user's cards", () => {
    const hdfc = changesFor(["hdfc_infinia"]);
    expect(hdfc.length).toBeGreaterThan(0);
    expect(hdfc.every((c) => c.cards.includes("hdfc_infinia"))).toBe(true);
    expect(changesFor(null)).toHaveLength(CHANGES.length);
  });
  it("formats dates", () => {
    expect(changeDate({ date: "2026-09-23" })).toBe("23 Sep 2026");
    expect(changeDate({ date: "2026-04-01", approx: true })).toBe("Apr 2026");
  });
});
