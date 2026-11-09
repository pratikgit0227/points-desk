import { describe, expect, it } from "vitest";
import { CREATORS, CREATOR_TRIPS, DESTINATIONS, type Change } from "@/lib/data";
import { planAlerts, snapshot } from "./alerts";
import { optionKey } from "./plans";

const dxb = DESTINATIONS.find((d) => d.id === "dxb")!;
const ai = dxb.options.find((o) => o.p === "airindia")!;
const plan = { dest: "dxb", cabin: "eco" as const, picks: [optionKey(ai)] };

describe("planAlerts", () => {
  it("is quiet when nothing changed", () => {
    const snap = snapshot(plan, "2026-11-09");
    expect(planAlerts(plan, snap, null, [])).toEqual([]);
  });

  it("reports a price change", () => {
    const snap = snapshot(plan, "2026-11-09");
    snap.picks[0].eco = (ai.eco ?? 0) - 2000;
    const [a] = planAlerts(plan, snap, null, []);
    expect(a.kind).toBe("price");
    expect(a.text).toMatch(/went up/);
  });

  it("reports a ratio change only for the user's cards", () => {
    const snap = snapshot(plan, "2026-11-09");
    const [prog] = Object.keys(snap.picks[0].ratios);
    snap.picks[0].ratios[prog] = 99;
    expect(planAlerts(plan, snap, [prog], []).some((a) => a.kind === "ratio")).toBe(true);
    expect(planAlerts(plan, snap, ["not_my_card"], []).some((a) => a.kind === "ratio")).toBe(false);
  });

  it("reports an option that is no longer listed", () => {
    const snap = snapshot(plan, "2026-11-09");
    snap.picks[0].key = "airindia|Somewhere old";
    expect(planAlerts(plan, snap, null, [])[0].kind).toBe("gone");
  });

  it("includes newer rule changes for the plan's partners", () => {
    const snap = snapshot(plan, "2026-11-09");
    const change = { id: "x", date: "2026-12-01", kind: "devaluation", title: "Air India chart up", what: "", cards: [], partners: ["airindia"], post: "", sources: [] } as Change;
    const older = { ...change, id: "y", date: "2026-10-01" };
    const out = planAlerts(plan, snap, null, [change, older]);
    expect(out.map((a) => a.change?.id)).toEqual(["x"]);
  });
});

describe("creator trips", () => {
  it("point at real creators, destinations and options", () => {
    for (const t of CREATOR_TRIPS) {
      expect(CREATORS.some((c) => c.id === t.creator), t.slug).toBe(true);
      const d = DESTINATIONS.find((x) => x.id === t.dest);
      expect(d, t.slug).toBeTruthy();
      for (const k of t.picks) expect(d!.options.some((o) => optionKey(o) === k), `${t.slug} ${k}`).toBe(true);
      expect(t.picks.length, t.slug).toBeLessThanOrEqual(3);
    }
  });

  it("have unique slugs and https links", () => {
    expect(new Set(CREATOR_TRIPS.map((t) => t.slug)).size).toBe(CREATOR_TRIPS.length);
    for (const t of CREATOR_TRIPS) for (const l of t.links) expect(l.href, t.slug).toMatch(/^https:\/\//);
  });
});
