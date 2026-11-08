"use client";

import Link from "next/link";
import { changeDate, changesFor, KIND_LABEL } from "@/lib/calc";
import { useStore } from "./store";

/** One-line strip on My Wallet: the newest change, or the newest one to the user's cards. */
export function LatestChange() {
  const { mine } = useStore();
  const c = changesFor(mine)[0];
  if (!c) return null;
  return (
    <Link href={`/changes#${c.id}`} className={"latest " + c.kind}>
      <span className="eyebrow">{mine ? "Latest change to your cards" : "Latest change"}</span>
      <span>
        <b>{changeDate(c)}</b> · {KIND_LABEL[c.kind]} · {c.title}
      </span>
      <span className="small">All changes →</span>
    </Link>
  );
}
