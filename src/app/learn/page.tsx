import type { Metadata } from "next";
import { GuideIndex } from "@/components/GuideIndex";
import { Notes } from "@/components/Notes";
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
      <GuideIndex />
      <ValueEditor />
      <Notes />
    </main>
  );
}
