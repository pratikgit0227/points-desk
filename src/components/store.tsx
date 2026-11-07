"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { clearExamples, exampleBalances, type Balances, type CashPrices, type Ctx, type FoundBalance, type Values } from "@/lib/calc";
import type { Cabin, Filter, PartnerId } from "@/lib/data";
import { usePersisted } from "@/lib/persisted";

export interface FinderState {
  q: string;
  mid: string;
  amt: number;
  cbName: string;
  cbPct: number;
}

export interface TripState {
  q: string;
  /** Destination id */
  id: string;
  cabin: Cabin;
  /** One-way cash fare in ₹; 0 means use the destination's typical fare */
  fare: number;
  /** Index of the nonstop airline chosen for paying cash */
  airline: number;
  /** Departure airport code for the live price links */
  from: string;
  /** Travel date (YYYY-MM-DD); empty means 60 days out */
  date: string;
}

export interface PickState {
  spend: number;
  travel: number;
}

// Stable fallbacks (see usePersisted). Storage keys match the original page.
const NO_BALANCES: Balances | null = null;
const EXAMPLE = exampleBalances();
const NO_VALUES: Values = {};
const ALL: Filter = "all";
const NO_FOUND: FoundBalance[] = [];
const FINDER: FinderState = { q: "indigo", mid: "indigo", amt: 6000, cbName: "", cbPct: 0 };
const PICK: PickState = { spend: 400000, travel: 60000 };
const TRIP: TripState = { q: "kuwait", id: "kwi", cabin: "eco", fare: 0, airline: 0, from: "DEL", date: "" };
const NO_CASH: CashPrices = {};

interface Store extends Ctx {
  usingExample: boolean;
  setBalance: (key: string, n: number) => void;
  applyFound: (items: FoundBalance[]) => void;
  setValue: (p: string, v: number) => void;
  resetValues: () => void;
  setFilter: (f: Filter) => void;
  found: FoundBalance[];
  addFound: (items: FoundBalance[]) => void;
  finder: FinderState;
  setFinder: (patch: Partial<FinderState>) => void;
  pick: PickState;
  trip: TripState;
  setTrip: (patch: Partial<TripState>) => void;
  setPick: (patch: Partial<PickState>) => void;
  cashPrices: CashPrices;
  setCashPrice: (key: string, cash: number, tax: number) => void;
  tripDate: string;
  setTripDate: (d: string) => void;
  guide: PartnerId | null;
  openGuide: (p: PartnerId) => void;
  closeGuide: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = usePersisted("pd_balances", NO_BALANCES);
  const [values, setValues] = usePersisted("pd_values", NO_VALUES);
  const [filter, setFilter] = usePersisted("pd_filter", ALL);
  const [found, setFound] = usePersisted("pd_found", NO_FOUND);
  const [finder, setFinderRaw] = usePersisted("pd_find", FINDER);
  const [pick, setPickRaw] = usePersisted("pd_pick", PICK);
  const [trip, setTripRaw] = usePersisted("pd_trip", TRIP);
  const [cashPrices, setCash] = usePersisted("pd_cash", NO_CASH);
  const [tripDate, setTripDate] = usePersisted("pd_date", "");
  const [guide, setGuide] = useState<PartnerId | null>(null);

  const balances = saved ?? EXAMPLE;
  const usingExample = Object.values(balances).some((b) => b.src === "ex");

  const setBalance = useCallback(
    (key: string, n: number) => setSaved((prev) => ({ ...clearExamples(prev ?? EXAMPLE), [key]: { n: Math.max(0, Math.round(n || 0)), src: "manual" } })),
    [setSaved],
  );

  const applyFound = useCallback(
    (items: FoundBalance[]) =>
      setSaved((prev) => {
        const next = clearExamples(prev ?? EXAMPLE);
        for (const x of items) next[x.program] = { n: Math.round(x.balance), src: "mail", asOf: x.asOf, subject: x.subject };
        return next;
      }),
    [setSaved],
  );

  const addFound = useCallback(
    (items: FoundBalance[]) => setFound((prev) => [...items, ...prev.filter((f) => !items.some((g) => g.program === f.program))]),
    [setFound],
  );

  const value = useMemo<Store>(
    () => ({
      balances,
      values,
      filter,
      usingExample,
      setBalance,
      applyFound,
      setValue: (p, v) => setValues((prev) => ({ ...prev, [p]: Math.max(0, v || 0) })),
      resetValues: () => setValues({}),
      setFilter,
      found,
      addFound,
      finder: { ...FINDER, ...finder },
      setFinder: (patch) => setFinderRaw((prev) => ({ ...FINDER, ...prev, ...patch })),
      pick,
      trip: { ...TRIP, ...trip },
      setTrip: (patch) => setTripRaw((prev) => ({ ...TRIP, ...prev, ...patch })),
      setPick: (patch) =>
        setPickRaw((prev) => {
          const next = { ...prev, ...patch };
          next.spend = Math.max(0, next.spend || 0);
          next.travel = Math.min(next.spend, Math.max(0, next.travel || 0));
          return next;
        }),
      cashPrices,
      setCashPrice: (key, cash, tax) => setCash((prev) => ({ ...prev, [key]: { cash, tax } })),
      tripDate,
      setTripDate,
      guide,
      openGuide: setGuide,
      closeGuide: () => setGuide(null),
    }),
    [balances, values, filter, usingExample, setBalance, applyFound, setValues, setFilter, found, addFound, finder, setFinderRaw, pick, setPickRaw, trip, setTripRaw, cashPrices, setCash, tripDate, setTripDate, guide],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
