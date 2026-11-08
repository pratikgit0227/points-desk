import { CHANGES, type Change, type ChangeKind } from "@/lib/data";
import { SITE_URL } from "./pages";

export const KIND_LABEL: Record<ChangeKind, string> = {
  devaluation: "↓ Devaluation",
  improvement: "↑ Improvement",
  partner: "Partner change",
  closure: "Card closed",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "23 Sep 2026", or "Apr 2026" when only the month is known */
export function changeDate(c: Pick<Change, "date" | "approx">): string {
  const [y, m, d] = c.date.split("-").map(Number);
  return (c.approx ? "" : d + " ") + MONTHS[m - 1] + " " + y;
}

/** Changes touching any of these cards; all changes when cards is null. */
export function changesFor(cards: readonly string[] | null, list: Change[] = CHANGES): Change[] {
  if (!cards) return list;
  return list.filter((c) => c.cards.some((k) => cards.includes(k)));
}

export function changeUrl(c: Change): string {
  return `${SITE_URL}/changes#${c.id}`;
}

/** Text for an X post: the summary plus a link, kept within 280 characters (links count as 23). */
export function postText(c: Change): string {
  const room = 280 - 23 - 2;
  const body = c.post.length > room ? c.post.slice(0, room - 1).trimEnd() + "…" : c.post;
  return `${body}\n\n${changeUrl(c)}`;
}
