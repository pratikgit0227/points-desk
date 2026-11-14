import type { Metadata } from "next";
import Link from "next/link";
import { CardPicker } from "@/components/CardPicker";
import { cardSlug } from "@/lib/calc";
import { PROGRAMS, cardName } from "@/lib/data";
import { Matrix } from "@/components/Matrix";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Choose a card",
  description: "Which Indian travel credit card leaves you the most after its fee, and which card gives the best ratio to each airline and hotel partner.",
};

export default function CardsPage() {
  return (
    <PageTransition>
    <main className="wrap">
      <div className="page-intro">
        <h1>Choose a card</h1>
        <p className="muted">Compare the open travel cards on what they earn you in a year after the fee, and see which card transfers best to each partner. Buying gift vouchers? See <Link href="/gift-cards">which card earns most on vouchers</Link>.</p>
      </div>
      <nav className="card-links" aria-label="All cards">
        {PROGRAMS.map((p) => (
          <Link key={p.key} href={`/cards/${cardSlug(p.key)}`}>
            {cardName(p)}
          </Link>
        ))}
      </nav>
      <CardPicker />
      <Matrix />
    </main>
    </PageTransition>
  );
}
