"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state shared across components. The server render and
 * first client render use the fallback, then React switches to the stored
 * value, so there is no hydration mismatch.
 *
 * Fallbacks must be stable references (module-level constants).
 */
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function read<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    let v: unknown = fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw) v = JSON.parse(raw);
    } catch {
      // storage blocked or corrupt: use the fallback
    }
    cache.set(key, v);
  }
  return cache.get(key) as T;
}

function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: keep the value in memory only
  }
  listeners.forEach((l) => l());
}

export type Setter<T> = (next: T | ((prev: T) => T)) => void;

export function usePersisted<T>(key: string, fallback: T): [T, Setter<T>] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback<Setter<T>>(
    (next) => write(key, typeof next === "function" ? (next as (p: T) => T)(read(key, fallback)) : next),
    [key, fallback],
  );
  return [value, set];
}

const noSub = () => () => {};

/** Today (YYYY-MM-DD) in the browser; "" while rendering on the server, so prerendering stays stable. */
export function useToday(): string {
  return useSyncExternalStore(noSub, () => new Date().toISOString().slice(0, 10), () => "");
}
