import { CHANGES, DESTINATIONS, PARTNERS, PROGRAMS, cardName, type Change, type PartnerId } from "@/lib/data";
import { ratioTxt } from "@/lib/format";
import { optionKey, type TripCore } from "./plans";

/**
 * In-browser alerts for watched plans: what we saw when the plan was saved,
 * compared with today's data. Nothing is sent anywhere; alerts show when the
 * user next opens the site.
 */

export interface PickSnap {
  key: string;
  p: PartnerId;
  /** One-way award price per person in each cabin, when saved */
  eco?: number;
  biz?: number;
  /** Card programme → transfer ratio into this partner, when saved */
  ratios: Record<string, number>;
}

export interface PlanSnap {
  /** YYYY-MM-DD the snapshot was taken */
  at: string;
  picks: PickSnap[];
}

export interface PlanAlert {
  kind: "price" | "ratio" | "gone" | "rule";
  text: string;
  /** Feed entry, for "rule" alerts */
  change?: Change;
}

function ratiosInto(p: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const prog of PROGRAMS) if (prog.r[p]) out[prog.key] = prog.r[p][0];
  return out;
}

/** Today's prices and ratios for a plan's picked options. */
export function snapshot(t: Pick<TripCore, "dest" | "picks">, at: string): PlanSnap {
  const d = DESTINATIONS.find((x) => x.id === t.dest);
  const picks: PickSnap[] = [];
  for (const key of t.picks) {
    const r = d?.options.find((o) => optionKey(o) === key);
    if (!r) continue;
    picks.push({ key, p: r.p as PartnerId, eco: r.eco, biz: r.biz, ratios: ratiosInto(r.p) });
  }
  return { at, picks };
}

const fmt = (n: number) => n.toLocaleString("en-IN");

/**
 * What changed since the snapshot: award prices, transfer ratios for the
 * cards that matter to the user (`cards`, or every card when null), options
 * no longer listed, and dated rule changes for the partners involved.
 */
export function planAlerts(t: Pick<TripCore, "dest" | "cabin">, snap: PlanSnap, cards: readonly string[] | null = null, changes: Change[] = CHANGES): PlanAlert[] {
  const d = DESTINATIONS.find((x) => x.id === t.dest);
  const out: PlanAlert[] = [];
  for (const s of snap.picks) {
    const name = PARTNERS[s.p]?.n ?? s.p;
    const r = d?.options.find((o) => optionKey(o) === s.key);
    if (!r) {
      out.push({ kind: "gone", text: `${name}: this option is no longer listed for ${d?.name ?? "this trip"}. Check it before transferring.` });
      continue;
    }
    const was = s[t.cabin];
    const now = r[t.cabin];
    if (was && now && was !== now) out.push({ kind: "price", text: `${name}: ${t.cabin === "biz" ? "business" : "economy"} price ${now > was ? "went up" : "went down"} from ${fmt(was)} to ${fmt(now)} points one-way.` });
    const current = ratiosInto(s.p);
    for (const [prog, before] of Object.entries(s.ratios)) {
      if (cards && !cards.includes(prog)) continue;
      const after = current[prog];
      const p = PROGRAMS.find((x) => x.key === prog);
      if (!p) continue;
      if (after === undefined) out.push({ kind: "ratio", text: `${cardName(p)} no longer transfers to ${name}.` });
      else if (after !== before) out.push({ kind: "ratio", text: `${cardName(p)} → ${name}: ratio changed from ${ratioTxt(before)} to ${ratioTxt(after)}.` });
    }
  }
  const partners = new Set(snap.picks.map((s) => s.p));
  for (const c of changes) {
    if (c.date <= snap.at) continue;
    if (!c.partners.some((p) => partners.has(p)) && !(cards && c.cards.some((k) => cards.includes(k)))) continue;
    out.push({ kind: "rule", text: c.title, change: c });
  }
  return out;
}
