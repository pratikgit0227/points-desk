"use client";

import type { Filter } from "@/lib/data";
import { useStore } from "./store";

const OPTIONS: { f: Filter; label: string }[] = [
  { f: "all", label: "All partners" },
  { f: "air", label: "Flights" },
  { f: "hotel", label: "Hotels" },
];

export function FilterBar() {
  const { filter, setFilter, usingExample } = useStore();
  return (
    <div className="bar">
      <div className="chips" role="group" aria-label="Redeem for">
        {OPTIONS.map((o) => (
          <button key={o.f} className="chip" type="button" aria-pressed={filter === o.f} onClick={() => setFilter(o.f)}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="small muted">{usingExample ? "Showing example balances. Paste a statement or type your own." : ""}</div>
    </div>
  );
}
