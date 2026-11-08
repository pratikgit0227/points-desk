import type { Metadata } from "next";
import { BookingFinder } from "@/components/BookingFinder";
import { DestinationFinder } from "@/components/DestinationFinder";
import { MyCards } from "@/components/MyCards";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Flying somewhere or booking a ticket? See every way to get there with Indian credit card points, and which card to pay with.",
};

export default function PlanPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Plan a trip</h1>
        <p className="muted">Where you&apos;re going or what you&apos;re booking: the best way to use points, and the best card to pay with if you buy the ticket.</p>
      </div>
      <MyCards />
      <DestinationFinder />
      <BookingFinder />
    </main>
  );
}
