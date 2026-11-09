import { describe, expect, it } from "vitest";
import { DESTINATIONS, PHOTOS } from "@/lib/data";
import { creditText, photoFor } from "./photos";

describe("photos", () => {
  it("every destination has a free-licensed photo with a credit", () => {
    for (const d of DESTINATIONS) {
      const p = PHOTOS[d.id];
      expect(p, d.id).toBeTruthy();
      expect(p.src, d.id).toMatch(/^https:\/\/(upload|thumb)\.wikimedia\.org\//);
      expect(p.license, d.id).toMatch(/^(CC BY|CC0|Public domain)/);
      expect(p.page, d.id).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it("picks the first place named, then a wider area", () => {
    expect(photoFor("Dubai, Doha, Singapore, Bangkok")?.alt).toMatch(/Dubai/);
    expect(photoFor("Tokyo, Japan")?.alt).toMatch(/Tokyo/);
    expect(photoFor("Anywhere in Japan")?.alt).toMatch(/Fuji/);
    expect(photoFor("Within the USA")?.alt).toMatch(/USA/);
    expect(photoFor("Delhi ↔ Mumbai (domestic)")?.alt).toMatch(/India Gate/);
    expect(photoFor("Somewhere unknown")).toBeUndefined();
  });

  it("uses hotel photos for hotel programmes", () => {
    expect(photoFor("Waldorf Astoria Maldives Ithaafushi", true)?.alt).toMatch(/Maldives/);
    expect(photoFor("Raffles Udaipur / Jaipur", true)?.alt).toMatch(/Udaipur/);
    expect(photoFor("Wyndham / Ramada hotels in India", true)?.alt).toMatch(/Taj/);
  });

  it("keeps credits short", () => {
    expect(creditText({ ...PHOTOS.dxb, by: "x".repeat(80) }).length).toBeLessThan(70);
  });
});
