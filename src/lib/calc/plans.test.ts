import { describe, expect, it } from "vitest";
import { DESTINATIONS } from "@/lib/data";
import { planDestination } from "./destinations";
import { compareOptions, decodeShare, encodeShare, MAX_PICKS, optionKey, recommend, shareFields, TAX_GUESS, togglePick, type TripPlan } from "./plans";

const kwi = DESTINATIONS.find((d) => d.id === "kwi")!;
const aiKey = optionKey(kwi.options.find((r) => r.p === "airindia")!);

const plan: TripPlan = {
  id: "x",
  name: "Kuwait in Jan",
  status: "checking",
  notes: "Ask Riya about dates",
  dest: "kwi",
  from: "DEL",
  date: "2027-01-14",
  flex: 3,
  cabin: "eco",
  pax: 2,
  legs: 2,
  fare: 16000,
  picks: [aiKey],
  updated: "2026-11-09",
};

describe("togglePick", () => {
  it("adds, removes and keeps at most three", () => {
    expect(togglePick([], "a")).toEqual(["a"]);
    expect(togglePick(["a"], "a")).toEqual([]);
    expect(togglePick(["a", "b", "c"], "d")).toEqual(["b", "c", "d"]);
    expect(MAX_PICKS).toBe(3);
  });
});

describe("share links", () => {
  it("carry the trip but not notes, status or ids by default", () => {
    const s = shareFields(plan);
    expect(s).not.toHaveProperty("notes");
    expect(s).not.toHaveProperty("status");
    expect(s).not.toHaveProperty("id");
    expect(Object.keys(s).sort()).toEqual(["cabin", "date", "dest", "fare", "flex", "from", "legs", "name", "pax", "picks", "v"]);
  });

  it("carry notes only when asked", () => {
    expect(shareFields(plan, true).notes).toBe("Ask Riya about dates");
  });

  it("round-trip, including non-English text", () => {
    const s = shareFields({ ...plan, name: "कुवैत ✈ trip" }, true);
    expect(decodeShare(encodeShare(s))).toEqual(s);
  });

  it("reject broken links and unknown destinations", () => {
    expect(decodeShare("not-a-link")).toBeNull();
    expect(decodeShare(encodeShare({ ...shareFields(plan), dest: "zzz" }))).toBeNull();
    expect(decodeShare(encodeShare({ ...shareFields(plan), pax: 50 }))).toBeNull();
  });

  it("drop anything extra a crafted link tries to carry", () => {
    const crafted = { ...shareFields(plan), balances: { axis_atlas: { n: 99999 } } };
    expect(decodeShare(encodeShare(crafted as never))).not.toHaveProperty("balances");
  });
});

describe("compareOptions", () => {
  const atlas = { axis_atlas: { n: 30000, src: "manual" as const } };
  const rows = compareOptions(plan, atlas);

  it("prices cash for every ticket: travellers × legs", () => {
    expect(rows[0].kind).toBe("cash");
    expect(rows[0].cashPaid).toBe(16000 * 4);
  });

  it("adds a fixed-value row from the card the user holds", () => {
    const portal = rows.find((r) => r.kind === "portal")!;
    expect(portal.prog!.key).toBe("axis_atlas");
    expect(portal.cardPts).toBe(Math.ceil(64000 / portal.prog!.base.v));
  });

  it("transfer rows cover all four tickets and pay estimated taxes", () => {
    const t = rows.find((r) => r.key === aiKey)!;
    const [one] = planDestination(kwi, "eco", 16000, atlas).filter((x) => x.p === "airindia");
    expect(t.partnerPts).toBe(one.each * 4);
    expect(t.cashPaid).toBe(TAX_GUESS.eco * 4);
    expect(t.saved).toBe(64000 - TAX_GUESS.eco * 4);
    expect(t.short).toBe(Math.max(0, t.partnerPts - 60000));
  });

  it("skips picks that don't exist on the destination", () => {
    expect(compareOptions({ ...plan, picks: ["nope|x"] }, atlas).some((r) => r.key === "nope|x")).toBe(false);
  });
});

describe("recommend", () => {
  it("suggests the transfer when the points cover it and beat the set value", () => {
    const rows = compareOptions({ ...plan, pax: 1, legs: 1 }, { axis_atlas: { n: 30000, src: "manual" } });
    expect(recommend(rows)!.row.key).toBe(aiKey);
  });
  it("falls back to cash when the points don't cover it", () => {
    const rows = compareOptions(plan, { axis_atlas: { n: 1000, src: "manual" } });
    expect(recommend(rows)!.row.kind).toBe("cash");
  });
});
