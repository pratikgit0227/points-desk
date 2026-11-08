import type { Metadata } from "next";
import Link from "next/link";
import { destinationFacts, destSlug } from "@/lib/calc";
import { DESTINATIONS, PARTNERS } from "@/lib/data";
import { fmt } from "@/lib/format";

export const metadata: Metadata = {
  title: "Destinations on points",
  description: "Where Indian credit card points can fly you: one-way award prices from India to the Gulf, Asia, Europe, the Americas and Australia.",
  alternates: { canonical: "/fly" },
};

const SORTED = [...DESTINATIONS].sort((a, b) => a.name.localeCompare(b.name));

export default function DestinationsPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Destinations on points</h1>
        <p className="muted">One-way award prices from India, in airline points. Tap a city for every route and which card to transfer from.</p>
      </div>
      <div className="dest-grid">
        {SORTED.map((d) => {
          const f = destinationFacts(d);
          const m = f.minEco ?? f.minBiz;
          return (
            <Link key={d.id} href={`/fly/${destSlug(d)}`} className="dest-tile">
              <b>{d.name}</b>
              <span className="small muted">{d.country}</span>
              {m && (
                <span className="num small">
                  from {fmt(f.minEco ? m.r.eco! : m.r.biz!)} pts{f.minEco ? "" : " (business)"} · {PARTNERS[m.p].n}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
