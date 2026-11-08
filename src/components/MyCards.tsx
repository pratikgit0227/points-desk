"use client";

import { useState } from "react";
import { CARD_INFO, PROGRAMS, catalogueCard, defaultCardFor, isOpenCard, searchCatalogue, type Program } from "@/lib/data";
import { useStore } from "./store";

function tagFor(status: string) {
  if (/closed/i.test(status)) return "closed";
  if (/invitation/i.test(status)) return "invite";
  if (/burgundy/i.test(status)) return "Burgundy only";
  if (/paused/i.test(status)) return "paused";
  return "";
}

/** The card's name as the user picked it ("Diners Club Black"), else the programme's default. */
export function useCardTitle() {
  const { cardAs } = useStore();
  return (prog: Program) => {
    const c = catalogueCard(cardAs[prog.key]) ?? defaultCardFor(prog.key);
    const ci = CARD_INFO[prog.key];
    return { bank: c?.bank ?? prog.bank, name: c?.name ?? prog.card, status: c?.status ?? ci?.status, fee: c?.fee ?? ci?.fee, note: ci?.note };
  };
}

/** "Which cards do you hold?" Every ranking on the page uses this. */
export function MyCards() {
  const { mine, toggleMine, clearMine } = useStore();
  const title = useCardTitle();
  const [open, setOpen] = useState(false);
  const held = mine ? PROGRAMS.filter((p) => mine.includes(p.key)) : [];

  return (
    <section className="mycards" aria-labelledby="mineH">
      <div className="mc-head">
        <h2 id="mineH">My cards</h2>
        <span className="small muted">
          {mine
            ? "Your cards are ranked first everywhere. Other cards show only if they beat yours and are open to apply."
            : "Showing 3 example cards. Add the cards you hold to see what your own points are worth."}
        </span>
        {mine && (
          <button type="button" className="link small" onClick={clearMine}>
            clear all
          </button>
        )}
      </div>
      <div className="mc-chips" role="group" aria-label="Cards you hold">
        {held.map((p) => {
          const t = title(p);
          const tag = isOpenCard(p.key) ? "" : tagFor(CARD_INFO[p.key]?.status ?? "");
          return (
            <span key={p.key} className="chip held">
              ✓ {t.bank.replace(" Bank", "").replace("American Express", "Amex")} {t.name}
              {tag && <span className="mc-tag">{tag}</span>}
              <button type="button" className="mc-x" aria-label={`Remove ${t.name}`} onClick={() => toggleMine(p.key)}>
                ×
              </button>
            </span>
          );
        })}
        <button type="button" className="primary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Done" : "+ Add a card"}
        </button>
      </div>
      {open && <AddCard />}
    </section>
  );
}

function AddCard() {
  const { mine, cardAs, addCard } = useStore();
  const [q, setQ] = useState("");
  const groups = searchCatalogue(q);
  return (
    <div className="addcard">
      <input type="text" placeholder="Search: bank or card name, e.g. Amex, Infinia, SBI" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cards" autoFocus />
      {groups.length === 0 && <p className="small muted">No card matches. Tell us which card you want added.</p>}
      {groups.map((g) => (
        <div key={g.bank} className="ac-bank">
          <div className="eyebrow">{g.bank}</div>
          <div className="ac-list">
            {g.cards.map((c) => {
              const added = c.program && mine?.includes(c.program) && (cardAs[c.program] ?? defaultCardFor(c.program)?.id) === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="ac-item"
                  disabled={!c.program || Boolean(added)}
                  onClick={() => c.program && addCard(c.id, c.program)}
                  title={c.program ? c.note : "Not supported yet"}
                >
                  <b>{c.name}</b>
                  <span className="small muted">{added ? "✓ Added" : c.program ? (c.note ?? "Add") : "Coming soon"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
