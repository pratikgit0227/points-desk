import type { Metadata } from "next";
import Link from "next/link";
import { BookingFinder } from "@/components/BookingFinder";
import { DestinationFinder } from "@/components/DestinationFinder";
import { MyCards } from "@/components/MyCards";
import { SavedPlans, SharedTripBanner } from "@/components/SavedPlans";
import { ViewSwitch } from "@/components/SimpleAnswer";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Flying somewhere or booking a ticket? See every way to get there with Indian credit card points, and which card to pay with.",
};

export default function PlanPage() {
  return (
    <PageTransition>
    <main className="wrap">
      <div className="page-intro hero-intro">
        <div className="intro-row">
          <h1>Plan a trip</h1>
          <ViewSwitch />
        </div>
        <p className="muted">Where you&apos;re going or what you&apos;re booking: the best way to use points, and the best card to pay with if you buy the ticket. Or browse <Link href="/fly">all destinations</Link>.</p>
      </div>
      <SharedTripBanner />
      <MyCards />
      <DestinationFinder />
      <SavedPlans />
      <BookingFinder />
    </main>
    </PageTransition>
  );
}
