"use client";

import { valueOf } from "@/lib/calc";
import { PARTNERS, PARTNER_IDS } from "@/lib/data";
import { useStore } from "./store";

const SORTED = [...PARTNER_IDS].sort((a, b) => PARTNERS[a].n.localeCompare(PARTNERS[b].n));

export function ValueEditor() {
  const { values, setValue, resetValues } = useStore();
  return (
    <section className="panel" aria-labelledby="valH">
      <details>
        <summary id="valH">Edit what a partner point is worth to you (₹)</summary>
        <p className="small muted" style={{ margin: "0 0 10px" }}>
          These are typical values for good award redemptions, not cash value. Change any of them to match how you book.{" "}
          <button type="button" className="link" onClick={resetValues}>
            Reset to defaults
          </button>
        </p>
        <div className="vals">
          {SORTED.map((p) => (
            <label key={p}>
              <span>{PARTNERS[p].n}</span>
              <input type="number" step="0.05" min="0" value={valueOf(values, p)} onChange={(e) => setValue(p, +e.target.value)} />
            </label>
          ))}
        </div>
      </details>
    </section>
  );
}
