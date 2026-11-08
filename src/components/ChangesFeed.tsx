"use client";

import Link from "next/link";
import { useState } from "react";
import { cardSlug, changeDate, changesFor, KIND_LABEL, postText } from "@/lib/calc";
import { CHANGES, PARTNERS, PROGRAMS, cardName, type Change, type ChangeKind } from "@/lib/data";
import { useStore } from "./store";

type Show = "all" | "mine" | ChangeKind;

const FILTERS: { f: Show; label: string }[] = [
  { f: "all", label: "All" },
  { f: "mine", label: "My cards" },
  { f: "devaluation", label: "Devaluations" },
  { f: "improvement", label: "Improvements" },
];

/** The full dated list, filterable, with a copy-as-post button on each entry. */
export function ChangesFeed() {
  const { mine } = useStore();
  const [show, setShow] = useState<Show>("all");
  const list =
    show === "all" ? CHANGES : show === "mine" ? changesFor(mine ?? []) : CHANGES.filter((c) => c.kind === show);

  return (
    <section className="changes" aria-label="Changes">
      <div className="chips" role="group" aria-label="Show">
        {FILTERS.map((x) => (
          <button key={x.f} type="button" className="chip" aria-pressed={show === x.f} onClick={() => setShow(x.f)}>
            {x.label}
          </button>
        ))}
      </div>
      {show === "mine" && !mine && (
        <p className="small muted" style={{ margin: 0 }}>
          Tick your cards under My cards on the <Link href="/">My Wallet</Link> tab to see only changes that affect you.
        </p>
      )}
      {list.length === 0 && mine && show === "mine" && <p className="small muted">No changes to your cards in this list.</p>}
      {list.map((c) => (
        <ChangeItem key={c.id} c={c} mine={mine} />
      ))}
    </section>
  );
}

function ChangeItem({ c, mine }: { c: Change; mine: string[] | null }) {
  const hits = mine ? c.cards.filter((k) => mine.includes(k)) : [];
  return (
    <article className={"change " + c.kind} id={c.id}>
      <div className="ch-meta">
        <time dateTime={c.date}>{changeDate(c)}</time>
        <span className={"ch-kind " + c.kind}>{KIND_LABEL[c.kind]}</span>
        {hits.length > 0 && <span className="pill mine">Affects your {hits.length === 1 ? "card" : hits.length + " cards"}</span>}
      </div>
      <h2>{c.title}</h2>
      <p>{c.what}</p>
      {c.todo && (
        <p className="ch-todo">
          <b>What to do:</b> {c.todo}
        </p>
      )}
      <div className="ch-foot small">
        {c.cards.length > 0 && (
          <span>
            Cards:{" "}
            {c.cards.map((k, i) => {
              const prog = PROGRAMS.find((p) => p.key === k)!;
              return (
                <span key={k}>
                  {i > 0 && ", "}
                  <Link href={`/cards/${cardSlug(k)}`}>{cardName(prog)}</Link>
                </span>
              );
            })}
          </span>
        )}
        {c.partners.length > 0 && <span className="muted">Partners: {c.partners.map((p) => PARTNERS[p].n).join(", ")}</span>}
        <span className="muted">
          Sources:{" "}
          {c.sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 && " · "}
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </span>
          ))}
        </span>
      </div>
      <CopyPost c={c} />
    </article>
  );
}

function CopyPost({ c }: { c: Change }) {
  const [done, setDone] = useState(false);
  const text = postText(c);
  return (
    <div className="ch-actions">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          } catch {
            // clipboard blocked: the X link below still works
          }
        }}
      >
        {done ? "✓ Copied" : "Copy as post"}
      </button>
      <a className="small" href={"https://x.com/intent/post?text=" + encodeURIComponent(text)} target="_blank" rel="noopener noreferrer">
        Post on X ↗
      </a>
    </div>
  );
}
