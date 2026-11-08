import { describe, expect, it } from "vitest";
import { APPLY, PROGRAMS, applyLinkFor, isOpenCard } from "@/lib/data";

describe("apply links", () => {
  it("every open card has an https apply link", () => {
    for (const p of PROGRAMS.filter((x) => isOpenCard(x.key))) {
      expect(applyLinkFor(p.key)?.href, p.key).toMatch(/^https:\/\//);
    }
  });

  it("closed and invite-only cards get no apply link", () => {
    for (const p of PROGRAMS.filter((x) => !isOpenCard(x.key))) {
      expect(applyLinkFor(p.key), p.key).toBeUndefined();
    }
  });

  it("only lists real card keys", () => {
    const keys = PROGRAMS.map((p) => p.key);
    for (const k of Object.keys(APPLY)) expect(keys).toContain(k);
  });
});
