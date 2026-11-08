import type { Metadata } from "next";
import { ChangesFeed } from "@/components/ChangesFeed";
import { changeDate } from "@/lib/calc";
import { CHANGES, CHANGES_CHECKED } from "@/lib/data";

export const metadata: Metadata = {
  title: "Credit card and miles changes",
  description:
    "Every devaluation, transfer ratio change and new partner for Indian travel credit cards (Axis, HDFC, Amex, HSBC) and airline programmes, with dates and sources.",
  alternates: { canonical: "/changes" },
};

export default function ChangesPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Changes</h1>
        <p className="muted">
          Devaluations, ratio changes and new partners for the cards and programmes on this site, newest first. Each entry has its sources; where they disagree, it says so. Last checked{" "}
          {changeDate({ date: CHANGES_CHECKED })} · {CHANGES.length} changes.
        </p>
      </div>
      <ChangesFeed />
    </main>
  );
}
