import type { Metadata } from "next";
import Link from "next/link";
import { AwardFinder } from "@/components/AwardFinder";
import { MyCards } from "@/components/MyCards";
import { PageTransition } from "@/components/PageTransition";
import { AWARD_CHECKED } from "@/lib/data/awardcharts";
import { longDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Points needed for any flight",
  description: "Pick any two airports and see how many Air India, Aeroplan, KrisFlyer and Avios points a one-way flight costs, from each programme's published chart, and which Indian card gets you there.",
};

export default function AwardsPage() {
  return (
    <PageTransition>
      <main className="wrap">
        <div className="page-intro">
          <h1>Points needed for any flight</h1>
          <p className="muted">
            Any two airports, every programme we have a chart for, both directions: into India, out of India, or neither. Charts checked {longDate(AWARD_CHECKED)}. For a ready-made trip with cash fares, use <Link href="/plan">Plan a trip</Link>.
          </p>
        </div>
        <MyCards />
        <AwardFinder />
      </main>
    </PageTransition>
  );
}
