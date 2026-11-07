"use client";

import { useEffect, useState } from "react";

export interface CheapFare {
  price: number;
  airline: string;
  flightNumber: string;
  departureAt: string;
  transfers: number;
  duration: number | null;
  link: string;
}

export type FareLookup =
  | { status: "off" } // not configured on this deployment, or not asked
  | { status: "loading" }
  | { status: "none" } // nothing found for the route/date
  | { status: "error"; message: string }
  | { status: "ok"; fare: CheapFare; month: boolean };

interface Entry {
  key: string;
  result: FareLookup;
}

/** Cheapest recently-found economy fare for a route and date, from /api/fares. */
export function useCheapFare(from: string, to: string, date: string, enabled: boolean): FareLookup {
  const key = enabled && date ? `${from}|${to}|${date}` : "";
  const [entry, setEntry] = useState<Entry>({ key: "", result: { status: "off" } });

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch(`/api/fares?from=${from}&to=${to}&date=${date}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 501) return { status: "off" } as const;
        const body = await res.json().catch(() => ({}));
        if (!res.ok) return { status: "error", message: body.error || "Couldn't load fares." } as const;
        const fares = (body.fares || []) as CheapFare[];
        return fares.length ? ({ status: "ok", fare: fares[0], month: Boolean(body.month) } as const) : ({ status: "none" } as const);
      })
      .then((result) => setEntry({ key, result }))
      .catch((e) => {
        if (e?.name !== "AbortError") setEntry({ key, result: { status: "error", message: "Couldn't load fares." } });
      });
    return () => ctrl.abort();
  }, [key, from, to, date]);

  if (!key) return { status: "off" };
  return entry.key === key ? entry.result : { status: "loading" };
}
