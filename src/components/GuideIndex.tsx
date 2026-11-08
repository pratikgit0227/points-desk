"use client";

import { GUIDES, PARTNERS, PROGRAMS, cardName, type PartnerId } from "@/lib/data";
import { useStore } from "./store";

const LIST = (Object.keys(GUIDES) as PartnerId[]).sort((a, b) => PARTNERS[a].n.localeCompare(PARTNERS[b].n));

/** Every partner guide, with which of the user's cards can transfer there. */
export function GuideIndex() {
  const { openGuide, mine } = useStore();
  return (
    <section className="panel" aria-labelledby="guidesH">
      <h2 id="guidesH">Partner guides</h2>
      <p className="small muted" style={{ margin: 0 }}>
        Best awards from India, how to book, and what to watch out for. Tap a programme to open its guide.
      </p>
      <div className="guide-list">
        {LIST.map((p) => {
          const g = GUIDES[p]!;
          const from = PROGRAMS.filter((prog) => prog.r[p] && (!mine || mine.includes(prog.key))).map(cardName);
          return (
            <button key={p} type="button" className="guide-item" onClick={() => openGuide(p)}>
              <span className="k">{PARTNERS[p].k === "air" ? "Airline" : "Hotel"}</span>
              <b>{PARTNERS[p].n}</b>
              <span className="small muted">
                {g.spots.length} sweet spot{g.spots.length === 1 ? "" : "s"}
                {mine ? (from.length ? ` · from ${from.join(", ")}` : " · none of your cards") : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
