import type { FoundBalance } from "@/lib/calc";

/**
 * Reads reward-point balances out of Indian bank SMS and emails with plain
 * pattern matching. Runs in the browser: free, instant, and the text never
 * leaves the device.
 */

// Card names to program keys. Order matters: more specific names first.
const CARDS: { re: RegExp; key: string }[] = [
  { re: /magnus\s+for\s+burgundy|burgundy/i, key: "axis_magnus_burgundy" },
  { re: /magnus/i, key: "axis_magnus" },
  { re: /horizon/i, key: "axis_horizon" },
  { re: /atlas/i, key: "axis_atlas" },
  { re: /infinia|diners\s*club\s*black|\bdcb\b/i, key: "hdfc_infinia" },
  { re: /regalia\s*gold/i, key: "hdfc_regalia_gold" },
  { re: /membership\s*rewards|american\s*express|\bamex\b|\bMR\s+points/i, key: "amex_mr" },
  { re: /travel\s*one|\bhsbc\b/i, key: "hsbc_travelone" },
  { re: /scapia/i, key: "scapia" },
];

const NUM = String.raw`(\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?`;
const UNIT = String.raw`(?:edge\s*miles|edge\s*reward(?:\s*points)?|reward\s*points?|membership\s*rewards(?:\s*points)?|mr\s*points|points|coins|miles)`;

// "balance ... is 48,250", "balance: 48,250", "closing balance of 48,250"
const BALANCE_THEN_NUM = new RegExp(String.raw`\b(?:closing|available|total|current|point|points|reward)?\s*bal(?:ance)?\b[^\d\n]{0,80}?` + NUM, "gi");
// "48,250 EDGE Miles ... balance", "You have 48,250 reward points"
const NUM_THEN_UNIT = new RegExp(NUM + String.raw`\s*` + UNIT + String.raw`\b[^\n.]{0,40}?\b(?:balance|available|in your account)`, "gi");
const HAVE_NUM_UNIT = new RegExp(String.raw`\b(?:you\s+(?:now\s+)?have|accumulated)\s+` + NUM + String.raw`\s*` + UNIT, "gi");

// Words that mean the number is one transaction, not the balance
const NOT_BALANCE = /\b(earned|credited|redeemed|debited|deducted|expir\w*|spent|reversed)\b/i;
// Words that mean the number is money, not points
const MONEY = /(?:₹|\brs\.?|\binr)\s*$/i;

const MONTHS: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

function pad(n: string) {
  return n.padStart(2, "0");
}

function fullYear(y: string) {
  return y.length === 2 ? "20" + y : y;
}

/** First date in the text, as YYYY-MM-DD. */
export function findDate(text: string): string {
  let m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = text.match(/\b(\d{1,2})[-\s/]([A-Za-z]{3})[A-Za-z]*[-\s/,]+(\d{2,4})\b/);
  if (m && MONTHS[m[2].toLowerCase()]) return `${fullYear(m[3])}-${MONTHS[m[2].toLowerCase()]}-${pad(m[1])}`;
  m = text.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (m && +m[2] <= 12) return `${fullYear(m[3])}-${pad(m[2])}-${pad(m[1])}`;
  return "";
}

/** Which card a message is about. Axis "EDGE Miles" alone means Atlas. */
export function findProgram(text: string): string | null {
  for (const c of CARDS) if (c.re.test(text)) return c.key;
  if (/edge\s*miles/i.test(text)) return "axis_atlas";
  return null;
}

/** Split pasted text into separate messages. */
function messages(text: string): string[] {
  return text
    .split(/\n\s*(?:-{3,}|={3,}|_{3,})\s*\n|\n\s*\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Dates, removed before looking for the balance so "as on 20-Oct-2026" isn't read as 20
const DATES = /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[-\s/][A-Za-z]{3}[A-Za-z]*[-\s/,]+\d{2,4}\b|\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g;

function balanceIn(raw: string): { n: number; evidence: string } | null {
  // Swap dates for digit-free markers (§x§, §xx§, …) so they can't be read as the balance
  const dates: string[] = [];
  const msg = raw.replace(DATES, (d) => `§${"x".repeat(dates.push(d))}§`);
  const restore = (s: string) => s.replace(/§(x+)§/g, (_, x: string) => dates[x.length - 1]);
  for (const re of [BALANCE_THEN_NUM, NUM_THEN_UNIT, HAVE_NUM_UNIT]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(msg))) {
      const full = m[0];
      const numStart = m.index + full.lastIndexOf(m[1]);
      if (MONEY.test(msg.slice(Math.max(0, numStart - 6), numStart))) continue;
      // A transaction word in the match ("500 points earned") means it isn't the balance
      if (NOT_BALANCE.test(full)) continue;
      const n = Number(m[1].replace(/,/g, ""));
      if (!Number.isFinite(n)) continue;
      return { n, evidence: restore(full).replace(/\s+/g, " ").trim().slice(0, 100) };
    }
  }
  return null;
}

/** Every balance stated in the pasted text, one per card (latest date wins). */
export function parseBalances(text: string): FoundBalance[] {
  const byProgram = new Map<string, FoundBalance>();
  for (const msg of messages(text)) {
    const program = findProgram(msg);
    if (!program) continue;
    const hit = balanceIn(msg);
    if (!hit) continue;
    const found: FoundBalance = {
      program,
      balance: hit.n,
      asOf: findDate(msg),
      subject: (msg.split("\n")[0] || "").slice(0, 80),
      evidence: hit.evidence,
    };
    const prev = byProgram.get(program);
    if (!prev || (found.asOf && found.asOf > prev.asOf)) byProgram.set(program, found);
  }
  return [...byProgram.values()];
}
