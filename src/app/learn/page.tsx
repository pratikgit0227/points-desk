import type { Metadata } from "next";
import Link from "next/link";
import { GuideIndex } from "@/components/GuideIndex";
import { Notes } from "@/components/Notes";
import { Points101 } from "@/components/Points101";
import { ValueEditor } from "@/components/ValueEditor";

export const metadata: Metadata = {
  title: "Learn",
  description: "How to use each airline and hotel programme with Indian credit card points: sweet spots, booking steps and what to watch out for.",
};

export default function LearnPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Learn</h1>
        <p className="muted">How each airline and hotel programme works, the best awards from India, and the sources behind every number on this site.</p>
      </div>
      <Points101 />
      <Link href="/changes" className="latest partner">
        <span className="eyebrow">Changes feed</span>
        <span>Every devaluation, ratio change and new partner in 2026, with dates and sources.</span>
        <span className="small">Open →</span>
      </Link>
      <GuideIndex />
      <ValueEditor />
      <Notes />
    </main>
  );
}
