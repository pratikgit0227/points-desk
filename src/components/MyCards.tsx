"use client";

import { CARD_INFO, PROGRAMS, cardName, isOpenCard } from "@/lib/data";
import { useStore } from "./store";

function tagFor(status: string) {
  if (/closed/i.test(status)) return "closed";
  if (/invitation/i.test(status)) return "invite";
  return "limited";
}

/** "Which cards do you hold?" Every ranking on the page uses this. */
export function MyCards() {
  const { mine, toggleMine, clearMine } = useStore();
  return (
    <section className="mycards" aria-labelledby="mineH">
      <div className="mc-head">
        <h2 id="mineH">My cards</h2>
        <span className="small muted">
          {mine
            ? `${mine.length} selected. Your cards are ranked first; other cards show only if they beat yours and are open to apply.`
            : "Tick the cards you hold. Results then rank your cards first, including closed or invite-only ones like Atlas or Infinia."}
        </span>
        {mine && (
          <button type="button" className="link small" onClick={clearMine}>
            clear
          </button>
        )}
      </div>
      <div className="mc-chips" role="group" aria-label="Cards you hold">
        {PROGRAMS.map((p) => {
          const on = mine?.includes(p.key) ?? false;
          return (
            <button
              key={p.key}
              type="button"
              className="chip"
              aria-pressed={on}
              title={CARD_INFO[p.key]?.status}
              onClick={() => toggleMine(p.key)}
            >
              {on ? "✓ " : "+ "}
              {cardName(p)}
              {!isOpenCard(p.key) && <span className="mc-tag">{tagFor(CARD_INFO[p.key]?.status ?? "")}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
