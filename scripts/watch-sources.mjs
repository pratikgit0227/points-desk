// Daily source watch. Fetches the pages our ratios, fees and award prices come from,
// keeps only the lines that matter (ratios, ₹ amounts, transfer/fee/lounge words),
// and compares them with the last run. Writes .watch/report.md when something changed.
// Free: runs on GitHub Actions; state is kept in the Actions cache.
//
// Usage: node scripts/watch-sources.mjs [stateDir]

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const SOURCES = [
  { id: "gift-smartbuy-cap", what: "HDFC SmartBuy voucher cap", url: "https://magnify.club/guides/hdfc-smartbuy-gift-voucher-points-cap" },
  { id: "gift-ishop-faq", what: "ICICI iShop caps and brand limits (bank)", url: "https://www.icici.bank.in/ishop/faqs" },
  { id: "gift-amex-shopwise", what: "Amex ShopWise multipliers and caps", url: "https://pointsfly.ai/blog/amex-reward-multiplier-shopwise" },
  { id: "gift-amex-gold-collection", what: "Amex Gold Collection voucher values (bank)", url: "https://www.americanexpress.com/in/charge-cards/gold-card/" },
  // Transfer ratios
  { id: "axis-groups-cardexpress", what: "Axis transfer partners and groups", url: "https://cardexpress.in/articles/axis-edge-transfer-partners-group-a-group-b" },
  { id: "axis-groups-magnify", what: "Axis groups and yearly caps", url: "https://magnify.club/guides/axis-bank-group-a-group-b-transfer-partners/" },
  { id: "axis-reshuffle-lfal", what: "Axis Travel EDGE reshuffle", url: "https://livefromalounge.com/axis-bank-travel-edge-rewards-reshuffle-2026/" },
  { id: "hdfc-partners", what: "HDFC transfer partners", url: "https://pointsmath.com/hdfc-bank-points-transfer-partners/" },
  { id: "amex-partners", what: "Amex India transfer partners", url: "https://magnify.club/guides/amex-india-transfer-partners/" },
  { id: "hsbc-travelone-review", what: "HSBC TravelOne partners and earn rate", url: "https://magnify.club/guides/hsbc-travelone-credit-card-review/" },
  // Banks' own card pages (fees, earn rates, benefits)
  { id: "bank-hsbc-travelone", what: "HSBC TravelOne (bank page)", url: "https://www.hsbc.bank.in/credit-cards/products/travelone/" },
  { id: "bank-axis-horizon", what: "Axis Horizon (bank page)", url: "https://www.axis.bank.in/cards/credit-card/axis-horizon-credit-card" },
  { id: "bank-axis-magnus", what: "Axis Magnus (bank page)", url: "https://www.axis.bank.in/cards/credit-card/axis-bank-magnus-credit-card" },
  { id: "bank-hdfc-regalia-gold", what: "HDFC Regalia Gold (bank page)", url: "https://www.hdfc.bank.in/credit-cards/regalia-gold-credit-card" },
  { id: "bank-hdfc-infinia", what: "HDFC Infinia (bank page)", url: "https://www.hdfc.bank.in/credit-cards/infinia-credit-card" },
  { id: "bank-amex-plat-travel", what: "Amex Platinum Travel (bank page)", url: "https://www.americanexpress.com/in/credit-cards/platinum-travel-credit-card/" },
  { id: "bank-scapia", what: "Scapia (card page)", url: "https://www.scapia.cards/" },
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const KEEP = /\b\d+(?:\.\d+)?\s?:\s?\d+(?:\.\d+)?\b|₹|\bRs\.?\s?\d|transfer|partner|annual fee|joining fee|renewal fee|milestone|miles\b|lounge|cap(?:ped)?\b|devalu/i;

/** Page HTML → the sorted, unique lines worth watching. */
export function watchedLines(html) {
  const text = html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d|\/td|\/th)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&rsquo;/g, "'")
    .replace(/&#8377;|&#x20b9;/gi, "₹");
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 6 && l.length <= 400 && KEEP.test(l))
    // drop lines that change on every load: times, "x minutes ago", years-only copyright
    .filter((l) => !/\b\d+\s+(seconds?|minutes?|hours?)\s+ago\b|©|copyright/i.test(l));
  return [...new Set(lines)].sort();
}

const hash = (lines) => createHash("sha256").update(lines.join("\n")).digest("hex").slice(0, 16);

async function fetchLines(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return watchedLines(await res.text());
}

async function main() {
  const dir = process.argv[2] || ".watch";
  await mkdir(dir, { recursive: true });
  const statePath = join(dir, "state.json");
  const prev = JSON.parse(await readFile(statePath, "utf8").catch(() => "{}"));
  const next = {};
  const changed = [];
  const failed = [];

  for (const s of SOURCES) {
    try {
      const lines = await fetchLines(s.url);
      if (lines.length === 0) throw new Error("no readable lines (page may be blocking bots)");
      next[s.id] = { hash: hash(lines), lines, at: new Date().toISOString() };
      const old = prev[s.id];
      if (old && old.hash !== next[s.id].hash) {
        const before = new Set(old.lines);
        const after = new Set(lines);
        changed.push({ s, added: lines.filter((l) => !before.has(l)), removed: old.lines.filter((l) => !after.has(l)) });
      }
    } catch (e) {
      failed.push({ s, why: e instanceof Error ? e.message : String(e) });
      if (prev[s.id]) next[s.id] = prev[s.id]; // keep the last good copy
    }
  }

  await writeFile(statePath, JSON.stringify(next));
  const first = Object.keys(prev).length === 0;
  const clip = (l) => (l.length > 200 ? l.slice(0, 200) + "…" : l);
  let report = "";
  if (changed.length) {
    report += `Checked ${new Date().toISOString().slice(0, 10)}. These source pages changed since the last run. Check whether a ratio, fee, cap or award price on Points Desk needs updating.\n\n`;
    for (const c of changed) {
      report += `### ${c.s.what}\n${c.s.url}\n\n`;
      if (c.added.length) report += "**New lines**\n" + c.added.slice(0, 15).map((l) => "- " + clip(l)).join("\n") + "\n\n";
      if (c.removed.length) report += "**Removed lines**\n" + c.removed.slice(0, 15).map((l) => "- " + clip(l)).join("\n") + "\n\n";
    }
  }
  if (failed.length && changed.length) report += "Couldn't read: " + failed.map((f) => `${f.s.what} (${f.why})`).join("; ") + "\n";
  if (report) await writeFile(join(dir, "report.md"), report);

  console.log(first ? "First run: saved a baseline." : `${changed.length} changed, ${failed.length} unreadable, ${SOURCES.length - changed.length - failed.length} unchanged.`);
  for (const f of failed) console.log(`  unreadable: ${f.s.id}: ${f.why}`);
  for (const c of changed) console.log(`  changed: ${c.s.id} (+${c.added.length} / -${c.removed.length})`);
}

if (process.argv[1]?.endsWith("watch-sources.mjs")) {
  await main();
}
