import type { Metadata } from "next";
import { CardPicker } from "@/components/CardPicker";
import { Matrix } from "@/components/Matrix";

export const metadata: Metadata = {
  title: "Choose a card",
  description: "Which Indian travel credit card leaves you the most after its fee, and which card gives the best ratio to each airline and hotel partner.",
};

export default function CardsPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Choose a card</h1>
        <p className="muted">Compare the open travel cards on what they earn you in a year after the fee, and see which card transfers best to each partner.</p>
      </div>
      <CardPicker />
      <Matrix />
    </main>
  );
}
