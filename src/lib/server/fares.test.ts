import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {} }));

async function load(token = "test-token") {
  vi.resetModules();
  vi.stubEnv("TRAVELPAYOUTS_TOKEN", token);
  vi.stubEnv("TRAVELPAYOUTS_MARKER", "12345");
  return import("./fares");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const api = (data: unknown[]) => new Response(JSON.stringify({ success: true, data }), { status: 200 });

describe("cheapestFares", () => {
  it("returns the cheapest fare first with a marked booking link", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      api([
        { price: 18000, airline: "6E", flight_number: 1235, departure_at: "2027-01-15T02:00:00+05:30", transfers: 0, duration_to: 245, link: "/search/HYD1501KWI1" },
        { price: 14200, airline: "IX", flight_number: "393", departure_at: "2027-01-15T09:00:00+05:30", transfers: 1, link: "/search/HYD1501KWI1?t=abc" },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { cheapestFares } = await load();
    const r = await cheapestFares("HYD", "KWI", "2027-01-15");
    expect(r.month).toBe(false);
    expect(r.fares[0]).toMatchObject({ price: 14200, airline: "IX", flightNumber: "393", transfers: 1 });
    expect(r.fares[0].link).toBe("https://www.aviasales.com/search/HYD1501KWI1?t=abc&marker=12345");
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("origin")).toBe("HYD");
    expect(url.searchParams.get("departure_at")).toBe("2027-01-15");
    expect(fetchMock.mock.calls[0][1].headers["X-Access-Token"]).toBe("test-token");
  });

  it("falls back to the month when the day has nothing", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(api([])).mockResolvedValueOnce(api([{ price: 15000, departure_at: "2027-01-20" }]));
    vi.stubGlobal("fetch", fetchMock);
    const { cheapestFares } = await load();
    const r = await cheapestFares("DEL", "KWI", "2027-01-15");
    expect(r.month).toBe(true);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get("departure_at")).toBe("2027-01");
    expect(r.fares[0].link).toBe("https://www.aviasales.com/search/DEL2001KWI1?marker=12345");
  });

  it("throws on an API error so the route can return 502", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));
    const { cheapestFares } = await load();
    await expect(cheapestFares("DEL", "KWI", "2027-01-15")).rejects.toThrow("401");
  });
});
